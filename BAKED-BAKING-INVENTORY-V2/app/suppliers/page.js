import {Shell} from '../components';
import {prisma} from '../../lib/prisma';
import Form from './form';
import SupplierTable from './supplier-table';

export const dynamic='force-dynamic';

export default async function Page(){
  const rows=await prisma.supplier.findMany({orderBy:{name:'asc'}});
  const data=rows.map(s=>({
    id:s.id,name:s.name,contactPerson:s.contactPerson||'',email:s.email||'',
    phone:s.phone||'',leadTimeDays:s.leadTimeDays,notes:s.notes||'',active:s.active
  }));

  return <Shell>
    <div className="topbar">
      <div className="title"><h1>Suppliers</h1><p>Add and edit supplier details and lead times.</p></div>
    </div>
    <div className="card"><Form/></div>
    <section className="section">
      <SupplierTable initial={data}/>
    </section>
  </Shell>;
}
