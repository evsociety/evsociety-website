// Google Analytics 4 Utility Functions

export const GA_MEASUREMENT_ID = 'G-1VQPB8G6T1';

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            targetId: string | Date,
            config?: Record<string, any>
        ) => void;
        dataLayer?: any[];
    }
}

/**
 * Check if we're in a browser environment and gtag is available
 */
const isGtagAvailable = (): boolean => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Check if debug mode is enabled
 */
const isDebugMode = (): boolean => {
    return process.env.NEXT_PUBLIC_GA_DEBUG === 'true';
};

/**
 * Track a page view event
 * @param path - The page path to track
 */
export const trackPageView = (path: string): void => {
    if (!isGtagAvailable()) return;

    const params = {
        page_path: path,
        page_title: typeof document !== 'undefined' ? document.title : '',
    };

    window.gtag!('event', 'page_view', params);

    if (isDebugMode()) {
        console.log('[GA4 Debug] page_view:', params);
    }
};

/**
 * Track a custom event
 * @param name - Event name (use lowercase with underscores)
 * @param params - Event parameters (avoid PII)
 */
export const trackEvent = (
    name: string,
    params?: Record<string, any>
): void => {
    if (!isGtagAvailable()) return;

    window.gtag!('event', name, params || {});

    if (isDebugMode()) {
        console.log(`[GA4 Debug] ${name}:`, params || {});
    }
};
