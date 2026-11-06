/**
 * EV Society Competition Platform — Google Apps Script backend (v1)
 *
 * Adds team registration, profile review and public directories to the EXISTING
 * "EVSociety Registrations" spreadsheet. It creates its own tabs (Competitions, Teams,
 * Team_Categories, Members, Mentors, Files, Awards, Change_Requests, Audit_Log) and never
 * modifies the existing registrations tab.
 *
 * Install (see google-apps-script/README.md for the full checklist):
 *   1. In the spreadsheet: Extensions > Apps Script > add a new script file named
 *      "competition-platform" and paste this file into it.
 *   2. In the existing doPost(e), right after `const data = JSON.parse(e.postData.contents);`
 *      add:   if (data && data.kind === 'evs-competition-v1') return evscHandlePost(data);
 *   3. Project Settings > Script Properties: set EVSC_API_SECRET (same value as the website's
 *      COMPETITION_API_SECRET) and optionally EVSC_SITE_URL, EVSC_REVALIDATE_URLS, EVSC_REVIEWERS.
 *   4. Run evsCompetitionSetup once from the editor and accept the permissions.
 *   5. Deploy > Manage deployments > edit the existing deployment > New version > Deploy.
 *
 * Security model
 *   - Every website request is HMAC-SHA256 signed with EVSC_API_SECRET, time-limited and
 *     single-use (nonce). Unsigned requests are rejected, so the public web-app URL cannot be
 *     used to read or change competition data.
 *   - Review decisions (approval, participation, winner, publication) are only honoured when
 *     made through the installed edit trigger by an identifiable reviewer. The trigger signs
 *     each decision with EVSC_APPROVAL_SECRET, which never leaves this script. A value typed
 *     or pasted without a valid signature is treated as "not approved".
 *   - Public data is projected here, field by field, from approved records and individual
 *     consent. Resumes, contact details without consent and pending revisions never leave.
 *
 * Written for the V8 runtime using ES2015 syntax only (no optional chaining), so it parses in
 * any Apps Script project. All globals are prefixed evsc / evsCompetition to avoid clashes with
 * the existing registration script in the same project.
 */

var EVSC_VERSION = '1.0.0';
var EVSC_ENVELOPE_KIND = 'evs-competition-v1';

