/**
 * Admin Configuration
 * Central configuration for admin features
 */

export const adminConfig = {
    // Admin email - only this email can access admin features
    ADMIN_EMAIL: 'evsociety.org@gmail.com',

    // Google Apps Script Admin API URL (deployed web app)
    APPS_SCRIPT_ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || '',

    // Google Sheets configuration
    SHEET_NAME: 'EVSociety Registrations',
    SHEET_TAB: 'Registrations',

    // Google OAuth Client ID for Sign-In
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

    // Session storage keys
    SESSION_KEYS: {
        ADMIN_EMAIL: 'evs_admin_email',
        ID_TOKEN: 'evs_admin_token',
        LOGIN_TIMESTAMP: 'evs_admin_login_ts',
    },

    // Session timeout (24 hours)
    SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000,
} as const;

export type AdminConfig = typeof adminConfig;
