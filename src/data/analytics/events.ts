/**
 * GA4 Event Schema and Type Definitions
 * 
 * This file defines all tracked events and their parameters for consistency
 * across the application. Use these types when calling trackEvent().
 */

// ============================================================================
// Event Names (use lowercase with underscores)
// ============================================================================

export const GA4_EVENTS = {
    // Page tracking
    PAGE_VIEW: 'page_view',

    // Navigation
    NAV_CLICK: 'nav_click',

    // CTAs and buttons
    CTA_CLICK: 'cta_click',
    BUTTON_CLICK: 'button_click',

    // Links
    LINK_CLICK: 'link_click',
    OUTBOUND_CLICK: 'outbound_click',
    FILE_DOWNLOAD: 'file_download',

    // Search
    SEARCH_OPEN: 'search_open',

    // Interactions
    ACCORDION_TOGGLE: 'accordion_toggle',
    TAB_SELECT: 'tab_select',

    // Profile views
    CANDIDATE_OPEN: 'candidate_open',
    PROJECT_OPEN: 'project_open',
} as const;

// ============================================================================
// Event Parameter Interfaces
// ============================================================================

/**
 * Page view event
 * Sent on every route change
 */
export interface PageViewParams {
    page_path: string;
    page_title: string;
}

/**
 * Navigation click event
 * Tracks clicks on menu items (header, footer, mobile drawer)
 */
export interface NavClickParams {
    nav_item: string;          // e.g., 'programs', 'about', 'events'
    nav_location: 'header' | 'footer' | 'mobile_drawer';
    destination_path: string;  // e.g., '/programs'
}

/**
 * CTA click event
 * Tracks primary call-to-action button clicks
 */
export interface CtaClickParams {
    cta_id: string;           // e.g., 'hero_join', 'view_program_details'
    page: string;             // Current page path
    section?: string;         // e.g., 'hero', 'featured_program'
    location?: string;        // Alternative to section
}

/**
 * Button click event
 * Generic button tracking
 */
export interface ButtonClickParams {
    button_id: string;
    page: string;
    section?: string;
}

/**
 * Link click event
 * Tracks internal link clicks
 */
export interface LinkClickParams {
    link_id: string;
    link_url: string;
    link_type: 'internal';
    page?: string;
}

/**
 * Outbound click event
 * Tracks clicks to external websites
 */
export interface OutboundClickParams {
    link_id: string;
    link_url: string;
    link_type: 'outbound';
    page?: string;
}

/**
 * File download event
 * Tracks PDF and document downloads
 */
export interface FileDownloadParams {
    link_id: string;
    link_url: string;
    link_type: 'download';
    file_ext: string;         // e.g., 'pdf', 'docx'
    file_name?: string;       // Filename without PII
    page?: string;
}

/**
 * Search open event
 * Tracks when search modal is opened
 */
export interface SearchOpenParams {
    location: 'header' | 'mobile_drawer';
}

/**
 * Accordion toggle event
 * Tracks accordion expand/collapse
 */
export interface AccordionToggleParams {
    accordion_id: string;     // e.g., 'pillar1', 'capstone'
    action: 'expand' | 'collapse';
    page: string;
}

/**
 * Tab select event
 * Tracks tab/pill selection
 */
export interface TabSelectParams {
    tab_id: string;
    tab_group?: string;
    page: string;
}

/**
 * Candidate profile open event
 * Tracks when a candidate profile is viewed
 */
export interface CandidateOpenParams {
    candidate_id: string;
    program?: string;         // e.g., 'evto'
    page: string;
}

/**
 * Project profile open event
 * Tracks when a project profile is viewed
 */
export interface ProjectOpenParams {
    project_id: string;
    page: string;
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example: Track navigation click
 * 
 * trackEvent(GA4_EVENTS.NAV_CLICK, {
 *   nav_item: 'programs',
 *   nav_location: 'header',
 *   destination_path: '/programs'
 * });
 */

/**
 * Example: Track CTA click
 * 
 * trackEvent(GA4_EVENTS.CTA_CLICK, {
 *   cta_id: 'hero_join',
 *   page: '/',
 *   section: 'hero'
 * });
 */

/**
 * Example: Track file download
 * 
 * trackEvent(GA4_EVENTS.FILE_DOWNLOAD, {
 *   link_id: 'evto_syllabus',
 *   link_url: '/programs/evto/syllabus.pdf',
 *   link_type: 'download',
 *   file_ext: 'pdf',
 *   file_name: 'evto-syllabus.pdf'
 * });
 */
