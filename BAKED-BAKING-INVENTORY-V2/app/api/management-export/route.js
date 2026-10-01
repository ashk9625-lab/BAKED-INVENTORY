import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const rows = await prisma.productionBatch.findMany({ orderBy: { createdAt: 'asc' } });
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
      date: r.createdAt,
      item: r.productName || '',
      person: '',
      quantity: Number(r.quantityMade || 0),
      extras: 0,
      issues: r.notes || 'N/A',
    });
    ws.getColumn(1).numFmt = 'dd/mm/yyyy';
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
