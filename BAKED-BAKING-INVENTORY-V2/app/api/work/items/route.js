import {prisma} from '../../../../lib/prisma';
import {currentUser} from '../../../../lib/auth';

export async function POST(req){
 try{
  const user=await currentUser(); if(!user)return Response.json({error:'Login required'},{status:401});
  if(user.role==='VIEW_ONLY')return Response.json({error:'View Only users cannot add items.'},{status:403});
  const d=await req.json();
  const x=await prisma.workItem.create({data:{
   boardId:Number(d.boardId),title:String(d.title||'').trim(),description:d.description||null,
   status:d.status||'TO_DO',priority:d.priority||'MEDIUM',
   dueDate:d.dueDate?new Date(`${d.dueDate}T12:00:00`):null,
   assigneeId:d.assigneeId?Number(d.assigneeId):null,createdById:user.id
  }});
  return Response.json(x,{status:201});
 }catch(e){return Response.json({error:e.message||'Item failed'},{status:400})}
}
