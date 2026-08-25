'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function WorkspaceForm(){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [ok,setOk]=useState(false);

  async function submit(e){
    e.preventDefault(); setBusy(true); setOk(false);
    const d=Object.fromEntries(new FormData(e.currentTarget));
    const r=await fetch('/api/work/workspaces',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok) return alert(j.error||'Could not create workspace');
    e.currentTarget.reset(); setOk(true); router.refresh();
    setTimeout(()=>setOk(false),2500);
  }

  return <form onSubmit={submit}>
    <div className="form-grid" style={{marginTop:12}}>
      <input name="name" placeholder="Workspace name" required/>
    </div>
    {ok&&<div className="success-box" style={{marginTop:12}}>✓ Workspace added</div>}
    <div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Adding…':'Add Workspace'}</button></div>
  </form>;
}