var EVSC_SCHEMA = {
    Competitions: ['Competition ID', 'Name', 'Slug', 'Organiser', 'Available Years', 'Categories', 'Registration Status', 'Registration Years', 'Default Registration Year', 'Public Visibility', 'Show Registered Teams', 'Configuration', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Updated At'],
    Teams: ['Team ID', 'Competition ID', 'Year', 'Entry Type', 'Team Name', 'College', 'Slug', 'Leader Member ID', 'Registration Status', 'Profile Approved', 'Publication Approved', 'Publication Consent', 'Profile Publication Status', 'Revision Number', 'Pending Change Request ID', 'Review Comments', 'Institution Logo File ID', 'Team Logo File ID', 'Team Photo File ID', 'Team Photo Consent', 'Processing Consent At', 'Deletion Requested', 'Startup Profile', 'Version', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Created At', 'Updated At', 'Submitted At', 'First Published At'],
    Team_Categories: ['Association ID', 'Team ID', 'Team (reference)', 'Year', 'Category ID', 'Category', 'Registration Status', 'Participation Verified', 'Winner Verified', 'Achievement', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Created At', 'Updated At'],
    Members: ['Member ID', 'Team ID', 'Full Name', 'Role', 'Email', 'Phone', 'LinkedIn', 'Photo File ID', 'Resume File ID', 'Display Order', 'Under 18', 'Guardian Consent Verified', 'Publication Permissions', 'Consent Status', 'Consent Updated At', 'Verification Status', 'Consent Token Hash', 'Consent Token Expires', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Created At', 'Updated At'],
    Mentors: ['Mentor ID', 'Team ID', 'Name', 'Institution', 'LinkedIn', 'Photo File ID', 'Display Order', 'Listing Consent', 'Created At', 'Updated At'],
    Files: ['File ID', 'Team ID', 'Owner ID', 'Kind', 'Drive File ID', 'MIME Type', 'Size (bytes)', 'Original Name', 'Status', 'Uploaded By', 'Uploaded At'],
    Awards: ['Award ID', 'Competition ID', 'Year', 'Category', 'Award Title', 'PDF Reference', 'Thumbnail Reference', 'Award Status', 'Publication Status', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Updated At'],
    Change_Requests: ['Change Request ID', 'Team ID', 'Team (reference)', 'Revision ID', 'Base Revision Number', 'Summary of Changes', 'Submitted Data', 'Review Status', 'Submission Timestamp', 'Decision Timestamp', 'Reviewer', 'Review Comments', 'Verification Metadata', 'Updated At'],
    Audit_Log: ['Event ID', 'Timestamp', 'Actor', 'Entity Type', 'Entity ID', 'Event Type', 'Outcome', 'Before', 'After', 'Details'],
};

var EVSC_ID_COLUMN = {
    Competitions: 'Competition ID', Teams: 'Team ID', Team_Categories: 'Association ID', Members: 'Member ID',
    Mentors: 'Mentor ID', Files: 'File ID', Awards: 'Award ID', Change_Requests: 'Change Request ID', Audit_Log: 'Event ID',
};

var EVSC_YES_NO = ['Yes', 'No'];
var EVSC_TEAM_STATUS = { DRAFT: 'Draft', PENDING: 'Pending Review', CHANGES: 'Changes Requested', APPROVED: 'Approved', REJECTED: 'Rejected' };
var EVSC_CR_STATUS = { DRAFT: 'Draft', PENDING: 'Pending Review', CHANGES: 'Changes Requested', APPROVED: 'Approved', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn', SUPERSEDED: 'Superseded' };
var EVSC_OPEN_CR = ['Draft', 'Pending Review', 'Changes Requested'];

// Columns a reviewer decides in the sheet. Each accepted edit is validated and signed; the
// `admin` list is what a reviewer may choose, `system` lists values only the platform sets.
var EVSC_REVIEW_FIELDS = {
    Competitions: {
        'Available Years': { type: 'years' },
        'Categories': { type: 'list' },
        'Registration Status': { values: ['Open', 'Closed'] },
        'Registration Years': { type: 'years' },
        'Default Registration Year': { type: 'year' },
        'Public Visibility': { values: ['Public', 'Hidden'] },
        'Show Registered Teams': { values: EVSC_YES_NO },
        'Configuration': { type: 'json' },
    },
    Teams: {
        'Registration Status': { values: ['Pending Review', 'Changes Requested', 'Approved', 'Rejected'], system: ['Draft', 'Pending Review'] },
        'Profile Approved': { values: EVSC_YES_NO },
        'Publication Approved': { values: EVSC_YES_NO },
    },
    Team_Categories: {
        'Registration Status': { values: ['Registered', 'Withdrawn', 'Rejected'] },
        'Participation Verified': { values: EVSC_YES_NO },
        'Winner Verified': { values: EVSC_YES_NO },
        'Achievement': { type: 'text', max: 200 },
    },
    Members: {
        'Guardian Consent Verified': { values: EVSC_YES_NO },
    },
    Awards: {
        'Award Title': { type: 'text', max: 200 },
        'PDF Reference': { type: 'docref' },
        'Thumbnail Reference': { type: 'docref' },
        'Award Status': { values: ['Proposed', 'Confirmed', 'Awarded'] },
        'Publication Status': { values: ['Draft', 'Published'] },
    },
    Change_Requests: {
        'Review Status': { values: ['Approved', 'Changes Requested', 'Rejected'], system: EVSC_OPEN_CR.concat(['Withdrawn', 'Superseded']) },
    },
};

// Columns only the platform writes. setup protects them; edits are not accepted as decisions.
var EVSC_SYSTEM_COLUMNS = {
    Teams: ['Team ID', 'Competition ID', 'Slug', 'Leader Member ID', 'Publication Consent', 'Profile Publication Status', 'Revision Number', 'Pending Change Request ID', 'Processing Consent At', 'Deletion Requested', 'Version', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Created At', 'Updated At', 'Submitted At', 'First Published At'],
    Team_Categories: ['Association ID', 'Team ID', 'Category ID', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata', 'Created At', 'Updated At'],
    Members: ['Member ID', 'Team ID', 'Publication Permissions', 'Consent Status', 'Consent Updated At', 'Verification Status', 'Consent Token Hash', 'Consent Token Expires', 'Last Reviewed By', 'Last Reviewed At', 'Verification Metadata'],
    Files: EVSC_SCHEMA.Files,
    Change_Requests: ['Change Request ID', 'Team ID', 'Submitted Data', 'Submission Timestamp', 'Decision Timestamp', 'Reviewer', 'Verification Metadata'],
    Audit_Log: EVSC_SCHEMA.Audit_Log,
};

// Seed rows for the first competition. Configuration lives in the website code; these rows hold
// the settings administrators change without a redeploy (years, registration, visibility).
var EVSC_SEED_COMPETITIONS = [
    {
        'Competition ID': 'inspace-model-rocketry-cansat',
        'Name': 'IN-SPACe Model Rocketry/CAN-7USAT India Student Competition',
        'Slug': 'inspace-model-rocketry-cansat',
        'Organiser': 'IN-SPACe (Indian National Space Promotion and Authorization Centre)',
        'Available Years': '2026',
        'Categories': 'model-rocketry, can-7usat',
        'Registration Status': 'Open',
        'Registration Years': '2026',
        'Default Registration Year': '2026',
        'Public Visibility': 'Public',
        'Show Registered Teams': 'No',
        'Configuration': '{"maxMentors":4}',
    },
];

var EVSC_SEED_AWARDS = [
    { 'Award ID': 'AWD-INSPACE-2026-CAN7USAT', 'Competition ID': 'inspace-model-rocketry-cansat', 'Year': '2026', 'Category': 'can-7usat', 'Award Title': 'EV Society CAN-7USAT Innovation Award 2026', 'PDF Reference': '', 'Thumbnail Reference': '', 'Award Status': 'Proposed', 'Publication Status': 'Draft' },
    { 'Award ID': 'AWD-INSPACE-2026-ROCKETRY', 'Competition ID': 'inspace-model-rocketry-cansat', 'Year': '2026', 'Category': 'model-rocketry', 'Award Title': 'EV Society Model Rocketry Innovation Award 2026', 'PDF Reference': '', 'Thumbnail Reference': '', 'Award Status': 'Proposed', 'Publication Status': 'Draft' },
];

var EVSC_LIMITS = {
    name: 120, teamName: 120, college: 200, institution: 200, email: 254, phone: 20, linkedin: 300,
    fileName: 120, achievement: 200, comments: 2000,
    // Technical safety caps that protect the sheet; competitions can set lower limits
    maxMembersCap: 50, maxMentorsCap: 10,
    uploadBytes: { photo: 3 * 1024 * 1024, logo: 2 * 1024 * 1024, resume: 4 * 1024 * 1024 },
    submittedDataChars: 45000,
};

var EVSC_FILE_KINDS = {
    'member-photo': { mimes: ['image/jpeg', 'image/png', 'image/webp'], max: 'photo', publicImage: true },
    'mentor-photo': { mimes: ['image/jpeg', 'image/png', 'image/webp'], max: 'photo', publicImage: true },
    'team-photo': { mimes: ['image/jpeg', 'image/png', 'image/webp'], max: 'photo', publicImage: true },
    'team-logo': { mimes: ['image/jpeg', 'image/png', 'image/webp'], max: 'logo', publicImage: true },
    'institution-logo': { mimes: ['image/jpeg', 'image/png', 'image/webp'], max: 'logo', publicImage: true },
    'resume': { mimes: ['application/pdf'], max: 'resume', publicImage: false },
};

var EVSC_PERMISSION_KEYS = ['photo', 'linkedin', 'email', 'phone'];

/* ───────────────────────── Errors ───────────────────────── */

function evscError(code, message, extra) {
    var err = new Error(message);
    err.evsc = true;
    err.code = code;
    if (extra) {
        Object.keys(extra).forEach(function (k) { err[k] = extra[k]; });
    }
    return err;
}

/* ───────────────────────── Properties & clock ───────────────────────── */

function evscProps() {
    return PropertiesService.getScriptProperties();
}

function evscProp(name, fallback) {
    var value = evscProps().getProperty(name);
    return value === null || value === undefined || value === '' ? fallback : value;
}

function evscNow() {
    return new Date();
}

function evscIso(date) {
    return (date || evscNow()).toISOString();
}

/* ───────────────────────── Crypto helpers ───────────────────────── */

function evscBytesToHex(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i++) {
        var b = (bytes[i] + 256) % 256;
        out += (b < 16 ? '0' : '') + b.toString(16);
    }
    return out;
}

function evscHmac(secret, value) {
    return evscBytesToHex(Utilities.computeHmacSha256Signature(String(value), String(secret)));
}

function evscSha256(value) {
    return evscBytesToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value)));
}

function evscSafeEqual(a, b) {
    a = String(a || '');
    b = String(b || '');
    if (a.length !== b.length || a.length === 0) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

function evscRandomHex(chars) {
    var out = '';
    while (out.length < chars) out += Utilities.getUuid().replace(/-/g, '');
    return out.slice(0, chars);
}

// Crockford-style alphabet without 0/1/I/O so IDs read clearly over the phone
var EVSC_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function evscRandomCode(length) {
    var hex = evscRandomHex(length * 2);
    var out = '';
    for (var i = 0; i < length; i++) {
        out += EVSC_ID_ALPHABET.charAt(parseInt(hex.substr(i * 2, 2), 16) % EVSC_ID_ALPHABET.length);
    }
    return out;
}

function evscNewId(prefix, length) {
    return prefix + '-' + evscRandomCode(length || 10);
}

function evscOtpCode() {
    // 48 random bits reduced to six digits; the modulo bias is negligible
    var n = parseInt(evscRandomHex(12), 16) % 1000000;
    var s = String(n);
    while (s.length < 6) s = '0' + s;
    return s;
}

function evscApprovalSecret() {
    var secret = evscProp('EVSC_APPROVAL_SECRET', '');
    if (!secret) throw evscError('SETUP_REQUIRED', 'Run evsCompetitionSetup to initialise the approval secret.');
    return secret;
}

/* ───────────────────────── Text & validation ───────────────────────── */

function evscStr(value) {
    if (value === null || value === undefined) return '';
    return String(value);
}

function evscText(value, max) {
    var s = evscStr(value).replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim();
    return max ? s.slice(0, max) : s;
}

function evscMultiline(value, max) {
    var s = evscStr(value).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ').trim();
    return max ? s.slice(0, max) : s;
}

// Prevent spreadsheet formula injection: a leading apostrophe forces Sheets to store text
function evscCell(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    var s = String(value);
    if (/^[=+\-@\t\r\n]/.test(s)) return "'" + s;
    return s;
}

function evscNormalizeEmail(value) {
    return evscText(value, EVSC_LIMITS.email).toLowerCase();
}

function evscIsEmail(value) {
    return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/.test(value) && value.length <= EVSC_LIMITS.email;
}

function evscNormalizePhone(value) {
    return evscText(value, EVSC_LIMITS.phone);
}

function evscIsPhone(value) {
    if (!/^\+?[0-9 ()\-]{6,20}$/.test(value)) return false;
    var digits = value.replace(/[^0-9]/g, '').length;
    return digits >= 8 && digits <= 15;
}

function evscNormalizeLinkedIn(value) {
    var s = evscText(value, EVSC_LIMITS.linkedin);
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    s = s.replace(/^http:\/\//i, 'https://');
    return s;
}

function evscIsLinkedIn(value) {
    return /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub|company|school)\/[A-Za-z0-9\-_%.~]+\/?(\?[A-Za-z0-9\-_%.~=&]*)?$/i.test(value);
}

function evscYes(value) {
    return value === true || evscStr(value).trim().toLowerCase() === 'yes';
}

function evscYesNo(value) {
    return evscYes(value) ? 'Yes' : 'No';
}

function evscParseYears(value) {
    var parts = evscStr(value).split(/[,\s]+/).filter(function (p) { return p; });
    var years = [];
    for (var i = 0; i < parts.length; i++) {
        if (!/^\d{4}$/.test(parts[i])) return null;
        var y = Number(parts[i]);
        if (y < 2000 || y > 2100) return null;
        if (years.indexOf(y) === -1) years.push(y);
    }
    return years.sort();
}

function evscParseList(value) {
    return evscStr(value).split(',').map(function (p) { return p.trim(); }).filter(function (p) { return p; });
}

function evscJsonParse(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    try {
        return JSON.parse(String(value));
    } catch (e) {
        return fallback;
    }
}

function evscSlugify(value) {
    var s = evscText(value, 120).toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return s.slice(0, 60).replace(/-+$/g, '') || 'team';
}

function evscNormalizedKey(value) {
    return evscText(value, 300).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function evscIsDocRef(value) {
    var s = evscStr(value).trim();
    if (!s) return true;
    if (/^\/[^\/"'<>\\\u0000-\u001F][^"'<>\\\u0000-\u001F]*$/.test(s) && s.indexOf('..') === -1) return true;
    return /^https:\/\/[^\s<>"']+$/.test(s);
}

/* ───────────────────────── Spreadsheet access ───────────────────────── */

function evscSpreadsheet() {
    var id = evscProp('EVSC_SPREADSHEET_ID', '');
    return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function evscSheet(name) {
    var sheet = evscSpreadsheet().getSheetByName(name);
    if (!sheet) throw evscError('SETUP_REQUIRED', 'Tab "' + name + '" is missing. Run evsCompetitionSetup.');
    return sheet;
}

function evscIsEmptyRow(values) {
    for (var i = 0; i < values.length; i++) {
        if (values[i] !== '' && values[i] !== null && values[i] !== undefined) return false;
    }
    return true;
}

// Reads a tab into row objects keyed by header name, so admins can reorder or add columns
function evscTable(name) {
    var sheet = evscSheet(name);
    var values = sheet.getDataRange().getValues();
    var headers = (values[0] || []).map(function (h) { return evscStr(h).trim(); });
    var index = {};
    headers.forEach(function (h, i) { if (h && index[h] === undefined) index[h] = i; });
    var missing = EVSC_SCHEMA[name].filter(function (h) { return index[h] === undefined; });
    if (missing.length) {
        throw evscError('SETUP_REQUIRED', 'Tab "' + name + '" is missing columns: ' + missing.join(', ') + '. Run evsCompetitionSetup.');
    }
    var rows = [];
    for (var r = 1; r < values.length; r++) {
        if (evscIsEmptyRow(values[r])) continue;
        var obj = {};
        Object.defineProperty(obj, '_row', { value: r + 1, writable: true, enumerable: false });
        headers.forEach(function (h, i) { if (h) obj[h] = values[r][i]; });
        rows.push(obj);
    }
    var idColumn = EVSC_ID_COLUMN[name];
    var table = {
        name: name,
        sheet: sheet,
        headers: headers,
        index: index,
        rows: rows,
        byId: function (id) {
            id = evscStr(id);
            if (!id) return null;
            for (var i = 0; i < rows.length; i++) if (evscStr(rows[i][idColumn]) === id) return rows[i];
            return null;
        },
        filter: function (fn) { return rows.filter(fn); },
        find: function (fn) {
            for (var i = 0; i < rows.length; i++) if (fn(rows[i])) return rows[i];
            return null;
        },
        insert: function (obj) {
            var row = headers.map(function (h) { return h && obj[h] !== undefined ? evscCell(obj[h]) : ''; });
            var rowNumber = sheet.getLastRow() + 1;
            sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
            var stored = {};
            Object.defineProperty(stored, '_row', { value: rowNumber, writable: true, enumerable: false });
            headers.forEach(function (h) { if (h) stored[h] = obj[h] === undefined ? '' : obj[h]; });
            rows.push(stored);
            return stored;
        },
        update: function (rowObj, changes) {
            Object.keys(changes).forEach(function (key) {
                var col = index[key];
                if (col === undefined) throw evscError('SETUP_REQUIRED', 'Column "' + key + '" is missing in ' + name);
                sheet.getRange(rowObj._row, col + 1).setValue(evscCell(changes[key]));
                rowObj[key] = changes[key];
            });
            return rowObj;
        },
        remove: function (rowObjs) {
            var numbers = rowObjs.map(function (r) { return r._row; }).sort(function (a, b) { return b - a; });
            numbers.forEach(function (n) { sheet.deleteRow(n); });
            // Rows below each deleted row move up by one
            rows = rows.filter(function (r) { return rowObjs.indexOf(r) === -1; });
            rows.forEach(function (r) {
                var shift = numbers.filter(function (n) { return n < r._row; }).length;
                r._row -= shift;
            });
            table.rows = rows;
        },
    };
    return table;
}

function evscTables(names) {
    var out = {};
    names.forEach(function (n) { out[n] = evscTable(n); });
    return out;
}

var EVSC_ALL_TABS = ['Competitions', 'Teams', 'Team_Categories', 'Members', 'Mentors', 'Files', 'Awards', 'Change_Requests', 'Audit_Log'];

function evscWithLock(fn) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) throw evscError('BUSY', 'The registration service is busy. Please try again in a moment.');
    try {
        return fn();
    } finally {
        lock.releaseLock();
    }
}

/* ───────────────────────── Signed review values ───────────────────────── */

function evscMeta(row) {
    return evscJsonParse(row['Verification Metadata'], {}) || {};
}

function evscSignature(entityId, field, value, by, at) {
    return evscHmac(evscApprovalSecret(), [entityId, field, value, by, at].join('|'));
}

// Returns the value of a reviewed field only if its signature is valid and still matches the
// cell; otherwise null, which every caller treats as "not approved" (fail closed)
function evscSignedValue(row, tab, field) {
    var meta = evscMeta(row);
    var entry = meta[field];
    if (!entry || typeof entry !== 'object') return null;
    var current = evscStr(row[field]);
    if (evscStr(entry.v) !== current) return null;
    var id = evscStr(row[EVSC_ID_COLUMN[tab]]);
    var expected = evscSignature(id, field, current, evscStr(entry.by), evscStr(entry.at));
    return evscSafeEqual(expected, entry.sig) ? current : null;
}

// Writes a reviewed value with its signature. `by` is a reviewer email or "system:<reason>"
function evscSetSigned(table, row, changes, by) {
    var tab = table.name;
    var id = evscStr(row[EVSC_ID_COLUMN[tab]]);
    var meta = evscMeta(row);
    var at = evscIso();
    var cells = {};
    Object.keys(changes).forEach(function (field) {
        var value = evscStr(changes[field]);
        cells[field] = value;
        meta[field] = { v: value, by: by, at: at, sig: evscSignature(id, field, value, by, at) };
    });
    cells['Verification Metadata'] = JSON.stringify(meta);
    if (by.indexOf('system:') !== 0 && table.index['Last Reviewed By'] !== undefined) {
        cells['Last Reviewed By'] = by;
        cells['Last Reviewed At'] = at;
    }
    table.update(row, cells);
}

// The last signed value of a field, checked against its own signature but not the cell. Used
// while handling an edit, when the cell already holds the reviewer's new value.
function evscSignedPrevious(row, tab, field) {
    var entry = evscMeta(row)[field];
    if (!entry || typeof entry !== 'object') return null;
    var id = evscStr(row[EVSC_ID_COLUMN[tab]]);
    var expected = evscSignature(id, field, evscStr(entry.v), evscStr(entry.by), evscStr(entry.at));
    return evscSafeEqual(expected, entry.sig) ? evscStr(entry.v) : null;
}

function evscSignedIs(row, tab, field, expected) {
    return evscSignedValue(row, tab, field) === expected;
}

/* ───────────────────────── Audit ───────────────────────── */

function evscAudit(tables, event) {
    var table = tables && tables.Audit_Log ? tables.Audit_Log : evscTable('Audit_Log');
    var trim = function (v) {
        if (v === undefined || v === null || v === '') return '';
        var s = typeof v === 'string' ? v : JSON.stringify(v);
        return s.length > 4000 ? s.slice(0, 4000) + '…' : s;
    };
    table.insert({
        'Event ID': evscNewId('EVT', 12),
        'Timestamp': evscIso(),
        'Actor': evscStr(event.actor || 'system'),
        'Entity Type': evscStr(event.entityType),
        'Entity ID': evscStr(event.entityId),
        'Event Type': evscStr(event.type),
        'Outcome': evscStr(event.outcome || 'ok'),
        'Before': trim(event.before),
        'After': trim(event.after),
        'Details': trim(event.details),
    });
}

/* ───────────────────────── Cache, rate limits, idempotency ───────────────────────── */

function evscCache() {
    return CacheService.getScriptCache();
}

function evscRateLimit(key, limit, windowSeconds) {
    var cache = evscCache();
    var cacheKey = 'rl:' + evscSha256(key).slice(0, 40);
    var current = evscJsonParse(cache.get(cacheKey), null);
    var now = Date.now();
    if (!current || current.reset < now) current = { count: 0, reset: now + windowSeconds * 1000 };
    current.count += 1;
    var ttl = Math.max(1, Math.ceil((current.reset - now) / 1000));
    cache.put(cacheKey, JSON.stringify(current), ttl);
    if (current.count > limit) {
        throw evscError('RATE_LIMITED', 'Too many attempts. Please wait a few minutes and try again.', { retryAfter: ttl });
    }
}

function evscIdempotent(key, fn) {
    if (!key) return fn();
    var cache = evscCache();
    var cacheKey = 'idem:' + evscSha256(key).slice(0, 40);
    var hit = cache.get(cacheKey);
    if (hit) return JSON.parse(hit);
    var result = fn();
    var json = JSON.stringify(result);
    if (json.length < 90000) cache.put(cacheKey, json, 600);
    return result;
}

function evscGeneration(competitionId) {
    return evscProp('EVSC_GEN_' + competitionId, '0');
}

function evscInvalidatePublic(competitionId) {
    evscProps().setProperty('EVSC_GEN_' + competitionId, String(Date.now()) + '-' + evscRandomHex(8));
}

function evscCachePutLarge(key, value, ttl) {
    var cache = evscCache();
    var size = 90000;
    var chunks = Math.ceil(value.length / size) || 1;
    if (chunks > 20) return;
    var entries = {};
    entries[key] = String(chunks);
    for (var i = 0; i < chunks; i++) entries[key + ':' + i] = value.substr(i * size, size);
    cache.putAll(entries, ttl);
}

function evscCacheGetLarge(key) {
    var cache = evscCache();
    var count = Number(cache.get(key));
    if (!count) return null;
    var keys = [];
    for (var i = 0; i < count; i++) keys.push(key + ':' + i);
    var parts = cache.getAll(keys);
    var out = '';
    for (var j = 0; j < count; j++) {
        if (typeof parts[keys[j]] !== 'string') return null;
        out += parts[keys[j]];
    }
    return out;
}

/* ───────────────────────── Request envelope ───────────────────────── */

function evscHandlePost(envelope) {
    var result = evscHandleEnvelope(envelope);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function evscVerifyEnvelope(envelope) {
    var secret = evscProp('EVSC_API_SECRET', '');
    if (!secret || secret.length < 32) throw evscError('SETUP_REQUIRED', 'EVSC_API_SECRET is not configured.');
    if (!envelope || envelope.kind !== EVSC_ENVELOPE_KIND) throw evscError('UNAUTHORIZED', 'Invalid request.');
    var ts = Number(envelope.ts);
    if (!ts || Math.abs(Date.now() - ts) > 5 * 60 * 1000) throw evscError('UNAUTHORIZED', 'Request expired.');
    var nonce = evscStr(envelope.nonce);
    if (!/^[a-f0-9]{16,64}$/.test(nonce)) throw evscError('UNAUTHORIZED', 'Invalid request.');
    var payload = evscStr(envelope.payload);
    var expected = evscHmac(secret, [EVSC_ENVELOPE_KIND, ts, nonce, payload].join('\n'));
    if (!evscSafeEqual(expected, envelope.sig)) throw evscError('UNAUTHORIZED', 'Invalid signature.');
    var cache = evscCache();
    var nonceKey = 'nonce:' + nonce;
    if (cache.get(nonceKey)) throw evscError('UNAUTHORIZED', 'Request already used.');
    cache.put(nonceKey, '1', 600);
    return JSON.parse(payload);
}

function evscHandleEnvelope(envelope) {
    try {
        var request = evscVerifyEnvelope(envelope);
        var handler = EVSC_ACTIONS[request.action];
        if (!handler) throw evscError('UNKNOWN_ACTION', 'Unknown action.');
        var ctx = request.ctx || {};
        var data = handler(request.params || {}, ctx);
        return { ok: true, data: data };
    } catch (err) {
        if (err && err.evsc) {
            return { ok: false, error: { code: err.code, message: err.message, fields: err.fields || null, details: err.details || null, retryAfter: err.retryAfter || null } };
        }
        Logger.log('evsc internal error: ' + (err && err.stack ? err.stack : err));
        return { ok: false, error: { code: 'INTERNAL', message: 'Something went wrong on our side. Please try again.' } };
    }
}

/* ───────────────────────── Competition configuration ───────────────────────── */

function evscCompetitionConfig(competitionId, tables) {
    var table = tables && tables.Competitions ? tables.Competitions : evscTable('Competitions');
    var row = table.byId(competitionId);
    if (!row) return null;
    var tab = 'Competitions';
    var configJson = evscJsonParse(evscSignedValue(row, tab, 'Configuration'), {}) || {};
    var registrationYears = evscParseYears(evscSignedValue(row, tab, 'Registration Years')) || [];
    var defaultYear = Number(evscSignedValue(row, tab, 'Default Registration Year')) || registrationYears[registrationYears.length - 1] || null;
    return {
        competitionId: competitionId,
        name: evscStr(row['Name']),
        availableYears: evscParseYears(evscSignedValue(row, tab, 'Available Years')) || [],
        categories: evscParseList(evscSignedValue(row, tab, 'Categories')),
        registrationOpen: evscSignedValue(row, tab, 'Registration Status') === 'Open',
        registrationYears: registrationYears,
        defaultRegistrationYear: defaultYear,
        publicVisible: evscSignedValue(row, tab, 'Public Visibility') === 'Public',
        showRegisteredTeams: evscSignedValue(row, tab, 'Show Registered Teams') === 'Yes',
        maxMentors: Math.min(EVSC_LIMITS.maxMentorsCap, Number(configJson.maxMentors) || 4),
        maxMembers: configJson.maxMembers ? Math.min(EVSC_LIMITS.maxMembersCap, Number(configJson.maxMembers)) : null,
        minMembers: configJson.minMembers ? Number(configJson.minMembers) : 0,
    };
}

function evscRequireConfig(competitionId, tables) {
    var config = evscCompetitionConfig(competitionId, tables);
    if (!config) throw evscError('NOT_FOUND', 'This competition is not configured yet.');
    return config;
}

/* ───────────────────────── Authentication (email code) ───────────────────────── */

function evscOtpKey(email) {
    return 'otp:' + evscSha256('otp|' + email).slice(0, 40);
}

function evscActionRequestCode(params, ctx) {
    var email = evscNormalizeEmail(params.email);
    if (!evscIsEmail(email)) throw evscError('VALIDATION', 'Enter a valid email address.', { fields: { email: 'Enter a valid email address.' } });
    evscRateLimit('otp-email|' + email, 4, 15 * 60);
    evscRateLimit('otp-email-day|' + email, 10, 24 * 3600);
    if (ctx.ip) evscRateLimit('otp-ip|' + ctx.ip, 15, 3600);
    var code = evscOtpCode();
    var pepper = evscProp('EVSC_OTP_PEPPER', '');
    var record = { h: evscSha256(pepper + '|' + email + '|' + code), exp: Date.now() + 10 * 60 * 1000, attempts: 0 };
    evscCache().put(evscOtpKey(email), JSON.stringify(record), 600);
    var competition = evscStr(params.competitionName) || 'EV Society';
    var sent = evscSendMail(email, 'Your EV Society verification code',
        'Your EV Society verification code is ' + code + '.\n\n' +
        'Enter it on the ' + competition + ' team page to confirm your email address. The code expires in 10 minutes.\n\n' +
        'If you did not request this code, you can ignore this email.\n\nEV Society');
    if (!sent) throw evscError('UNAVAILABLE', 'We could not send the email right now. Please try again later.');
    return { sent: true, expiresInSeconds: 600 };
}

function evscActionVerifyCode(params, ctx) {
    var email = evscNormalizeEmail(params.email);
    var code = evscText(params.code, 10).replace(/\s/g, '');
    if (!evscIsEmail(email) || !/^\d{6}$/.test(code)) throw evscError('INVALID_CODE', 'That code is not valid. Check the email and try again.');
    if (ctx.ip) evscRateLimit('otp-verify-ip|' + ctx.ip, 30, 3600);
    var cache = evscCache();
    var key = evscOtpKey(email);
    var record = evscJsonParse(cache.get(key), null);
    if (!record || record.exp < Date.now()) throw evscError('INVALID_CODE', 'That code has expired. Request a new one.');
    if (record.attempts >= 5) {
        cache.remove(key);
        throw evscError('INVALID_CODE', 'Too many incorrect attempts. Request a new code.');
    }
    var pepper = evscProp('EVSC_OTP_PEPPER', '');
    if (!evscSafeEqual(record.h, evscSha256(pepper + '|' + email + '|' + code))) {
        record.attempts += 1;
        cache.put(key, JSON.stringify(record), Math.max(1, Math.ceil((record.exp - Date.now()) / 1000)));
        throw evscError('INVALID_CODE', 'That code is not correct. Check the email and try again.');
    }
    cache.remove(key);
    return { email: email };
}

/* ───────────────────────── Team data helpers ───────────────────────── */

function evscActorEmail(ctx) {
    var email = evscNormalizeEmail(ctx && ctx.actorEmail);
    if (!evscIsEmail(email)) throw evscError('UNAUTHORIZED', 'Please sign in again.');
    return email;
}

function evscTeamMembers(tables, teamId) {
    return tables.Members.filter(function (m) { return evscStr(m['Team ID']) === teamId; })
        .sort(function (a, b) { return Number(a['Display Order'] || 0) - Number(b['Display Order'] || 0); });
}

function evscTeamMentors(tables, teamId) {
    return tables.Mentors.filter(function (m) { return evscStr(m['Team ID']) === teamId; })
        .sort(function (a, b) { return Number(a['Display Order'] || 0) - Number(b['Display Order'] || 0); });
}

function evscTeamCategories(tables, teamId) {
    return tables.Team_Categories.filter(function (c) { return evscStr(c['Team ID']) === teamId; });
}

function evscLeaderOf(tables, team) {
    var leaderId = evscStr(team['Leader Member ID']);
    return tables.Members.find(function (m) { return evscStr(m['Member ID']) === leaderId && evscStr(m['Team ID']) === evscStr(team['Team ID']); });
}

// Not-found for both missing and foreign teams, so IDs cannot be probed
function evscRequireLeader(tables, teamId, actorEmail, competitionId) {
    var team = tables.Teams.byId(teamId);
    if (!team || (competitionId && evscStr(team['Competition ID']) !== competitionId)) throw evscError('NOT_FOUND', 'Team not found.');
    var leader = evscLeaderOf(tables, team);
    if (!leader || evscNormalizeEmail(leader['Email']) !== actorEmail) throw evscError('NOT_FOUND', 'Team not found.');
    return { team: team, leader: leader };
}

function evscTeamStatus(team) {
    return evscSignedValue(team, 'Teams', 'Registration Status') || '';
}

function evscOpenChangeRequest(tables, team) {
    var id = evscStr(team['Pending Change Request ID']);
    if (!id) return null;
    var cr = tables.Change_Requests.byId(id);
    if (!cr || EVSC_OPEN_CR.indexOf(evscSignedValue(cr, 'Change_Requests', 'Review Status')) === -1) return null;
    return cr;
}

function evscEditMode(team) {
    if (evscYes(team['Deletion Requested'])) return { mode: 'locked', reason: 'deletion-requested' };
    var status = evscTeamStatus(team);
    if (status === EVSC_TEAM_STATUS.REJECTED) return { mode: 'locked', reason: 'rejected' };
    if (status === EVSC_TEAM_STATUS.APPROVED) return { mode: 'revision', reason: null };
    return { mode: 'direct', reason: null };
}

function evscParsePermissions(value) {
    var s = evscStr(value).toLowerCase();
    var out = { hidden: false, photo: false, linkedin: false, email: false, phone: false };
    if (s.indexOf('hidden') !== -1) out.hidden = true;
    EVSC_PERMISSION_KEYS.forEach(function (k) { if (s.indexOf(k) !== -1) out[k] = true; });
    return out;
}

function evscFormatPermissions(perms) {
    if (perms.hidden) return 'hidden';
    return EVSC_PERMISSION_KEYS.filter(function (k) { return perms[k]; }).join(', ');
}

// The editable team document, the same shape the website sends and change requests store
function evscLiveTeamData(tables, team) {
    var teamId = evscStr(team['Team ID']);
    var leaderId = evscStr(team['Leader Member ID']);
    var members = evscTeamMembers(tables, teamId);
    var leader = null;
    var others = [];
    members.forEach(function (m) {
        var person = {
            memberId: evscStr(m['Member ID']),
            name: evscStr(m['Full Name']),
            email: evscStr(m['Email']),
            phone: evscStr(m['Phone']),
            linkedin: evscStr(m['LinkedIn']),
            photoFileId: evscStr(m['Photo File ID']),
            resumeFileId: evscStr(m['Resume File ID']),
            under18: evscYes(m['Under 18']),
        };
        if (person.memberId === leaderId) leader = person;
        else others.push(person);
    });
    return {
        year: Number(team['Year']) || null,
        categories: evscTeamCategories(tables, teamId)
            .filter(function (c) { return evscStr(c['Registration Status']) !== 'Withdrawn'; })
            .map(function (c) { return evscStr(c['Category ID']); }),
        team: {
            name: evscStr(team['Team Name']),
            college: evscStr(team['College']),
            institutionLogoFileId: evscStr(team['Institution Logo File ID']),
            teamLogoFileId: evscStr(team['Team Logo File ID']),
            teamPhotoFileId: evscStr(team['Team Photo File ID']),
            teamPhotoConsent: evscYes(team['Team Photo Consent']),
        },
        leader: leader,
        members: others,
        mentors: evscTeamMentors(tables, teamId).map(function (m) {
            return {
                mentorId: evscStr(m['Mentor ID']),
                name: evscStr(m['Name']),
                institution: evscStr(m['Institution']),
                linkedin: evscStr(m['LinkedIn']),
                photoFileId: evscStr(m['Photo File ID']),
                listingConsent: evscYes(m['Listing Consent']),
            };
        }),
    };
}

// Normalises and checks the website's team document. Full completeness is only required
// when submitting; drafts may be partial.
function evscNormalizeTeamInput(raw, config, opts) {
    raw = raw || {};
    var errors = {};
    var data = {
        year: Number(raw.year) || null,
        categories: Array.isArray(raw.categories) ? raw.categories.map(function (c) { return evscText(c, 60); }).filter(function (c) { return c; }) : [],
        team: {},
        leader: {},
        members: [],
        mentors: [],
    };
    var t = raw.team || {};
    data.team = {
        name: evscText(t.name, EVSC_LIMITS.teamName),
        college: evscText(t.college, EVSC_LIMITS.college),
        institutionLogoFileId: evscText(t.institutionLogoFileId, 40),
        teamLogoFileId: evscText(t.teamLogoFileId, 40),
        teamPhotoFileId: evscText(t.teamPhotoFileId, 40),
        teamPhotoConsent: raw.team ? t.teamPhotoConsent === true : false,
    };
    var l = raw.leader || {};
    data.leader = {
        memberId: evscText(l.memberId, 40),
        name: evscText(l.name, EVSC_LIMITS.name),
        phone: evscNormalizePhone(l.phone),
        linkedin: evscNormalizeLinkedIn(l.linkedin),
        photoFileId: evscText(l.photoFileId, 40),
        resumeFileId: evscText(l.resumeFileId, 40),
        under18: l.under18 === true,
    };
    if (data.leader.phone && !evscIsPhone(data.leader.phone)) errors['leader.phone'] = 'Enter a valid phone number.';
    if (data.leader.linkedin && !evscIsLinkedIn(data.leader.linkedin)) errors['leader.linkedin'] = 'Enter a LinkedIn profile URL, such as https://www.linkedin.com/in/your-name.';

    var rawMembers = Array.isArray(raw.members) ? raw.members : [];
    if (rawMembers.length > EVSC_LIMITS.maxMembersCap) errors.members = 'A team can list at most ' + EVSC_LIMITS.maxMembersCap + ' members.';
    rawMembers.slice(0, EVSC_LIMITS.maxMembersCap).forEach(function (m, i) {
        m = m || {};
        var member = {
            memberId: evscText(m.memberId, 40),
            name: evscText(m.name, EVSC_LIMITS.name),
            email: evscNormalizeEmail(m.email),
            phone: evscNormalizePhone(m.phone),
            linkedin: evscNormalizeLinkedIn(m.linkedin),
            photoFileId: evscText(m.photoFileId, 40),
            resumeFileId: evscText(m.resumeFileId, 40),
            under18: m.under18 === true,
        };
        var p = 'members.' + i + '.';
        if (member.email && !evscIsEmail(member.email)) errors[p + 'email'] = 'Enter a valid email address.';
        if (member.phone && !evscIsPhone(member.phone)) errors[p + 'phone'] = 'Enter a valid phone number.';
        if (member.linkedin && !evscIsLinkedIn(member.linkedin)) errors[p + 'linkedin'] = 'Enter a LinkedIn profile URL.';
        data.members.push(member);
    });

    var rawMentors = Array.isArray(raw.mentors) ? raw.mentors : [];
    if (rawMentors.length > config.maxMentors) errors.mentors = 'Add at most ' + config.maxMentors + ' mentors.';
    rawMentors.slice(0, config.maxMentors).forEach(function (m, i) {
        m = m || {};
        var mentor = {
            mentorId: evscText(m.mentorId, 40),
            name: evscText(m.name, EVSC_LIMITS.name),
            institution: evscText(m.institution, EVSC_LIMITS.institution),
            linkedin: evscNormalizeLinkedIn(m.linkedin),
            photoFileId: evscText(m.photoFileId, 40),
            listingConsent: m.listingConsent === true,
        };
        if (mentor.linkedin && !evscIsLinkedIn(mentor.linkedin)) errors['mentors.' + i + '.linkedin'] = 'Enter a LinkedIn profile URL.';
        data.mentors.push(mentor);
    });

    if (opts && opts.complete) {
        if (!data.year) errors.year = 'Select the competition year.';
        if (!data.categories.length) errors.categories = 'Select a competition category.';
        if (!data.team.name) errors['team.name'] = 'Enter the team name.';
        if (!data.team.college) errors['team.college'] = 'Enter the college or university name.';
        if (!data.leader.name) errors['leader.name'] = "Enter the team leader's full name.";
        if (!data.leader.phone) errors['leader.phone'] = "Enter the team leader's phone number.";
        data.members.forEach(function (m, i) { if (!m.name) errors['members.' + i + '.name'] = "Enter the member's full name, or remove this member."; });
        data.mentors.forEach(function (m, i) { if (!m.name) errors['mentors.' + i + '.name'] = "Enter the mentor's full name, or remove this mentor."; });
        var teamSize = data.members.length + 1;
        if (config.maxMembers && teamSize > config.maxMembers) errors.members = 'This competition allows at most ' + config.maxMembers + ' people per team, including the leader.';
        if (config.minMembers && teamSize < config.minMembers) errors.members = 'This competition needs at least ' + config.minMembers + ' people per team, including the leader.';
        if (raw.processingConsent !== true) errors.processingConsent = 'Please agree to the processing of this registration.';
    }
    // Member emails must be unique within a team (leader included)
    var seen = {};
    if (opts && opts.leaderEmail) seen[opts.leaderEmail] = 'leader';
    data.members.forEach(function (m, i) {
        if (!m.email) return;
        if (seen[m.email]) errors['members.' + i + '.email'] = 'This email is already used by another person in the team.';
        seen[m.email] = true;
    });

    data.leaderPermissions = {
        photo: !!(raw.leaderPermissions && raw.leaderPermissions.photo === true),
        linkedin: !!(raw.leaderPermissions && raw.leaderPermissions.linkedin === true),
        email: !!(raw.leaderPermissions && raw.leaderPermissions.email === true),
        phone: !!(raw.leaderPermissions && raw.leaderPermissions.phone === true),
    };
    data.publicationConsent = raw.publicationConsent === true;
    data.processingConsent = raw.processingConsent === true;

    if (Object.keys(errors).length) throw evscError('VALIDATION', 'Please correct the highlighted fields.', { fields: errors });
    return data;
}

function evscValidateYearAndCategories(data, config) {
    var fields = {};
    if (data.year && config.registrationYears.indexOf(data.year) === -1) fields.year = 'Registration is not open for ' + data.year + '.';
    var invalid = data.categories.filter(function (c) { return config.categories.indexOf(c) === -1; });
    if (invalid.length) fields.categories = 'Select a valid competition category.';
    var unique = {};
    data.categories.forEach(function (c) { unique[c] = true; });
    if (Object.keys(unique).length !== data.categories.length) fields.categories = 'Each category can only be selected once.';
    if (Object.keys(fields).length) throw evscError('VALIDATION', 'Please correct the highlighted fields.', { fields: fields });
}

// Every referenced upload must belong to this team and be the right kind of file
function evscValidateFileRefs(tables, teamId, data) {
    var checks = [];
    var add = function (fileId, kinds, path) { if (fileId) checks.push({ id: fileId, kinds: kinds, path: path }); };
    add(data.team.institutionLogoFileId, ['institution-logo'], 'team.institutionLogoFileId');
    add(data.team.teamLogoFileId, ['team-logo'], 'team.teamLogoFileId');
    add(data.team.teamPhotoFileId, ['team-photo'], 'team.teamPhotoFileId');
    add(data.leader.photoFileId, ['member-photo'], 'leader.photoFileId');
    add(data.leader.resumeFileId, ['resume'], 'leader.resumeFileId');
    data.members.forEach(function (m, i) {
        add(m.photoFileId, ['member-photo'], 'members.' + i + '.photoFileId');
        add(m.resumeFileId, ['resume'], 'members.' + i + '.resumeFileId');
    });
    data.mentors.forEach(function (m, i) { add(m.photoFileId, ['mentor-photo'], 'mentors.' + i + '.photoFileId'); });
    var fields = {};
    checks.forEach(function (c) {
        var file = tables.Files.byId(c.id);
        if (!file || evscStr(file['Team ID']) !== teamId || c.kinds.indexOf(evscStr(file['Kind'])) === -1 || evscStr(file['Status']) !== 'Active') {
            fields[c.path] = 'This file is not available. Please upload it again.';
        }
    });
    if (Object.keys(fields).length) throw evscError('VALIDATION', 'Some uploaded files are no longer available.', { fields: fields });
}

function evscFileSummary(tables, fileId) {
    if (!fileId) return null;
    var file = tables.Files.byId(fileId);
    if (!file) return null;
    return {
        fileId: fileId,
        kind: evscStr(file['Kind']),
        name: evscStr(file['Original Name']),
        mime: evscStr(file['MIME Type']),
        size: Number(file['Size (bytes)']) || 0,
        uploadedAt: evscStr(file['Uploaded At']),
    };
}

function evscCollectFileIds(data) {
    var ids = [data.team.institutionLogoFileId, data.team.teamLogoFileId, data.team.teamPhotoFileId];
    if (data.leader) ids.push(data.leader.photoFileId, data.leader.resumeFileId);
    data.members.forEach(function (m) { ids.push(m.photoFileId, m.resumeFileId); });
    data.mentors.forEach(function (m) { ids.push(m.photoFileId); });
    return ids.filter(function (id) { return id; });
}

/* ───────────────────────── Team views ───────────────────────── */

function evscPublicationLabel(team) {
    return evscStr(team['Profile Publication Status']) || 'Not published';
}

function evscTeamView(tables, team, config) {
    var teamId = evscStr(team['Team ID']);
    var status = evscTeamStatus(team);
    var edit = evscEditMode(team);
    var cr = evscOpenChangeRequest(tables, team);
    var live = evscLiveTeamData(tables, team);
    var data = live;
    if (cr) {
        var pending = evscJsonParse(cr['Submitted Data'], null);
        if (pending) data = pending;
    }
    // Year and categories are fixed once a team is approved
    if (edit.mode === 'revision') {
        data.year = live.year;
        data.categories = live.categories;
    }
    var leaderRow = evscLeaderOf(tables, team);
    var leaderPerms = evscParsePermissions(leaderRow ? leaderRow['Publication Permissions'] : '');
    var files = {};
    evscCollectFileIds(data).concat(evscCollectFileIds(live)).forEach(function (id) {
        var summary = evscFileSummary(tables, id);
        if (summary) files[id] = summary;
    });
    var memberConsents = {};
    evscTeamMembers(tables, teamId).forEach(function (m) {
        memberConsents[evscStr(m['Member ID'])] = {
            consentStatus: evscStr(m['Consent Status']) || 'Not requested',
            verificationStatus: evscStr(m['Verification Status']) || 'Unverified',
            permissions: evscParsePermissions(m['Publication Permissions']),
            guardianConsentVerified: evscSignedIs(m, 'Members', 'Guardian Consent Verified', 'Yes'),
        };
    });
    var categories = evscTeamCategories(tables, teamId).map(function (c) {
        return {
            categoryId: evscStr(c['Category ID']),
            registrationStatus: evscSignedValue(c, 'Team_Categories', 'Registration Status') || 'Registered',
            participationVerified: evscSignedIs(c, 'Team_Categories', 'Participation Verified', 'Yes'),
            winnerVerified: evscSignedIs(c, 'Team_Categories', 'Winner Verified', 'Yes') && evscSignedIs(c, 'Team_Categories', 'Participation Verified', 'Yes'),
            achievement: evscSignedValue(c, 'Team_Categories', 'Achievement') || '',
        };
    });
    return {
        teamId: teamId,
        competitionId: evscStr(team['Competition ID']),
        entryType: evscStr(team['Entry Type']) || 'Team',
        status: status || EVSC_TEAM_STATUS.DRAFT,
        version: Number(team['Version']) || 0,
        revisionNumber: Number(team['Revision Number']) || 0,
        slug: evscStr(team['Slug']),
        editMode: edit.mode,
        lockedReason: edit.reason,
        reviewComments: status === EVSC_TEAM_STATUS.CHANGES || status === EVSC_TEAM_STATUS.REJECTED ? evscMultiline(team['Review Comments'], EVSC_LIMITS.comments) : '',
        publication: {
            consent: evscYes(team['Publication Consent']),
            profileApproved: evscSignedIs(team, 'Teams', 'Profile Approved', 'Yes'),
            publicationApproved: evscSignedIs(team, 'Teams', 'Publication Approved', 'Yes'),
            status: evscPublicationLabel(team),
        },
        processingConsentAt: evscStr(team['Processing Consent At']),
        submittedAt: evscStr(team['Submitted At']),
        updatedAt: evscStr(team['Updated At']),
        pendingChange: cr ? {
            changeRequestId: evscStr(cr['Change Request ID']),
            status: evscStr(cr['Review Status']),
            submittedAt: evscStr(cr['Submission Timestamp']),
            summary: evscStr(cr['Summary of Changes']),
            reviewComments: evscStr(cr['Review Status']) === EVSC_CR_STATUS.CHANGES ? evscMultiline(cr['Review Comments'], EVSC_LIMITS.comments) : '',
        } : null,
        leaderEmail: leaderRow ? evscNormalizeEmail(leaderRow['Email']) : '',
        leaderPermissions: { photo: leaderPerms.photo, linkedin: leaderPerms.linkedin, email: leaderPerms.email, phone: leaderPerms.phone },
        categoriesStatus: categories,
        memberConsents: memberConsents,
        files: files,
        data: data,
        maxMentors: config ? config.maxMentors : 4,
    };
}

function evscActionListTeams(params, ctx) {
    var email = evscActorEmail(ctx);
    var competitionId = evscText(params.competitionId, 80);
    var tables = evscTables(['Teams', 'Members', 'Team_Categories', 'Change_Requests']);
    var leaderRows = tables.Members.filter(function (m) { return evscNormalizeEmail(m['Email']) === email && evscStr(m['Role']) === 'Leader'; });
    var teams = [];
    leaderRows.forEach(function (m) {
        var team = tables.Teams.byId(m['Team ID']);
        if (!team || evscStr(team['Competition ID']) !== competitionId) return;
        if (evscStr(team['Leader Member ID']) !== evscStr(m['Member ID'])) return;
        var cr = evscOpenChangeRequest(tables, team);
        teams.push({
            teamId: evscStr(team['Team ID']),
            name: evscStr(team['Team Name']),
            college: evscStr(team['College']),
            year: Number(team['Year']) || null,
            categories: evscTeamCategories(tables, evscStr(team['Team ID'])).map(function (c) { return evscStr(c['Category ID']); }),
            status: evscTeamStatus(team) || EVSC_TEAM_STATUS.DRAFT,
            publicationStatus: evscPublicationLabel(team),
            pendingChange: cr ? evscStr(cr['Review Status']) : null,
            updatedAt: evscStr(team['Updated At']),
        });
    });
    teams.sort(function (a, b) { return b.updatedAt < a.updatedAt ? -1 : b.updatedAt > a.updatedAt ? 1 : 0; });
    return { teams: teams };
}

function evscActionGetTeam(params, ctx) {
    var email = evscActorEmail(ctx);
    var tables = evscTables(['Competitions', 'Teams', 'Members', 'Mentors', 'Team_Categories', 'Files', 'Change_Requests']);
    var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
    var config = evscCompetitionConfig(evscStr(found.team['Competition ID']), tables);
    return { team: evscTeamView(tables, found.team, config) };
}

/* ───────────────────────── Create draft ───────────────────────── */

function evscUniqueTeamId(tables) {
    for (var i = 0; i < 20; i++) {
        var id = 'EVS-' + evscRandomCode(6);
        if (!tables.Teams.byId(id)) return id;
    }
    throw evscError('INTERNAL', 'Could not allocate a team ID.');
}

function evscActionCreateDraft(params, ctx) {
    var email = evscActorEmail(ctx);
    return evscWithLock(function () {
        return evscIdempotent(params.idempotencyKey ? 'create|' + email + '|' + params.idempotencyKey : '', function () {
            var tables = evscTables(EVSC_ALL_TABS);
            var competitionId = evscText(params.competitionId, 80);
            var config = evscRequireConfig(competitionId, tables);
            if (!config.registrationOpen) throw evscError('CLOSED', 'Registration is currently closed.');
            var year = Number(params.year);
            var categories = Array.isArray(params.categories) ? params.categories.map(function (c) { return evscText(c, 60); }) : [];
            var name = evscText(params.leader && params.leader.name, EVSC_LIMITS.name);
            var phone = evscNormalizePhone(params.leader && params.leader.phone);
            var fields = {};
            if (!year || config.registrationYears.indexOf(year) === -1) fields.year = 'Registration is not open for this year.';
            if (!categories.length) fields.categories = 'Select a competition category.';
            if (!name) fields['leader.name'] = 'Enter your full name.';
            if (!phone || !evscIsPhone(phone)) fields['leader.phone'] = 'Enter a valid phone number.';
            if (Object.keys(fields).length) throw evscError('VALIDATION', 'Please correct the highlighted fields.', { fields: fields });
            evscValidateYearAndCategories({ year: year, categories: categories }, config);

            if (!params.allowAdditional) {
                var existing = tables.Members.filter(function (m) { return evscStr(m['Role']) === 'Leader' && evscNormalizeEmail(m['Email']) === email; })
                    .map(function (m) { return tables.Teams.byId(m['Team ID']); })
                    .filter(function (t) { return t && evscStr(t['Competition ID']) === competitionId && Number(t['Year']) === year && evscTeamStatus(t) !== EVSC_TEAM_STATUS.REJECTED; });
                if (existing.length) {
                    throw evscError('DUPLICATE_LEADER', 'You already have a registration for ' + year + '.', {
                        details: { teamId: evscStr(existing[0]['Team ID']), teamName: evscStr(existing[0]['Team Name']) },
                    });
                }
            }
            if (ctx.ip) evscRateLimit('create-ip|' + ctx.ip, 10, 3600);

            var now = evscIso();
            var teamId = evscUniqueTeamId(tables);
            var leaderId = evscNewId('MBR');
            var team = tables.Teams.insert({
                'Team ID': teamId,
                'Competition ID': competitionId,
                'Year': year,
                'Entry Type': 'Team',
                'Team Name': '',
                'College': '',
                'Slug': '',
                'Leader Member ID': leaderId,
                'Publication Consent': 'No',
                'Profile Publication Status': 'Not published',
                'Revision Number': 0,
                'Team Photo Consent': 'No',
                'Deletion Requested': 'No',
                'Version': 1,
                'Created At': now,
                'Updated At': now,
            });
            evscSetSigned(tables.Teams, team, { 'Registration Status': EVSC_TEAM_STATUS.DRAFT, 'Profile Approved': 'No', 'Publication Approved': 'No' }, 'system:create');
            var leader = tables.Members.insert({
                'Member ID': leaderId,
                'Team ID': teamId,
                'Full Name': name,
                'Role': 'Leader',
                'Email': email,
                'Phone': phone,
                'Display Order': 0,
                'Under 18': 'No',
                'Publication Permissions': '',
                'Consent Status': 'Self (team leader)',
                'Verification Status': 'Email verified',
                'Created At': now,
                'Updated At': now,
            });
            evscSetSigned(tables.Members, leader, { 'Guardian Consent Verified': 'No' }, 'system:create');
            evscSyncCategories(tables, team, categories, config, 'system:create');
            evscAudit(tables, { actor: email, entityType: 'Team', entityId: teamId, type: 'team.draft_created', after: { year: year, categories: categories } });
            return { team: evscTeamView(tables, team, config) };
        });
    });
}

function evscCategoryLabel(categoryId) {
    var labels = { 'model-rocketry': 'Model Rocketry', 'can-7usat': 'CAN-7USAT' };
    return labels[categoryId] || categoryId;
}

// One association per category; deselected categories are removed while the team is unapproved
function evscSyncCategories(tables, team, categories, config, actor) {
    var teamId = evscStr(team['Team ID']);
    var existing = evscTeamCategories(tables, teamId);
    var now = evscIso();
    var toRemove = existing.filter(function (c) { return categories.indexOf(evscStr(c['Category ID'])) === -1; });
    if (toRemove.length) tables.Team_Categories.remove(toRemove);
    categories.forEach(function (categoryId) {
        var current = existing.filter(function (c) { return evscStr(c['Category ID']) === categoryId; })[0];
        if (current) {
            tables.Team_Categories.update(current, { 'Year': team['Year'], 'Team (reference)': evscStr(team['Team Name']), 'Updated At': now });
            return;
        }
        var row = tables.Team_Categories.insert({
            'Association ID': evscNewId('TCA'),
            'Team ID': teamId,
            'Team (reference)': evscStr(team['Team Name']),
            'Year': team['Year'],
            'Category ID': categoryId,
            'Category': evscCategoryLabel(categoryId),
            'Created At': now,
            'Updated At': now,
        });
        evscSetSigned(tables.Team_Categories, row, { 'Registration Status': 'Registered', 'Participation Verified': 'No', 'Winner Verified': 'No', 'Achievement': '' }, actor);
    });
}

/* ───────────────────────── Save team ───────────────────────── */

function evscPersonChanged(before, after) {
    if (!before) return true;
    return ['email', 'phone', 'linkedin', 'photoFileId'].some(function (k) { return evscStr(before[k]) !== evscStr(after[k]); });
}

function evscResetConsent(changes) {
    changes['Publication Permissions'] = '';
    changes['Consent Status'] = 'Not requested';
    changes['Consent Updated At'] = evscIso();
    changes['Consent Token Hash'] = '';
    changes['Consent Token Expires'] = '';
}

// Writes the team document to the live rows (used for direct saves and approved revisions)
function evscApplyTeamData(tables, team, data, actor, opts) {
    var teamId = evscStr(team['Team ID']);
    var now = evscIso();
    var teamChanges = {
        'Team Name': data.team.name,
        'College': data.team.college,
        'Institution Logo File ID': data.team.institutionLogoFileId,
        'Team Logo File ID': data.team.teamLogoFileId,
        'Team Photo File ID': data.team.teamPhotoFileId,
        'Team Photo Consent': evscYesNo(data.team.teamPhotoConsent && data.team.teamPhotoFileId),
        'Updated At': now,
    };
    if (opts.allowYearCategory) {
        teamChanges['Year'] = data.year;
    }
    // Public URLs stay stable once a profile has been published
    if (!evscStr(team['First Published At']) && data.team.name) {
        teamChanges['Slug'] = evscUniqueSlug(tables, data.team.name, data.year || team['Year'], teamId);
    }
    tables.Teams.update(team, teamChanges);
    if (opts.allowYearCategory) evscSyncCategories(tables, team, data.categories, opts.config, 'system:' + actor);

    var existing = evscTeamMembers(tables, teamId);
    var leaderRow = evscLeaderOf(tables, team);
    var before = evscLiveTeamData(tables, team);
    var beforeById = {};
    before.members.forEach(function (m) { beforeById[m.memberId] = m; });

    if (leaderRow) {
        tables.Members.update(leaderRow, {
            'Full Name': data.leader.name || leaderRow['Full Name'],
            'Phone': data.leader.phone || leaderRow['Phone'],
            'LinkedIn': data.leader.linkedin,
            'Photo File ID': data.leader.photoFileId,
            'Resume File ID': data.leader.resumeFileId,
            'Under 18': evscYesNo(data.leader.under18),
            'Updated At': now,
        });
    }

    var keptIds = {};
    var created = [];
    data.members.forEach(function (m, i) {
        var row = m.memberId ? existing.filter(function (r) { return evscStr(r['Member ID']) === m.memberId && evscStr(r['Role']) !== 'Leader'; })[0] : null;
        var changes = {
            'Full Name': m.name,
            'Email': m.email,
            'Phone': m.phone,
            'LinkedIn': m.linkedin,
            'Photo File ID': m.photoFileId,
            'Resume File ID': m.resumeFileId,
            'Display Order': i + 1,
            'Under 18': evscYesNo(m.under18),
            'Updated At': now,
        };
        if (row) {
            keptIds[evscStr(row['Member ID'])] = true;
            if (evscPersonChanged(beforeById[evscStr(row['Member ID'])], m)) {
                if (evscStr(beforeById[evscStr(row['Member ID'])].email) !== m.email) changes['Verification Status'] = 'Unverified';
                evscResetConsent(changes);
            }
            tables.Members.update(row, changes);
        } else {
            var id = evscNewId('MBR');
            changes['Member ID'] = id;
            changes['Team ID'] = teamId;
            changes['Role'] = 'Member';
            changes['Consent Status'] = 'Not requested';
            changes['Verification Status'] = 'Unverified';
            changes['Publication Permissions'] = '';
            changes['Created At'] = now;
            var inserted = tables.Members.insert(changes);
            evscSetSigned(tables.Members, inserted, { 'Guardian Consent Verified': 'No' }, 'system:create');
            keptIds[id] = true;
            created.push(id);
        }
    });
    var removedMembers = existing.filter(function (r) { return evscStr(r['Role']) !== 'Leader' && !keptIds[evscStr(r['Member ID'])]; });
    if (removedMembers.length) tables.Members.remove(removedMembers);

    var existingMentors = evscTeamMentors(tables, teamId);
    var keptMentors = {};
    data.mentors.forEach(function (m, i) {
        var row = m.mentorId ? existingMentors.filter(function (r) { return evscStr(r['Mentor ID']) === m.mentorId; })[0] : null;
        var changes = {
            'Name': m.name,
            'Institution': m.institution,
            'LinkedIn': m.linkedin,
            'Photo File ID': m.photoFileId,
            'Display Order': i + 1,
            'Listing Consent': evscYesNo(m.listingConsent),
            'Updated At': now,
        };
        if (row) {
            keptMentors[evscStr(row['Mentor ID'])] = true;
            tables.Mentors.update(row, changes);
        } else {
            var mentorId = evscNewId('MNT');
            changes['Mentor ID'] = mentorId;
            changes['Team ID'] = teamId;
            changes['Created At'] = now;
            tables.Mentors.insert(changes);
            keptMentors[mentorId] = true;
        }
    });
    var removedMentors = existingMentors.filter(function (r) { return !keptMentors[evscStr(r['Mentor ID'])]; });
    if (removedMentors.length) tables.Mentors.remove(removedMentors);

    evscLinkFiles(tables, data, teamId);
    evscTeamCategories(tables, teamId).forEach(function (c) {
        if (evscStr(c['Team (reference)']) !== data.team.name) tables.Team_Categories.update(c, { 'Team (reference)': data.team.name });
    });
    return { createdMemberIds: created, removedMembers: removedMembers.length, removedMentors: removedMentors.length };
}

function evscLinkFiles(tables, data, teamId) {
    var owners = {};
    owners[data.team.institutionLogoFileId] = teamId;
    owners[data.team.teamLogoFileId] = teamId;
    owners[data.team.teamPhotoFileId] = teamId;
    if (data.leader) {
        owners[data.leader.photoFileId] = data.leader.memberId;
        owners[data.leader.resumeFileId] = data.leader.memberId;
    }
    data.members.forEach(function (m) { owners[m.photoFileId] = m.memberId || 'pending'; owners[m.resumeFileId] = m.memberId || 'pending'; });
    data.mentors.forEach(function (m) { owners[m.photoFileId] = m.mentorId || 'pending'; });
    Object.keys(owners).forEach(function (fileId) {
        if (!fileId) return;
        var file = tables.Files.byId(fileId);
        if (file && evscStr(file['Team ID']) === teamId && evscStr(file['Owner ID']) !== owners[fileId]) {
            tables.Files.update(file, { 'Owner ID': owners[fileId] });
        }
    });
}

function evscUniqueSlug(tables, name, year, teamId) {
    var base = evscSlugify(name) + (year ? '-' + year : '');
    var slug = base;
    var n = 2;
    while (tables.Teams.find(function (t) { return evscStr(t['Slug']) === slug && evscStr(t['Team ID']) !== teamId; })) {
        slug = base + '-' + n;
        n += 1;
    }
    return slug;
}

function evscCheckDuplicateTeam(tables, team, data) {
    var key = evscNormalizedKey(data.team.name) + '|' + evscNormalizedKey(data.team.college);
    var duplicate = tables.Teams.find(function (t) {
        return evscStr(t['Team ID']) !== evscStr(team['Team ID']) &&
            evscStr(t['Competition ID']) === evscStr(team['Competition ID']) &&
            Number(t['Year']) === Number(data.year || team['Year']) &&
            evscTeamStatus(t) !== EVSC_TEAM_STATUS.REJECTED &&
            evscTeamStatus(t) !== EVSC_TEAM_STATUS.DRAFT &&
            evscNormalizedKey(t['Team Name']) + '|' + evscNormalizedKey(t['College']) === key;
    });
    if (duplicate) {
        throw evscError('DUPLICATE_TEAM', 'A team with this name from this college is already registered for this year.', {
            fields: { 'team.name': 'A team with this name from this college is already registered for this year. If it is yours, sign in to Manage Team Profile.' },
        });
    }
}

function evscSummarizeChanges(before, after) {
    var lines = [];
    var cmp = function (label, a, b) { if (evscStr(a) !== evscStr(b)) lines.push(label + ': "' + evscStr(a) + '" → "' + evscStr(b) + '"'); };
    cmp('Team name', before.team.name, after.team.name);
    cmp('College', before.team.college, after.team.college);
    if (before.team.teamLogoFileId !== after.team.teamLogoFileId) lines.push('Team logo ' + (after.team.teamLogoFileId ? 'updated' : 'removed'));
    if (before.team.institutionLogoFileId !== after.team.institutionLogoFileId) lines.push('Institution logo ' + (after.team.institutionLogoFileId ? 'updated' : 'removed'));
    if (before.team.teamPhotoFileId !== after.team.teamPhotoFileId) lines.push('Team photograph ' + (after.team.teamPhotoFileId ? 'updated' : 'removed'));
    if (!!before.team.teamPhotoConsent !== !!after.team.teamPhotoConsent) lines.push('Team photograph consent: ' + evscYesNo(after.team.teamPhotoConsent));
    var personFields = [['name', 'name'], ['phone', 'phone'], ['linkedin', 'LinkedIn'], ['photoFileId', 'photo'], ['resumeFileId', 'resume'], ['under18', 'under-18 flag']];
    var changedFields = function (a, b, fields) {
        return fields.filter(function (f) { return evscStr(a[f[0]]) !== evscStr(b[f[0]]); }).map(function (f) { return f[1]; });
    };
    if (before.leader && after.leader) {
        var lf = changedFields(before.leader, after.leader, personFields);
        if (lf.length) lines.push('Team leader updated (' + lf.join(', ') + ')');
    }
    var beforeMembers = {};
    before.members.forEach(function (m) { beforeMembers[m.memberId] = m; });
    after.members.forEach(function (m) {
        var prev = m.memberId ? beforeMembers[m.memberId] : null;
        if (!prev) { lines.push('Member added: ' + m.name); return; }
        delete beforeMembers[m.memberId];
        var f = changedFields(prev, m, personFields.concat([['email', 'email']]));
        if (f.length) lines.push('Member updated: ' + m.name + ' (' + f.join(', ') + ')');
    });
    Object.keys(beforeMembers).forEach(function (id) { lines.push('Member removed: ' + beforeMembers[id].name); });
    var beforeMentors = {};
    before.mentors.forEach(function (m) { beforeMentors[m.mentorId] = m; });
    after.mentors.forEach(function (m) {
        var prev = m.mentorId ? beforeMentors[m.mentorId] : null;
        if (!prev) { lines.push('Mentor added: ' + m.name); return; }
        delete beforeMentors[m.mentorId];
        var f = changedFields(prev, m, [['name', 'name'], ['institution', 'institution'], ['linkedin', 'LinkedIn'], ['photoFileId', 'photo'], ['listingConsent', 'listing consent']]);
        if (f.length) lines.push('Mentor updated: ' + m.name + ' (' + f.join(', ') + ')');
    });
    Object.keys(beforeMentors).forEach(function (id) { lines.push('Mentor removed: ' + beforeMentors[id].name); });
    return lines;
}

function evscContentOnly(data) {
    return { year: data.year, categories: data.categories, team: data.team, leader: data.leader, members: data.members, mentors: data.mentors };
}

function evscActionSaveTeam(params, ctx) {
    var email = evscActorEmail(ctx);
    return evscWithLock(function () {
        return evscIdempotent(params.idempotencyKey ? 'save|' + email + '|' + params.idempotencyKey : '', function () {
            var tables = evscTables(EVSC_ALL_TABS);
            var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
            var team = found.team;
            var leaderRow = found.leader;
            var teamId = evscStr(team['Team ID']);
            var config = evscRequireConfig(evscStr(team['Competition ID']), tables);
            if (params.expectedVersion !== undefined && params.expectedVersion !== null && Number(params.expectedVersion) !== Number(team['Version'])) {
                throw evscError('CONFLICT', 'This profile was changed in another window or by EV Society. Reload to see the latest version before saving.');
            }
            var edit = evscEditMode(team);
            if (edit.mode === 'locked') throw evscError('LOCKED', edit.reason === 'rejected' ? 'This registration was not accepted. Please contact EV Society.' : 'A deletion request is in progress for this team.');
            var submit = params.submit === true;
            var data = evscNormalizeTeamInput(params.data, config, { complete: submit, leaderEmail: evscNormalizeEmail(leaderRow['Email']) });
            data.leader.memberId = evscStr(leaderRow['Member ID']);
            var live = evscLiveTeamData(tables, team);
            if (edit.mode === 'revision') {
                data.year = live.year;
                data.categories = live.categories;
            } else {
                if (!data.year || !data.categories.length) {
                    throw evscError('VALIDATION', 'Please correct the highlighted fields.', { fields: { categories: 'Select a competition category.' } });
                }
                evscValidateYearAndCategories(data, config);
            }
            evscValidateFileRefs(tables, teamId, data);
            if (submit) evscCheckDuplicateTeam(tables, team, data);

            var now = evscIso();
            var status = evscTeamStatus(team);
            var before = { status: status, version: Number(team['Version']) };

            // Consent choices made by the verified leader take effect immediately, even when the
            // content itself waits for review, so a withdrawal is never delayed
            tables.Members.update(leaderRow, {
                'Publication Permissions': evscFormatPermissions(data.leaderPermissions),
                'Consent Updated At': now,
            });
            var teamImmediate = { 'Publication Consent': evscYesNo(data.publicationConsent) };
            if (data.processingConsent && !evscStr(team['Processing Consent At'])) teamImmediate['Processing Consent At'] = now;
            tables.Teams.update(team, teamImmediate);

            var outcome = { mode: edit.mode, submitted: false, changeRequestId: null };
            if (edit.mode === 'direct') {
                var applied = evscApplyTeamData(tables, team, data, email, { allowYearCategory: true, config: config });
                var openCr = evscOpenChangeRequest(tables, team);
                if (openCr) {
                    evscSetSigned(tables.Change_Requests, openCr, { 'Review Status': EVSC_CR_STATUS.SUPERSEDED }, 'system:superseded');
                    tables.Change_Requests.update(openCr, { 'Updated At': now });
                    tables.Teams.update(team, { 'Pending Change Request ID': '' });
                }
                if (submit && (status === EVSC_TEAM_STATUS.DRAFT || status === EVSC_TEAM_STATUS.CHANGES || !status)) {
                    evscSetSigned(tables.Teams, team, { 'Registration Status': EVSC_TEAM_STATUS.PENDING }, 'system:submitted');
                    tables.Teams.update(team, { 'Submitted At': now });
                    outcome.submitted = true;
                }
                outcome.createdMemberIds = applied.createdMemberIds;
            } else {
                var proposed = evscContentOnly(data);
                var changes = evscSummarizeChanges(live, proposed);
                var cr = evscOpenChangeRequest(tables, team);
                if (!changes.length && cr) {
                    // The leader reverted everything: nothing is left to review
                    evscSetSigned(tables.Change_Requests, cr, { 'Review Status': EVSC_CR_STATUS.WITHDRAWN }, 'system:no-changes');
                    tables.Change_Requests.update(cr, { 'Updated At': now });
                    tables.Teams.update(team, { 'Pending Change Request ID': '' });
                } else if (changes.length) {
                    var json = JSON.stringify(proposed);
                    if (json.length > EVSC_LIMITS.submittedDataChars) throw evscError('PAYLOAD_TOO_LARGE', 'This update is too large to submit at once. Please contact EV Society.');
                    var crStatus = submit ? EVSC_CR_STATUS.PENDING : (cr && evscStr(cr['Review Status']) === EVSC_CR_STATUS.PENDING ? EVSC_CR_STATUS.PENDING : EVSC_CR_STATUS.DRAFT);
                    var summary = changes.join('\n');
                    if (cr) {
                        tables.Change_Requests.update(cr, {
                            'Team (reference)': live.team.name,
                            'Summary of Changes': summary,
                            'Submitted Data': json,
                            'Submission Timestamp': submit ? now : cr['Submission Timestamp'],
                            'Updated At': now,
                        });
                    } else {
                        cr = tables.Change_Requests.insert({
                            'Change Request ID': evscNewId('CHG'),
                            'Team ID': teamId,
                            'Team (reference)': live.team.name,
                            'Revision ID': 'R' + ((Number(team['Revision Number']) || 1) + 1),
                            'Base Revision Number': Number(team['Revision Number']) || 1,
                            'Summary of Changes': summary,
                            'Submitted Data': json,
                            'Submission Timestamp': submit ? now : '',
                            'Updated At': now,
                        });
                        tables.Teams.update(team, { 'Pending Change Request ID': evscStr(cr['Change Request ID']) });
                    }
                    if (evscSignedValue(cr, 'Change_Requests', 'Review Status') !== crStatus) {
                        evscSetSigned(tables.Change_Requests, cr, { 'Review Status': crStatus }, 'system:' + (submit ? 'submitted' : 'saved'));
                    }
                    outcome.changeRequestId = evscStr(cr['Change Request ID']);
                    outcome.submitted = submit;
                }
            }
            tables.Teams.update(team, { 'Version': (Number(team['Version']) || 0) + 1, 'Updated At': now });
            var notified = edit.mode === 'direct' ? evscSendPendingConsentRequests(tables, team, config) : 0;
            evscRefreshPublicationStatus(tables, team);
            evscInvalidatePublic(evscStr(team['Competition ID']));
            evscAudit(tables, {
                actor: email, entityType: 'Team', entityId: teamId,
                type: edit.mode === 'revision' ? (outcome.submitted ? 'team.revision_submitted' : 'team.revision_saved') : (outcome.submitted ? 'team.submitted' : 'team.saved'),
                before: before, after: { status: evscTeamStatus(team), version: Number(team['Version']), changeRequestId: outcome.changeRequestId },
                details: notified ? notified + ' consent request(s) sent' : '',
            });
            return { team: evscTeamView(tables, team, config), outcome: outcome };
        });
    });
}

function evscActionDiscardChanges(params, ctx) {
    var email = evscActorEmail(ctx);
    return evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
        var cr = evscOpenChangeRequest(tables, found.team);
        if (cr) {
            evscSetSigned(tables.Change_Requests, cr, { 'Review Status': EVSC_CR_STATUS.WITHDRAWN }, 'system:withdrawn');
            tables.Change_Requests.update(cr, { 'Updated At': evscIso() });
            tables.Teams.update(found.team, { 'Pending Change Request ID': '', 'Version': (Number(found.team['Version']) || 0) + 1, 'Updated At': evscIso() });
            evscAudit(tables, { actor: email, entityType: 'Change Request', entityId: evscStr(cr['Change Request ID']), type: 'revision.withdrawn' });
        }
        var config = evscCompetitionConfig(evscStr(found.team['Competition ID']), tables);
        return { team: evscTeamView(tables, found.team, config) };
    });
}

// Withdrawing consent is immediate; granting it still needs EV Society's publication approval
function evscActionSetPublication(params, ctx) {
    var email = evscActorEmail(ctx);
    return evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
        var value = evscYesNo(params.consent === true);
        var before = evscStr(found.team['Publication Consent']);
        tables.Teams.update(found.team, { 'Publication Consent': value, 'Updated At': evscIso(), 'Version': (Number(found.team['Version']) || 0) + 1 });
        evscRefreshPublicationStatus(tables, found.team);
        evscInvalidatePublic(evscStr(found.team['Competition ID']));
        evscAudit(tables, { actor: email, entityType: 'Team', entityId: evscStr(found.team['Team ID']), type: 'team.publication_consent', before: before, after: value });
        var config = evscCompetitionConfig(evscStr(found.team['Competition ID']), tables);
        return { team: evscTeamView(tables, found.team, config) };
    });
}

function evscActionRequestDeletion(params, ctx) {
    var email = evscActorEmail(ctx);
    return evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
        var reason = evscMultiline(params.reason, 1000);
        tables.Teams.update(found.team, { 'Deletion Requested': 'Yes', 'Publication Consent': 'No', 'Updated At': evscIso(), 'Version': (Number(found.team['Version']) || 0) + 1 });
        evscRefreshPublicationStatus(tables, found.team);
        evscInvalidatePublic(evscStr(found.team['Competition ID']));
        evscAudit(tables, { actor: email, entityType: 'Team', entityId: evscStr(found.team['Team ID']), type: 'team.deletion_requested', details: reason });
        evscSendMail(evscProp('EVSC_ADMIN_NOTIFY_EMAIL', 'evsociety.org@gmail.com'), 'Team data deletion requested: ' + evscStr(found.team['Team ID']),
            'The team leader of ' + evscStr(found.team['Team Name'] || found.team['Team ID']) + ' (' + evscStr(found.team['Team ID']) + ') asked for the team\'s data to be deleted.\n\n' +
            'The profile has been withdrawn from the website. To delete the data, select the team row in the Teams tab and use EV Society Competitions > Delete selected team permanently.\n\n' +
            (reason ? 'Reason given: ' + reason + '\n' : ''));
        var config = evscCompetitionConfig(evscStr(found.team['Competition ID']), tables);
        return { team: evscTeamView(tables, found.team, config) };
    });
}

/* ───────────────────────── Uploads ───────────────────────── */

function evscUploadFolder(teamId) {
    var rootId = evscProp('EVSC_UPLOAD_FOLDER_ID', '');
    if (!rootId) throw evscError('SETUP_REQUIRED', 'Run evsCompetitionSetup to create the upload folder.');
    var root = DriveApp.getFolderById(rootId);
    var existing = root.getFoldersByName(teamId);
    return existing.hasNext() ? existing.next() : root.createFolder(teamId);
}

function evscSniffMime(bytes) {
    var b = function (i) { return (bytes[i] + 256) % 256; };
    if (bytes.length >= 4 && b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return 'application/pdf';
    if (bytes.length >= 3 && b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return 'image/jpeg';
    if (bytes.length >= 8 && b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4E && b(3) === 0x47) return 'image/png';
    if (bytes.length >= 12 && b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50) return 'image/webp';
    return '';
}

function evscActionUpload(params, ctx) {
    var email = evscActorEmail(ctx);
    var kind = evscText(params.kind, 40);
    var spec = EVSC_FILE_KINDS[kind];
    if (!spec) throw evscError('VALIDATION', 'Unsupported file type.');
    var bytes = Utilities.base64Decode(evscStr(params.base64));
    var mime = evscSniffMime(bytes);
    if (spec.mimes.indexOf(mime) === -1) throw evscError('VALIDATION', kind === 'resume' ? 'Upload the resume as a PDF file.' : 'Upload a JPG, PNG or WebP image.');
    if (bytes.length > EVSC_LIMITS.uploadBytes[spec.max]) throw evscError('VALIDATION', 'This file is too large.');
    if (bytes.length < 64) throw evscError('VALIDATION', 'This file appears to be empty.');
    if (ctx.ip) evscRateLimit('upload-ip|' + ctx.ip, 120, 3600);
    evscRateLimit('upload-email|' + email, 120, 3600);
    return evscWithLock(function () {
        var tables = evscTables(['Teams', 'Members', 'Files', 'Audit_Log']);
        var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
        if (evscEditMode(found.team).mode === 'locked') throw evscError('LOCKED', 'This team can no longer be edited.');
        var teamId = evscStr(found.team['Team ID']);
        var fileId = evscNewId('FIL', 12);
        var ext = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
        var name = evscText(params.originalName, EVSC_LIMITS.fileName).replace(/[\\\/:*?"<>|]/g, '_') || (kind + '.' + ext);
        var blob = Utilities.newBlob(bytes, mime, kind + '-' + fileId + '.' + ext);
        var driveFile = evscUploadFolder(teamId).createFile(blob);
        driveFile.setDescription('EV Society competition upload ' + fileId + ' for team ' + teamId + ' (' + kind + '). Private.');
        tables.Files.insert({
            'File ID': fileId,
            'Team ID': teamId,
            'Owner ID': '',
            'Kind': kind,
            'Drive File ID': driveFile.getId(),
            'MIME Type': mime,
            'Size (bytes)': bytes.length,
            'Original Name': name,
            'Status': 'Active',
            'Uploaded By': email,
            'Uploaded At': evscIso(),
        });
        evscAudit(tables, { actor: email, entityType: 'File', entityId: fileId, type: 'file.uploaded', details: kind + ' for ' + teamId });
        return { file: { fileId: fileId, kind: kind, name: name, mime: mime, size: bytes.length } };
    });
}

// Image previews for the signed-in team leader in the editor (never resumes)
function evscActionPrivateFile(params, ctx) {
    var email = evscActorEmail(ctx);
    var tables = evscTables(['Teams', 'Members', 'Files']);
    var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
    var file = tables.Files.byId(evscText(params.fileId, 40));
    if (!file || evscStr(file['Team ID']) !== evscStr(found.team['Team ID']) || evscStr(file['Status']) !== 'Active') throw evscError('NOT_FOUND', 'File not found.');
    var spec = EVSC_FILE_KINDS[evscStr(file['Kind'])];
    if (!spec || !spec.publicImage) throw evscError('NOT_FOUND', 'File not found.');
    return evscFilePayload(file);
}

function evscFilePayload(file) {
    var blob = DriveApp.getFileById(evscStr(file['Drive File ID'])).getBlob();
    return { mime: evscStr(file['MIME Type']), base64: Utilities.base64Encode(blob.getBytes()) };
}

/* ───────────────────────── Member consent ───────────────────────── */

function evscSiteUrl() {
    return evscProp('EVSC_SITE_URL', 'https://www.evsociety.org').replace(/\/+$/, '');
}

function evscCompetitionPath(competitionId) {
    return '/programs/' + competitionId;
}

function evscIssueConsentToken(tables, member) {
    var token = evscRandomHex(48);
    tables.Members.update(member, {
        'Consent Token Hash': evscSha256('consent|' + token),
        'Consent Token Expires': evscIso(new Date(Date.now() + 30 * 24 * 3600 * 1000)),
    });
    return token;
}

function evscSendConsentRequest(tables, team, member, config) {
    var email = evscNormalizeEmail(member['Email']);
    if (!evscIsEmail(email)) return false;
    var token = evscIssueConsentToken(tables, member);
    var leader = evscLeaderOf(tables, team);
    var link = evscSiteUrl() + evscCompetitionPath(evscStr(team['Competition ID'])) + '/consent/' + token;
    var competitionName = config && config.name ? config.name : 'an EV Society competition';
    var sent = evscSendMail(email, 'Choose what EV Society shows about you on ' + (evscStr(team['Team Name']) || 'your team') + '\'s profile',
        (leader ? evscStr(leader['Full Name']) : 'Your team leader') + ' added you as a member of the team "' + evscStr(team['Team Name']) + '" for the ' + competitionName + ' (' + evscStr(team['Year']) + ') on EV Society.\n\n' +
        'If EV Society approves the team\'s profile, your name may appear on it. Your photograph, LinkedIn profile, email address and phone number will only be shown if you agree. Your resume is never published.\n\n' +
        'Review and choose what is shown (link valid for 30 days):\n' + link + '\n\n' +
        'You can change or withdraw your choices at any time using the same link. If you do not recognise this team, you can ignore this email.\n\nEV Society');
    if (sent) {
        tables.Members.update(member, { 'Consent Status': 'Requested', 'Consent Updated At': evscIso() });
    }
    return sent;
}

function evscSendPendingConsentRequests(tables, team, config) {
    var status = evscTeamStatus(team);
    if ([EVSC_TEAM_STATUS.PENDING, EVSC_TEAM_STATUS.CHANGES, EVSC_TEAM_STATUS.APPROVED].indexOf(status) === -1) return 0;
    var count = 0;
    evscTeamMembers(tables, evscStr(team['Team ID'])).forEach(function (m) {
        if (evscStr(m['Role']) === 'Leader') return;
        if (evscStr(m['Consent Status']) && evscStr(m['Consent Status']) !== 'Not requested') return;
        if (!evscStr(m['Email'])) return;
        if (evscSendConsentRequest(tables, team, m, config)) count += 1;
    });
    return count;
}

function evscActionResendConsent(params, ctx) {
    var email = evscActorEmail(ctx);
    return evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var found = evscRequireLeader(tables, evscText(params.teamId, 40), email, evscText(params.competitionId, 80));
        var member = tables.Members.byId(evscText(params.memberId, 40));
        if (!member || evscStr(member['Team ID']) !== evscStr(found.team['Team ID']) || evscStr(member['Role']) === 'Leader') throw evscError('NOT_FOUND', 'Member not found.');
        if (!evscStr(member['Email'])) throw evscError('VALIDATION', 'Add an email address for this member first.');
        var status = evscTeamStatus(found.team);
        if (status === EVSC_TEAM_STATUS.DRAFT || !status) throw evscError('VALIDATION', 'Consent requests are sent once the registration is submitted for review.');
        evscRateLimit('consent-resend|' + evscStr(member['Member ID']), 1, 600);
        var config = evscCompetitionConfig(evscStr(found.team['Competition ID']), tables);
        if (!evscSendConsentRequest(tables, found.team, member, config)) throw evscError('UNAVAILABLE', 'We could not send the email right now. Please try again later.');
        evscAudit(tables, { actor: email, entityType: 'Member', entityId: evscStr(member['Member ID']), type: 'consent.requested' });
        return { team: evscTeamView(tables, found.team, config) };
    });
}

function evscMemberByToken(tables, token) {
    token = evscText(token, 120);
    if (!/^[a-f0-9]{48}$/.test(token)) return null;
    var hash = evscSha256('consent|' + token);
    var member = tables.Members.find(function (m) { return evscSafeEqual(evscStr(m['Consent Token Hash']), hash); });
    if (!member) return null;
    if (!evscStr(member['Consent Token Expires']) || new Date(evscStr(member['Consent Token Expires'])).getTime() < Date.now()) return null;
    return member;
}

function evscMask(value, kind) {
    var s = evscStr(value);
    if (!s) return '';
    if (kind === 'email') {
        var parts = s.split('@');
        return parts[0].slice(0, 2) + '•••@' + (parts[1] || '');
    }
    var digits = s.replace(/[^0-9]/g, '');
    return '••••••' + digits.slice(-4);
}

function evscActionGetConsent(params, ctx) {
    var tables = evscTables(['Competitions', 'Teams', 'Members', 'Files']);
    if (ctx.ip) evscRateLimit('consent-view-ip|' + ctx.ip, 60, 3600);
    var member = evscMemberByToken(tables, params.token);
    if (!member) throw evscError('NOT_FOUND', 'This link has expired or is no longer valid.');
    var team = tables.Teams.byId(member['Team ID']);
    if (!team) throw evscError('NOT_FOUND', 'This link has expired or is no longer valid.');
    var config = evscCompetitionConfig(evscStr(team['Competition ID']), tables);
    var perms = evscParsePermissions(member['Publication Permissions']);
    return {
        competitionId: evscStr(team['Competition ID']),
        competitionName: config ? config.name : '',
        teamName: evscStr(team['Team Name']),
        year: Number(team['Year']) || null,
        memberName: evscStr(member['Full Name']),
        available: {
            photo: !!evscStr(member['Photo File ID']),
            linkedin: !!evscStr(member['LinkedIn']),
            email: !!evscStr(member['Email']),
            phone: !!evscStr(member['Phone']),
        },
        preview: {
            linkedin: evscStr(member['LinkedIn']),
            email: evscMask(member['Email'], 'email'),
            phone: evscMask(member['Phone'], 'phone'),
        },
        permissions: perms,
        under18: evscYes(member['Under 18']),
        consentStatus: evscStr(member['Consent Status']) || 'Requested',
    };
}

function evscActionSaveConsent(params, ctx) {
    if (ctx.ip) evscRateLimit('consent-save-ip|' + ctx.ip, 30, 3600);
    return evscWithLock(function () {
        var tables = evscTables(['Teams', 'Members', 'Audit_Log']);
        var member = evscMemberByToken(tables, params.token);
        if (!member) throw evscError('NOT_FOUND', 'This link has expired or is no longer valid.');
        var raw = params.permissions || {};
        var perms = { hidden: raw.hidden === true, photo: false, linkedin: false, email: false, phone: false };
        if (!perms.hidden) {
            perms.photo = raw.photo === true && !!evscStr(member['Photo File ID']);
            perms.linkedin = raw.linkedin === true && !!evscStr(member['LinkedIn']);
            perms.email = raw.email === true && !!evscStr(member['Email']);
            perms.phone = raw.phone === true && !!evscStr(member['Phone']);
        }
        var before = evscStr(member['Publication Permissions']);
        var granted = EVSC_PERMISSION_KEYS.some(function (k) { return perms[k]; });
        var changes = {
            'Publication Permissions': evscFormatPermissions(perms),
            'Consent Status': perms.hidden ? 'Declined (hidden)' : granted ? 'Given' : 'Declined',
            'Consent Updated At': evscIso(),
            'Verification Status': 'Email verified',
        };
        // A member can say they are under 18; only a team leader edit or an admin clears it
        if (params.under18 === true) changes['Under 18'] = 'Yes';
        tables.Members.update(member, changes);
        var team = tables.Teams.byId(member['Team ID']);
        if (team) evscInvalidatePublic(evscStr(team['Competition ID']));
        evscAudit(tables, { actor: 'member:' + evscStr(member['Member ID']), entityType: 'Member', entityId: evscStr(member['Member ID']), type: 'consent.updated', before: before, after: changes['Publication Permissions'] });
        return { saved: true, consentStatus: changes['Consent Status'], competitionId: team ? evscStr(team['Competition ID']) : '' };
    });
}

/* ───────────────────────── Publication status ───────────────────────── */

function evscIsPublishable(team) {
    return evscSignedIs(team, 'Teams', 'Registration Status', EVSC_TEAM_STATUS.APPROVED) &&
        evscSignedIs(team, 'Teams', 'Profile Approved', 'Yes') &&
        evscSignedIs(team, 'Teams', 'Publication Approved', 'Yes') &&
        evscYes(team['Publication Consent']) &&
        !evscYes(team['Deletion Requested']);
}

// Whether the profile is actually on the website, in words an administrator and the team
// leader can act on. A profile approved for publication still waits for participation to be
// verified unless the competition shows registered teams.
function evscPublicationState(tables, team) {
    if (!evscIsPublishable(team)) return { visible: false, label: null };
    var config = evscCompetitionConfig(evscStr(team['Competition ID']), tables);
    if (!config || !config.publicVisible) return { visible: false, label: 'Ready to publish (directory hidden)' };
    var categories = evscTeamCategories(tables, evscStr(team['Team ID'])).filter(function (c) {
        return evscSignedIs(c, 'Team_Categories', 'Registration Status', 'Registered') && config.categories.indexOf(evscStr(c['Category ID'])) !== -1;
    });
    var verified = categories.some(function (c) { return evscSignedIs(c, 'Team_Categories', 'Participation Verified', 'Yes'); });
    if (categories.length && (verified || config.showRegisteredTeams)) return { visible: true, label: 'Published' };
    return { visible: false, label: 'Ready to publish (participation not yet verified)' };
}

function evscRefreshPublicationStatus(tables, team) {
    var state = evscPublicationState(tables, team);
    var label = state.label;
    if (!label) {
        if (evscStr(team['First Published At'])) label = evscYes(team['Deletion Requested']) ? 'Withdrawn (deletion requested)' : !evscYes(team['Publication Consent']) ? 'Withdrawn by team' : 'Unpublished';
        else label = 'Not published';
    }
    var changes = {};
    if (evscStr(team['Profile Publication Status']) !== label) changes['Profile Publication Status'] = label;
    if (state.visible && !evscStr(team['First Published At'])) changes['First Published At'] = evscIso();
    if (Object.keys(changes).length) tables.Teams.update(team, changes);
}

/* ───────────────────────── Public snapshot ───────────────────────── */

function evscBuildPublicSnapshot(competitionId) {
    var tables = evscTables(['Competitions', 'Teams', 'Team_Categories', 'Members', 'Mentors', 'Files', 'Awards']);
    var config = evscCompetitionConfig(competitionId, tables);
    var snapshot = { competitionId: competitionId, generatedAt: evscIso(), config: null, teams: [], stats: {}, awards: [], publicFileIds: [] };
    if (!config) return snapshot;
    snapshot.config = {
        availableYears: config.availableYears,
        registrationOpen: config.registrationOpen,
        registrationYears: config.registrationYears,
        defaultRegistrationYear: config.defaultRegistrationYear,
        publicVisible: config.publicVisible,
        showRegisteredTeams: config.showRegisteredTeams,
        maxMentors: config.maxMentors,
        maxMembers: config.maxMembers,
    };
    var fileIds = {};
    var activeFile = function (fileId, teamId, kinds) {
        if (!fileId) return null;
        var file = tables.Files.byId(fileId);
        if (!file || evscStr(file['Status']) !== 'Active' || evscStr(file['Team ID']) !== teamId || kinds.indexOf(evscStr(file['Kind'])) === -1) return null;
        fileIds[fileId] = true;
        return fileId;
    };
    var stat = function (year, categoryId) {
        var y = snapshot.stats[year] || (snapshot.stats[year] = { approvedRegistrations: 0, categories: {} });
        if (!categoryId) return y;
        return y.categories[categoryId] || (y.categories[categoryId] = { approvedRegistrations: 0, participants: 0, winners: 0 });
    };

    tables.Teams.filter(function (t) { return evscStr(t['Competition ID']) === competitionId; }).forEach(function (team) {
        var teamId = evscStr(team['Team ID']);
        var year = Number(team['Year']);
        var categories = evscTeamCategories(tables, teamId).map(function (c) {
            var participation = evscSignedIs(c, 'Team_Categories', 'Participation Verified', 'Yes');
            var winner = participation && evscSignedIs(c, 'Team_Categories', 'Winner Verified', 'Yes');
            return {
                categoryId: evscStr(c['Category ID']),
                active: evscSignedIs(c, 'Team_Categories', 'Registration Status', 'Registered'),
                participationVerified: participation,
                winnerVerified: winner,
                achievement: winner ? (evscSignedValue(c, 'Team_Categories', 'Achievement') || '') : '',
            };
        }).filter(function (c) { return c.active && config.categories.indexOf(c.categoryId) !== -1; });

        if (!evscSignedIs(team, 'Teams', 'Registration Status', EVSC_TEAM_STATUS.APPROVED)) return;
        stat(year).approvedRegistrations += 1;
        categories.forEach(function (c) { stat(year, c.categoryId).approvedRegistrations += 1; });
        if (!evscIsPublishable(team)) return;
        var visibleCategories = categories.filter(function (c) { return config.showRegisteredTeams || c.participationVerified; });
        if (!visibleCategories.length) return;
        visibleCategories.forEach(function (c) {
            if (c.participationVerified) stat(year, c.categoryId).participants += 1;
            if (c.winnerVerified) stat(year, c.categoryId).winners += 1;
        });

        var leaderId = evscStr(team['Leader Member ID']);
        var people = [];
        evscTeamMembers(tables, teamId).forEach(function (m) {
            var isLeader = evscStr(m['Member ID']) === leaderId;
            if (evscYes(m['Under 18']) && !evscSignedIs(m, 'Members', 'Guardian Consent Verified', 'Yes')) return;
            var perms = evscParsePermissions(m['Publication Permissions']);
            if (perms.hidden) return;
            // Other members' details need their own consent; the leader consents for themselves
            var consented = isLeader || evscStr(m['Consent Status']) === 'Given';
            var linkedin = evscNormalizeLinkedIn(m['LinkedIn']);
            var email = evscNormalizeEmail(m['Email']);
            var phone = evscNormalizePhone(m['Phone']);
            people.push({
                role: isLeader ? 'leader' : 'member',
                name: evscText(m['Full Name'], EVSC_LIMITS.name),
                photoFileId: consented && perms.photo ? activeFile(evscStr(m['Photo File ID']), teamId, ['member-photo']) : null,
                linkedin: consented && perms.linkedin && evscIsLinkedIn(linkedin) ? linkedin : null,
                email: consented && perms.email && evscIsEmail(email) ? email : null,
                phone: consented && perms.phone && evscIsPhone(phone) ? phone : null,
            });
        });
        people.sort(function (a, b) { return a.role === b.role ? 0 : a.role === 'leader' ? -1 : 1; });
        var mentors = evscTeamMentors(tables, teamId).filter(function (m) { return evscYes(m['Listing Consent']) && evscText(m['Name']); }).slice(0, config.maxMentors).map(function (m) {
            var linkedin = evscNormalizeLinkedIn(m['LinkedIn']);
            return {
                name: evscText(m['Name'], EVSC_LIMITS.name),
                institution: evscText(m['Institution'], EVSC_LIMITS.institution),
                linkedin: evscIsLinkedIn(linkedin) ? linkedin : null,
                photoFileId: activeFile(evscStr(m['Photo File ID']), teamId, ['mentor-photo']),
            };
        });
        snapshot.teams.push({
            slug: evscStr(team['Slug']),
            year: year,
            name: evscText(team['Team Name'], EVSC_LIMITS.teamName),
            college: evscText(team['College'], EVSC_LIMITS.college),
            entryType: evscStr(team['Entry Type']) || 'Team',
            revision: Number(team['Revision Number']) || 1,
            teamLogoFileId: activeFile(evscStr(team['Team Logo File ID']), teamId, ['team-logo']),
            institutionLogoFileId: activeFile(evscStr(team['Institution Logo File ID']), teamId, ['institution-logo']),
            teamPhotoFileId: evscYes(team['Team Photo Consent']) ? activeFile(evscStr(team['Team Photo File ID']), teamId, ['team-photo']) : null,
            categories: visibleCategories.map(function (c) {
                return { categoryId: c.categoryId, participationVerified: c.participationVerified, winnerVerified: c.winnerVerified, achievement: c.achievement };
            }),
            people: people,
            mentors: mentors,
        });
    });
    if (!config.publicVisible) {
        snapshot.teams = [];
        fileIds = {};
    }

    tables.Awards.filter(function (a) { return evscStr(a['Competition ID']) === competitionId; }).forEach(function (a) {
        var tab = 'Awards';
        var published = evscSignedIs(a, tab, 'Publication Status', 'Published');
        var pdf = evscSignedValue(a, tab, 'PDF Reference');
        var thumb = evscSignedValue(a, tab, 'Thumbnail Reference');
        snapshot.awards.push({
            awardId: evscStr(a['Award ID']),
            year: Number(a['Year']) || null,
            categoryId: evscStr(a['Category']),
            title: evscSignedValue(a, tab, 'Award Title') || '',
            status: evscSignedValue(a, tab, 'Award Status') || 'Proposed',
            pdfReference: published && pdf && evscIsDocRef(pdf) ? pdf : null,
            thumbnailReference: published && thumb && evscIsDocRef(thumb) ? thumb : null,
        });
    });
    snapshot.teams.sort(function (a, b) { return b.year - a.year || a.name.localeCompare(b.name); });
    snapshot.publicFileIds = Object.keys(fileIds);
    return snapshot;
}

function evscActionPublicSnapshot(params) {
    var competitionId = evscText(params.competitionId, 80);
    var key = 'snap:' + competitionId + ':' + evscGeneration(competitionId);
    var cached = evscCacheGetLarge(key);
    if (cached) return JSON.parse(cached);
    var snapshot = evscBuildPublicSnapshot(competitionId);
    evscCachePutLarge(key, JSON.stringify(snapshot), 300);
    return snapshot;
}

function evscActionConfig(params) {
    var competitionId = evscText(params.competitionId, 80);
    var config = evscCompetitionConfig(competitionId);
    return { config: config };
}

// Public images only: the file must be referenced by the current public snapshot
function evscActionPublicMedia(params) {
    var fileId = evscText(params.fileId, 40);
    var competitionId = evscText(params.competitionId, 80);
    var snapshot = evscActionPublicSnapshot({ competitionId: competitionId });
    if (snapshot.publicFileIds.indexOf(fileId) === -1) throw evscError('NOT_FOUND', 'File not found.');
    var file = evscTable('Files').byId(fileId);
    if (!file) throw evscError('NOT_FOUND', 'File not found.');
    var spec = EVSC_FILE_KINDS[evscStr(file['Kind'])];
    if (!spec || !spec.publicImage) throw evscError('NOT_FOUND', 'File not found.');
    return evscFilePayload(file);
}

/* ───────────────────────── Review trigger ───────────────────────── */

function evscReviewers() {
    var configured = evscParseList(evscProp('EVSC_REVIEWERS', '')).map(evscNormalizeEmail);
    var owner = '';
    try {
        owner = evscNormalizeEmail(Session.getEffectiveUser().getEmail());
    } catch (e) {
        owner = '';
    }
    if (owner && configured.indexOf(owner) === -1) configured.push(owner);
    return configured;
}

function evscEditorEmail(e) {
    var email = '';
    try {
        if (e && e.user && e.user.getEmail) email = e.user.getEmail();
    } catch (err) {
        email = '';
    }
    if (!email) {
        try {
            email = Session.getActiveUser().getEmail();
        } catch (err2) {
            email = '';
        }
    }
    return evscNormalizeEmail(email);
}

function evscValidateReviewValue(tables, tab, row, field, value, previous) {
    var spec = EVSC_REVIEW_FIELDS[tab][field];
    if (spec.values && spec.values.indexOf(value) === -1) {
        return 'Choose one of: ' + spec.values.join(', ') + '.';
    }
    if (spec.type === 'years' && evscParseYears(value) === null) return 'Enter years as a comma-separated list, for example 2026, 2027.';
    if (spec.type === 'year' && !/^\d{4}$/.test(value)) return 'Enter a four-digit year.';
    if (spec.type === 'json' && value && evscJsonParse(value, null) === null) return 'Enter valid JSON, for example {"maxMentors":4}.';
    if (spec.type === 'docref' && !evscIsDocRef(value)) return 'Enter a site path starting with / or an https:// link.';
    if (spec.type === 'text' && value.length > (spec.max || 200)) return 'Keep this under ' + (spec.max || 200) + ' characters.';

    if (tab === 'Teams') {
        if (field === 'Registration Status') {
            if (value === EVSC_TEAM_STATUS.APPROVED && (previous === EVSC_TEAM_STATUS.DRAFT || !previous)) return 'This registration is still a draft. It can be approved after the team leader submits it.';
        }
        if (field === 'Publication Approved' && value === 'Yes' && !evscSignedIs(row, 'Teams', 'Profile Approved', 'Yes')) return 'Approve the profile (Profile Approved = Yes) before approving publication.';
    }
    if (tab === 'Team_Categories') {
        if (field === 'Winner Verified' && value === 'Yes' && !evscSignedIs(row, 'Team_Categories', 'Participation Verified', 'Yes')) return 'Verify participation for this category before verifying a winner.';
        if (field === 'Participation Verified' && value === 'No' && evscSignedIs(row, 'Team_Categories', 'Winner Verified', 'Yes')) return 'Remove the winner verification first.';
    }
    if (tab === 'Competitions') {
        if (field === 'Default Registration Year') {
            var years = evscParseYears(evscSignedValue(row, 'Competitions', 'Registration Years')) || [];
            if (years.indexOf(Number(value)) === -1) return 'The default year must be one of the Registration Years.';
        }
    }
    if (tab === 'Change_Requests' && field === 'Review Status') {
        if (previous !== EVSC_CR_STATUS.PENDING) return 'Only change requests with status "Pending Review" can be decided.';
    }
    return null;
}

function evscRestoreCell(table, row, field, reason) {
    var meta = evscMeta(row);
    var restored = meta[field] ? evscStr(meta[field].v) : '';
    var col = table.index[field];
    var range = table.sheet.getRange(row._row, col + 1);
    range.setValue(evscCell(restored));
    range.setNote('Change not applied (' + evscIso().slice(0, 16).replace('T', ' ') + ' UTC): ' + reason);
    row[field] = restored;
}

// Installable on-edit trigger (installed by evsCompetitionSetup). Validates and signs review
// decisions, applies approved revisions, notifies team leaders and refreshes the website.
function evsCompetitionOnEdit(e) {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    var tab = sheet.getName();
    var reviewFields = EVSC_REVIEW_FIELDS[tab];
    if (!reviewFields) return;
    var startRow = e.range.getRow();
    var startCol = e.range.getColumn();
    var numRows = e.range.getNumRows();
    var numCols = e.range.getNumColumns();
    if (startRow === 1) {
        e.range.setNote('Header names are used by the website. Renaming them can stop the competition platform from working.');
        if (numRows === 1) return;
    }
    var reviewer = evscEditorEmail(e);
    var allowed = reviewer && evscReviewers().indexOf(reviewer) !== -1;
    evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var table = tables[tab];
        var touched = {};
        for (var r = Math.max(startRow, 2); r < startRow + numRows; r++) {
            var row = table.rows.filter(function (x) { return x._row === r; })[0];
            if (!row) continue;
            for (var c = startCol; c < startCol + numCols; c++) {
                var field = table.headers[c - 1];
                if (!reviewFields[field]) continue;
                var value = evscText(row[field], field === 'Configuration' ? 2000 : 300);
                var previous = evscSignedPrevious(row, tab, field);
                if (previous !== null && previous === value) continue;
                var entityId = evscStr(row[EVSC_ID_COLUMN[tab]]);
                if (!allowed) {
                    evscRestoreCell(table, row, field, reviewer ? reviewer + ' is not listed as a reviewer.' : 'the reviewer could not be identified. Review decisions must be made while signed in as an authorised reviewer account.');
                    evscAudit(tables, { actor: reviewer || 'unknown', entityType: tab, entityId: entityId, type: 'review.rejected', outcome: 'rejected', after: { field: field, value: value } });
                    continue;
                }
                var problem = evscValidateReviewValue(tables, tab, row, field, value, previous);
                if (problem) {
                    evscRestoreCell(table, row, field, problem);
                    evscAudit(tables, { actor: reviewer, entityType: tab, entityId: entityId, type: 'review.invalid', outcome: 'rejected', after: { field: field, value: value }, details: problem });
                    continue;
                }
                var changes = {};
                changes[field] = value;
                evscSetSigned(table, row, changes, reviewer);
                table.sheet.getRange(row._row, c).setNote('');
                evscAudit(tables, { actor: reviewer, entityType: tab, entityId: entityId, type: 'review.decision', before: { field: field, value: previous }, after: { field: field, value: value } });
                evscAfterReview(tables, tab, row, field, value, previous, reviewer);
                touched[evscCompetitionOfRow(tables, tab, row)] = true;
            }
        }
        Object.keys(touched).forEach(function (competitionId) {
            if (!competitionId) return;
            evscInvalidatePublic(competitionId);
            evscNotifyWebsite(competitionId);
        });
    });
}

function evscCompetitionOfRow(tables, tab, row) {
    if (tab === 'Competitions' || tab === 'Teams' || tab === 'Awards') return evscStr(row['Competition ID']);
    var team = tables.Teams.byId(row['Team ID']);
    return team ? evscStr(team['Competition ID']) : '';
}

function evscAfterReview(tables, tab, row, field, value, previous, reviewer) {
    if (tab === 'Teams') {
        if (field === 'Registration Status') {
            if (value === EVSC_TEAM_STATUS.APPROVED && !(Number(row['Revision Number']) > 0)) tables.Teams.update(row, { 'Revision Number': 1 });
            if (value !== previous) evscNotifyLeaderOfDecision(tables, row, value);
            if (value !== EVSC_TEAM_STATUS.DRAFT) {
                var config = evscCompetitionConfig(evscStr(row['Competition ID']), tables);
                evscSendPendingConsentRequests(tables, row, config);
            }
        }
        evscRefreshPublicationStatus(tables, row);
    }
    if (tab === 'Members' || tab === 'Team_Categories') {
        var team = tables.Teams.byId(row['Team ID']);
        if (team) evscRefreshPublicationStatus(tables, team);
    }
    if (tab === 'Competitions') {
        tables.Teams.filter(function (t) { return evscStr(t['Competition ID']) === evscStr(row['Competition ID']); })
            .forEach(function (t) { evscRefreshPublicationStatus(tables, t); });
    }
    if (tab === 'Change_Requests' && field === 'Review Status') {
        var crTeam = tables.Teams.byId(row['Team ID']);
        var now = evscIso();
        tables.Change_Requests.update(row, { 'Decision Timestamp': now, 'Reviewer': reviewer, 'Updated At': now });
        if (!crTeam) return;
        if (value === EVSC_CR_STATUS.APPROVED) {
            try {
                evscApplyChangeRequest(tables, crTeam, row, reviewer);
            } catch (err) {
                evscSetSigned(tables.Change_Requests, row, { 'Review Status': EVSC_CR_STATUS.PENDING }, 'system:apply-failed');
                tables.Change_Requests.sheet.getRange(row._row, tables.Change_Requests.index['Review Status'] + 1).setNote('Could not apply this change request: ' + (err && err.message ? err.message : err));
                evscAudit(tables, { actor: reviewer, entityType: 'Change Request', entityId: evscStr(row['Change Request ID']), type: 'revision.apply_failed', outcome: 'error', details: String(err && err.message ? err.message : err) });
                return;
            }
        }
        if (value === EVSC_CR_STATUS.REJECTED || value === EVSC_CR_STATUS.APPROVED) {
            tables.Teams.update(crTeam, { 'Pending Change Request ID': '', 'Version': (Number(crTeam['Version']) || 0) + 1 });
        }
        evscNotifyLeaderOfRevision(tables, crTeam, row, value);
    }
}

function evscApplyChangeRequest(tables, team, cr, reviewer) {
    var data = evscJsonParse(cr['Submitted Data'], null);
    if (!data) throw evscError('INTERNAL', 'Change request data is unreadable.');
    var config = evscCompetitionConfig(evscStr(team['Competition ID']), tables);
    var leaderRow = evscLeaderOf(tables, team);
    data.leader = data.leader || {};
    data.leader.memberId = leaderRow ? evscStr(leaderRow['Member ID']) : '';
    var before = evscLiveTeamData(tables, team);
    // Files referenced by the revision must still exist; anything missing is dropped
    var check = function (id) {
        var f = id ? tables.Files.byId(id) : null;
        return f && evscStr(f['Team ID']) === evscStr(team['Team ID']) && evscStr(f['Status']) === 'Active' ? id : '';
    };
    data.team.institutionLogoFileId = check(data.team.institutionLogoFileId);
    data.team.teamLogoFileId = check(data.team.teamLogoFileId);
    data.team.teamPhotoFileId = check(data.team.teamPhotoFileId);
    data.leader.photoFileId = check(data.leader.photoFileId);
    data.leader.resumeFileId = check(data.leader.resumeFileId);
    data.members.forEach(function (m) { m.photoFileId = check(m.photoFileId); m.resumeFileId = check(m.resumeFileId); });
    data.mentors.forEach(function (m) { m.photoFileId = check(m.photoFileId); });
    evscApplyTeamData(tables, team, data, reviewer, { allowYearCategory: false, config: config });
    tables.Teams.update(team, { 'Revision Number': (Number(team['Revision Number']) || 1) + 1, 'Updated At': evscIso() });
    evscSendPendingConsentRequests(tables, team, config);
    evscRefreshPublicationStatus(tables, team);
    evscAudit(tables, { actor: reviewer, entityType: 'Team', entityId: evscStr(team['Team ID']), type: 'revision.applied', before: { revision: before.team.name }, after: { revision: Number(team['Revision Number']), changeRequestId: evscStr(cr['Change Request ID']) } });
}

/* ───────────────────────── Email ───────────────────────── */

function evscSendMail(to, subject, body) {
    try {
        if (MailApp.getRemainingDailyQuota() < 1) {
            Logger.log('evsc mail quota exhausted; not sent: ' + subject);
            return false;
        }
        MailApp.sendEmail({ to: to, subject: subject, body: body, name: 'EV Society', replyTo: evscProp('EVSC_REPLY_TO', 'evsociety.org@gmail.com') });
        return true;
    } catch (err) {
        Logger.log('evsc mail failed: ' + err);
        return false;
    }
}

function evscManageUrl(team) {
    return evscSiteUrl() + evscCompetitionPath(evscStr(team['Competition ID'])) + '/manage';
}

function evscNotifyLeaderOfDecision(tables, team, status) {
    var leader = evscLeaderOf(tables, team);
    if (!leader) return;
    var name = evscStr(team['Team Name']) || evscStr(team['Team ID']);
    var comments = evscMultiline(team['Review Comments'], EVSC_LIMITS.comments);
    var bodies = {
        'Approved': 'Your team registration "' + name + '" (' + evscStr(team['Team ID']) + ') has been approved by EV Society.\n\nApproval of the registration does not by itself publish the profile or confirm competition participation or results. EV Society verifies those separately.',
        'Changes Requested': 'EV Society reviewed your team registration "' + name + '" (' + evscStr(team['Team ID']) + ') and asked for some changes.' + (comments ? '\n\nReviewer comments:\n' + comments : '') + '\n\nSign in to Manage Team Profile to update and resubmit it:',
        'Rejected': 'EV Society could not accept the team registration "' + name + '" (' + evscStr(team['Team ID']) + ').' + (comments ? '\n\nReviewer comments:\n' + comments : '') + '\n\nIf you have questions, reply to this email.',
    };
    if (!bodies[status]) return;
    evscSendMail(evscStr(leader['Email']), 'EV Society team registration ' + evscStr(team['Team ID']) + ': ' + status, bodies[status] + '\n\n' + evscManageUrl(team) + '\n\nEV Society');
}

function evscNotifyLeaderOfRevision(tables, team, cr, status) {
    var leader = evscLeaderOf(tables, team);
    if (!leader) return;
    var name = evscStr(team['Team Name']) || evscStr(team['Team ID']);
    var comments = evscMultiline(cr['Review Comments'], EVSC_LIMITS.comments);
    var text = {
        'Approved': 'The changes to the "' + name + '" team profile have been approved and are now on the website.',
        'Changes Requested': 'EV Society asked for some changes to your proposed update of the "' + name + '" profile.' + (comments ? '\n\nReviewer comments:\n' + comments : ''),
        'Rejected': 'EV Society did not accept the proposed update of the "' + name + '" profile. The previously approved profile stays as it is.' + (comments ? '\n\nReviewer comments:\n' + comments : ''),
    }[status];
    if (!text) return;
    evscSendMail(evscStr(leader['Email']), 'EV Society team profile update: ' + status, text + '\n\n' + evscManageUrl(team) + '\n\nEV Society');
}

/* ───────────────────────── Website refresh ───────────────────────── */

function evscNotifyWebsite(competitionId) {
    var urls = evscParseList(evscProp('EVSC_REVALIDATE_URLS', ''));
    var secret = evscProp('EVSC_API_SECRET', '');
    if (!urls.length || !secret) return 0;
    var body = JSON.stringify({ competitionId: competitionId, ts: Date.now() });
    var ts = String(Date.now());
    var sig = evscHmac(secret, ts + '.' + body);
    var ok = 0;
    urls.forEach(function (url) {
        try {
            var res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: body, headers: { 'x-evs-timestamp': ts, 'x-evs-signature': sig }, muteHttpExceptions: true });
            if (res.getResponseCode() < 300) ok += 1;
        } catch (err) {
            Logger.log('evsc revalidate failed for ' + url + ': ' + err);
        }
    });
    return ok;
}

/* ───────────────────────── Setup ───────────────────────── */

function evsCompetitionSetup() {
    var props = evscProps();
    var report = [];
    if (!props.getProperty('EVSC_APPROVAL_SECRET')) {
        props.setProperty('EVSC_APPROVAL_SECRET', evscRandomHex(64));
        report.push('Created approval signing secret.');
    }
    if (!props.getProperty('EVSC_OTP_PEPPER')) {
        props.setProperty('EVSC_OTP_PEPPER', evscRandomHex(32));
    }
    var apiSecret = props.getProperty('EVSC_API_SECRET');
    if (!apiSecret || apiSecret.length < 32) {
        report.push('ACTION NEEDED: set Script Property EVSC_API_SECRET (at least 32 characters) to the same value as COMPETITION_API_SECRET on the website.');
    }
    var ss = evscSpreadsheet();
    Object.keys(EVSC_SCHEMA).forEach(function (name) {
        report.push(evscEnsureTab(ss, name));
    });
    report.push(evscSeedRows());
    if (!props.getProperty('EVSC_UPLOAD_FOLDER_ID')) {
        var folder = DriveApp.createFolder('EV Society Competition Uploads (private)');
        folder.setDescription('Private uploads for the EV Society competition platform. Do not share this folder.');
        props.setProperty('EVSC_UPLOAD_FOLDER_ID', folder.getId());
        report.push('Created private Drive folder for uploads.');
    }
    report.push(evscEnsureTriggers(ss));
    var summary = report.filter(function (r) { return r; }).join('\n');
    Logger.log(summary);
    return summary;
}

function evscEnsureTab(ss, name) {
    var headers = EVSC_SCHEMA[name];
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        evscFormatTab(sheet, name, headers);
        return 'Created tab ' + name + '.';
    }
    // Never overwrite: only append missing columns to a tab that is recognisably ours
    var lastCol = Math.max(1, sheet.getLastColumn());
    var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return evscStr(h).trim(); });
    if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        evscFormatTab(sheet, name, headers);
        return 'Set up empty tab ' + name + '.';
    }
    if (existing[0] !== headers[0]) {
        throw evscError('SETUP_CONFLICT', 'A tab named "' + name + '" already exists and is not a competition platform tab. Rename it and run setup again. Nothing was changed.');
    }
    var missing = headers.filter(function (h) { return existing.indexOf(h) === -1; });
    if (missing.length) {
        sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
        evscFormatTab(sheet, name, existing.concat(missing));
        return 'Added columns to ' + name + ': ' + missing.join(', ');
    }
    evscFormatTab(sheet, name, existing);
    return '';
}

