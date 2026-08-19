import { Shell } from './components';
import { prisma } from '../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  const movements = await prisma.stockMovement.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { product: true } });
  const low = products.filter(p => Number(p.currentStock) <= Number(p.reorderLevel));
  const totalUnits = products.reduce((sum,p)=> sum + Number(p.currentStock), 0);
  return <Shell>
    <div className="topbar"><div className="title"><h1>Inventory Dashboard</h1><p>Live stock overview for the Baked Baking Team.</p></div></div>
    <div className="grid">
      <div className="card"><div className="label">ACTIVE PRODUCTS</div><div className="metric">{products.filter(p=>p.active).length}</div></div>
      <div className="card"><div className="label">TOTAL STOCK</div><div className="metric">{totalUnits.toFixed(2)}</div></div>
      <div className="card"><div className="label">LOW STOCK ITEMS</div><div className="metric">{low.length}</div></div>
      <div className="card"><div className="label">RECENT MOVEMENTS</div><div className="metric">{movements.length}</div></div>
    </div>
    <section className="section"><h2>Low Stock</h2><div className="table-wrap"><table><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Stock</th><th>Reorder</th><th>Status</th></tr></thead><tbody>{low.length ? low.map(p=><tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{Number(p.currentStock)} {p.unit}</td><td>{Number(p.reorderLevel)}</td><td><span className="badge low">Low</span></td></tr>) : <tr><td colSpan="6">No low-stock items.</td></tr>}</tbody></table></div></section>
    <section className="section"><h2>Recent Stock Activity</h2><div className="table-wrap"><table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Note</th></tr></thead><tbody>{movements.map(m=><tr key={m.id}><td>{m.createdAt.toLocaleString()}</td><td>{m.product.name}</td><td>{m.type}</td><td>{Number(m.quantity)}</td><td>{m.note || '-'}</td></tr>)}</tbody></table></div></section>
  </Shell>
}
