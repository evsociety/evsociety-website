/**
 * Unified Google Apps Script for EVSociety
 * 
 * FEATURES:
 * - Handles Public Registrations (no-cors)
 * - Handles Admin API (CORS enabled)
 * - Mismatched column mapping fixes
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Open your "EVSociety Registrations" Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. REPLACE ALL existing code with this file.
 * 4. Click "Deploy" > "Manage deployments"
 * 5. Click "Edit" (pencil icon)
 * 6. Select "New version" from the version dropdown
 * 7. Click "Deploy"
 * 
 * IMPORTANT: You must reference the SAME Web App URL for both
 * NEXT_PUBLIC_REGISTRATION_API_URL and NEXT_PUBLIC_ADMIN_API_URL
 * in your .env.local file.
 */

const SHEET_NAME = 'Sheet1';
const ADMIN_EMAIL = 'evsociety.org@gmail.com';

/**
 * Handle CORS preflight requests
 */
function doOptions(e) {
    return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type')
        .setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Main POST handler
 * Acts as a router between Registration and Admin actions
 */
function doPost(e) {
    // Set Default CORS headers for all responses
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const data = JSON.parse(e.postData.contents);

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
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Fallback if sheet name is different
    if (!sheet) sheet = ss.getSheets()[0];

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
    ];

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
        const registrations = getRegistrations(filters);
        return output.setContent(JSON.stringify({
            ok: true,
            data: registrations,
            total: registrations.length
        }));
    }

    return output.setContent(JSON.stringify({
        ok: false,
        error: 'Unknown action'
    }));
}

/**
 * Helper: Verify Admin Token
 */
function verifyAdminToken(idToken) {
    // Basic check for now
    if (!idToken || idToken.length < 5) return false;
    return true;
}

/**
 * Helper: Get Registrations with Mapping
 */
function getRegistrations(filters) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.getSheets()[0];

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
            itemId: getVal(row, 'registrationId'), // Fallback to registrationId as itemId is not in sheet

            role: getVal(row, 'role'),
            itemTitle: getVal(row, 'itemTitle'),

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
            skillArea: getVal(row, 'skillAreas'), // Note: plural in sheet, singular in interface? Mapping safely.

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
