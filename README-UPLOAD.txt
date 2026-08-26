BAKED INVENTORY - LIVE WORK MANAGEMENT + MANAGER ALERTS

Upload these files into the existing BAKED-INVENTORY repository while preserving the folder paths:

1) BAKED-BAKING-INVENTORY-V2/app/api/work/live-state/route.js  (NEW)
2) BAKED-BAKING-INVENTORY-V2/app/app/work-management/work-management-client.js  (REPLACE)
3) BAKED-BAKING-INVENTORY-V2/app/app/work-management/work-management.css  (REPLACE)

What it does:
- Stores Work Management board state in the shared PostgreSQL database instead of localStorage.
- Polls every 5 seconds so manager/admin can see staff changes from other devices.
- Adds a Live Manager Feed.
- Adds Alerts for Stuck, Overdue and Urgent tasks.
- Records staff activity with name and timestamp.
- Uses raw SQL tables created automatically; no Prisma schema change is required.

After the GitHub commit, Vercel should deploy automatically.
