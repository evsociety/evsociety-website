# Admin View Debug Report

## 🔍 Step-by-Step Debug Analysis

### ✅ Step 1: Frontend Page Loads Successfully
**Status**: WORKING ✓
- URL: `http://localhost:3000/admin/registrations`
- Page renders correctly
- Shows "Access Denied" message
- Displays "Sign in with Google" button
- Message: "Only evsociety.org@gmail.com can access this page"

### ❌ Step 2: Google Sign-In Fails
**Status**: FAILING ✗
**Error**: `[GSI_LOGGER]: The given origin is not allowed for the given client ID.`

**Root Cause**: 
- `http://localhost:3000` is NOT whitelisted in Google Cloud Console
- The OAuth 2.0 Client ID doesn't have localhost as an authorized origin

**Impact**: Admin cannot sign in, so cannot access the registration data

### ❌ Step 3: Google Apps Script Has Syntax Error
**Status**: FAILING ✗
**Error**: `SyntaxError: Identifier 'SHEET_NAME' has already been declared (line 1, file "UnifiedScript.gs")`

**Root Cause**:
- Multiple `.gs` files in the Apps Script project
- Each file defines `const SHEET_NAME`
- This creates a duplicate declaration error

**Impact**: Even if admin signs in successfully, the API won't return data

---

## 📊 Issue Summary

| Component | Status | Issue |
|-----------|--------|-------|
| Frontend Admin Page | ✅ Working | Loads correctly |
| Google Sign-In | ❌ Blocked | localhost not authorized |
| Google Apps Script | ❌ Error | Duplicate SHEET_NAME |
| Data Fetching | ❌ Blocked | Cannot proceed due to above issues |

---

## 🔧 Required Fixes (In Order)

### Fix 1: Add localhost to Google OAuth (REQUIRED FOR DEVELOPMENT)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one matching `973987815424-anc53c7p927h6gn5gbtfhdphjqnlecmu.apps.googleusercontent.com`)
5. Click **Edit** (pencil icon)
6. Under **Authorized JavaScript origins**, click **+ ADD URI**
7. Add: `http://localhost:3000`
8. Click **Save**

**Note**: Changes may take a few minutes to propagate.

### Fix 2: Clean Up Google Apps Script (CRITICAL)

Follow the guide in: `/docs/GOOGLE_APPS_SCRIPT_FIX_GUIDE.md`

**Quick Summary**:
1. Open Google Sheet → Extensions → Apps Script
2. **Delete ALL extra `.gs` files** (keep only one)
3. Replace ALL code in the remaining file with `docs/unified-google-apps-script.js`
4. Save
5. Deploy → Manage deployments → Edit → New version → Deploy

### Fix 3: Test the Complete Flow

After both fixes:

1. **Test API directly**:
   ```bash
   node test_admin_api.js
   ```
   Expected: JSON data with registrations

2. **Test Admin Page**:
   - Go to `http://localhost:3000/admin/registrations`
   - Click "Sign in with Google"
   - Sign in with `evsociety.org@gmail.com`
   - Should see the registrations table with 4 entries

---

## 🎯 Expected Result After Fixes

### API Test Output:
```
✅ Parsed JSON:
- ok: true
- total: 4
- data length: 4

✅ First registration:
{
  "registrationId": "EVS-20260209-95993",
  "fullName": "Sudarshana Kar",
  "email": "sudarshana.kar@example.com",
  ...
}
```

### Admin Page:
- Sign-in works
- Shows table with 4 registrations
- Can view details
- Can export CSV

---

## 🚨 Current Blockers

1. **Cannot sign in** → Fix Google OAuth origins
2. **Cannot fetch data** → Fix Google Apps Script syntax error

Both must be fixed for the admin view to work.

---

## 📝 Testing Checklist

- [ ] Added `http://localhost:3000` to Google OAuth origins
- [ ] Deleted extra `.gs` files in Apps Script
- [ ] Replaced code with unified script
- [ ] Deployed new version
- [ ] Tested API with `node test_admin_api.js` (should return JSON)
- [ ] Tested admin page sign-in (should work)
- [ ] Verified registrations table shows data
- [ ] Tested "View" button on a registration
- [ ] Tested CSV export

---

## 🔗 Related Files

- Fix Guide: `/docs/GOOGLE_APPS_SCRIPT_FIX_GUIDE.md`
- Unified Script: `/docs/unified-google-apps-script.js`
- Test Script: `/test_admin_api.js`
- Admin Page: `http://localhost:3000/admin/registrations`
