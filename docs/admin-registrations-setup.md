# Admin Registrations Setup Guide

## Overview
This guide will help you set up the admin registrations page for EVSociety.org. The admin page allows authorized users to view, filter, and export all registrations stored in Google Sheets.

## Prerequisites
- Google Account: `evsociety.org@gmail.com`
- Google Sheet: "EVSociety Registrations"
- Google Cloud Project with OAuth 2.0 configured

---

## Step 1: Configure Google Cloud Project

### 1.1 Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Select **Application type**: Web application
6. Configure:
   - **Name**: EVSociety Admin OAuth
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://www.evsociety.org` (for production)
   - **Authorized redirect URIs**: (leave empty for Google Sign-In)
7. Click **CREATE**
8. Copy the **Client ID** (e.g., `XXXXXXXXXXXXXXXXXX`)
Client secret :  'XXXXXXXXXXXXXXXXXX'

### 1.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External**
3. Fill in:
   - **App name**: EVSociety Admin
   - **User support email**: evsociety.org@gmail.com
   - **Developer contact**: evsociety.org@gmail.com
4. Add scopes (optional for basic email access)
5. Add test users: `evsociety.org@gmail.com`
6. Save and continue

---

## Step 2: Deploy Google Apps Script Admin API

### 2.1 Open Apps Script

1. Open your Google Sheet: **EVSociety Registrations**
2. Go to **Extensions** > **Apps Script**
3. You should see the existing registration script

### 2.2 Create Admin API Script

1. In Apps Script editor, click **+** next to Files
2. Create a new file: `AdminAPI.gs`
3. Copy the contents from `/docs/google-apps-script-admin-api.js`
4. Paste into `AdminAPI.gs`
5. Save the project (Ctrl/Cmd + S)

### 2.3 Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ > Select type: **Web app**
3. Configure:
   - **Description**: EVSociety Admin API
   - **Execute as**: Me (evsociety.org@gmail.com)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycby.../exec`) 
6. Click **Done**

### 2.4 Test the Deployment

1. Open the Web App URL in a browser
2. You should see a JSON response (might be an error since we're not POSTing)
3. This confirms the deployment is live

---

## Step 3: Configure Environment Variables

### 3.1 Add to `.env.local`

Add these variables to `/Users/ananth/Developer/evsociety-website/.env.local`:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_DEBUG=true

# Registration API (Google Apps Script)
NEXT_PUBLIC_REGISTRATION_API_URL=https://script.google.com/macros/s/YOUR_REGISTRATION_SCRIPT_ID/exec

# Admin API (Google Apps Script)
NEXT_PUBLIC_ADMIN_API_URL=https://script.google.com/macros/s/YOUR_ADMIN_SCRIPT_ID/exec

# Google OAuth Client ID (for admin sign-in)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

**Replace**:
- `YOUR_ADMIN_SCRIPT_ID` with the deployment URL from Step 2.3
- `YOUR_REGISTRATION_SCRIPT_ID` with your existing registration script URL
- `123456789-xxxxx.apps.googleusercontent.com` with your OAuth Client ID from Step 1.1

### 3.2 Add to Vercel (Production)

1. Go to your Vercel project
2. Navigate to **Settings** > **Environment Variables**
3. Add the same variables as above
4. Click **Save**
5. Redeploy your application

---

## Step 4: Verify the Setup

### 4.1 Start Development Server

```bash
cd /Users/ananth/Developer/evsociety-website
npm run dev
```

### 4.2 Test Admin Access

1. Open `http://localhost:3000/admin/registrations`
2. You should see "Access Denied" with Google Sign-In button
3. Click **Sign in with Google**
4. Sign in with `evsociety.org@gmail.com`
5. After successful authentication:
   - You should be redirected to the admin page
   - Registrations should load from Google Sheets
6. Test filters and export functionality

### 4.3 Test Register Page Admin Button

1. Open `http://localhost:3000/register`
2. If signed in as admin, you should see **"View Registrations (Admin)"** button
3. Click it to navigate to admin page

---

## Step 5: Security Best Practices

### 5.1 Token Verification (IMPORTANT)

The current Apps Script has a **simplified token verification**. For production:

