/**
 * Unified Google Apps Script for EVSociety
 * 
 * FEATURES:
 * - Handles Public Registrations
 * - Handles Admin API
 * - Mismatched column mapping fixes
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Open your "EVSociety Registrations" Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. REPLACE ALL code in this file (Code.gs) with this file. Keep the separate
 *    "competition-platform" file if it is installed.
 * 3a. Project Settings > Script Properties: set ADMIN_OAUTH_CLIENT_ID to the website's
 *     NEXT_PUBLIC_GOOGLE_CLIENT_ID. Without it, the admin page is refused (fail-safe).
 * 3b. Select getSheet in the function list and click Run once, then approve the permission
 *     "Connect to an external service" (used to verify admin sign-ins with Google).
 * 4. Click "Deploy" > "Manage deployments"
 * 5. Click "Edit" (pencil icon) next to your existing deployment
 * 6. Select "New version" from the version dropdown (CRITICAL!)
 * 7. Click "Deploy"
 * 
 * IMPORTANT: You must reference the SAME Web App URL for both
 * NEXT_PUBLIC_REGISTRATION_API_URL and NEXT_PUBLIC_ADMIN_API_URL
 * in your .env.local file.
 */

// CONFIGURATION
const SHEET_NAME = 'EVSociety Registrations'; // Must match your actual sheet name
const SHEET_NAME_FALLBACK = 'Sheet1';
const ADMIN_EMAIL = 'evsociety.org@gmail.com';

/**
 * Main POST handler
 * Acts as a router between Registration and Admin actions
 */
function doPost(e) {
    // ContentService automatically handles CORS for simple requests
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        // Guard against empty postData
        if (!e || !e.postData || !e.postData.contents) {
            throw new Error('No post data received');
        }

        const data = JSON.parse(e.postData.contents);

        // Competition platform (signed requests from the website server; see competition-platform.gs)
        if (data && data.kind === 'evs-competition-v1') return evscHandlePost(data);

        // ROUTER LOGIC:
        // If action is 'listRegistrations', it's an Admin Request
        if (data.action === 'listRegistrations' || data.verifyToken) {
            return handleAdminAction(data, output);
        }

        // Otherwise, it's a Public Registration
        return handleRegistration(data, output);

    } catch (error) {
        Logger.log('Error in doPost: ' + error.toString());
        return output.setContent(JSON.stringify({
            success: false,
            ok: false,
            error: error.toString()
        }));
    }
}

/**
 * Handler for Public Registrations
 */
function handleRegistration(data, output) {
    const sheet = getSheet();
    if (!sheet) {
        throw new Error('Sheet not found');
    }

    // Visitor input starting with = + - or @ would otherwise be stored as a spreadsheet formula.
    // A leading apostrophe keeps it as plain text (the apostrophe is not shown in the sheet).
    const asText = function (value) {
        return typeof value === 'string' && /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
    };

    // Prepare row data (Append Order)
    const row = [
        data.registrationId || '',
        data.type || '',
        data.role || '',
        data.itemTitle || '',
        data.fullName || '',
        data.email || '',
        data.phone ? "'" + data.phone : '',
        data.city || '',
        data.state || '',
        data.organization || '',
        data.designation || '',
        data.linkedinUrl || '',
        data.participationMode || '',
        data.consent ? 'Yes' : 'No',
        data.newsletter ? 'Yes' : 'No',
        data.guestCategory || '',
        data.topic || '',
        data.reference || '',
        data.specialRequirements || '',
        data.skillAreas || '',
        data.interestLevel || '',
        data.participantType || '',
        data.experienceLevel || '',
        data.sessionTrack || '',
        data.questions || '',
        data.timestamp || new Date().toISOString()
    ].map(asText);

    sheet.appendRow(row);

    return output.setContent(JSON.stringify({
        success: true,
        registrationId: data.registrationId
    }));
}

/**
 * Handler for Admin Actions
 */
function handleAdminAction(data, output) {
    const { action, filters, idToken } = data;

    // Verify Token
    if (!verifyAdminToken(idToken)) {
        return output.setContent(JSON.stringify({
            ok: false,
            error: 'Access denied. Invalid token.'
        }));
    }

    if (action === 'listRegistrations') {
        try {
            const registrations = getRegistrations(filters);
            return output.setContent(JSON.stringify({
                ok: true,
                data: registrations,
                total: registrations.length
            }));
        } catch (err) {
            return output.setContent(JSON.stringify({
                ok: false,
                error: 'Failed to list registrations: ' + err.toString()
            }));
        }
    }

    return output.setContent(JSON.stringify({
        ok: false,
        error: 'Unknown action: ' + action
    }));
}

/**
 * Helper: Verify Admin Token
 *
 * The admin page sends the Google ID token from "Sign in with Google". Google confirms the token
 * is genuine and current; access is granted only if it was issued to EV Society's own OAuth
 * client (Script Property ADMIN_OAUTH_CLIENT_ID, the same value as NEXT_PUBLIC_GOOGLE_CLIENT_ID)
 * for the verified admin address. Anything else, including a missing configuration, is refused.
 * Google ID tokens expire after about an hour; the admin page then asks to sign in again.
 */
