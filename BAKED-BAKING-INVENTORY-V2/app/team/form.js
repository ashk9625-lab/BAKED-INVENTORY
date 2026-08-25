'use client';
import {useState} from 'react';
import {useSubmit} from '../client-submit';

export default function F(){
  const [added,setAdded]=useState(false);
  const {submit,busy}=useSubmit('/api/team',{onSuccess:()=>{setAdded(true);setTimeout(()=>setAdded(false),2500)}});
  return <form onSubmit={submit}>
    <div className="form-grid">
      <input name="name" placeholder="Name" required/>
      <input name="email" type="email" placeholder="Email" required/>
      <input name="password" type="password" minLength="8" placeholder="Temporary password (min 8)" required/>
      <select name="role" defaultValue="STAFF">
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
        <option value="STAFF">Staff</option>
        <option value="VIEW_ONLY">View Only</option>
      </select>
    </div>
    {added&&<div className="success-box" style={{marginTop:12}}>✓ Staff login added</div>}
    <div className="actions" style={{marginTop:12}}>
      <button disabled={busy}>{busy?'Adding…':'Add Staff Login'}</button>
    </div>
  </form>;
}
