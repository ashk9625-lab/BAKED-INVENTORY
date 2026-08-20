import {Shell,EmptyRow} from '../components'; import {prisma} from '../../lib/prisma'; import ProductForm from './product-form'; import CsvImport from './csv-import';
export const dynamic='force-dynamic';
export default async function Page(){const products=await prisma.product.findMany({orderBy:{name:'asc'}});return <Shell>
<div className="topbar"><div className="title"><h1>Products</h1><p>Ingredients, packaging, finished products and raw materials.</p></div></div>
<div className="card"><ProductForm/></div><div className="card section"><CsvImport/></div>
<section className="section"><div className="actions"><a href="/api/export/products"><button className="secondary">Export Products CSV</button></a></div>
<div className="table-wrap" style={{marginTop:12}}><table><thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Stock</th><th>Reorder</th><th>Cost</th><th>Location</th><th>Barcode</th></tr></thead>
<tbody>{products.length?products.map(p=><tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{Number(p.currentStock)} {p.unit}</td><td>{Number(p.reorderLevel)}</td><td>R {Number(p.costPrice).toFixed(2)}</td><td>{p.location||'-'}</td><td>{p.barcode||'-'}</td></tr>):<EmptyRow colSpan={8}/>}</tbody></table></div></section></Shell>}
