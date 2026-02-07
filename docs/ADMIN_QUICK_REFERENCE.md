# Admin Registrations - Quick Reference

## Quick Start

### 1. Environment Variables Required

Add to `.env.local`:

```bash
NEXT_PUBLIC_ADMIN_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

### 2. Deploy Apps Script

1. Open Google Sheet: "EVSociety Registrations"
2. Extensions > Apps Script
3. Create new file: `AdminAPI.gs`
4. Copy code from `docs/google-apps-script-admin-api.js`
5. Deploy as Web App (Anyone can access, Execute as Me)
6. Copy URL and add to `.env.local`

### 3. Setup Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized origins:
   - `http://localhost:3000`
   - `https://www.evsociety.org`
5. Copy Client ID to `.env.local`

### 4. Test

```bash
npm run dev
```

Visit: `http://localhost:3000/admin/registrations`

Sign in with: `evsociety.org@gmail.com`

---

## Admin Access

- **URL**: `/admin/registrations`
- **Authorized**: `evsociety.org@gmail.com` only
- **Visibility**: No menu links, noindex (hidden from search)
- **Access from**: "View Registrations (Admin)" button on `/register` (when signed in)

---

## Features

### Filters
- Item Type: Events, Programs, Projects, Webinars
- Role: Attendee, Guest
- Item Title: Text search
- Date Range: From/To
- Mode: Online, Offline, Hybrid
- City: Text search

### Actions
- **Apply Filters**: Fetch filtered data
- **Clear**: Reset all filters
- **Export CSV**: Download filtered data
- **View**: Open detail modal for any registration

### Sorting
- Primary: Event Date DESC
- Fallback: Timestamp DESC (registration date)

---

## Components

| Component | Purpose |
|-----------|---------|
| `AdminRegistrationsClient.tsx` | Main page logic, auth check, data fetching |
| `AdminAccessDenied.tsx` | Login page for unauthorized users |
| `AdminHeader.tsx` | Page header with sign-out |
| `AdminFiltersBar.tsx` | Filter controls |
| `AdminRegistrationsTable.tsx` | Desktop table + mobile cards |
| `AdminRegistrationDetailModal.tsx` | Full details modal |

---

## Security

### Current Implementation
- Client-side email check: `evsociety.org@gmail.com`
- Google Sign-In ID token sent to Apps Script
- Apps Script validates token (basic check)

### Production Enhancement Needed
Update `verifyAdminToken()` in Apps Script to properly verify tokens:

```javascript
function verifyAdminToken(idToken) {
    const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken;
    const response = UrlFetchApp.fetch(url);
    const payload = JSON.parse(response.getContentText());
    
    return payload.email === ADMIN_EMAIL && payload.exp > Date.now() / 1000;
}
```

---

## Analytics Events

```javascript
admin_access_denied          // Unauthorized access
admin_sign_in_success        // Successful sign-in
admin_registrations_view     // Registrations loaded
admin_filter_applied         // Filters applied
admin_export_clicked         // Export initiated
admin_row_view_opened        // Detail modal opened
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access denied" after sign-in | Verify signing in with `evsociety.org@gmail.com` |
| No data loading | Check `NEXT_PUBLIC_ADMIN_API_URL` in `.env.local` |
| CORS errors | Add domain to Apps Script CORS headers |
| Export not working | Check browser console, ensure data is loaded |
| Button not showing on /register | Sign in as admin, clear localStorage and retry |

---

## File Locations

- **Admin Pages**: `src/app/admin/registrations/`
- **Components**: `src/components/admin/`
- **Config**: `src/config/adminConfig.ts`
- **Auth Utils**: `src/lib/adminAuth.ts`
- **API Service**: `src/lib/adminRegistrationsService.ts`
- **Types**: `src/types/admin.ts`
- **Apps Script**: `docs/google-apps-script-admin-api.js`
- **Setup Guide**: `docs/admin-registrations-setup.md`

---

## Next Steps

1. ✅ Complete setup following `admin-registrations-setup.md`
2. ✅ Deploy Apps Script and get URL
3. ✅ Configure Google OAuth Client ID
4. ✅ Add environment variables
5. ✅ Test locally
6. ✅ Enhance token verification (production)
7. ✅ Deploy to Vercel with env vars
8. ✅ Test on production

---

**For detailed setup instructions, see**: `docs/admin-registrations-setup.md`
