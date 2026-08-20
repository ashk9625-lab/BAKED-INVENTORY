import {prisma} from '../../../lib/prisma';
export async function POST(req){try{const d=await req.json();const x=await prisma.teamMember.create({data:{name:d.name.trim(),email:d.email.trim().toLowerCase(),role:d.role||'STAFF'}});return Response.json(x,{status:201});}catch(e){return Response.json({error:'Could not add team member. Email may already exist.'},{status:400});}}
