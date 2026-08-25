'use client';
import {useState} from 'react';

export default function SupplierTable({initial}) {
  const [rows,setRows]=useState(initial);
  const [saving,setSaving]=useState(null);
  const [saved,setSaved]=useState(null);

  function change(id,key,value) {
    setRows(rows=>rows.map(r=>r.id===id?{...r,[key]:value}:r));
  }

  async function save(row) {
    setSaving(row.id); setSaved(null);
    const r=await fetch('/api/suppliers',{
      method:'PATCH',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(row)
    });
    const j=await r.json().catch(()=>({}));
    setSaving(null);
    if(!r.ok) return alert(j.error||'Supplier could not be updated');
    setSaved(row.id);
    setTimeout(()=>setSaved(null),2500);
  }

  if(!rows.length) return <div className="notice">No suppliers yet.</div>;

  return <div className="table-wrap">
    <table className="edit-table">
      <thead><tr>
        <th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Lead Time</th><th>Notes</th><th>Active</th><th></th>
      </tr></thead>
      <tbody>{rows.map(s=><tr key={s.id}>
        <td><input value={s.name} onChange={e=>change(s.id,'name',e.target.value)}/></td>
        <td><input value={s.contactPerson} onChange={e=>change(s.id,'contactPerson',e.target.value)}/></td>
        <td><input type="email" value={s.email} onChange={e=>change(s.id,'email',e.target.value)}/></td>
        <td><input value={s.phone} onChange={e=>change(s.id,'phone',e.target.value)}/></td>
        <td><input type="number" min="0" value={s.leadTimeDays} onChange={e=>change(s.id,'leadTimeDays',e.target.value)}/></td>
        <td><input value={s.notes} onChange={e=>change(s.id,'notes',e.target.value)}/></td>
        <td>
          <select value={s.active?'yes':'no'} onChange={e=>change(s.id,'active',e.target.value==='yes')}>
            <option value="yes">Yes</option><option value="no">No</option>
          </select>
        </td>
        <td>
          <button type="button" onClick={()=>save(s)} disabled={saving===s.id}>
            {saving===s.id?'Saving…':saved===s.id?'✓ Saved':'Save'}
          </button>
        </td>
      </tr>)}</tbody>
    </table>
  </div>;
}
