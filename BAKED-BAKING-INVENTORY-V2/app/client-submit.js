'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useSubmit(endpoint, options={}) {
  const router = useRouter();
  const [busy,setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    const data = Object.fromEntries(new FormData(form));
    const r = await fetch(endpoint, {
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(data)
    });
    const j = await r.json().catch(()=>({}));
    setBusy(false);

    if (r.ok) {
      form.reset();
      if (options.onSuccess) options.onSuccess(j);
      router.refresh();
      return true;
    }
    alert(j.error || 'Action failed');
    return false;
  }

  return {submit,busy};
}
