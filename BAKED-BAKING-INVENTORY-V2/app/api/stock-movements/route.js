import {prisma} from '../../../lib/prisma';
import {currentUser} from '../../../lib/auth';

const positive=new Set(['RECEIVE','PRODUCTION_OUTPUT','ADJUSTMENT_IN','TRANSFER_IN']);
const negative=new Set(['ISSUE_TO_PRODUCTION','ADJUSTMENT_OUT','WASTE','TRANSFER_OUT']);

export async function POST(req){
  try{
    const user=await currentUser();
    if(!user) return Response.json({error:'Login required'},{status:401});
    if(!['ADMIN','MANAGER','STAFF','STOCK'].includes(user.role))
      return Response.json({error:'You do not have permission to change stock.'},{status:403});

    const d=await req.json();
    const qty=Number(d.quantity);
    if(!(qty>0)) throw new Error('Quantity must be greater than zero');
    const pid=Number(d.productId);

    const m=await prisma.$transaction(async tx=>{
      const p=await tx.product.findUnique({where:{id:pid}});
      if(!p) throw new Error('Product not found');

      const delta=positive.has(d.type)?qty:negative.has(d.type)?-qty:0;
      const next=Number(p.currentStock)+delta;
      if(next<0) throw new Error('Not enough stock');

      const move=await tx.stockMovement.create({
        data:{
          productId:pid,
          type:d.type,
          quantity:qty,
          note:d.note||null,
          batchRef:d.batchRef||null,
          staffId:user.id
        }
      });

      await tx.product.update({where:{id:pid},data:{currentStock:next}});
      return move;
    });

    return Response.json(m,{status:201});
  }catch(e){
    return Response.json({error:e.message||'Movement failed'},{status:400});
  }
}
