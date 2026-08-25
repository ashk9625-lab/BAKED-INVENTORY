'use client';
import {useState} from 'react';

export default function TeamTable({initial,currentUserId}) {
  const [rows,setRows]=useState(initial);
  const [saving,setSaving]=useState(null);

  function change(id,key,value){setRows(rs=>rs.map(r=>r.id===id?{...r,[key]:value}:r));}

  async function save(row){
    setSaving(row.id);
    const r=await fetch('/api/team',{
      method:'PATCH',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(row)
    });
    const j=await r.json().catch(()=>({}));
    setSaving(null);
    if(!r.ok) return alert(j.error||'Staff account could not be updated');
    alert('Staff permissions updated');
  }

  return <div className="table-wrap">
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>New Password</th><th></th></tr></thead>
      <tbody>{rows.map(m=><tr key={m.id}>
        <td><input value={m.name} onChange={e=>change(m.id,'name',e.target.value)}/></td>
        <td>{m.email}</td>
        <td><select value={m.role} onChange={e=>change(m.id,'role',e.target.value)}>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
          <option value="VIEW_ONLY">View Only</option>
        </select></td>
        <td><select value={m.active?'yes':'no'} disabled={m.id===currentUserId} onChange={e=>change(m.id,'active',e.target.value==='yes')}>
          <option value="yes">Yes</option><option value="no">No</option>
        </select></td>
        <td><input type="password" placeholder="Leave blank to keep" onChange={e=>change(m.id,'password',e.target.value)}/></td>
        <td><button type="button" onClick={()=>save(m)} disabled={saving===m.id}>
          {saving===m.id?'Saving…':'Save'}
        </button></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
