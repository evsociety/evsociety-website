/**
 * Google Apps Script - EVSociety Admin API
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Open your "EVSociety Registrations" Google Sheet
 * 
 * 2. Go to Extensions > Apps Script
 * 
 * 3. Create a new script file named "AdminAPI.gs"
 * 
 * 4. Copy and paste this entire code
 * 
 * 5. Save the project
 * 
 * 6. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Description: "EVSociety Admin API"
 *    - Execute as: "Me (evsociety.org@gmail.com)"
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 * 
 * 7. Copy the Web App URL
 * 
 * 8. Add to .env.local:
 *    NEXT_PUBLIC_ADMIN_API_URL=your_admin_api_url_here
 * 
 * 9. Restart Next.js server
 */

const ADMIN_EMAIL = 'evsociety.org@gmail.com';
const SHEET_NAME = 'Sheet1';

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
 */
function doPost(e) {
    try {
        // Set CORS headers
        const output = ContentService.createTextOutput();
        output.setMimeType(ContentService.MimeType.JSON);
        output.setHeader('Access-Control-Allow-Origin', '*');
        output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        output.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Parse request body
        const requestData = JSON.parse(e.postData.contents);
        const { action, filters, idToken } = requestData;

        // Verify admin access
        if (!verifyAdminToken(idToken)) {
            return output.setContent(JSON.stringify({
                ok: false,
                error: 'Access denied. Admin authorization required.'
            }));
        }

        // Handle actions
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

    } catch (error) {
        Logger.log('Error in doPost: ' + error.toString());
        const errorOutput = ContentService
            .createTextOutput(JSON.stringify({
                ok: false,
                error: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
        errorOutput.setHeader('Access-Control-Allow-Origin', '*');
        return errorOutput;
    }
}

/**
 * Verify admin token and email
 */
function verifyAdminToken(idToken) {
    try {
        // For production: Use OAuth2 library to verify token
        // For now: Basic verification (you should enhance this)

        // In a real implementation, you would:
        // 1. Verify the token signature
        // 2. Check token expiration
        // 3. Extract email from token payload
        // 4. Verify email matches ADMIN_EMAIL

        // Simplified check (ENHANCE THIS FOR PRODUCTION):
        if (!idToken || idToken.length < 10) {
            return false;
        }

        // TODO: Implement proper Google ID token verification
        // For now, we rely on the session being created only after successful Google Sign-In

        return true; // Temporarily allow (MUST FIX FOR PRODUCTION)

    } catch (error) {
        Logger.log('Token verification error: ' + error.toString());
        return false;
    }
}

/**
 * Get registrations with filtering and sorting
 */
function getRegistrations(filters) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName(SHEET_NAME);

        if (!sheet) {
            throw new Error('Sheet "' + SHEET_NAME + '" not found');
        }

        // Get all data
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();

        if (values.length <= 1) {
            return []; // No data (only headers)
        }

        // Get headers
        const headers = values[0];

        // Convert rows to objects
        let registrations = [];
        for (let i = 1; i < values.length; i++) {
            const row = values[i];
            const registration = {};

            headers.forEach((header, index) => {
                registration[header] = row[index];
            });

            registrations.push(registration);
        }

        // Apply filters
        if (filters) {
            registrations = applyFilters(registrations, filters);
        }

        // Sort by eventDate DESC, fallback to timestamp DESC
        registrations.sort((a, b) => {
            const dateA = a.eventDate || a.timestamp;
            const dateB = b.eventDate || b.timestamp;

            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;

            return new Date(dateB) - new Date(dateA);
        });

        return registrations;

    } catch (error) {
        Logger.log('Error getting registrations: ' + error.toString());
        throw error;
    }
}

/**
 * Apply filters to registrations
 */
function applyFilters(registrations, filters) {
    return registrations.filter(reg => {
        // Filter by item type
        if (filters.itemType && filters.itemType !== 'all') {
            if (reg.registrationType !== filters.itemType) {
                return false;
            }
        }

        // Filter by role
        if (filters.role && filters.role !== 'all') {
            if (reg.role !== filters.role) {
                return false;
            }
        }

        // Filter by title search
        if (filters.searchTitle) {
            const searchLower = filters.searchTitle.toLowerCase();
            const titleLower = (reg.itemTitle || '').toLowerCase();
            if (!titleLower.includes(searchLower)) {
                return false;
            }
        }

        // Filter by date range
        if (filters.dateFrom) {
            const eventDate = reg.eventDate || reg.timestamp;
            if (eventDate && new Date(eventDate) < new Date(filters.dateFrom)) {
                return false;
            }
        }

        if (filters.dateTo) {
            const eventDate = reg.eventDate || reg.timestamp;
            if (eventDate && new Date(eventDate) > new Date(filters.dateTo)) {
                return false;
            }
        }

        // Filter by mode
        if (filters.mode && filters.mode !== 'all') {
            if (reg.mode !== filters.mode) {
                return false;
            }
        }

        // Filter by city
        if (filters.city) {
            const cityLower = filters.city.toLowerCase();
            const regCityLower = (reg.city || '').toLowerCase();
            if (!regCityLower.includes(cityLower)) {
                return false;
            }
        }

        return true;
    });
}


