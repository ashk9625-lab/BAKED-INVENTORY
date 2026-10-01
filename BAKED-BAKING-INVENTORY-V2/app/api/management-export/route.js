import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const suppliedPassword = request.headers.get('x-management-password');
    const expectedPassword = process.env.MANAGEMENT_EXCEL_PASSWORD;
    if (!expectedPassword || suppliedPassword !== expectedPassword) {
      return NextResponse.json({ error: 'Incorrect management password' }, { status: 401 });
    }
    const live = await prisma.workLiveState.findUnique({ where: { id: 1 } });
    const groups = Array.isArray(live?.data?.groups) ? live.data.groups : [];
    const rows = groups.flatMap(g => (g.items || []).map(item => ({...item, groupName:g.name})))
      .filter(item => item.status === 'Done' || item.done === true)
      .sort((a,b) => new Date(a.completedAt || a.dueDate || 0) - new Date(b.completedAt || b.dueDate || 0));
    const infusionRows = await prisma.infusionBatch.findMany({ orderBy: { createdAt: 'asc' } });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Production Data');
    ws.columns = [
      { header:'Date', key:'date', width:16 },
      { header:'Item', key:'item', width:34 },
      { header:'Person Responsible', key:'person', width:24 },
      { header:'Quantity', key:'quantity', width:14 },
      { header:'Extras', key:'extras', width:12 },
      { header:'Issues', key:'issues', width:42 },
    ];
    ws.getRow(1).font = { bold:true };
    ws.views = [{ state:'frozen', ySplit:1 }];
    for (const r of rows) ws.addRow({
      date: r.completedAt ? new Date(r.completedAt) : (r.dueDate ? new Date(r.dueDate+'T12:00:00') : new Date()),
      item: r.task || '',
      person: r.owner || '',
      quantity: Number(r.quantity || 0),
      extras: Number(r.extras || 0),
      issues: r.issues || 'N/A',
    });
    ws.getColumn(1).numFmt = 'dd/mm/yyyy';

    const infusion = wb.addWorksheet('Infusion Data');
    infusion.columns = [
      { header:'Date', key:'date', width:16 },
      { header:'Section', key:'section', width:14 },
      { header:'Batch Number', key:'batch', width:20 },
      { header:'Product / Infusion', key:'product', width:30 },
      { header:'Person Responsible', key:'person', width:24 },
      { header:'Base / Input Material', key:'input', width:30 },
      { header:'Base Quantity', key:'inputQty', width:16 },
      { header:'Infusion Ingredient', key:'ingredient', width:28 },
      { header:'Infusion Quantity', key:'infusionQty', width:18 },
      { header:'Potency', key:'potency', width:18 },
      { header:'Final Yield', key:'yield', width:18 },
      { header:'Wastage', key:'wastage', width:16 },
      { header:'Status', key:'status', width:16 },
      { header:'Notes', key:'notes', width:36 },
    ];
    infusion.getRow(1).font = { bold:true };
    infusion.views = [{ state:'frozen', ySplit:1 }];
    for (const r of infusionRows) infusion.addRow({
      date:r.createdAt, section:r.section, batch:r.batchNumber, product:r.productName,
      person:r.personResponsible, input:r.inputMaterial,
      inputQty:Number(r.inputQuantity||0)+' '+(r.inputUnit||''),
      ingredient:r.infusionIngredient,
      infusionQty:Number(r.infusionQuantity||0)+' '+(r.infusionUnit||''),
      potency:r.potency==null?'':Number(r.potency)+' '+(r.potencyUnit||''),
      yield:Number(r.finalYield||0)+' '+(r.yieldUnit||''),
      wastage:Number(r.wastage||0)+' '+(r.yieldUnit||''),
      status:r.status, notes:r.notes||''
    });
    infusion.getColumn(1).numFmt = 'dd/mm/yyyy';
    const buffer = await wb.xlsx.writeBuffer();
    return new NextResponse(buffer, { headers:{
      'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':'attachment; filename="Baking Room Data Control LIVE.xlsx"',
      'Cache-Control':'no-store'
    }});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error:'Could not generate Excel report'}, {status:500});
  }
}
