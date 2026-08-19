import { Shell } from '../components';
import { prisma } from '../../lib/prisma';
import ProductForm from './product-form';

export const dynamic = 'force-dynamic';
export default async function Products(){
 const products=await prisma.product.findMany({orderBy:{name:'asc'}});
 return <Shell><div className="topbar"><div className="title"><h1>Products</h1><p>Ingredients, packaging materials and finished baking products.</p></div></div>
 <div className="card"><ProductForm/></div>
 <section className="section"><div className="table-wrap"><table><thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Stock</th><th>Reorder Level</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{Number(p.currentStock)} {p.unit}</td><td>{Number(p.reorderLevel)}</td></tr>)}</tbody></table></div></section></Shell>
}
