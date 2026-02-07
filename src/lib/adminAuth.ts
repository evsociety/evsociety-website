/**
 * Admin Authentication Utilities
 * Google Sign-In and session management
 */

import { adminConfig } from '@/config/adminConfig';
import type { AdminSession } from '@/types/admin';

/**
 * Check if user is authenticated as admin
 */
export const isAdminAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
        const session = getAdminSession();
        if (!session) return false;

        // Check if session is expired
        const now = Date.now();
        const elapsed = now - session.loginTimestamp;

        if (elapsed > adminConfig.SESSION_TIMEOUT_MS) {
            clearAdminSession();
            return false;
        }

        // Check if email matches admin email
        return session.adminEmail === adminConfig.ADMIN_EMAIL;

    } catch (error) {
        console.error('Error checking admin auth:', error);
        return false;
    }
};

/**
 * Get admin session from localStorage
 */
export const getAdminSession = (): AdminSession | null => {
    if (typeof window === 'undefined') return null;

    try {
        const email = localStorage.getItem(adminConfig.SESSION_KEYS.ADMIN_EMAIL);
        const token = localStorage.getItem(adminConfig.SESSION_KEYS.ID_TOKEN);
        const timestamp = localStorage.getItem(adminConfig.SESSION_KEYS.LOGIN_TIMESTAMP);

        if (!email || !token || !timestamp) {
            return null;
        }

        return {
            adminEmail: email,
            idToken: token,
            loginTimestamp: parseInt(timestamp, 10),
        };
    } catch (error) {
        console.error('Error getting admin session:', error);
        return null;
    }
};

/**
 * Save admin session to localStorage
 */
export const saveAdminSession = (email: string, idToken: string): void => {
    if (typeof window === 'undefined') return;

    try {
        const timestamp = Date.now().toString();

        localStorage.setItem(adminConfig.SESSION_KEYS.ADMIN_EMAIL, email);
        localStorage.setItem(adminConfig.SESSION_KEYS.ID_TOKEN, idToken);
        localStorage.setItem(adminConfig.SESSION_KEYS.LOGIN_TIMESTAMP, timestamp);

        console.log('[Admin Auth] Session saved for:', email);
    } catch (error) {
        console.error('Error saving admin session:', error);
    }
};

/**
 * Clear admin session
 */
export const clearAdminSession = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(adminConfig.SESSION_KEYS.ADMIN_EMAIL);
        localStorage.removeItem(adminConfig.SESSION_KEYS.ID_TOKEN);
        localStorage.removeItem(adminConfig.SESSION_KEYS.LOGIN_TIMESTAMP);

        console.log('[Admin Auth] Session cleared');
    } catch (error) {
        console.error('Error clearing admin session:', error);
    }
};

/**
 * Initialize Google Sign-In
 * Call this in useEffect on admin pages
 */
export const initGoogleSignIn = (onSuccess: (email: string, idToken: string) => void): void => {
    if (typeof window === 'undefined') return;

    // Check if Google Sign-In script is loaded
    if (!(window as any).google) {
        console.error('Google Sign-In script not loaded');
        return;
    }

    try {
        (window as any).google.accounts.id.initialize({
            client_id: adminConfig.GOOGLE_CLIENT_ID,
            callback: (response: any) => {
                handleGoogleSignIn(response, onSuccess);
            },
        });

        console.log('[Admin Auth] Google Sign-In initialized');
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
    }
};

/**
 * Render Google Sign-In button
 */
export const renderGoogleSignInButton = (elementId: string): void => {
    if (typeof window === 'undefined') return;

    try {
        (window as any).google.accounts.id.renderButton(
            document.getElementById(elementId),
            {
                theme: 'filled_blue',
                size: 'large',
                text: 'signin_with',
                width: 300,
            }
        );
    } catch (error) {
        console.error('Error rendering Google Sign-In button:', error);
    }
};

/**
 * Handle Google Sign-In callback
 */
const handleGoogleSignIn = (
    response: any,
    onSuccess: (email: string, idToken: string) => void
): void => {
    try {
        // Decode JWT token to get email
        const idToken = response.credential;
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        const email = payload.email;

        console.log('[Admin Auth] Sign-in attempt:', email);

        // Check if email matches admin email
        if (email !== adminConfig.ADMIN_EMAIL) {
            alert('Access Denied: Only admin account can access this page.');
            return;
        }

        // Save session
        saveAdminSession(email, idToken);

        // Call success callback
        onSuccess(email, idToken);

    } catch (error) {
        console.error('Error handling Google Sign-In:', error);
        alert('Sign-in failed. Please try again.');
    }
};

/**
 * Sign out admin
 */
export const signOutAdmin = (): void => {
    clearAdminSession();

    // Optional: Sign out from Google
    if (typeof window !== 'undefined' && (window as any).google) {
        try {
            (window as any).google.accounts.id.disableAutoSelect();
        } catch (error) {
            console.error('Error signing out from Google:', error);
        }
    }

    // Redirect to login
    window.location.href = '/admin/registrations';
};
