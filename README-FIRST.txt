THIS FIX IS FOR YOUR CURRENT BAKED-BAKING-INVENTORY-V2.

Upload/replace these exact files inside BAKED-BAKING-INVENTORY-V2:

app/components.js          REPLACE
app/layout.js              REPLACE
app/globals.css            REPLACE
app/install-button.js      ADD

public/manifest.webmanifest  ADD
public/service-worker.js     ADD
public/icon-192.png          ADD
public/icon-512.png          ADD
public/apple-touch-icon.png  ADD

IMPORTANT:
The reason the button was missing is that the live V2 app still had the OLD app/components.js,
which did not import or render InstallButton.

After upload:
1. Wait for Vercel deployment to finish.
2. Refresh baked-inventory.vercel.app.
3. The Install App button should appear directly below “Baking Team Inventory” in the left sidebar.
4. If Chrome still shows the old page, press Ctrl+F5 once.

Android: Chrome -> Install App.
iPhone/iPad: Safari -> Install App -> Share -> Add to Home Screen.
