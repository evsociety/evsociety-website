// Registration Types and Interfaces

export type RegistrationType = 'events' | 'programs' | 'projects' | 'webinars';
export type RegistrationRole = 'attendee' | 'guest';
export type ParticipationMode = 'online' | 'offline' | 'hybrid';
export type GuestCategory = 'speaker' | 'partner' | 'sponsor' | 'media' | 'vip' | 'other';
export type SkillArea = 'ev-software' | 'battery' | 'charging' | 'cybersecurity' | 'ai-ml' | 'embedded' | 'research' | 'other';
export type InterestLevel = 'volunteer' | 'internship' | 'mentorship' | 'collaboration';
export type ParticipantType = 'student' | 'professional' | 'faculty' | 'startup' | 'govt' | 'other';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface RegistrationItem {
    id: string;
    title: string;
    date?: string;
    time?: string;
    startDate?: string;
    duration?: string;
    location?: string;
    modeOptions: ParticipationMode[];
    categoryTags: string[];
    sessionTracks?: string[];
    speaker?: string;
    speakerTitle?: string;
    speakerOrganization?: string;
    speakerInstitution?: string;
    posterLinkURL?: string;
    youtubeURL?: string;
}

export interface RegistrationFormData {
    // Common fields
    fullName: string;
    email: string;
    phone: string;
    countryCode: string;
    city: string;
    state: string;
    organization: string;
    designation: string;
    linkedinUrl?: string;
    participationMode: ParticipationMode | '';
    consent: boolean;
    newsletter: boolean;

    // Guest-specific fields
    guestCategory?: GuestCategory | '';
    topic?: string;
    reference?: string;
    specialRequirements?: string;

    // Project-specific fields
    skillAreas?: SkillArea[];
    interestLevel?: InterestLevel | '';

    // Program-specific fields
    participantType?: ParticipantType | '';
    experienceLevel?: ExperienceLevel | '';

    // Event/Webinar-specific fields
    sessionTrack?: string;
    questions?: string;
}

export interface StoredRegistration {
    registrationId: string;
    type: RegistrationType;
    role: RegistrationRole;
    itemId: string;
    itemTitle: string;
    formData: RegistrationFormData;
    timestamp: string;
}

export interface ValidationError {
    field: string;
    message: string;
}
