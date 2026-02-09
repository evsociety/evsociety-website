/**
 * Admin Types
 * TypeScript interfaces for admin features
 */

export interface AdminRegistration {
    registrationId: string;
    registrationType: string;
    role: 'attendee' | 'guest';
    itemType: 'events' | 'programs' | 'projects' | 'webinars';
    itemId: string;
    itemTitle: string;
    eventDate?: string;
    eventTime?: string;
    location?: string;
    mode: 'online' | 'offline' | 'hybrid';

    // Participant details
    fullName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    organization: string;
    designation: string;
    linkedIn?: string;

    // Guest-specific
    guestCategory?: string;
    topicReason?: string;
    invitedBy?: string;
    specialRequirements?: string;

    // Project/Program-specific
    skillArea?: string;
    interestLevel?: string;
    participantType?: string;
    experienceLevel?: string;
    questions?: string;

    // Metadata
    sessionTrack?: string;
    timestamp: string;
}

export interface AdminFilters {
    itemType?: 'all' | 'events' | 'programs' | 'projects' | 'webinars';
    role?: 'all' | 'attendee' | 'guest';
    searchTitle?: string;
    dateFrom?: string;
    dateTo?: string;
    mode?: 'all' | 'online' | 'offline' | 'hybrid';
    city?: string;
}

export interface AdminSession {
    adminEmail: string;
    idToken: string;
    loginTimestamp: number;
}

export interface AdminApiResponse<T = any> {
    ok: boolean;
    data?: T;
    total?: number;
    error?: string;
}

export interface AdminApiRequest {
    action: 'listRegistrations';
    filters?: AdminFilters;
    idToken: string;
}
