'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function useSubmit(endpoint) {
  const router = useRouter(); const [busy,setBusy]=useState(false);
  async function submit(e){
    e.preventDefault(); setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
    const j = await r.json().catch(()=>({})); setBusy(false);
    if(r.ok){ e.currentTarget.reset(); router.refresh(); return true; }
    alert(j.error || 'Action failed'); return false;
  }
  return {submit,busy};
}
