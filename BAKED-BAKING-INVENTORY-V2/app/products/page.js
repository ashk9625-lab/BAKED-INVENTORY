import {Shell} from '../components';
import {prisma} from '../../lib/prisma';
import ProductManager from './product-manager';

export const dynamic='force-dynamic';

export default async function Page(){
  const rows=await prisma.product.findMany({orderBy:{name:'asc'}});
  const products=rows.map(x=>({
    id:x.id,
    sku:x.sku,
    name:x.name,
    category:x.category,
    unit:x.unit,
    barcode:x.barcode||'',
    location:x.location||'',
    costPrice:Number(x.costPrice),
    reorderLevel:Number(x.reorderLevel),
    currentStock:Number(x.currentStock),
    active:x.active
  }));

  return <Shell>
    <div className="topbar">
      <div className="title">
        <h1>Products</h1>
        <p>Add, edit and manage inventory products.</p>
      </div>
    </div>
    <ProductManager initial={products}/>
  </Shell>;
}
