import {Shell,EmptyRow} from '../components'; import {prisma} from '../../lib/prisma'; import Form from './form';
export const dynamic='force-dynamic';
export default async function Page(){const [products,recipes]=await Promise.all([prisma.product.findMany({where:{active:true},orderBy:{name:'asc'}}),prisma.recipe.findMany({include:{outputProduct:true,items:{include:{product:true}}},orderBy:{name:'asc'}})]);return <Shell>
<div className="topbar"><div className="title"><h1>Recipes / BOM</h1><p>Link ingredients and packaging to finished products.</p></div></div><div className="card"><Form products={products}/></div>
<section className="section"><div className="table-wrap"><table><thead><tr><th>Recipe</th><th>Output</th><th>Yield</th><th>Inputs</th></tr></thead><tbody>
{recipes.length?recipes.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.outputProduct.name}</td><td>{Number(r.outputQuantity)} {r.outputProduct.unit}</td><td>{r.items.map(i=><div key={i.id}>{i.product.name}: {Number(i.quantity)} {i.product.unit}</div>)}</td></tr>):<EmptyRow colSpan={4}/>}</tbody></table></div></section></Shell>}
