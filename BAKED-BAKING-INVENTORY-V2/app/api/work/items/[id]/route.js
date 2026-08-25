import {prisma} from '../../../../../lib/prisma';
import {currentUser} from '../../../../../lib/auth';

export async function PATCH(req,{params}){
 try{
  const user=await currentUser(); if(!user)return Response.json({error:'Login required'},{status:401});
  if(user.role==='VIEW_ONLY')return Response.json({error:'View Only users cannot update items.'},{status:403});
  const p=await params; const d=await req.json(); const data={};
  for(const k of ['title','description','status','priority']) if(k in d)data[k]=d[k]||null;
  if('assigneeId'in d)data.assigneeId=d.assigneeId?Number(d.assigneeId):null;
  if('dueDate'in d)data.dueDate=d.dueDate?new Date(`${d.dueDate}T12:00:00`):null;
  const x=await prisma.workItem.update({where:{id:Number(p.id)},data});
  return Response.json(x);
 }catch(e){return Response.json({error:e.message||'Update failed'},{status:400})}
}
