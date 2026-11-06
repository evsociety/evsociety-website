import type { CompetitionDefinition } from '@/config/competitions';
import type { FileKind, PublicTeam, TeamSavePayload, TeamView } from '@/lib/competitions/model';
import { optionForCategories } from '@/lib/competitions/validation';

// Form state for Register Team / Manage Team Profile and conversions to and from the API

export interface FileRef {
    fileId: string;
    name: string;
    size?: number;
    /** Object URL for a fresh upload, or the leader-only preview route for saved images */
    previewUrl?: string;
}

export interface MemberDraft {
    key: string;
    memberId?: string;
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    photo: FileRef | null;
    resume: FileRef | null;
    under18: boolean;
}

export interface MentorDraft {
    key: string;
    mentorId?: string;
    name: string;
    institution: string;
    linkedin: string;
    photo: FileRef | null;
    listingConsent: boolean;
}

export interface FormState {
    year: number | null;
    optionId: string;
    team: {
        name: string;
        teamCode: string;
        college: string;
        institutionLogo: FileRef | null;
        teamLogo: FileRef | null;
        teamPhoto: FileRef | null;
        teamPhotoConsent: boolean;
    };
    leader: {
        name: string;
        email: string;
        phone: string;
        linkedin: string;
        photo: FileRef | null;
        resume: FileRef | null;
        under18: boolean;
    };
    leaderPermissions: { photo: boolean; linkedin: boolean; email: boolean; phone: boolean };
    members: MemberDraft[];
    mentors: MentorDraft[];
    publicationConsent: boolean;
    processingConsent: boolean;
}

let counter = 0;
export const newKey = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const emptyMember = (): MemberDraft => ({ key: newKey('m'), name: '', email: '', phone: '', linkedin: '', photo: null, resume: null, under18: false });
export const emptyMentor = (): MentorDraft => ({ key: newKey('t'), name: '', institution: '', linkedin: '', photo: null, listingConsent: false });

export function initialFormState(competition: CompetitionDefinition, defaultYear: number, email = ''): FormState {
    return {
        year: defaultYear,
        optionId: '',
        team: { name: '', teamCode: '', college: '', institutionLogo: null, teamLogo: null, teamPhoto: null, teamPhotoConsent: false },
        leader: { name: '', email, phone: '', linkedin: '', photo: null, resume: null, under18: false },
        leaderPermissions: { photo: false, linkedin: false, email: false, phone: false },
        members: [],
        mentors: [],
        publicationConsent: true,
        processingConsent: false,
    };
}

export function categoriesForOption(competition: CompetitionDefinition, optionId: string): string[] {
    return competition.registrationOptions.find((o) => o.id === optionId)?.categoryIds ?? [];
}

export function fromTeamView(view: TeamView, competition: CompetitionDefinition, previewUrl: (fileId: string) => string): FormState {
    const ref = (fileId: string, image = true): FileRef | null => {
        if (!fileId) return null;
        const meta = view.files[fileId];
        return { fileId, name: meta?.name ?? 'Uploaded file', size: meta?.size, previewUrl: image ? previewUrl(fileId) : undefined };
    };
    const d = view.data;
    return {
        year: d.year,
        optionId: optionForCategories(competition, d.categories)?.id ?? '',
        team: {
            name: d.team.name,
            teamCode: d.team.teamCode ?? '',
            college: d.team.college,
            institutionLogo: ref(d.team.institutionLogoFileId),
            teamLogo: ref(d.team.teamLogoFileId),
            teamPhoto: ref(d.team.teamPhotoFileId),
            teamPhotoConsent: d.team.teamPhotoConsent,
        },
        leader: {
            name: d.leader?.name ?? '',
            email: view.leaderEmail,
            phone: d.leader?.phone ?? '',
            linkedin: d.leader?.linkedin ?? '',
            photo: ref(d.leader?.photoFileId ?? ''),
            resume: ref(d.leader?.resumeFileId ?? '', false),
            under18: d.leader?.under18 ?? false,
        },
        leaderPermissions: { ...view.leaderPermissions },
        members: d.members.map((m) => ({
            key: m.memberId || newKey('m'),
            memberId: m.memberId || undefined,
            name: m.name,
            email: m.email,
            phone: m.phone,
            linkedin: m.linkedin,
            photo: ref(m.photoFileId),
            resume: ref(m.resumeFileId, false),
            under18: m.under18,
        })),
        mentors: d.mentors.map((m) => ({
            key: m.mentorId || newKey('t'),
            mentorId: m.mentorId || undefined,
            name: m.name,
            institution: m.institution,
            linkedin: m.linkedin,
            photo: ref(m.photoFileId),
            listingConsent: m.listingConsent,
        })),
        publicationConsent: view.publication.consent,
        processingConsent: !!view.processingConsentAt,
    };
}

