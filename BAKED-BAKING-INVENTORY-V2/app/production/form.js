'use client';
import {useState} from 'react';
import {useSubmit} from '../client-submit';

export default function F({recipes}) {
  const [id,setId]=useState('');
  const [added,setAdded]=useState(false);
  const {submit,busy}=useSubmit('/api/production',{
    onSuccess:()=>{ setId(''); setAdded(true); setTimeout(()=>setAdded(false),3500); }
  });
  const x=recipes.find(r=>String(r.id)===String(id));

  return <form onSubmit={submit}>
    <div className="form-grid">
      <select name="recipeId" required value={id} onChange={e=>{setId(e.target.value);setAdded(false)}}>
        <option value="" disabled>Recipe</option>
        {recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <input name="batchNumber" placeholder="Batch number" required/>
      <input name="multiplier" type="number" step="0.01" min="0.01" defaultValue="1" placeholder="Batch multiplier"/>
      <input name="notes" placeholder="Production notes"/>
    </div>
    {x&&<div className="notice" style={{marginTop:12}}>
      Makes {x.outputQuantity} {x.outputUnit} {x.outputProduct} per batch. Inputs: {x.items.map(i=>`${i.quantity} ${i.unit} ${i.name}`).join(', ')}
    </div>}
    {added&&<div className="success-box" style={{marginTop:12}}>✓ Added successfully</div>}
    <div className="actions" style={{marginTop:12}}>
      <button disabled={busy}>{busy?'Adding…':'Complete Production Batch'}</button>
    </div>
  </form>;
}
