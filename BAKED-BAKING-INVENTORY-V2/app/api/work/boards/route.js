import {prisma} from '../../../../lib/prisma';
import {currentUser} from '../../../../lib/auth';
export async function POST(req){
 try{
  const user=await currentUser(); if(!user)return Response.json({error:'Login required'},{status:401});
  if(user.role==='VIEW_ONLY')return Response.json({error:'View Only users cannot create boards.'},{status:403});
  const d=await req.json();
  const x=await prisma.workBoard.create({data:{workspaceId:Number(d.workspaceId),name:String(d.name||'').trim(),description:d.description||null}});
  return Response.json(x,{status:201});
 }catch(e){return Response.json({error:e.message||'Board failed'},{status:400})}
}
