'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const r = await fetch('/api/auth/login', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data)
    });
    const j = await r.json().catch(()=>({}));
    setBusy(false);
    if (!r.ok) return setError(j.error || 'Login failed');
    router.push('/');
    router.refresh();
  }

  return <form onSubmit={submit} className="auth-form">
    <input name="email" type="email" placeholder="Email address" autoComplete="username" required />
    <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
    {error && <div className="error-box">{error}</div>}
    <button disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
  </form>;
}