function evscFormatTab(sheet, name, headers) {
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0B1930').setFontColor('#FFFFFF');
    var maxRows = Math.max(sheet.getMaxRows(), 1000);
    // Plain-text format keeps phone numbers, IDs and timestamps exactly as written
    sheet.getRange(2, 1, maxRows - 1, headers.length).setNumberFormat('@');
    var review = EVSC_REVIEW_FIELDS[name] || {};
    Object.keys(review).forEach(function (field) {
        var col = headers.indexOf(field);
        if (col === -1 || !review[field].values) return;
        var rule = SpreadsheetApp.newDataValidation().requireValueInList(review[field].values.concat(review[field].system || []), true).setAllowInvalid(false).build();
        sheet.getRange(2, col + 1, maxRows - 1, 1).setDataValidation(rule);
    });
    var protectedCols = (EVSC_SYSTEM_COLUMNS[name] || []).concat(Object.keys(review));
    var me = Session.getEffectiveUser();
    var reviewers = evscReviewers();
    sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
        if (evscStr(p.getDescription()).indexOf('EVSC:') === 0) p.remove();
    });
    protectedCols.forEach(function (field) {
        var col = headers.indexOf(field);
        if (col === -1) return;
        var protection = sheet.getRange(1, col + 1, maxRows, 1).protect().setDescription('EVSC: ' + field + ' is managed by the competition platform');
        protection.addEditor(me);
        protection.removeEditors(protection.getEditors().filter(function (u) { return u.getEmail() !== me.getEmail(); }));
        if (protection.canDomainEdit()) protection.setDomainEdit(false);
        // Reviewers may edit decision columns; system columns stay with the script owner
        if (review[field]) reviewers.forEach(function (email) { if (email !== evscNormalizeEmail(me.getEmail())) protection.addEditor(email); });
    });
}

