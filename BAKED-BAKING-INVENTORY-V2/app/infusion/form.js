'use client';
import {useState} from 'react';
import {useSubmit} from '../client-submit';

const sections=['BUTTER','OIL','VAPE','COSMETIC'];

export default function InfusionForm(){
  const [section,setSection]=useState('BUTTER');
  const [added,setAdded]=useState(false);
  const {submit,busy}=useSubmit('/api/infusion',{onSuccess:()=>{setAdded(true);setTimeout(()=>setAdded(false),3500);}});
  return <form onSubmit={submit}>
    <div className="infusion-tabs">{sections.map(x=><button type="button" key={x} onClick={()=>setSection(x)} className={section===x?'active':''}>{x[0]+x.slice(1).toLowerCase()}</button>)}</div>
    <input type="hidden" name="section" value={section}/>
    <div className="form-grid" style={{marginTop:14}}>
      <input name="batchNumber" placeholder="Infusion / Batch number" required/>
      <input name="productName" placeholder="Product / infusion name" required/>
      <input name="personResponsible" placeholder="Person responsible" required/>
      <input name="inputMaterial" placeholder="Base / input material" required/>
      <input name="inputQuantity" type="number" min="0" step="0.001" placeholder="Base quantity" required/>
      <input name="inputUnit" placeholder="Base unit (g / ml)" defaultValue={section==='OIL'||section==='VAPE'?'ml':'g'} required/>
      <input name="infusionIngredient" placeholder="Infusion ingredient" required/>
      <input name="infusionQuantity" type="number" min="0" step="0.001" placeholder="Infusion quantity" required/>
      <input name="infusionUnit" placeholder="Infusion unit (g / ml)" defaultValue="g" required/>
      <input name="potency" type="number" min="0" step="0.001" placeholder="Recorded potency / concentration"/>
      <input name="potencyUnit" placeholder="Potency unit (optional)"/>
      <input name="finalYield" type="number" min="0" step="0.001" placeholder="Final yield" required/>
      <input name="yieldUnit" placeholder="Yield unit (g / ml)" defaultValue={section==='OIL'||section==='VAPE'?'ml':'g'} required/>
      <input name="wastage" type="number" min="0" step="0.001" defaultValue="0" placeholder="Loss / wastage"/>
      <select name="status" defaultValue="COMPLETED"><option>IN PROGRESS</option><option>COMPLETED</option><option>ON HOLD</option></select>
      <input name="notes" placeholder="Notes"/>
    </div>
    {added&&<div className="success-box" style={{marginTop:12}}>✓ Infusion batch recorded</div>}
    <div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Saving…':'Save Infusion Batch'}</button></div>
  </form>;
}
