import {prisma} from '../../../../lib/prisma';
import {currentUser} from '../../../../lib/auth';
export async function POST(req){
 try{
  const user=await currentUser(); if(!user)return Response.json({error:'Login required'},{status:401});
  if(user.role==='VIEW_ONLY')return Response.json({error:'View Only users cannot create workspaces.'},{status:403});
  const d=await req.json(); const name=String(d.name||'').trim(); if(!name)throw new Error('Workspace name required');
  const x=await prisma.workWorkspace.create({data:{name}});
  return Response.json(x,{status:201});
 }catch(e){return Response.json({error:e.message||'Workspace failed'},{status:400})}
}
