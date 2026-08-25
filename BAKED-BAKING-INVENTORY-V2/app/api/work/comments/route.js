import {prisma} from '../../../../lib/prisma';
import {currentUser} from '../../../../lib/auth';

export async function POST(req){
 try{
  const user=await currentUser(); if(!user)return Response.json({error:'Login required'},{status:401});
  if(user.role==='VIEW_ONLY')return Response.json({error:'View Only users cannot post comments.'},{status:403});
  const d=await req.json(); const body=String(d.body||'').trim(); if(!body)throw new Error('Comment cannot be empty');
  const x=await prisma.workComment.create({data:{itemId:Number(d.itemId),authorId:user.id,body}});
  return Response.json(x,{status:201});
 }catch(e){return Response.json({error:e.message||'Comment failed'},{status:400})}
}
