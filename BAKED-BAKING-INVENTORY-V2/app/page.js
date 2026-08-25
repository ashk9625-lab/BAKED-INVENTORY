import {Shell,EmptyRow} from './components';
import {prisma} from '../lib/prisma';

export const dynamic='force-dynamic';

export default async function Page(){
 const [products,movements,suppliers,batches]=await Promise.all([
  prisma.product.findMany({where:{active:true},orderBy:{name:'asc'}}),
  prisma.stockMovement.findMany({include:{product:true,staff:true},orderBy:{createdAt:'desc'},take:8}),
  prisma.supplier.count({where:{active:true}}),
  prisma.productionBatch.count()
 ]);

 const low=products.filter(p=>Number(p.currentStock)<=Number(p.reorderLevel));
 const total=products.reduce((s,p)=>s+Number(p.currentStock),0);
 const value=products.reduce((s,p)=>s+Number(p.currentStock)*Number(p.costPrice),0);

 return <Shell>
  <div className="topbar"><div className="title">
    <h1>Inventory Dashboard</h1><p>Live stock overview for the BAKED Baking Team.</p>
  </div></div>

  <div className="grid">
    <div className="card"><div className="label">Active Products</div><div className="metric">{products.length}</div></div>
    <div className="card"><div className="label">Total Stock</div><div className="metric">{total.toFixed(2)}</div></div>
    <div className="card"><div className="label">Low Stock</div><div className="metric">{low.length}</div></div>
    <div className="card"><div className="label">Stock Value</div><div className="metric">R {value.toFixed(2)}</div></div>
  </div>

  <div className="grid3 section">
    <div className="card"><div className="label">Suppliers</div><div className="metric">{suppliers}</div></div>
    <div className="card"><div className="label">Production Batches</div><div className="metric">{batches}</div></div>
    <div className="card"><div className="label">Low Stock Items</div><div className="metric">{low.length}</div></div>
  </div>

  <section className="section"><h2>Low Stock</h2>
    <div className="table-wrap"><table>
      <thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Reorder</th></tr></thead>
      <tbody>{low.length?low.map(p=><tr key={p.id}>
        <td>{p.sku}</td><td>{p.name}</td><td>{Number(p.currentStock)} {p.unit}</td><td>{Number(p.reorderLevel)}</td>
      </tr>):<EmptyRow colSpan={4}>No low stock items.</EmptyRow>}</tbody>
    </table></div>
  </section>

  <section className="section"><h2>Recent Activity</h2>
    <div className="table-wrap"><table>
      <thead><tr><th>Date</th><th>Staff</th><th>Product</th><th>Type</th><th>Qty</th><th>Batch</th></tr></thead>
      <tbody>{movements.length?movements.map(m=><tr key={m.id}>
        <td>{m.createdAt.toLocaleString()}</td>
        <td>{m.staff?.name||'System / Legacy'}</td>
        <td>{m.product.name}</td><td>{m.type}</td><td>{Number(m.quantity)}</td><td>{m.batchRef||'-'}</td>
      </tr>):<EmptyRow colSpan={6}/>}</tbody>
    </table></div>
  </section>
 </Shell>;
}
