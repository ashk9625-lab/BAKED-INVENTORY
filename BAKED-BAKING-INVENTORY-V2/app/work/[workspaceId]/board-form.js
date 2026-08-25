'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function BoardForm({workspaceId}){
 const router=useRouter(); const[busy,setBusy]=useState(false);
 async function submit(e){
   e.preventDefault();setBusy(true);
   const d=Object.fromEntries(new FormData(e.currentTarget)); d.workspaceId=workspaceId;
   const r=await fetch('/api/work/boards',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});
   const j=await r.json().catch(()=>({}));setBusy(false);
   if(!r.ok)return alert(j.error||'Could not create board');
   e.currentTarget.reset();router.refresh();
 }
 return <form onSubmit={submit}>
   <div className="form-grid" style={{marginTop:12}}>
    <input name="name" placeholder="Board name" required/>
    <input name="description" placeholder="Board description"/>
   </div>
   <div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Adding…':'Add Board'}</button></div>
 </form>
}
