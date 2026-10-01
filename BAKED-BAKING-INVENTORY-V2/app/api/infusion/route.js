import {prisma} from '../../../lib/prisma';
import {currentUser} from '../../../lib/auth';

const allowed=new Set(['BUTTER','OIL','VAPE','COSMETIC']);
export async function POST(req){
 try{
  const user=await currentUser();
  if(!user) return Response.json({error:'Login required'},{status:401});
  if(!['ADMIN','MANAGER','STAFF','PRODUCTION'].includes(user.role)) return Response.json({error:'Permission denied'},{status:403});
  const d=await req.json();
  const section=String(d.section||'').toUpperCase();
  if(!allowed.has(section)) throw new Error('Invalid infusion section');
  const result=await prisma.infusionBatch.create({data:{
   section,batchNumber:String(d.batchNumber||'').trim(),productName:String(d.productName||'').trim(),
   inputMaterial:String(d.inputMaterial||'').trim(),inputQuantity:Number(d.inputQuantity),inputUnit:String(d.inputUnit||'g').trim(),
   infusionIngredient:String(d.infusionIngredient||'').trim(),infusionQuantity:Number(d.infusionQuantity),infusionUnit:String(d.infusionUnit||'g').trim(),
   potency:d.potency===''||d.potency==null?null:Number(d.potency),potencyUnit:d.potencyUnit||null,
   personResponsible:String(d.personResponsible||user.name||user.email||'').trim(),finalYield:Number(d.finalYield),yieldUnit:String(d.yieldUnit||'g').trim(),
   wastage:Number(d.wastage||0),status:String(d.status||'COMPLETED'),notes:d.notes||null
  }});
  return Response.json(result,{status:201});
 }catch(e){return Response.json({error:e.message||'Could not save infusion batch'},{status:400});}
}
