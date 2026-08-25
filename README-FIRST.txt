BAKED INVENTORY V3 – LOGIN, PERMISSIONS & STAFF AUDIT
=====================================================

THIS PACKAGE IS MADE FOR:
BAKED-INVENTORY / BAKED-BAKING-INVENTORY-V2

WHAT THIS ADDS
--------------
1. Supplier list is editable. Admin/Manager can edit and save supplier details.
2. Production shows "✓ Added successfully" after a successful production batch.
3. Purchase Orders removed from the sidebar/dashboard and old PO URLs are disabled.
4. Staff login system.
5. Permission levels:
   - ADMIN: full access + Team & Permissions
   - MANAGER: operational access including suppliers/products/recipes
   - STAFF: stock and production operational access
   - VIEW_ONLY: can view but cannot change inventory data
   Existing legacy STOCK / PRODUCTION roles remain compatible for stock/production actions.
6. Every manual stock movement records the logged-in staff member.
7. Production stock deductions/output also record the logged-in staff member.
8. Stock Movement history and CSV export now include the staff name.
9. Dashboard Recent Activity shows the staff member.
10. Existing Install App button remains supported.

IMPORTANT – FIRST LOGIN
-----------------------
After Vercel finishes deploying:
1. Open https://baked-inventory.vercel.app
2. You should be sent to Staff Login.
3. Because no login password exists yet, click "Create First Admin".
4. Enter the Admin name, email and a password of at least 8 characters.
5. You will be signed in automatically.
6. Go to Team & Permissions to create staff logins.

EXISTING TEAM MEMBERS
---------------------
Existing Team & Roles rows are kept.
They cannot login until an Admin gives them a password.
The Admin can either:
- add a new staff login, or
- edit an existing account and set a New Password.

HOW TO UPLOAD
-------------
1. Extract this ZIP.
2. In GitHub open the BAKED-INVENTORY repository.
3. Upload/merge the included BAKED-BAKING-INVENTORY-V2 folder into the EXISTING
   BAKED-BAKING-INVENTORY-V2 folder.
4. Replace matching files when GitHub asks.
5. Do NOT upload these files into BAKED-BAKING-INVENTORY-V1.
6. Wait for Vercel to deploy.

DATABASE
--------
Vercel already runs:
  prisma db push
before:
  next build

This V3 schema only ADDS nullable login/audit fields to the current tables.
It deliberately keeps the old PurchaseOrder database models so deployment does not
need a destructive database reset. The Purchase Orders feature is disabled in the app.

OPTIONAL SECURITY SETTING
-------------------------
The app can use DATABASE_URL as the session signing secret automatically.
For better separation, add a Vercel environment variable named:
  AUTH_SECRET
with a long random value, then redeploy.

ROLLBACK
--------
Keep a copy of your current V2 files before uploading if you want a quick rollback.

FILES INCLUDED
--------------
- prisma/schema.prisma
- middleware.js
- lib/auth.js
- app/components.js
- app/client-submit.js
- login/setup/auth routes
- supplier editing files/API
- production confirmation + staff audit
- stock movement staff audit + export
- Team & Permissions login management
- dashboard PO removal + staff activity
- purchase-order disable stubs
- updated globals.css
