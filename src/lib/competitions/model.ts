// Shared shapes for the competition platform, used by the browser, the API routes and tests.
// The editable "team document" matches what the Apps Script backend stores and returns.

export type TeamStatus = 'Draft' | 'Pending Review' | 'Changes Requested' | 'Approved' | 'Rejected';
export type ChangeRequestStatus = 'Draft' | 'Pending Review' | 'Changes Requested' | 'Approved' | 'Rejected' | 'Withdrawn' | 'Superseded';
export type FileKind = 'member-photo' | 'mentor-photo' | 'team-photo' | 'team-logo' | 'institution-logo' | 'resume';

export interface PublicationPermissions {
    photo: boolean;
    linkedin: boolean;
    email: boolean;
    phone: boolean;
}

export interface LeaderInput {
    memberId?: string;
    name: string;
    phone: string;
    linkedin: string;
    photoFileId: string;
    resumeFileId: string;
    under18: boolean;
}

export interface MemberInput {
    memberId?: string;
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    photoFileId: string;
    resumeFileId: string;
    under18: boolean;
}

export interface MentorInput {
    mentorId?: string;
    name: string;
    institution: string;
    linkedin: string;
    photoFileId: string;
    listingConsent: boolean;
}

export interface TeamDocument {
    year: number | null;
    categories: string[];
    team: {
        name: string;
        college: string;
        institutionLogoFileId: string;
        teamLogoFileId: string;
        teamPhotoFileId: string;
        teamPhotoConsent: boolean;
    };
    leader: LeaderInput;
    members: MemberInput[];
    mentors: MentorInput[];
}

/** What the browser sends when saving: the document plus consent choices that apply immediately */
export interface TeamSavePayload extends TeamDocument {
    leaderPermissions: PublicationPermissions;
    publicationConsent: boolean;
    processingConsent: boolean;
}

export interface FileSummary {
    fileId: string;
    kind: FileKind;
    name: string;
    mime: string;
    size: number;
    uploadedAt?: string;
}

export interface MemberConsentState {
    consentStatus: string;
    verificationStatus: string;
    permissions: PublicationPermissions & { hidden: boolean };
    guardianConsentVerified: boolean;
}

export interface CategoryStatus {
    categoryId: string;
    registrationStatus: string;
    participationVerified: boolean;
    winnerVerified: boolean;
    achievement: string;
}

/** A team as its signed-in leader sees it */
export interface TeamView {
    teamId: string;
    competitionId: string;
    entryType: string;
    status: TeamStatus;
    version: number;
    revisionNumber: number;
    slug: string;
    editMode: 'direct' | 'revision' | 'locked';
    lockedReason: 'rejected' | 'deletion-requested' | null;
    reviewComments: string;
    publication: {
        consent: boolean;
        profileApproved: boolean;
        publicationApproved: boolean;
        status: string;
    };
    processingConsentAt: string;
    submittedAt: string;
    updatedAt: string;
    pendingChange: {
        changeRequestId: string;
        status: ChangeRequestStatus;
        submittedAt: string;
        summary: string;
        reviewComments: string;
    } | null;
    leaderEmail: string;
    leaderPermissions: PublicationPermissions;
    categoriesStatus: CategoryStatus[];
    memberConsents: Record<string, MemberConsentState>;
    files: Record<string, FileSummary>;
    data: TeamDocument;
    maxMentors: number;
}

export interface TeamListItem {
    teamId: string;
    name: string;
    college: string;
    year: number | null;
    categories: string[];
    status: TeamStatus;
    publicationStatus: string;
    pendingChange: ChangeRequestStatus | null;
    updatedAt: string;
}

/* ── Public (approved, consented) data ── */

export interface PublicPerson {
    role: 'leader' | 'member';
    name: string;
    photoUrl: string | null;
    linkedin: string | null;
    email: string | null;
    phone: string | null;
}

export interface PublicMentor {
    name: string;
    institution: string;
    linkedin: string | null;
    photoUrl: string | null;
}

export interface PublicTeamCategory {
    categoryId: string;
    participationVerified: boolean;
    winnerVerified: boolean;
    achievement: string;
}

export interface PublicTeam {
    slug: string;
    year: number;
    name: string;
    college: string;
    entryType: string;
    revision: number;
    teamLogoUrl: string | null;
    institutionLogoUrl: string | null;
    teamPhotoUrl: string | null;
    categories: PublicTeamCategory[];
    leader: PublicPerson | null;
    members: PublicPerson[];
    mentors: PublicMentor[];
}

export interface PublicAward {
    awardId: string;
    year: number | null;
    categoryId: string;
    title: string;
    status: 'Proposed' | 'Confirmed' | 'Awarded';
    document: { viewUrl: string; downloadUrl: string; kind: 'site' | 'drive' | 'external' } | null;
    thumbnailUrl: string | null;
}

export interface PublicCategoryStats {
    approvedRegistrations: number;
    participants: number;
    winners: number;
}

export interface CompetitionRuntimeConfig {
    availableYears: number[];
    registrationOpen: boolean;
    registrationYears: number[];
    defaultRegistrationYear: number;
    publicVisible: boolean;
    showRegisteredTeams: boolean;
    maxMentors: number;
    maxMembers: number | null;
}

export interface PublicCompetitionData {
    competitionId: string;
    generatedAt: string;
    config: CompetitionRuntimeConfig;
    teams: PublicTeam[];
    stats: Record<string, { approvedRegistrations: number; categories: Record<string, PublicCategoryStats> }>;
    awards: PublicAward[];
    /** Opaque upload IDs the public media route may serve */
    publicFileIds: string[];
}

/** How a team is labelled in a category; registration alone never makes a team a participant */
export type PublicStage = 'registered' | 'participant' | 'winner';

export function stageOf(category: PublicTeamCategory): PublicStage {
    if (category.winnerVerified && category.participationVerified) return 'winner';
    if (category.participationVerified) return 'participant';
    return 'registered';
}

export const STAGE_LABEL: Record<PublicStage, string> = {
    registered: 'Registration approved',
    participant: 'Participation verified',
    winner: 'Winner verified',
};

export function emptyTeamDocument(year: number | null, categories: string[]): TeamDocument {
    return {
        year,
        categories,
        team: { name: '', college: '', institutionLogoFileId: '', teamLogoFileId: '', teamPhotoFileId: '', teamPhotoConsent: false },
        leader: { name: '', phone: '', linkedin: '', photoFileId: '', resumeFileId: '', under18: false },
        members: [],
        mentors: [],
    };
}
