import {prisma} from '../../../lib/prisma';
import {currentUser} from '../../../lib/auth';

async function manager(){
  const user=await currentUser();
  if(!user) return {error:Response.json({error:'Login required'},{status:401})};
  if(!['ADMIN','MANAGER'].includes(user.role))
    return {error:Response.json({error:'Only Admin or Manager can change products.'},{status:403})};
  return {user};
}

function clean(d){
  return {
    sku:String(d.sku||'').trim(),
    name:String(d.name||'').trim(),
    category:String(d.category||'').trim(),
    unit:String(d.unit||'unit').trim()||'unit',
    barcode:d.barcode?String(d.barcode).trim():null,
    location:d.location?String(d.location).trim():null,
    costPrice:Number(d.costPrice||0),
    reorderLevel:Number(d.reorderLevel||0),
    active:d.active===undefined?true:Boolean(d.active)
  };
}

function out(x){
  return {
    id:x.id,sku:x.sku,name:x.name,category:x.category,unit:x.unit,
    barcode:x.barcode||'',location:x.location||'',costPrice:Number(x.costPrice),
    reorderLevel:Number(x.reorderLevel),currentStock:Number(x.currentStock),active:x.active
  };
}

export async function POST(req){
  try{
    const auth=await manager(); if(auth.error) return auth.error;
    const d=await req.json();
    const data=clean(d);
    if(!data.sku||!data.name||!data.category) throw new Error('SKU, product name and category are required');
    const x=await prisma.product.create({
      data:{...data,currentStock:Number(d.currentStock||0)}
    });
    return Response.json(out(x),{status:201});
  }catch(e){
    return Response.json({error:e.code==='P2002'?'SKU already exists':(e.message||'Product failed')},{status:400});
  }
}

export async function PATCH(req){
  try{
    const auth=await manager(); if(auth.error) return auth.error;
    const d=await req.json();
    const id=Number(d.id);
    if(!id) throw new Error('Product ID missing');
    const data=clean(d);
    if(!data.sku||!data.name||!data.category) throw new Error('SKU, product name and category are required');
    const x=await prisma.product.update({where:{id},data});
    return Response.json(out(x));
  }catch(e){
    return Response.json({error:e.code==='P2002'?'SKU already exists':(e.message||'Product update failed')},{status:400});
  }
}

export async function DELETE(req){
  try{
    const auth=await manager(); if(auth.error) return auth.error;
    const d=await req.json();
    const id=Number(d.id);
    if(!id) throw new Error('Product ID missing');

    const x=await prisma.product.findUnique({
      where:{id},
      include:{_count:{select:{movements:true,purchaseItems:true,recipeInputs:true,recipeOutputs:true,transfers:true}}}
    });
    if(!x) return Response.json({error:'Product not found'},{status:404});

    const linked=Object.values(x._count).some(n=>n>0);
    if(linked)
      return Response.json({error:'This product is linked to existing inventory records and cannot be deleted. Set it inactive instead.'},{status:409});

    await prisma.product.delete({where:{id}});
    return Response.json({ok:true,id});
  }catch(e){
    return Response.json({error:e.message||'Product delete failed'},{status:400});
  }
}
