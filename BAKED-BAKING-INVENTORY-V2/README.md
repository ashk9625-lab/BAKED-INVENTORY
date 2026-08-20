# BAKED Baking Team Inventory V2

Upload this folder to replace the contents of the current `baked-baking-inventory` project folder.

Included:
- Dashboard
- Products / ingredients / packaging / finished goods
- CSV product import and CSV exports
- Stock receiving, production issues, adjustments and waste
- Suppliers
- Purchase orders + Receive All
- Recipes / BOM
- Production batches with automatic ingredient deduction and finished-goods increase
- Stock transfers / locations
- Cost price + stock valuation
- Low-stock alerts
- Reports
- Team / role register
- Batch references / traceability

## Vercel
Keep your existing `DATABASE_URL`.

Your Vercel build command should stay:
`npm run db:push && npm run build`

Because the Prisma schema has new tables and fields, the first deployment will update the database automatically.

## Important
The Team & Roles screen records staff roles but does not enforce login permissions yet.