function evscSeedRows() {
    var tables = evscTables(['Competitions', 'Awards']);
    var added = [];
    EVSC_SEED_COMPETITIONS.forEach(function (seed) {
        if (tables.Competitions.byId(seed['Competition ID'])) return;
        var row = tables.Competitions.insert({ 'Competition ID': seed['Competition ID'], 'Name': seed['Name'], 'Slug': seed['Slug'], 'Organiser': seed['Organiser'], 'Updated At': evscIso() });
        var signed = {};
        Object.keys(EVSC_REVIEW_FIELDS.Competitions).forEach(function (f) { signed[f] = seed[f]; });
        evscSetSigned(tables.Competitions, row, signed, 'system:seed');
        added.push(seed['Competition ID']);
    });
    EVSC_SEED_AWARDS.forEach(function (seed) {
        if (tables.Awards.byId(seed['Award ID'])) return;
        var row = tables.Awards.insert({ 'Award ID': seed['Award ID'], 'Competition ID': seed['Competition ID'], 'Year': seed['Year'], 'Category': seed['Category'], 'Updated At': evscIso() });
        var signed = {};
        Object.keys(EVSC_REVIEW_FIELDS.Awards).forEach(function (f) { signed[f] = seed[f]; });
        evscSetSigned(tables.Awards, row, signed, 'system:seed');
        added.push(seed['Award ID']);
    });
    return added.length ? 'Seeded: ' + added.join(', ') : '';
}

