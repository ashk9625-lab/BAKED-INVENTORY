import Link from 'next/link';
import {Shell} from '../../components';
import {prisma} from '../../../lib/prisma';
import BoardForm from './board-form';

export const dynamic='force-dynamic';

export default async function WorkspacePage({params}){
  const p=await params;
  const id=Number(p.workspaceId);
  const workspace=await prisma.workWorkspace.findUnique({
    where:{id},
    include:{boards:{where:{active:true},include:{_count:{select:{items:true}}},orderBy:{createdAt:'asc'}}}
  });
  if(!workspace) return <Shell><div className="notice">Workspace not found.</div></Shell>;

  return <Shell>
    <div className="topbar"><div className="title">
      <h1>{workspace.name}</h1><p>Create and manage boards for this workspace.</p>
    </div></div>

    <div className="card">
      <div className="label">Create Board</div>
      <BoardForm workspaceId={workspace.id}/>
    </div>

    <section className="section">
      <div className="work-grid">
        {workspace.boards.map(b=>
          <Link className="card work-board-card" key={b.id} href={`/work/board/${b.id}`}>
            <div className="label">Board</div>
            <h2>{b.name}</h2>
            <p className="muted">{b.description||'No description'}</p>
            <div className="metric-small">{b._count.items} item{b._count.items===1?'':'s'}</div>
          </Link>
        )}
      </div>
    </section>
  </Shell>;
}
