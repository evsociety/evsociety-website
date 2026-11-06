// Configuration model for EV Society competitions. One definition drives registration, team
// editing, the participants and winners directories and award documents, so a new competition
// needs a definition (and a row in the Competitions tab) rather than new pages or components.

export interface CompetitionCategory {
    id: string;
    label: string;
    /** Tab label on the winners page, e.g. "Model Rocketry Winners" */
    winnersLabel: string;
    description?: string;
}

/** A choice offered in the registration form; each maps to one or more categories */
export interface CompetitionRegistrationOption {
    id: string;
    label: string;
    description?: string;
    categoryIds: string[];
}

export interface CompetitionAwardDocument {
    id: string;
    year: number;
    categoryId: string;
    title: string;
    /** Proposed until EV Society confirms it; never changed automatically */
    status: 'Proposed' | 'Confirmed' | 'Awarded';
    /** Only a document the administrator supplied: a site path or an https link. Null until then. */
    pdf: string | null;
    thumbnail?: string | null;
}

export interface CompetitionDefinition {
    id: string;
    slug: string;
    /** Public path of the competition's landing page */
    basePath: string;
    name: string;
    shortName: string;
    organiser: string;
    organiserUrl?: string;
    /** 'individual' is supported by the data model; the first release exposes team registration */
    participantType: 'team' | 'individual';
    /** 'custom' when the landing page is a bespoke route; 'generic' renders it from this config */
    landing: 'custom' | 'generic';
    categories: CompetitionCategory[];
    registrationOptions: CompetitionRegistrationOption[];
    /** Fallbacks; the Competitions tab overrides these without a redeploy */
    defaults: {
        availableYears: number[];
        registrationYears: number[];
        defaultRegistrationYear: number;
        registrationOpen: boolean;
        showRegisteredTeams: boolean;
    };
    rules: {
        maxMentors: number;
        /** Includes the leader; null means no competition-specific limit */
        maxMembers: number | null;
        minMembers: number;
    };
    /** Optional fields the form shows; required fields are fixed by the platform */
    fields: {
        institutionLogo: boolean;
        teamLogo: boolean;
        teamPhoto: boolean;
        memberPhoto: boolean;
        memberResume: boolean;
        memberEmail: boolean;
        memberPhone: boolean;
        mentorPhoto: boolean;
        mentorInstitution: boolean;
    };
    directories: {
        participants: boolean;
        winners: boolean;
    };
    awards: {
        heading: string;
        intro?: string;
        documents: CompetitionAwardDocument[];
        /** Existing award information, shown with the documents */
        facts?: { label: string; value: string; note?: string }[];
        disclaimer?: string;
        links?: { label: string; href: string }[];
    } | null;
    copy: {
        heroEyebrow: string;
        registerSubtitle: string;
        registerIntro: string;
        /** States what registering on EV Society is, and is not */
        registrationNotice: string;
        participantsTitle: string;
        participantsSubtitle: string;
        winnersTitle: string;
        winnersSubtitle: string;
    };
}
