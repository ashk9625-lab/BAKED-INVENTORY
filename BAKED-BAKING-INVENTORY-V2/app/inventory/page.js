import {Shell,EmptyRow} from '../components';
import {prisma} from '../../lib/prisma';
import MovementForm from './movement-form';

export const dynamic='force-dynamic';

export default async function Page(){
  const [products,moves]=await Promise.all([
    prisma.product.findMany({where:{active:true},orderBy:{name:'asc'}}),
    prisma.stockMovement.findMany({
      include:{product:true,staff:true},
      orderBy:{createdAt:'desc'},
      take:100
    })
  ]);

  return <Shell>
    <div className="topbar">
      <div className="title">
        <h1>Stock Movements</h1>
        <p>Receive, issue, adjust and write off stock. Every change records the logged-in staff member.</p>
      </div>
    </div>

    <div className="card">
      <MovementForm products={products.map(p=>({
        id:p.id,sku:p.sku,name:p.name,stock:Number(p.currentStock),unit:p.unit
      }))}/>
    </div>

    <section className="section">
      <div className="actions">
        <a href="/api/export/movements"><button className="secondary">Export Movements CSV</button></a>
      </div>
      <div className="table-wrap" style={{marginTop:12}}>
        <table>
          <thead><tr>
            <th>Date</th><th>Staff Member</th><th>Product</th><th>Action</th><th>Qty</th><th>Batch</th><th>Note</th>
          </tr></thead>
          <tbody>
            {moves.length?moves.map(m=><tr key={m.id}>
              <td>{m.createdAt.toLocaleString()}</td>
              <td>{m.staff?.name||'System / Legacy'}</td>
              <td>{m.product.sku} — {m.product.name}</td>
              <td>{m.type}</td>
              <td>{Number(m.quantity)}</td>
              <td>{m.batchRef||'-'}</td>
              <td>{m.note||'-'}</td>
            </tr>):<EmptyRow colSpan={7}/>}
          </tbody>
        </table>
      </div>
    </section>
  </Shell>;
}
