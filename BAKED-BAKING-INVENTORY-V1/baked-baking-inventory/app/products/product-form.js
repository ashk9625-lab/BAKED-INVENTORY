'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function ProductForm(){
 const router=useRouter(); const [busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault(); setBusy(true); const data=Object.fromEntries(new FormData(e.currentTarget)); const r=await fetch('/api/products',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)}); setBusy(false); if(r.ok){e.currentTarget.reset();router.refresh();} else alert('Could not add product');}
 return <form onSubmit={submit}><div className="form-grid"><input name="sku" placeholder="SKU" required/><input name="name" placeholder="Product name" required/><select name="category" defaultValue="Ingredient"><option>Ingredient</option><option>Packaging</option><option>Finished Product</option></select><input name="unit" placeholder="Unit e.g. kg, g, unit" defaultValue="unit"/><input name="reorderLevel" type="number" step="0.01" placeholder="Reorder level" defaultValue="0"/></div><div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Saving...':'Add Product'}</button></div></form>
}
