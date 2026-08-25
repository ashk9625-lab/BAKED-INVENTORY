'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupForm() {
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/auth/setup', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data)
    });
    const j = await r.json().catch(()=>({}));
    setBusy(false);
    if (!r.ok) return setError(j.error || 'Setup failed');
    router.push('/');
    router.refresh();
  }

  return <form onSubmit={submit} className="auth-form">
    <input name="name" placeholder="Admin name" required />
    <input name="email" type="email" placeholder="Admin email" required />
    <input name="password" type="password" placeholder="Password (minimum 8 characters)" minLength="8" required />
    {error && <div className="error-box">{error}</div>}
    <button disabled={busy}>{busy ? 'Creating…' : 'Create Admin Account'}</button>
  </form>;
}
