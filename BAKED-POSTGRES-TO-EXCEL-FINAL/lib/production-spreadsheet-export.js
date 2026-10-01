import ExcelJS from 'exceljs';
import path from 'path';

const STAFF = ['Siya', 'Sena', 'Sam', 'Kristin'];

function asDate(v) {
  const d = v instanceof Date ? v : new Date(v || Date.now());
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
function monthSheetName(value) {
  const d = asDate(value);
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Africa/Johannesburg' }).format(d);
  const year = new Intl.DateTimeFormat('en-GB', { year: '2-digit', timeZone: 'Africa/Johannesburg' }).format(d);
  return `${month} '${year}`;
}
function first(entry, names, fallback = '') {
  for (const n of names) if (entry?.[n] !== undefined && entry?.[n] !== null && entry?.[n] !== '') return entry[n];
  return fallback;
}
function personText(entry) {
  const direct = first(entry, ['personResponsible','staffName','userName','employeeName','assignedTo']);
  if (direct) return String(direct);
  const people = entry?.people || entry?.staff || entry?.workers;
  if (Array.isArray(people) && people.length) {
    const names = people.map(p => typeof p === 'string' ? p : (p?.name || p?.staffName || '')).filter(Boolean);
    if (STAFF.every(n => names.includes(n))) return 'All';
    return names.join(' & ');
  }
  return '';
}
function copyFormulaPattern(ws, row) {
  const sourceRow = row > 2 ? row - 1 : 3;
  for (let c = 7; c <= 11; c++) {
    const src = ws.getCell(sourceRow, c);
    const dst = ws.getCell(row, c);
    if (src.value && typeof src.value === 'object' && src.value.formula) {
      dst.value = { formula: String(src.value.formula).replace(/([A-Z]+)\d+/g, `$1${row}`) };
    } else if (typeof src.value === 'string' && src.value.startsWith('=')) {
      dst.value = src.value.replace(/([A-Z]+)\d+/g, `$1${row}`);
    }
  }
}

export async function buildManagementWorkbook(entries) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(process.cwd(), 'management', 'Baking Room Data Control AUTOMATED.xlsx'));

  for (const entry of entries) {
    const when = first(entry, ['date','workDate','productionDate','completedAt','createdAt'], new Date());
    const ws = workbook.getWorksheet(monthSheetName(when));
    if (!ws) continue;

    const id = first(entry, ['id','workId','taskId'], `${asDate(when).getTime()}-${first(entry,['item','productName','task','product'])}`);
    const marker = `[APP:${id}]`;
    let row = null;
    for (let r = 2; r <= Math.max(ws.rowCount, 2); r++) {
      if (String(ws.getCell(r, 6).value || '').includes(marker)) { row = r; break; }
    }
    if (!row) {
      row = 2;
      while (ws.getCell(row, 1).value) row++;
    }

    ws.getCell(row, 1).value = asDate(when);
    ws.getCell(row, 2).value = String(first(entry, ['item','productName','task','product','name']));
    ws.getCell(row, 3).value = personText(entry);
    ws.getCell(row, 4).value = Number(first(entry, ['quantity','qty','totalMade','made'], 0)) || 0;
    ws.getCell(row, 5).value = Number(first(entry, ['extras','extra'], 0)) || 0;
    const issue = String(first(entry, ['issues','issue','notes','comment'], 'N/A'));
    ws.getCell(row, 6).value = `${issue} ${marker}`.trim();
    copyFormulaPattern(ws, row);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
