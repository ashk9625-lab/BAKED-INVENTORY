import {prisma} from '../../../lib/prisma';
import {currentUser} from '../../../lib/auth';

async function manager() {
  const user=await currentUser();
  if(!user) return {error:Response.json({error:'Login required'},{status:401})};
  if(!['ADMIN','MANAGER'].includes(user.role))
    return {error:Response.json({error:'Only Admin or Manager can change suppliers.'},{status:403})};
  return {user};
}

export async function POST(req){
  try{
    const auth=await manager(); if(auth.error) return auth.error;
    const d=await req.json();
    const x=await prisma.supplier.create({
      data:{
        name:d.name.trim(),
        contactPerson:d.contactPerson||null,
        email:d.email||null,
        phone:d.phone||null,
        leadTimeDays:Number(d.leadTimeDays||0),
        notes:d.notes||null
      }
    });
    return Response.json(x,{status:201});
  }catch(e){
    return Response.json({error:e.message||'Supplier failed'},{status:400});
  }
}

export async function PATCH(req){
  try{
    const auth=await manager(); if(auth.error) return auth.error;
    const d=await req.json();
    const id=Number(d.id);
    if(!id) throw new Error('Supplier ID missing');
    const x=await prisma.supplier.update({
      where:{id},
      data:{
        name:String(d.name||'').trim(),
        contactPerson:d.contactPerson||null,
        email:d.email||null,
        phone:d.phone||null,
        leadTimeDays:Number(d.leadTimeDays||0),
        notes:d.notes||null,
        active:Boolean(d.active)
      }
    });
    return Response.json(x);
  }catch(e){
    return Response.json({error:e.message||'Supplier update failed'},{status:400});
  }
}

export async function DELETE(req){
  try{
    const auth=await manager(); if(auth.error) return auth.error;

    const d=await req.json();
    const id=Number(d.id);
    if(!id) throw new Error('Supplier ID missing');

    const supplier=await prisma.supplier.findUnique({
      where:{id},
      include:{_count:{select:{purchaseOrders:true}}}
    });

    if(!supplier)
      return Response.json({error:'Supplier not found'},{status:404});

    if(supplier._count.purchaseOrders>0)
      return Response.json({
        error:'This supplier is linked to existing purchase orders and cannot be deleted. Set the supplier to inactive instead.'
      },{status:409});

    await prisma.supplier.delete({where:{id}});
    return Response.json({ok:true,id});
  }catch(e){
    return Response.json({error:e.message||'Supplier delete failed'},{status:400});
  }
}