export function toPayload(state: FormState, competition: CompetitionDefinition): TeamSavePayload {
    const id = (f: FileRef | null) => f?.fileId ?? '';
    return {
        year: state.year,
        categories: categoriesForOption(competition, state.optionId),
        team: {
            name: state.team.name,
            teamCode: state.team.teamCode,
            college: state.team.college,
            institutionLogoFileId: id(state.team.institutionLogo),
            teamLogoFileId: id(state.team.teamLogo),
            teamPhotoFileId: id(state.team.teamPhoto),
            teamPhotoConsent: state.team.teamPhotoConsent,
        },
        leader: {
            name: state.leader.name,
            phone: state.leader.phone,
            linkedin: state.leader.linkedin,
            photoFileId: id(state.leader.photo),
            resumeFileId: id(state.leader.resume),
            under18: state.leader.under18,
        },
        members: state.members.map((m) => ({ memberId: m.memberId, name: m.name, email: m.email, phone: m.phone, linkedin: m.linkedin, photoFileId: id(m.photo), resumeFileId: id(m.resume), under18: m.under18 })),
        mentors: state.mentors.map((m) => ({ mentorId: m.mentorId, name: m.name, institution: m.institution, linkedin: m.linkedin, photoFileId: id(m.photo), listingConsent: m.listingConsent })),
        leaderPermissions: state.leaderPermissions,
        publicationConsent: state.publicationConsent,
        processingConsent: state.processingConsent,
    };
}

/** After a direct save, adopt the member and mentor IDs the backend assigned (same order) */
export function adoptIds(state: FormState, view: TeamView): FormState {
    if (view.editMode !== 'direct') return state;
    const members = state.members.map((m, i) => ({ ...m, memberId: view.data.members[i]?.memberId || m.memberId }));
    const mentors = state.mentors.map((m, i) => ({ ...m, mentorId: view.data.mentors[i]?.mentorId || m.mentorId }));
    return { ...state, members, mentors };
}

/**
 * How the profile would look publicly if EV Society approves it. Members' photos, LinkedIn and
 * contact details appear only after each member agrees, so the preview marks them as pending.
 */
export function previewTeam(state: FormState, competition: CompetitionDefinition, slug: string): PublicTeam {
    const photo = (f: FileRef | null) => f?.previewUrl ?? null;
    const perms = state.leaderPermissions;
    return {
        slug: slug || 'preview',
        year: state.year ?? competition.defaults.defaultRegistrationYear,
        name: state.team.name || 'Your team name',
        teamCode: state.team.teamCode,
        college: state.team.college,
        entryType: 'Team',
        revision: 1,
        teamLogoUrl: photo(state.team.teamLogo),
        institutionLogoUrl: photo(state.team.institutionLogo),
        teamPhoto: state.team.teamPhotoConsent && photo(state.team.teamPhoto) ? { url: photo(state.team.teamPhoto)!, width: null, height: null, alt: `Group photograph of ${state.team.name || 'the team'}` } : null,
        categories: categoriesForOption(competition, state.optionId).map((categoryId) => ({ categoryId, participationVerified: false, winnerVerified: false, achievement: '', verifiedAt: '', officialResultUrl: '' })),
        leader: state.leader.under18 ? null : {
            role: 'leader',
            name: state.leader.name || 'Team leader',
            photoUrl: perms.photo ? photo(state.leader.photo) : null,
            linkedin: perms.linkedin && state.leader.linkedin ? state.leader.linkedin : null,
            email: perms.email ? state.leader.email : null,
            phone: perms.phone ? state.leader.phone : null,
        },
        members: state.members.filter((m) => m.name && !m.under18).map((m) => ({ role: 'member', name: m.name, photoUrl: null, linkedin: null, email: null, phone: null })),
        mentors: state.mentors.filter((m) => m.name && m.listingConsent).slice(0, competition.rules.maxMentors).map((m) => ({ name: m.name, institution: m.institution, linkedin: m.linkedin || null, photoUrl: photo(m.photo) })),
    };
}

export const IMAGE_KINDS: FileKind[] = ['member-photo', 'mentor-photo', 'team-photo', 'team-logo', 'institution-logo'];
