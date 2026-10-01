import {Shell,EmptyRow} from '../components';
import {prisma} from '../../lib/prisma';
import InfusionForm from './form';
export const dynamic='force-dynamic';

export default async function Page(){
 const batches=await prisma.infusionBatch.findMany({orderBy:{createdAt:'desc'},take:100});
 return <Shell>
  <div className="topbar"><div className="title"><h1>Infusion</h1><p>Record and track Butter, Oil, Vape and Cosmetic infusion batches.</p></div></div>
  <div className="card"><h2 style={{marginTop:0}}>New Infusion Batch</h2><InfusionForm/></div>
  <section className="section"><h2>Recent Infusion Batches</h2><div className="table-wrap"><table>
   <thead><tr><th>Date</th><th>Section</th><th>Batch</th><th>Product</th><th>Person</th><th>Base</th><th>Infusion</th><th>Potency</th><th>Yield</th><th>Wastage</th><th>Status</th><th>Notes</th></tr></thead>
   <tbody>{batches.length?batches.map(b=><tr key={b.id}>
    <td>{new Date(b.createdAt).toLocaleString('en-ZA')}</td><td><strong>{b.section}</strong></td><td>{b.batchNumber}</td><td>{b.productName}</td><td>{b.personResponsible}</td>
    <td>{Number(b.inputQuantity)} {b.inputUnit} {b.inputMaterial}</td><td>{Number(b.infusionQuantity)} {b.infusionUnit} {b.infusionIngredient}</td>
    <td>{b.potency==null?'-':Number(b.potency)+' '+(b.potencyUnit||'')}</td><td>{Number(b.finalYield)} {b.yieldUnit}</td><td>{Number(b.wastage)} {b.yieldUnit}</td><td>{b.status}</td><td>{b.notes||'-'}</td>
   </tr>):<EmptyRow colSpan={12}>No infusion batches yet.</EmptyRow>}</tbody>
  </table></div></section>
 </Shell>;
}
