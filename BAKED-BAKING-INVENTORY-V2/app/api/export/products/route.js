import {prisma} from '../../../../lib/prisma';
const q=v=>`"${String(v??'').replaceAll('"','""')}"`;
export async function GET(){const rows=await prisma.product.findMany({orderBy:{name:'asc'}});const head='sku,name,category,unit,currentStock,reorderLevel,costPrice,barcode,location';const body=rows.map(p=>[p.sku,p.name,p.category,p.unit,Number(p.currentStock),Number(p.reorderLevel),Number(p.costPrice),p.barcode,p.location].map(q).join(',')).join('\n');return new Response(head+'\n'+body,{headers:{'content-type':'text/csv','content-disposition':'attachment; filename="baked-products.csv"'}});}
