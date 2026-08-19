# Baked Baking Team Inventory

Standalone internal inventory system for the Baked Baking Team.

## Included in Version 1
- Dashboard
- Product/SKU master
- Ingredients, packaging and finished-product categories
- Current stock balances
- Low-stock thresholds
- Stock receiving
- Issue to production
- Production output
- Adjustments and wastage
- Stock movement audit history
- PostgreSQL database schema
- Production batch data model

## Technology
- Next.js (server + web interface)
- PostgreSQL
- Prisma ORM
- GitHub for source code
- Designed to deploy on Vercel or another Node.js server

## Setup
1. Upload this project to a GitHub repository.
2. Create a PostgreSQL database.
3. Copy `.env.example` to `.env.local` and place your real `DATABASE_URL` in `.env.local`.
4. Run:

```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

5. Open `http://localhost:3000`.

## Important
Never upload `.env` or `.env.local` to GitHub. They can contain database passwords.

## Planned Version 2
- Staff login and roles
- Recipe/BOM management
- Automatic ingredient consumption per baking batch
- Batch numbers and expiry dates
- Finished-product yields
- Stock counts and variances
- Supplier receiving
- Packaging stock
- CSV import/export
- Reports
