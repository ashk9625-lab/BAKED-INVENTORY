BAKED – POSTGRESQL TO EXCEL (FINAL SETUP)
=========================================

FINAL FLOW
Baking staff enter work in BAKED App
        ↓
Existing Prisma/PostgreSQL database saves the work
        ↓
Management Excel is generated from the live database

NO ONEDRIVE.
NO SPREADSHEET INPUT BY STAFF.
NO EXPORT STEP FOR STAFF.
NO EXCEL -> APP SYNC.

UPLOAD THESE FILES INTO THE EXISTING BAKED INVENTORY PROJECT
------------------------------------------------------------
1) app/api/management-export/route.js
2) lib/production-spreadsheet-export.js
3) management/Baking Room Data Control AUTOMATED.xlsx

PACKAGE.JSON
------------
Inside the existing dependencies object add:

  "exceljs": "^4.4.0"

Do not replace your existing package.json with a small patch file.

AFTER GITHUB UPLOAD
-------------------
Commit the changes and let Vercel deploy.

MANAGEMENT EXCEL
----------------
Open this address on the live site:

  /api/management-export

Example:
  https://baked-inventory.vercel.app/api/management-export

It creates "Baking Room Data Control LIVE.xlsx" from the CURRENT database records.
Therefore work entered today is already included when management opens the workbook.

WORKBOOK MAPPING
----------------
A  Date
B  Item
C  Person Responsible
D  Quantity
E  Extras
F  Issues
G:K Existing spreadsheet formula area

The exporter recognises common Work Management field names automatically and tries these Prisma model names:
workManagement, workEntry, workRecord, productionWork, productionEntry, productionBatch.

IMPORTANT
---------
This does not overwrite a file on a Windows computer. PostgreSQL is the permanent live record. Excel is a management report generated from that live record.

If the endpoint displays "Work Management model not found", send ChatGPT the current prisma/schema.prisma file. Only the model name mapping will need adjustment.
