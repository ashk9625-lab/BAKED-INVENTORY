import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/auth';
import { buildManagementWorkbook } from '../../../lib/production-spreadsheet-export';

export async function GET() {
  const user = await requireUser(['ADMIN']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // IMPORTANT: Rename `workManagement` below only if your Prisma model uses a different name.
  const entries = await prisma.workManagement.findMany({ orderBy: { createdAt: 'asc' } });
  const buffer = await buildManagementWorkbook(entries);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Baking Room Data Control UPDATED.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
