import {prisma} from '../../../lib/prisma';
import {currentUser} from '../../../lib/auth';

export async function POST(req){
  try{
    const user=await currentUser();
    if(!user) return Response.json({error:'Login required'},{status:401});
    if(!['ADMIN','MANAGER','STAFF','PRODUCTION'].includes(user.role))
      return Response.json({error:'You do not have permission to add production.'},{status:403});

    const d=await req.json();
    const mult=Number(d.multiplier||1);
    if(!(mult>0)) throw new Error('Multiplier must be greater than zero');
    const rid=Number(d.recipeId);

    const result=await prisma.$transaction(async tx=>{
      const r=await tx.recipe.findUnique({
        where:{id:rid},
        include:{items:{include:{product:true}},outputProduct:true}
      });
      if(!r) throw new Error('Recipe not found');

      for(const i of r.items){
        const need=Number(i.quantity)*mult;
        if(Number(i.product.currentStock)<need)
          throw new Error(`Not enough ${i.product.name}. Need ${need} ${i.product.unit}`);
      }

      for(const i of r.items){
        const need=Number(i.quantity)*mult;
        await tx.product.update({
          where:{id:i.productId},
          data:{currentStock:Number(i.product.currentStock)-need}
        });
        await tx.stockMovement.create({
          data:{
            productId:i.productId,
            type:'ISSUE_TO_PRODUCTION',
            quantity:need,
            batchRef:d.batchNumber,
            note:`Recipe: ${r.name}`,
            staffId:user.id
          }
        });
      }

      const made=Number(r.outputQuantity)*mult;
      await tx.product.update({
        where:{id:r.outputProductId},
        data:{currentStock:Number(r.outputProduct.currentStock)+made}
      });
      await tx.stockMovement.create({
        data:{
          productId:r.outputProductId,
          type:'PRODUCTION_OUTPUT',
          quantity:made,
          batchRef:d.batchNumber,
          note:`Recipe: ${r.name}`,
          staffId:user.id
        }
      });

      return tx.productionBatch.create({
        data:{
          batchNumber:d.batchNumber,
          recipeId:r.id,
          productName:r.outputProduct.name,
          quantityMade:made,
          unit:r.outputProduct.unit,
          notes:d.notes||null
        }
      });
    });

    return Response.json(result,{status:201});
  }catch(e){
    return Response.json({error:e.message||'Production failed'},{status:400});
  }
}
