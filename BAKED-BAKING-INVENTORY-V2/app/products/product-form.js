'use client'; import {useSubmit} from '../client-submit';
export default function ProductForm(){const {submit,busy}=useSubmit('/api/products');return <form onSubmit={submit}><div className="label">Add Product</div><div className="form-grid" style={{marginTop:12}}>
<input name="sku" placeholder="SKU" required/><input name="name" placeholder="Product name" required/>
<select name="category" defaultValue="Ingredient"><option>Ingredient</option><option>Packaging</option><option>Finished Product</option><option>Cleaning</option><option>Other</option></select>
<input name="unit" defaultValue="unit" placeholder="Unit"/><input name="reorderLevel" type="number" step="0.01" defaultValue="0" placeholder="Reorder level"/>
<input name="costPrice" type="number" step="0.01" defaultValue="0" placeholder="Cost price"/><input name="location" placeholder="Storage location"/><input name="barcode" placeholder="Barcode"/>
</div><div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Saving...':'Add Product'}</button></div></form>}
