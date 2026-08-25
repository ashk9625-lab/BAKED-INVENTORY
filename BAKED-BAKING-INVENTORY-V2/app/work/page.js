import Link from 'next/link';
import { Shell, EmptyRow } from '../components';
import { prisma } from '../../lib/prisma';
import WorkspaceForm from './workspace-form';

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  const workspaces = await prisma.workWorkspace.findMany({
    where:{active:true},
    include:{boards:{where:{active:true},include:{_count:{select:{items:true}}}}},
    orderBy:{createdAt:'asc'}
  });

  return <Shell>
    <div className="topbar">
      <div className="title">
        <h1>Work Management</h1>
        <p>Boards, tasks, owners, due dates and operational follow-ups.</p>
      </div>
    </div>

    <div className="card">
      <div className="label">Create Workspace</div>
      <WorkspaceForm />
    </div>

    <section className="section">
      <div className="work-grid">
        {workspaces.length ? workspaces.map(w=>
          <div className="card work-workspace" key={w.id}>
            <div className="work-card-head">
              <div>
                <div className="label">Workspace</div>
                <h2>{w.name}</h2>
              </div>
              <Link href={`/work/${w.id}`}><button>Open</button></Link>
            </div>
            <div className="muted">{w.boards.length} board{w.boards.length===1?'':'s'}</div>
            <div className="work-board-list">
              {w.boards.slice(0,4).map(b=>
                <Link className="work-board-link" key={b.id} href={`/work/board/${b.id}`}>
                  <span>{b.name}</span><strong>{b._count.items}</strong>
                </Link>
              )}
            </div>
          </div>
        ) : <div className="notice">No workspaces yet. Create your first workspace above.</div>}
      </div>
    </section>
  </Shell>;
}
