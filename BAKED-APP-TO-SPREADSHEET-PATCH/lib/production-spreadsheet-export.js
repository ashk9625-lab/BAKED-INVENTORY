import ExcelJS from 'exceljs';
import path from 'path';

const STAFF = ['Siya', 'Sena', 'Sam', 'Kristin'];

function monthSheetName(date) {
  const d = new Date(date);
  const month = d.toLocaleString('en-GB', { month: 'short', timeZone: 'Africa/Johannesburg' });
  const yy = String(d.getFullYear()).slice(-2);
  return `${month} '${yy}`;
}

function personText(entry) {
  if (entry.personResponsible) return entry.personResponsible;
  if (Array.isArray(entry.people) && entry.people.length) {
    if (STAFF.every(n => entry.people.includes(n))) return 'All';
    return entry.people.join(' & ');
  }
  return entry.staffName || entry.userName || '';
}

export async function buildManagementWorkbook(entries) {
  const workbook = new ExcelJS.Workbook();
  const templatePath = path.join(process.cwd(), 'management', 'Baking Room Data Control AUTOMATED.xlsx');
  await workbook.xlsx.readFile(templatePath);

  // Do not alter historical spreadsheet entries. App-managed rows are identified by a note in col F.
  for (const entry of entries) {
    const sheetName = monthSheetName(entry.date || entry.createdAt);
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) continue;

    // Use a stable ID to avoid duplicates on repeated exports.
    const marker = `[APP:${entry.id}]`;
    let targetRow = null;
    for (let r = 2; r <= ws.rowCount; r++) {
      if (String(ws.getCell(r, 6).value || '').includes(marker)) {
        targetRow = r;
        break;
      }
    }
    if (!targetRow) {
      targetRow = 2;
      while (targetRow <= ws.rowCount && ws.getCell(targetRow, 1).value) targetRow++;
    }

    const d = new Date(entry.date || entry.createdAt);
    ws.getCell(targetRow, 1).value = d;
    ws.getCell(targetRow, 2).value = entry.item || entry.productName || entry.task || '';
    ws.getCell(targetRow, 3).value = personText(entry);
    ws.getCell(targetRow, 4).value = Number(entry.quantity ?? entry.qty ?? 0);
    ws.getCell(targetRow, 5).value = Number(entry.extras ?? 0);
    const issueText = entry.issues || entry.issue || 'N/A';
    ws.getCell(targetRow, 6).value = `${issueText} ${marker}`.trim();

    // Copy the existing formula pattern into G:K for the inserted row.
    for (let c = 7; c <= 11; c++) {
      const prev = ws.getCell(Math.max(2, targetRow - 1), c);
      if (prev.value && typeof prev.value === 'object' && prev.value.formula) {
        ws.getCell(targetRow, c).value = { formula: prev.value.formula.replace(/\d+/g, String(targetRow)) };
      } else if (typeof prev.value === 'string' && prev.value.startsWith('=')) {
        ws.getCell(targetRow, c).value = prev.value.replace(/\d+/g, String(targetRow));
      }
    }
  }

  return workbook.xlsx.writeBuffer();
}
