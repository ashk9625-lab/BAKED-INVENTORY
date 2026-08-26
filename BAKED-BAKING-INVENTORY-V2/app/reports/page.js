import {Shell} from '../components';
import {prisma} from '../../lib/prisma';

export const dynamic='force-dynamic';

function num(v){ return Number(v||0); }

export default async function Page(){
  const [products,movements,batches,suppliers]=await Promise.all([
    prisma.product.findMany({where:{active:true},orderBy:{name:'asc'}}),
    prisma.stockMovement.findMany({
      include:{product:true,staff:true},
      orderBy:{createdAt:'desc'},
      take:100
    }),
    prisma.productionBatch.findMany({orderBy:{createdAt:'desc'},take:20}),
    prisma.supplier.findMany({where:{active:true},orderBy:{name:'asc'}})
  ]);

  const totalStock=products.reduce((s,p)=>s+num(p.currentStock),0);
  const stockValue=products.reduce((s,p)=>s+(num(p.currentStock)*num(p.costPrice)),0);
  const lowStock=products.filter(p=>num(p.currentStock)<=num(p.reorderLevel));

  return <Shell>
    <div className="topbar">
      <div className="title">
        <h1>Reports</h1>
        <p>Inventory, stock movement and production reporting for the BAKED Baking Team.</p>
      </div>
      <div className="actions">
        <a className="button" href="/api/export/movements">Download Stock Movements CSV</a>
      </div>
    </div>

    <section className="stats">
      <div className="stat"><span>Active Products</span><strong>{products.length}</strong></div>
      <div className="stat"><span>Total Stock</span><strong>{totalStock.toFixed(2)}</strong></div>
      <div className="stat"><span>Low Stock Items</span><strong>{lowStock.length}</strong></div>
      <div className="stat"><span>Stock Value</span><strong>R {stockValue.toFixed(2)}</strong></div>
      <div className="stat"><span>Suppliers</span><strong>{suppliers.length}</strong></div>
      <div className="stat"><span>Production Batches</span><strong>{batches.length}</strong></div>
    </section>

    <section className="section">
      <div className="section-head"><div><h2>Low Stock Report</h2><p className="muted">Products at or below their reorder level.</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>SKU</th><th>Product</th><th>Current Stock</th><th>Reorder Level</th><th>Unit</th></tr></thead>
          <tbody>
            {lowStock.length ? lowStock.map(p=><tr key={p.id}>
              <td>{p.sku}</td><td>{p.name}</td><td>{num(p.currentStock)}</td><td>{num(p.reorderLevel)}</td><td>{p.unit}</td>
            </tr>) : <tr><td colSpan="5" className="muted">No low stock items.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>

    <section className="section">
      <div className="section-head"><div><h2>Recent Stock Movements</h2><p className="muted">Latest 100 inventory transactions.</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Staff</th><th>Product</th><th>Type</th><th>Qty</th><th>Batch</th><th>Note</th></tr></thead>
          <tbody>
            {movements.length ? movements.map(m=><tr key={m.id}>
              <td>{new Date(m.createdAt).toLocaleString('en-ZA')}</td>
              <td>{m.staff?.name||'System / Legacy'}</td>
              <td>{m.product?.name||'-'}</td>
              <td>{m.type.replaceAll('_',' ')}</td>
              <td>{num(m.quantity)}</td>
              <td>{m.batchRef||'-'}</td>
              <td>{m.note||'-'}</td>
            </tr>) : <tr><td colSpan="7" className="muted">No stock movements yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>

    <section className="section">
      <div className="section-head"><div><h2>Recent Production</h2><p className="muted">Latest completed production batches.</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Batch</th><th>Product</th><th>Quantity</th><th>Status</th></tr></thead>
          <tbody>
            {batches.length ? batches.map(b=><tr key={b.id}>
              <td>{new Date(b.createdAt).toLocaleString('en-ZA')}</td>
              <td>{b.batchNumber}</td>
              <td>{b.productName}</td>
              <td>{num(b.quantityMade)} {b.unit}</td>
              <td>{b.status}</td>
            </tr>) : <tr><td colSpan="5" className="muted">No production batches yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </Shell>;
}
