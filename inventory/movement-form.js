'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const movementTypes = [
  ['RECEIVE', 'Receive Stock'],
  ['ISSUE_TO_PRODUCTION', 'Issue to Production'],
  ['PRODUCTION_OUTPUT', 'Production Output'],
  ['ADJUSTMENT_IN', 'Adjustment In'],
  ['ADJUSTMENT_OUT', 'Adjustment Out'],
  ['WASTE', 'Waste'],
  ['TRANSFER_IN', 'Transfer In'],
  ['TRANSFER_OUT', 'Transfer Out']
];

export default function MovementForm({ products = [] }) {
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
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Stock movement failed');

      setMessage('✓ Stock movement added successfully');
      form.reset();
      router.refresh();
    } catch (error) {
      alert(error.message || 'Stock movement failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <select name="productId" required defaultValue="">
          <option value="" disabled>Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name} ({p.stock} {p.unit})
            </option>
          ))}
        </select>

        <select name="type" required defaultValue="RECEIVE">
          {movementTypes.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <input name="quantity" type="number" step="0.01" min="0.01" placeholder="Quantity" required />
        <input name="batchRef" placeholder="Batch / reference (optional)" />
        <input name="note" placeholder="Note / reason (optional)" style={{ gridColumn: '1 / -1' }} />
      </div>

      {message && <div className="success-box" style={{ marginTop: 12 }}>{message}</div>}

      <div className="actions" style={{ marginTop: 12 }}>
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Add Stock Movement'}
        </button>
      </div>
    </form>
  );
}
