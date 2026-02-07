# EVSociety Registration System - Google Sheets Integration

## Overview
The registration system now sends data to **both** localStorage (backup) and Google Sheets (central storage).

## Setup Instructions

### Step 1: Create Google Sheet

1. Create a new Google Sheet named **"EVSociety Registrations"**
2. In the first row, add these column headers **in this exact order**:

```
registrationId | type | role | itemTitle | fullName | email | phone | city | state | organization | designation | linkedinUrl | participationMode | consent | newsletter | guestCategory | topic | reference | specialRequirements | skillAreas | interestLevel | participantType | experienceLevel | sessionTrack | questions | timestamp
```

### Step 2: Deploy Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default code
3. Copy the entire contents of `docs/google-apps-script.js`
4. Paste it into the Apps Script editor
5. Save the project (name it "EVSociety Registration Handler")
6. Click **Deploy > New deployment**
7. Settings:
   - Type: **Web app**
   - Description: "EVSociety Registration API"
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. **Copy the Web App URL** (it will look like: `https://script.google.com/macros/s/...`)

### Step 3: Configure Your Website

1. Create or edit `.env.local` in your project root:

```env
NEXT_PUBLIC_REGISTRATION_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

2. Restart your Next.js development server:

```bash
npm run dev
```

### Step 4: Test the Integration

1. Go to `http://localhost:3000/register`
2. Fill out and submit a test registration
3. Check your Google Sheet - a new row should appear with the registration data
4. Check browser console for success logs

## How It Works

### Submission Flow

1. **User submits form** → `RegisterClient.tsx`
2. **Generate Registration ID** → Format: `EVS-YYYYMMDD-XXXXX`
3. **Save to localStorage** → Backup storage (always succeeds)
4. **Send to Google Sheets** → Via Apps Script Web App
5. **Show success message** → Displays Registration ID

### Error Handling

- **API Success + localStorage Success**: Full success message
- **API Failure + localStorage Success**: Shows "Saved locally, sync pending" warning
- **Both Fail**: Shows error, asks user to try again

### Data Saved

**Common Fields** (all registrations):
- Registration ID, Type, Role, Item Title
- Name, Email, Phone, City, State
- Organization, Designation, LinkedIn
- Participation Mode, Consent, Newsletter

**Guest-Specific** (when role = Guest):
- Guest Category, Topic, Reference, Special Requirements

**Project-Specific** (when type = Projects):
- Skill Areas, Interest Level

**Program-Specific** (when type = Programs):
- Participant Type, Experience Level

**Event/Webinar-Specific**:
- Session Track, Questions

## Configuration

Edit `src/config/registerConfig.ts` to customize:

```typescript
export const REGISTRATION_CONFIG = {
    APPS_SCRIPT_URL: process.env.NEXT_PUBLIC_REGISTRATION_API_URL || '',
    USE_LOCALSTORAGE_FALLBACK: true,
    DEBUG: process.env.NODE_ENV === 'development',
};
```

## Testing Apps Script

In the Apps Script editor, you can test the script:

1. Select the `testDoPost` function from the dropdown
2. Click the **Run** button
3. Check the **Execution log** for results
4. Verify a test row was added to your sheet

## Troubleshooting

**Registration not appearing in Google Sheets:**
- Check the Apps Script URL is correct in `.env.local`
- Verify the deployment is set to "Anyone" can access
- Check browser console for error messages
- Run the `testDoPost` function in Apps Script to verify it works

**"Saved locally, sync pending" message:**
- This means localStorage worked but API failed
- Check network tab in browser dev tools
- Verify Apps Script deployment is active
- Check Apps Script execution logs for errors

**CORS errors:**
- This is expected with `no-cors` mode
- Google Apps Script requires this mode
- Data still goes through successfully

## Viewing Registrations

### In Google Sheets
- Open your "EVSociety Registrations" sheet
- All submissions appear as new rows
- Apply filters, create charts, export as needed

### In Browser (Backup)
- Open DevTools > Console
- Run: `JSON.parse(localStorage.getItem('evsociety_registrations'))`
- Shows all registrations stored locally

## Security Notes

- Apps Script is deployed as "Anyone can access" - this is required for the website to send data
- No authentication is needed (public form submission)
- Data is sent over HTTPS
- Consider adding rate limiting in Apps Script if needed
- For sensitive data, implement authentication tokens

## Next Steps

Once confirmed working:
1. Share the Google Sheet with your team (View or Edit access)
2. Consider adding data validation in the sheet
3. Set up email notifications in Apps Script (optional)
4. Create charts/reports in Google Sheets
5. Export data periodically for backups
