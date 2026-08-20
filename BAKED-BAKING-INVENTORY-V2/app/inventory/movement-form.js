'use client'; import {useSubmit} from '../client-submit';
export default function F({products}){const {submit,busy}=useSubmit('/api/stock-movements');return <form onSubmit={submit}><div className="form-grid">
<select name="productId" required defaultValue=""><option value="" disabled>Product</option>{products.map(p=><option key={p.id} value={p.id}>{p.sku} — {p.name} ({p.stock} {p.unit})</option>)}</select>
<select name="type" defaultValue="RECEIVE"><option>RECEIVE</option><option>ISSUE_TO_PRODUCTION</option><option>PRODUCTION_OUTPUT</option><option>ADJUSTMENT_IN</option><option>ADJUSTMENT_OUT</option><option>WASTE</option></select>
<input name="quantity" type="number" step="0.01" min="0.01" placeholder="Quantity" required/><input name="batchRef" placeholder="Batch / lot ref"/><input name="note" placeholder="Reason / note"/>
</div><div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Saving...':'Save Movement'}</button></div></form>}