const ADMIN_TOKEN_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

function verifyAdminToken(idToken) {
    if (typeof idToken !== 'string' || idToken.length < 100 || idToken.length > 4096 || idToken.split('.').length !== 3) {
        return false;
    }
    const clientIds = String(PropertiesService.getScriptProperties().getProperty('ADMIN_OAUTH_CLIENT_ID') || '')
        .split(',')
        .map(function (id) { return id.trim(); })
        .filter(function (id) { return id; });
    if (!clientIds.length) {
        Logger.log('Admin access refused: Script Property ADMIN_OAUTH_CLIENT_ID is not set.');
        return false;
    }

    // Tokens already confirmed by Google are remembered (by hash) until they expire
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idToken)
        .map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); })
        .join('');
    const cache = CacheService.getScriptCache();
    const cacheKey = 'admin-token:' + digest.slice(0, 40);
    if (cache.get(cacheKey) === 'ok') return true;

    let info;
    try {
        const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
        if (response.getResponseCode() !== 200) return false;
        info = JSON.parse(response.getContentText());
    } catch (err) {
        Logger.log('Admin token check failed: ' + err);
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const expires = Number(info.exp);
    const valid = clientIds.indexOf(String(info.aud)) !== -1 &&
        ADMIN_TOKEN_ISSUERS.indexOf(String(info.iss)) !== -1 &&
        String(info.email_verified) === 'true' &&
        String(info.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        expires > now;
    if (valid) {
        cache.put(cacheKey, 'ok', Math.max(1, Math.min(expires - now, 3600)));
    } else {
        Logger.log('Admin access refused for ' + (info.email || 'unknown account'));
    }
    return valid;
}

/**
 * Helper: Get Registrations with Mapping
 */
function getRegistrations(filters) {
    const sheet = getSheet();
    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) return [];

    const headers = values[0];

    // Create Header Map (Name -> Index)
    const headerMap = {};
    headers.forEach((h, i) => { headerMap[h] = i; });

    // Helper to get value safely
    const getVal = (row, field) => {
        const idx = headerMap[field];
        return (idx !== undefined) ? row[idx] : '';
    };

    let registrations = [];

    // Skip header row
    for (let i = 1; i < values.length; i++) {
        const row = values[i];

        // MAP SHEET COLUMNS TO FRONTEND INTERFACE
        // This fixes the "View not working" issue caused by naming mismatches
        const reg = {
            registrationId: getVal(row, 'registrationId'),

            // Map 'type' -> 'registrationType' AND 'itemType'
            registrationType: getVal(row, 'type'),
            itemType: getVal(row, 'type'),
            itemId: getVal(row, 'registrationId'), // Fallback to registrationId

            role: getVal(row, 'role'),
            itemTitle: getVal(row, 'itemTitle'),
            eventDate: getVal(row, 'eventDate') || getVal(row, 'timestamp'), // Fallback
            eventTime: getVal(row, 'eventTime'),
            location: getVal(row, 'location'),

            fullName: getVal(row, 'fullName'),
            email: getVal(row, 'email'),
            phone: getVal(row, 'phone'),
            city: getVal(row, 'city'),
            state: getVal(row, 'state'),
            organization: getVal(row, 'organization'),
            designation: getVal(row, 'designation'),

            // Mappings
            linkedIn: getVal(row, 'linkedinUrl'),
            mode: getVal(row, 'participationMode'),
            topicReason: getVal(row, 'topic'),
            invitedBy: getVal(row, 'reference'),
            skillArea: getVal(row, 'skillAreas'),

            // Guests
            guestCategory: getVal(row, 'guestCategory'),
            specialRequirements: getVal(row, 'specialRequirements'),
            interestLevel: getVal(row, 'interestLevel'),
            participantType: getVal(row, 'participantType'),
            experienceLevel: getVal(row, 'experienceLevel'),
            questions: getVal(row, 'questions'),
            sessionTrack: getVal(row, 'sessionTrack'),

            timestamp: getVal(row, 'timestamp')
        };

        registrations.push(reg);
    }

    // Apply Filters
    if (filters) {
        registrations = registrations.filter(reg => {
            // Filter by itemType
            if (filters.itemType && filters.itemType !== 'all') {
                if (reg.itemType !== filters.itemType) return false;
            }
            // Filter by role
            if (filters.role && filters.role !== 'all') {
                if (reg.role !== filters.role) return false;
            }
            // Filter by mode
            if (filters.mode && filters.mode !== 'all') {
                if (reg.mode !== filters.mode) return false;
            }
            // Filter by city
            if (filters.city) {
                if (!reg.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
            }
            return true;
        });
    }

    // Sort by timestamp DESC
    registrations.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return registrations;
}

/**
 * Helper: Get Sheet safely
 */
function getSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.getSheetByName(SHEET_NAME_FALLBACK);
    if (!sheet) sheet = ss.getSheets()[0];
    return sheet;
}