1. Install OAuth2 library in Apps Script:
   - In Apps Script, go to **Resources** > **Libraries**
   - Add: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBVvblosG` (OAuth2)
   - Select latest version

2. Update `verifyAdminToken()` function in `AdminAPI.gs`:

```javascript
function verifyAdminToken(idToken) {
    try {
        // Use Google's token verification endpoint
        const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken;
        const response = UrlFetchApp.fetch(url);
        const payload = JSON.parse(response.getContentText());
        
        // Verify email
        if (payload.email !== ADMIN_EMAIL) {
            return false;
        }
        
        // Verify token is valid (not expired)
        if (payload.exp < Date.now() / 1000) {
            return false;
        }
        
        return true;
    } catch (error) {
        Logger.log('Token verification error: ' + error.toString());
        return false;
    }
}
```

3. Redeploy the script

### 5.2 Rate Limiting

Consider implementing rate limiting in Apps Script to prevent abuse:

```javascript
const RATE_LIMIT = 100; // Max requests per minute
const cache = CacheService.getScriptCache();

function checkRateLimit(email) {
    const key = 'rate_' + email;
    const count = cache.get(key) || 0;
    
    if (count > RATE_LIMIT) {
        throw new Error('Rate limit exceeded');
    }
    
    cache.put(key, parseInt(count) + 1, 60); // 60 seconds TTL
}
```

### 5.3 CORS Configuration

If you encounter CORS issues, update `doPost()` to include proper headers:

```javascript
function doPost(e) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://www.evsociety.org',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // ... rest of the code
}
```

---

## Step 6: Usage

### Admin Features

1. **View Registrations**: All registrations sorted by event date (latest first)
2. **Filter by**:
   - Item Type (Events, Programs, Projects, Webinars)
   - Role (Attendee, Guest)
   - Item Title (search)
   - Date Range
   - Mode (Online, Offline, Hybrid)
   - City (search)
3. **Export**: Download filtered data as CSV
4. **View Details**: Click "View" to see full registration details

### Admin URL

- Local: `http://localhost:3000/admin/registrations`
- Production: `https://www.evsociety.org/admin/registrations`

**Note**: This page is **NOT indexed** by search engines (noindex robots meta tag).

---

## Troubleshooting

### Issue: "Access denied" even after signing in

**Solution**:
- Ensure you're signing in with `evsociety.org@gmail.com`
- Check browser console for errors
- Verify OAuth Client ID is correct in `.env.local`
- Try clearing localStorage and signing in again

### Issue: No registrations loading

**Solution**:
- Check Network tab in DevTools for API errors
- Verify `NEXT_PUBLIC_ADMIN_API_URL` is correct
- Check Apps Script logs: Apps Script > **Executions** tab
- Ensure Sheet tab is named exactly "Registrations"

### Issue: Export not working

**Solution**:
- Check browser console for JavaScript errors
- Ensure data is loaded before exporting
- Try with filters applied

### Issue: CORS errors

**Solution**:
- Add your domain to Apps Script CORS headers (see Step 5.3)
- Redeploy the Apps Script

---

## Analytics Events

The admin page tracks these analytics events (if GA4 is configured):

- `admin_access_denied` - Unauthorized access attempt
- `admin_sign_in_success` - Successful admin login
- `admin_registrations_view` - Admin viewed registrations
- `admin_filter_applied` - Filters applied
- `admin_export_clicked` - Export initiated
- `admin_row_view_opened` - Detail modal opened

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── registrations/
│   │       ├── page.tsx                          # Admin page entry
│   │       └── AdminRegistrationsClient.tsx      # Main admin component
│   └── register/
│       └── RegisterClient.tsx                     # Modified to show admin button
├── components/
│   └── admin/
│       ├── AdminAccessDenied.tsx                  # Access denied page
│       ├── AdminFiltersBar.tsx                    # Filters component
│       ├── AdminHeader.tsx                        # Page header
│       ├── AdminRegistrationDetailModal.tsx       # Detail modal
│       └── AdminRegistrationsTable.tsx            # Table/cards view
├── config/
│   └── adminConfig.ts                             # Admin configuration
├── lib/
│   ├── adminAuth.ts                               # Authentication utilities
│   └── adminRegistrationsService.ts               # API service layer
└── types/
    └── admin.ts                                   # TypeScript types

docs/
└── google-apps-script-admin-api.js                # Apps Script code
```

---

## Support

For issues or questions:
- Check browser console for errors
- Review Apps Script execution logs
- Verify all environment variables are set correctly
- Test in incognito mode to rule out caching issues

---

**Last Updated**: 2026-02-07
