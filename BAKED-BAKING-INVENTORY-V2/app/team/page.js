import {Shell,EmptyRow} from '../components';
import {prisma} from '../../lib/prisma';
import {requireUser} from '../../lib/auth';
import Form from './form';
import TeamTable from './team-table';

export const dynamic='force-dynamic';

export default async function Page(){
  const user=await requireUser(['ADMIN']);
  const rows=await prisma.teamMember.findMany({orderBy:{name:'asc'}});
  const data=rows.map(m=>({
    id:m.id,name:m.name,email:m.email,role:m.role,active:m.active,password:''
  }));

  return <Shell requiredRoles={['ADMIN']}>
    <div className="topbar">
      <div className="title"><h1>Team & Permissions</h1><p>Create staff logins and control access.</p></div>
    </div>
    <div className="card"><Form/></div>
    <section className="section">
      {data.length?<TeamTable initial={data} currentUserId={user.id}/>:<div className="notice">No staff accounts.</div>}
    </section>
  </Shell>;
}
