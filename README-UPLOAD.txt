BAKED BAKING TEAM INVENTORY — BACK BUTTON UPGRADE

PURPOSE
Adds a phone/desktop friendly Back button without changing Work Management,
inventory, PostgreSQL data, or the Excel reporting integration.

FILES
1. app/back-button.js
   ADD this new file to your existing app folder.

2. app/back-button-add-to-globals.css
   DO NOT upload this file as globals.css.
   Open it, copy its contents, and paste them at the BOTTOM of:
   app/globals.css

3. BACK-BUTTON-EXAMPLE.txt
   Shows the two lines needed on any internal page where the Back button
   should appear.

HOW TO ADD IT TO A PAGE
At the top of the page, import BackButton. The relative path depends on
where that page lives.

Then place:
    <BackButton />

immediately before the page heading/content.

BEHAVIOUR
- If the user navigated from another BAKED screen, Back returns there.
- If there is no useful browser history, it falls back to the Dashboard (/).
- It does not write to or change the database.
- It does not change Work Management records.
- It does not change the PostgreSQL-to-Excel reporting system.
- Works on mobile and desktop.

IMPORTANT
The complete live source tree was not available when this patch was made,
so this package intentionally does NOT overwrite layout.js, components.js,
or any existing page. That prevents accidental removal of features from
your current deployed version.

After uploading/merging the files, commit to GitHub and allow Vercel to
deploy normally.