function evscEnsureTriggers(ss) {
    var handlers = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
    var out = [];
    if (handlers.indexOf('evsCompetitionOnEdit') === -1) {
        ScriptApp.newTrigger('evsCompetitionOnEdit').forSpreadsheet(ss).onEdit().create();
        out.push('Installed the review trigger.');
    }
    if (handlers.indexOf('evsCompetitionOnOpen') === -1) {
        ScriptApp.newTrigger('evsCompetitionOnOpen').forSpreadsheet(ss).onOpen().create();
        out.push('Installed the menu trigger.');
    }
    return out.join(' ');
}

/* ───────────────────────── Menu & admin utilities ───────────────────────── */

function evsCompetitionOnOpen() {
    SpreadsheetApp.getUi().createMenu('EV Society Competitions')
        .addItem('Refresh website now', 'evsCompetitionRefreshWebsite')
        .addItem('Check setup', 'evsCompetitionCheckSetup')
        .addItem('Remove unused uploads (older than 7 days)', 'evsCompetitionCleanupUploads')
        .addSeparator()
        .addItem('Delete selected team permanently…', 'evsCompetitionDeleteSelectedTeam')
        .addToUi();
}

function evsCompetitionRefreshWebsite() {
    var ids = evscTable('Competitions').rows.map(function (r) { return evscStr(r['Competition ID']); });
    var refreshed = 0;
    ids.forEach(function (id) { evscInvalidatePublic(id); refreshed += evscNotifyWebsite(id); });
    SpreadsheetApp.getActive().toast(refreshed ? 'Website refresh requested.' : 'Cache cleared. Set EVSC_REVALIDATE_URLS to refresh the website immediately; otherwise it updates within a few minutes.', 'EV Society');
}

