'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SupplierForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Supplier could not be added');

      setMessage('✓ Supplier added successfully');
      form.reset();
      router.refresh();
    } catch (error) {
      alert(error.message || 'Supplier could not be added');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="label">Add Supplier</div>
      <div className="form-grid" style={{ marginTop: 12 }}>
        <input name="name" placeholder="Supplier name" required />
        <input name="contactPerson" placeholder="Contact person" />
        <input name="email" type="email" placeholder="Email" />
        <input name="phone" placeholder="Phone" />
        <input name="leadTimeDays" type="number" min="0" step="1" defaultValue="0" placeholder="Lead time (days)" />
        <input name="notes" placeholder="Notes" />
      </div>

      {message && <div className="success-box" style={{ marginTop: 12 }}>{message}</div>}

      <div className="actions" style={{ marginTop: 12 }}>
        <button type="submit" disabled={busy}>
          {busy ? 'Adding…' : 'Add Supplier'}
        </button>
      </div>
    </form>
  );
}
