BAKED INVENTORY V4 – WORK MANAGEMENT
====================================

This upgrade ADDS a Monday.com-style work-management module INSIDE the existing
BAKED Inventory app. It is not a separate website.

FIRST VERSION INCLUDES:
- Workspaces
- Boards
- Tasks / Items
- Owner / staff assignment
- Status
- Priority
- Due dates
- Descriptions
- Comments / Updates
- Table view
- Kanban view
- Same BAKED Inventory login and staff permissions
- Same PWA / Install App

IMPORTANT:
The current V3 database change previously failed because TeamMember.updatedAt
was required without a default.

BEFORE DEPLOYING V4, change this in prisma/schema.prisma:
  updatedAt DateTime @updatedAt
TO:
  updatedAt DateTime @default(now()) @updatedAt

Then follow WORK-MANAGEMENT-SCHEMA-ADD.txt to add the work-management models.

Also:
- add ['/work','Work Management'] to app/components.js
- append app/ADD-TO-globals.css.txt to app/globals.css
- add the included app/work and app/api/work folders

Do not delete the existing inventory pages. This is an integrated module.

This package intentionally does not copy Monday.com's branding or proprietary
visual design; it recreates the work-management workflow inside BAKED Inventory.