function evsCompetitionCheckSetup() {
    var problems = [];
    try {
        evscTables(EVSC_ALL_TABS);
    } catch (err) {
        problems.push(err.message);
    }
    var handlers = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
    if (handlers.indexOf('evsCompetitionOnEdit') === -1) problems.push('The review trigger is not installed. Run evsCompetitionSetup.');
    var secret = evscProp('EVSC_API_SECRET', '');
    if (!secret || secret.length < 32) problems.push('EVSC_API_SECRET is not set.');
    if (!evscProp('EVSC_UPLOAD_FOLDER_ID', '')) problems.push('The upload folder is not set up.');
    var message = problems.length ? problems.join('\n') : 'Competition platform ' + EVSC_VERSION + ' is set up correctly. Reviewers: ' + evscReviewers().join(', ');
    SpreadsheetApp.getUi().alert(message);
}

function evscReferencedFileIds(tables) {
    var refs = {};
    var add = function (v) { if (v) refs[evscStr(v)] = true; };
    tables.Teams.rows.forEach(function (t) { add(t['Institution Logo File ID']); add(t['Team Logo File ID']); add(t['Team Photo File ID']); });
    tables.Members.rows.forEach(function (m) { add(m['Photo File ID']); add(m['Resume File ID']); });
    tables.Mentors.rows.forEach(function (m) { add(m['Photo File ID']); });
    tables.Change_Requests.rows.forEach(function (cr) {
        if (EVSC_OPEN_CR.indexOf(evscStr(cr['Review Status'])) === -1) return;
        var data = evscJsonParse(cr['Submitted Data'], null);
        if (data) evscCollectFileIds(data).forEach(add);
    });
    return refs;
}

