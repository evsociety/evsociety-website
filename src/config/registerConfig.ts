// Registration Configuration
// Configure the Google Apps Script Web App URL here

export const REGISTRATION_CONFIG = {
    // Google Apps Script Web App URL
    // Replace this with your deployed Apps Script URL after setup
    APPS_SCRIPT_URL: process.env.NEXT_PUBLIC_REGISTRATION_API_URL || '',

    // Fallback to localStorage if API fails
    USE_LOCALSTORAGE_FALLBACK: true,

    // Enable debug logging
    DEBUG: process.env.NODE_ENV === 'development',
};
