# Google Apps Script Fix Guide

## Problem
Your Google Apps Script is showing this error:
```
SyntaxError: Identifier 'SHEET_NAME' has already been declared (line 1, file "UnifiedScript.gs")
```

This means you have **duplicate code** or **multiple script files** defining the same variable.

---

## Solution: Clean Up and Redeploy

### Step 1: Open Google Apps Script Editor

1. Open your Google Sheet: **"EVSociety Registrations"**
2. Click **Extensions** → **Apps Script**
3. You should see the Apps Script editor open

### Step 2: Check for Multiple Files

Look at the **left sidebar** under "Files". You might see multiple `.gs` files like:
- `Code.gs`
- `UnifiedScript.gs`
- `AdminAPI.gs`
- `RegistrationScript.gs`
- etc.

**This is the problem!** Multiple files are defining `const SHEET_NAME`.

### Step 3: Delete All Extra Files

**Keep ONLY ONE file.** Delete all others:

1. Click on each extra file in the sidebar
2. Click the **three dots** (⋮) next to the filename
3. Select **"Remove"**
4. Confirm the deletion

**Leave only ONE `.gs` file** (usually `Code.gs` or create a new one called `UnifiedScript.gs`)

### Step 4: Replace with Unified Script

1. Open the remaining `.gs` file
2. **Delete ALL existing code** in that file
3. Copy the ENTIRE content from:
   ```
   /Users/ananth/Developer/evsociety-website/docs/unified-google-apps-script.js
   ```
4. Paste it into the Apps Script editor
5. Click **Save** (💾 disk icon or Ctrl+S)

### Step 5: Deploy New Version

1. Click **Deploy** → **Manage deployments**
2. Click the **Edit** button (✏️ pencil icon) next to your existing deployment
3. In the "Version" dropdown, select **"New version"**
4. Add a description like: "Fixed duplicate SHEET_NAME error"
5. Click **Deploy**
6. The URL should remain the same

### Step 6: Verify the Fix

After deploying, the script should work. You can test it by:

1. Going back to your terminal
2. Running: `node test_admin_api.js`
3. You should see JSON data instead of an error

---

## Expected Result

After fixing, the test script should output something like:
```
✅ Parsed JSON:
- ok: true
- total: 4
- data length: 4

✅ First registration:
{
  "registrationId": "EVS-20260209-95993",
  "fullName": "Sudarshana Kar",
  ...
}
```

---

## Common Mistakes to Avoid

❌ **Don't** keep multiple `.gs` files
❌ **Don't** copy-paste code into an existing file (this creates duplicates)
❌ **Don't** forget to select "New version" when deploying

✅ **Do** delete all extra files first
✅ **Do** replace ALL code in the single remaining file
✅ **Do** deploy as a new version

---

## Need Help?

If you're still seeing errors after following these steps:
1. Take a screenshot of the Apps Script editor showing the file list
2. Share the exact error message you're seeing
3. Confirm you selected "New version" when deploying