function evscCleanupUploads(olderThanDays) {
    return evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var refs = evscReferencedFileIds(tables);
        var cutoff = Date.now() - olderThanDays * 24 * 3600 * 1000;
        var removed = 0;
        tables.Files.rows.forEach(function (f) {
            if (evscStr(f['Status']) !== 'Active' || refs[evscStr(f['File ID'])]) return;
            if (new Date(evscStr(f['Uploaded At'])).getTime() > cutoff) return;
            try {
                DriveApp.getFileById(evscStr(f['Drive File ID'])).setTrashed(true);
            } catch (err) {
                Logger.log('evsc cleanup: ' + err);
            }
            tables.Files.update(f, { 'Status': 'Removed' });
            removed += 1;
        });
        evscAudit(tables, { actor: 'system', entityType: 'Files', entityId: '', type: 'files.cleanup', details: removed + ' unused upload(s) removed' });
        return removed;
    });
}

function evsCompetitionCleanupUploads() {
    var removed = evscCleanupUploads(7);
    SpreadsheetApp.getActive().toast(removed + ' unused upload(s) moved to Drive trash.', 'EV Society');
}

// Removes a team's rows and moves its Drive folder to the trash. The audit log keeps only the
// team ID and the fact of deletion, not the deleted personal data.
function evscDeleteTeamData(teamId, actor) {
    return evscWithLock(function () {
        var tables = evscTables(EVSC_ALL_TABS);
        var team = tables.Teams.byId(teamId);
        if (!team) throw evscError('NOT_FOUND', 'Team not found.');
        var competitionId = evscStr(team['Competition ID']);
        var byTeam = function (r) { return evscStr(r['Team ID']) === teamId; };
        tables.Files.filter(byTeam).forEach(function (f) {
            try {
                DriveApp.getFileById(evscStr(f['Drive File ID'])).setTrashed(true);
            } catch (err) {
                Logger.log('evsc delete: ' + err);
            }
        });
        ['Members', 'Mentors', 'Team_Categories', 'Change_Requests', 'Files'].forEach(function (name) {
            var rows = tables[name].filter(byTeam);
            if (rows.length) tables[name].remove(rows);
        });
        tables.Teams.remove([team]);
        evscInvalidatePublic(competitionId);
        evscAudit(tables, { actor: actor, entityType: 'Team', entityId: teamId, type: 'team.deleted', details: 'All team, member, mentor and file records deleted' });
        evscNotifyWebsite(competitionId);
        return true;
    });
}

