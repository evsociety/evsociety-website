# 🚀 Deploy New Version - Critical Step!

## ⚠️ IMPORTANT: You MUST Deploy a New Version!

After deleting the extra files and updating the code, you **MUST** deploy a **NEW VERSION** for the changes to take effect.

The old broken version is still running until you deploy!

---

## Step-by-Step Deployment Instructions

### 1. Open Apps Script Editor
- You should already have it open
- If not: Google Sheet → Extensions → Apps Script

### 2. Verify Your Code
- Make sure you have **ONLY ONE** `.gs` file in the left sidebar
- The file should contain the unified script code
- Click **Save** (💾) if you haven't already

### 3. Deploy New Version (CRITICAL!)

**Option A: If you see "Deploy" button in top-right:**
1. Click **Deploy** button (top-right corner)
2. Select **Manage deployments**
3. You'll see your existing deployment
4. Click the **Edit** button (✏️ pencil icon) next to it
5. Under **Version**, click the dropdown
6. Select **"New version"** (NOT "Version 1" or any old version)
7. Optionally add description: "Fixed duplicate SHEET_NAME error"
8. Click **Deploy**
9. Click **Done**

**Option B: If you see "New deployment" button:**
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in:
   - Description: "Fixed duplicate SHEET_NAME"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Copy the new URL (should be the same as before)
7. Click **Done**

### 4. Wait for Propagation
- Changes can take **30-60 seconds** to propagate
- Wait 1 minute before testing

### 5. Test the API
Run this command:
```bash
node test_admin_api.js
```

---

## ✅ Expected Success Output

After deploying, you should see:

```
🔍 Testing Admin API...

URL: https://script.google.com/macros/s/AKfycbz.../exec

--- Test 1: Sending listRegistrations request ---
Executing curl command...

Response:
{"ok":true,"total":4,"data":[...]}

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

## ❌ If You Still See the Error

If you still see `SyntaxError: Identifier 'SHEET_NAME' has already been declared`:

### Check 1: Did you deploy a NEW version?
- Go back to Apps Script
- Click Deploy → Manage deployments
- Check the "Version" column - it should show "Head" or a new version number
- If it shows "Version 1", you didn't deploy a new version!

### Check 2: Are there still multiple files?
- Look at the left sidebar in Apps Script
- You should see ONLY ONE `.gs` file
- If you see multiple files (Code.gs, UnifiedScript.gs, etc.), delete the extras

### Check 3: Is there duplicate code in the file?
- Open the `.gs` file
- Press Ctrl+F (or Cmd+F on Mac)
- Search for "const SHEET_NAME"
- You should find it ONLY ONCE (around line 24)
- If you find it multiple times, you have duplicate code in the same file

---

## 🎯 Quick Checklist

Before testing, verify:
- [ ] Only ONE `.gs` file exists
- [ ] The file contains the unified script code
- [ ] You clicked "Save" in Apps Script
- [ ] You deployed a **NEW VERSION** (not just saved)
- [ ] You waited 1 minute after deploying
- [ ] You ran `node test_admin_api.js`

---

## 📸 Visual Reference

When you click "Manage deployments", you should see something like:

```
Active Deployments
┌─────────────────────────────────────────────┐
│ Web app                                     │
│ Version: Head (or new version number)       │
│ URL: https://script.google.com/macros/...   │
│ [Edit ✏️] [Archive]                         │
└─────────────────────────────────────────────┘
```

The **Version** should NOT be "Version 1" if you just deployed a new version!

---

## Need Help?

If it's still not working:
1. Take a screenshot of the Apps Script editor showing:
   - The file list (left sidebar)
   - The deployment screen
2. Share the screenshot
3. Run `node test_admin_api.js` and share the full output
