'use client';
import {useState} from 'react';

const blank={sku:'',name:'',category:'',unit:'unit',barcode:'',location:'',costPrice:0,reorderLevel:0,currentStock:0,active:true};

export default function ProductManager({initial}){
  const [rows,setRows]=useState(initial);
  const [form,setForm]=useState(blank);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  async function api(method,body){
    setBusy(true); setMessage('');
    try{
      const r=await fetch('/api/products',{
        method,
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||'Request failed');
      return j;
    }finally{setBusy(false)}
  }

  async function add(e){
    e.preventDefault();
    try{
      const x=await api('POST',form);
      setRows(r=>[...r,x].sort((a,b)=>a.name.localeCompare(b.name)));
      setForm(blank);
      setMessage('✓ Product added');
    }catch(e){setMessage(e.message)}
  }

  async function save(row){
    try{
      const x=await api('PATCH',row);
      setRows(r=>r.map(v=>v.id===x.id?x:v));
      setMessage('✓ Product updated');
    }catch(e){setMessage(e.message)}
  }

  async function remove(id){
    if(!confirm('Delete this product?')) return;
    try{
      await api('DELETE',{id});
      setRows(r=>r.filter(v=>v.id!==id));
      setMessage('✓ Product deleted');
    }catch(e){setMessage(e.message)}
  }

  const update=(id,key,val)=>setRows(r=>r.map(x=>x.id===id?{...x,[key]:val}:x));

  return <>
    <div className="card">
      <h2 style={{marginTop:0}}>Add Product</h2>
      <form onSubmit={add}>
        <div className="form-grid">
          <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} required/>
          <input placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required/>
          <input placeholder="Unit (g, kg, unit)" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/>
          <input placeholder="Barcode" value={form.barcode} onChange={e=>setForm({...form,barcode:e.target.value})}/>
          <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
          <input type="number" step="0.01" placeholder="Cost price" value={form.costPrice} onChange={e=>setForm({...form,costPrice:e.target.value})}/>
          <input type="number" step="0.01" placeholder="Reorder level" value={form.reorderLevel} onChange={e=>setForm({...form,reorderLevel:e.target.value})}/>
          <input type="number" step="0.01" placeholder="Opening stock" value={form.currentStock} onChange={e=>setForm({...form,currentStock:e.target.value})}/>
        </div>
        <div className="actions" style={{marginTop:12}}>
          <button disabled={busy}>{busy?'Saving…':'Add Product'}</button>
        </div>
      </form>
      {message&&<div className="notice" style={{marginTop:12}}>{message}</div>}
    </div>

    <section className="section">
      <div className="section-head">
        <div><h2>Product List</h2><p className="muted">{rows.length} products</p></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>Name</th><th>Category</th><th>Unit</th><th>Stock</th><th>Reorder</th><th>Cost</th><th>Location</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length?rows.map(r=><tr key={r.id}>
              <td><input value={r.sku} onChange={e=>update(r.id,'sku',e.target.value)}/></td>
              <td><input value={r.name} onChange={e=>update(r.id,'name',e.target.value)}/></td>
              <td><input value={r.category} onChange={e=>update(r.id,'category',e.target.value)}/></td>
              <td><input value={r.unit} onChange={e=>update(r.id,'unit',e.target.value)}/></td>
              <td>{Number(r.currentStock).toFixed(2)}</td>
              <td><input type="number" step="0.01" value={r.reorderLevel} onChange={e=>update(r.id,'reorderLevel',e.target.value)}/></td>
              <td><input type="number" step="0.01" value={r.costPrice} onChange={e=>update(r.id,'costPrice',e.target.value)}/></td>
              <td><input value={r.location} onChange={e=>update(r.id,'location',e.target.value)}/></td>
              <td><input type="checkbox" checked={!!r.active} onChange={e=>update(r.id,'active',e.target.checked)}/></td>
              <td>
                <div className="actions">
                  <button type="button" onClick={()=>save(r)} disabled={busy}>Save</button>
                  <button type="button" onClick={()=>remove(r.id)} disabled={busy}>Delete</button>
                </div>
              </td>
            </tr>):<tr><td colSpan="10" className="muted">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </>;
}
