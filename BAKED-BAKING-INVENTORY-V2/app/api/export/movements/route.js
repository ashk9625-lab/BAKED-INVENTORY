import {prisma} from '../../../../lib/prisma';
const q=v=>`"${String(v??'').replaceAll('"','""')}"`;
export async function GET(){const rows=await prisma.stockMovement.findMany({include:{product:true},orderBy:{createdAt:'desc'}});const head='date,sku,product,type,quantity,batchRef,note';const body=rows.map(m=>[m.createdAt.toISOString(),m.product.sku,m.product.name,m.type,Number(m.quantity),m.batchRef,m.note].map(q).join(',')).join('\n');return new Response(head+'\n'+body,{headers:{'content-type':'text/csv','content-disposition':'attachment; filename="baked-stock-movements.csv"'}});}
