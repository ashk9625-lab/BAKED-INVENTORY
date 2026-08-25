import {prisma} from '../../../../../lib/prisma';
import {currentUser} from '../../../../../lib/auth';

export async function GET(req,{params}){
 const user=await currentUser(); if(!user)return Response.json({error:'Login required'},{status:401});
 const p=await params; const id=Number(p.id);
 const board=await prisma.workBoard.findUnique({
  where:{id},
  include:{workspace:true,items:{include:{assignee:true,createdBy:true,comments:{include:{author:true},orderBy:{createdAt:'asc'}}},orderBy:[{status:'asc'},{createdAt:'asc'}]}}
 });
 if(!board)return Response.json({error:'Board not found'},{status:404});
 return Response.json({
  id:board.id,name:board.name,description:board.description||'',workspace:board.workspace.name,
  items:board.items.map(i=>({
   id:i.id,title:i.title,description:i.description||'',status:i.status,priority:i.priority,
   dueDate:i.dueDate?i.dueDate.toISOString().slice(0,10):'',
   assignee:i.assignee?{id:i.assignee.id,name:i.assignee.name}:null,
   createdBy:i.createdBy?.name||'Unknown',
   comments:i.comments.map(c=>({id:c.id,body:c.body,author:c.author?.name||'Unknown',createdAt:c.createdAt.toISOString()}))
  }))
 });
}