function evsCompetitionDeleteSelectedTeam() {
    var ui = SpreadsheetApp.getUi();
    var sheet = SpreadsheetApp.getActiveSheet();
    if (sheet.getName() !== 'Teams') {
        ui.alert('Select a row in the Teams tab first.');
        return;
    }
    var row = sheet.getActiveRange().getRow();
    var table = evscTable('Teams');
    var team = table.rows.filter(function (r) { return r._row === row; })[0];
    if (!team) {
        ui.alert('Select a team row first.');
        return;
    }
    var actor = evscNormalizeEmail(Session.getActiveUser().getEmail());
    if (!actor || evscReviewers().indexOf(actor) === -1) {
        ui.alert('Only an authorised reviewer can delete team data.');
        return;
    }
    var answer = ui.alert('Delete team ' + evscStr(team['Team ID']) + ' (' + evscStr(team['Team Name']) + ')?',
        'This permanently removes the team, its members, mentors, change requests and uploaded files. It cannot be undone.', ui.ButtonSet.YES_NO);
    if (answer !== ui.Button.YES) return;
    evscDeleteTeamData(evscStr(team['Team ID']), actor);
    ui.alert('Team data deleted.');
}

/* ───────────────────────── Action registry ───────────────────────── */

var EVSC_ACTIONS = {
    'config.get': evscActionConfig,
    'public.snapshot': evscActionPublicSnapshot,
    'public.media': evscActionPublicMedia,
    'auth.requestCode': evscActionRequestCode,
    'auth.verifyCode': evscActionVerifyCode,
    'teams.list': evscActionListTeams,
    'teams.get': evscActionGetTeam,
    'teams.createDraft': evscActionCreateDraft,
    'teams.save': evscActionSaveTeam,
    'teams.discardChanges': evscActionDiscardChanges,
    'teams.setPublication': evscActionSetPublication,
    'teams.requestDeletion': evscActionRequestDeletion,
    'teams.resendConsent': evscActionResendConsent,
    'files.upload': evscActionUpload,
    'files.private': evscActionPrivateFile,
    'consent.get': evscActionGetConsent,
    'consent.save': evscActionSaveConsent,
};
