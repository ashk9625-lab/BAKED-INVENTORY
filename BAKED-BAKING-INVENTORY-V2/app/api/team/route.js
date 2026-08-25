import {prisma} from '../../../lib/prisma';
import {currentUser,hashPassword} from '../../../lib/auth';

async function admin(){
  const user=await currentUser();
  if(!user) return {error:Response.json({error:'Login required'},{status:401})};
  if(user.role!=='ADMIN') return {error:Response.json({error:'Admin permission required'},{status:403})};
  return {user};
}

export async function POST(req){
  try{
    const auth=await admin(); if(auth.error) return auth.error;
    const d=await req.json();
    const x=await prisma.teamMember.create({
      data:{
        name:d.name.trim(),
        email:d.email.trim().toLowerCase(),
        role:d.role||'STAFF',
        passwordHash:hashPassword(d.password),
        active:true
      }
    });
    return Response.json(x,{status:201});
  }catch(e){
    return Response.json({error:e.message||'Could not add team member. Email may already exist.'},{status:400});
  }
}

export async function PATCH(req){
  try{
    const auth=await admin(); if(auth.error) return auth.error;
    const d=await req.json();
    const id=Number(d.id);
    if(!id) throw new Error('Staff ID missing');

    if(id===auth.user.id && d.active===false)
      throw new Error('You cannot deactivate your own account.');

    const data={
      name:String(d.name||'').trim(),
      role:d.role||'STAFF',
      active:Boolean(d.active)
    };
    if(d.password) data.passwordHash=hashPassword(d.password);

    const x=await prisma.teamMember.update({where:{id},data});
    return Response.json({id:x.id,name:x.name,email:x.email,role:x.role,active:x.active});
  }catch(e){
    return Response.json({error:e.message||'Could not update staff account.'},{status:400});
  }
}
