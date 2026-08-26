import { prisma } from '../../../../lib/prisma';
import { currentUser } from '../../../../lib/auth';

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS work_live_state (
      id INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by TEXT
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS work_activity (
      id BIGSERIAL PRIMARY KEY,
      actor TEXT NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'update',
      message TEXT NOT NULL,
      urgent BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
    await ensureTables();

    const states = await prisma.$queryRawUnsafe(
      'SELECT data, updated_at, updated_by FROM work_live_state WHERE id = 1 LIMIT 1'
    );
    const activities = await prisma.$queryRawUnsafe(`
      SELECT id, actor, event_type, message, urgent, created_at
      FROM work_activity
      ORDER BY id DESC
      LIMIT 80
    `);

    const state = states?.[0] || null;
    return Response.json({
      data: state?.data || null,
      updatedAt: state?.updated_at ? new Date(state.updated_at).toISOString() : null,
      updatedBy: state?.updated_by || null,
      user: { id: user.id, name: user.name, role: user.role },
      activities: (activities || []).map(a => ({
        id: Number(a.id),
        actor: a.actor,
        type: a.event_type,
        message: a.message,
        urgent: !!a.urgent,
        createdAt: new Date(a.created_at).toISOString(),
      })),
    });
  } catch (e) {
    return Response.json({ error: e.message || 'Live work feed failed' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
    if (user.role === 'VIEW_ONLY') {
      return Response.json({ error: 'View Only users cannot change work management.' }, { status: 403 });
    }
    await ensureTables();
    const body = await req.json();
    if (!body?.data || typeof body.data !== 'object') {
      return Response.json({ error: 'Board data required' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO work_live_state (id, data, updated_at, updated_by)
       VALUES (1, $1::jsonb, NOW(), $2)
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = NOW(), updated_by = EXCLUDED.updated_by`,
      JSON.stringify(body.data),
      user.name || 'BAKED Staff'
    );

    return Response.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (e) {
    return Response.json({ error: e.message || 'Could not save live board' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
    await ensureTables();
    const body = await req.json();
    const message = String(body?.message || '').trim();
    if (!message) return Response.json({ error: 'Activity message required' }, { status: 400 });

    await prisma.$executeRawUnsafe(
      `INSERT INTO work_activity (actor, event_type, message, urgent)
       VALUES ($1, $2, $3, $4)`,
      user.name || 'BAKED Staff',
      String(body?.type || 'update'),
      message,
      !!body?.urgent
    );
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message || 'Could not record activity' }, { status: 500 });
  }
}
