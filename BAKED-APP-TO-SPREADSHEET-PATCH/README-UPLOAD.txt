BAKED – APP TO MANAGEMENT SPREADSHEET PATCH
===========================================

PURPOSE
One-way only:
BAKED Baking Team Inventory / Work Management -> Baking Room Data Control spreadsheet.
Staff do NOT receive spreadsheet controls and spreadsheet changes do NOT feed back to the app.

WHAT THE EXPORT WRITES
A = Date
B = Item
C = Person Responsible
D = Quantity
E = Extras
F = Issues
G:K stay formula-driven by the existing workbook.

UPLOAD / MERGE
1. Put your current workbook at:
   management/Baking Room Data Control AUTOMATED.xlsx
2. Add:
   lib/production-spreadsheet-export.js
3. Add:
   app/api/management-export/route.js
4. Add ExcelJS to package.json dependencies:
   "exceljs": "^4.4.0"
5. Commit to GitHub and let Vercel deploy.

IMPORTANT MODEL CHECK
The route currently reads:
  prisma.workManagement.findMany(...)
If the current app's Prisma model has a different name, change ONLY that model name.
The export helper accepts these common field names:
  date/createdAt
  item/productName/task
  personResponsible/people/staffName/userName
  quantity/qty
  extras
  issues/issue

HOW IT WORKS
The endpoint is ADMIN-only and is not added to the staff menu.
Open /api/management-export while logged in as Admin to receive the latest management workbook.
Each app row is tagged internally with [APP:<id>] so repeated exports update the same spreadsheet row instead of duplicating it.

IMPORTANT LIMITATION
A Vercel web app cannot silently overwrite an Excel file sitting on a Windows PC. This patch creates the current management workbook from live app data without exposing it to staff. For true unattended overwrite of a cloud-hosted Excel file, the file must live in a writable cloud service (for example OneDrive/SharePoint or Google Drive) and that service must be connected separately.
