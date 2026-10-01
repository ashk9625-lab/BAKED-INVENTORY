import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { buildManagementWorkbook } from '../../../lib/production-spreadsheet-export';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getWorkModel() {
  const candidates = ['workManagement','workEntry','workRecord','productionWork','productionEntry','productionBatch'];
  for (const name of candidates) {
    if (prisma?.[name] && typeof prisma[name].findMany === 'function') return prisma[name];
  }
  return null;
}

export async function GET() {
  try {
    const model = getWorkModel();
    if (!model) {
      return NextResponse.json({
        error: 'Work Management model not found',
        help: 'Open app/api/management-export/route.js and add your Prisma model name to candidates.'
      }, { status: 500 });
    }
    const entries = await model.findMany();
    entries.sort((a,b) => new Date(a.date || a.workDate || a.productionDate || a.createdAt || 0) - new Date(b.date || b.workDate || b.productionDate || b.createdAt || 0));
    const buffer = await buildManagementWorkbook(entries);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Baking Room Data Control LIVE.xlsx"',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Management Excel generation failed:', error);
    return NextResponse.json({ error: 'Could not generate management Excel workbook' }, { status: 500 });
  }
}
