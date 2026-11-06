// Registration validation shared by the form (inline errors) and the API routes (server-side
// checks before anything reaches the spreadsheet). The Apps Script repeats the essential checks.
// Error keys are field paths such as "team.name" or "members.2.email".

import type { CompetitionDefinition } from '@/config/competitions';
import type { CompetitionRuntimeConfig, TeamSavePayload } from './model';

export type FieldErrors = Record<string, string>;

export const LIMITS = {
    name: 120,
    teamName: 120,
    college: 200,
    institution: 200,
    email: 254,
    phone: 20,
    linkedin: 300,
    /** Technical safety cap; competitions may set a lower team size */
    membersCap: 50,
} as const;

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;
const LINKEDIN_RE = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub|company|school)\/[A-Za-z0-9\-_%.~]+\/?(\?[A-Za-z0-9\-_%.~=&]*)?$/i;

export const cleanText = (value: unknown, max: number) =>
    String(value ?? '').replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export const normalizeEmail = (value: unknown) => cleanText(value, LIMITS.email).toLowerCase();

export function isEmail(value: string): boolean {
    return value.length <= LIMITS.email && EMAIL_RE.test(value);
}

export function isPhone(value: string): boolean {
    if (!PHONE_RE.test(value)) return false;
    const digits = value.replace(/\D/g, '').length;
    return digits >= 8 && digits <= 15;
}

/** Accepts "linkedin.com/in/name" or http links and returns the https form */
export function normalizeLinkedIn(value: unknown): string {
    let s = cleanText(value, LIMITS.linkedin);
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
    return s.replace(/^http:\/\//i, 'https://');
}

export function isLinkedInUrl(value: string): boolean {
    return LINKEDIN_RE.test(value);
}

export function validateLeaderStart(input: { name: string; email: string; phone: string }): FieldErrors {
    const errors: FieldErrors = {};
    if (!cleanText(input.name, LIMITS.name)) errors['leader.name'] = 'Enter your full name.';
    const email = normalizeEmail(input.email);
    if (!email) errors['leader.email'] = 'Enter your email address.';
    else if (!isEmail(email)) errors['leader.email'] = 'Enter a valid email address, such as name@college.edu.';
    const phone = cleanText(input.phone, LIMITS.phone);
    if (!phone) errors['leader.phone'] = 'Enter your phone number.';
    else if (!isPhone(phone)) errors['leader.phone'] = 'Enter a valid phone number, including the country code if outside India.';
    return errors;
}

export function validateYearAndCategories(
    competition: CompetitionDefinition,
    config: Pick<CompetitionRuntimeConfig, 'registrationYears'>,
    year: number | null,
    categories: string[],
): FieldErrors {
    const errors: FieldErrors = {};
    if (!year) errors.year = 'Select the competition year.';
    else if (!config.registrationYears.includes(year)) errors.year = `Registration is not open for ${year}.`;
    const valid = competition.categories.map((c) => c.id);
    if (!categories.length) errors.categories = 'Select a competition category.';
    else if (categories.some((c) => !valid.includes(c)) || new Set(categories).size !== categories.length) {
        errors.categories = 'Select a valid competition category.';
    }
    return errors;
}

/** The registration option (e.g. "Model Rocketry & CAN-7USAT") matching a category selection */
export function optionForCategories(competition: CompetitionDefinition, categories: string[]) {
    const key = [...categories].sort().join('|');
    return competition.registrationOptions.find((o) => [...o.categoryIds].sort().join('|') === key) ?? null;
}

interface ValidateOptions {
    /** Submitting for review needs every required field; drafts may be partial */
    complete: boolean;
    competition: CompetitionDefinition;
    config: Pick<CompetitionRuntimeConfig, 'registrationYears' | 'maxMentors' | 'maxMembers'>;
    leaderEmail: string;
    /** Year and categories cannot change once a team is approved */
    lockYearAndCategories?: boolean;
}

export function validateTeamPayload(payload: TeamSavePayload, opts: ValidateOptions): FieldErrors {
    const errors: FieldErrors = {};
    const { competition, config, complete } = opts;

    if (!opts.lockYearAndCategories) {
        Object.assign(errors, validateYearAndCategories(competition, config, payload.year, payload.categories));
    }

    const t = payload.team;
    if (complete && !cleanText(t.name, LIMITS.teamName)) errors['team.name'] = 'Enter the team name.';
    if (complete && !cleanText(t.college, LIMITS.college)) errors['team.college'] = 'Enter the college or university name.';

    const l = payload.leader;
    if (complete && !cleanText(l.name, LIMITS.name)) errors['leader.name'] = "Enter the team leader's full name.";
    const leaderPhone = cleanText(l.phone, LIMITS.phone);
    if (complete && !leaderPhone) errors['leader.phone'] = "Enter the team leader's phone number.";
    else if (leaderPhone && !isPhone(leaderPhone)) errors['leader.phone'] = 'Enter a valid phone number.';
    const leaderLinkedIn = normalizeLinkedIn(l.linkedin);
    if (leaderLinkedIn && !isLinkedInUrl(leaderLinkedIn)) errors['leader.linkedin'] = 'Enter a LinkedIn profile URL, such as https://www.linkedin.com/in/your-name.';

    const seenEmails = new Map<string, string>([[normalizeEmail(opts.leaderEmail), 'the team leader']]);
    if (payload.members.length > LIMITS.membersCap) errors.members = `A team can list at most ${LIMITS.membersCap} members.`;
    payload.members.forEach((m, i) => {
        const p = `members.${i}.`;
        if (complete && !cleanText(m.name, LIMITS.name)) errors[`${p}name`] = "Enter the member's full name, or remove this member.";
        const email = normalizeEmail(m.email);
        if (email) {
            if (!isEmail(email)) errors[`${p}email`] = 'Enter a valid email address.';
            else if (seenEmails.has(email)) errors[`${p}email`] = `This email is already used by ${seenEmails.get(email)}.`;
            else seenEmails.set(email, 'another member');
        }
        const phone = cleanText(m.phone, LIMITS.phone);
        if (phone && !isPhone(phone)) errors[`${p}phone`] = 'Enter a valid phone number.';
        const linkedin = normalizeLinkedIn(m.linkedin);
        if (linkedin && !isLinkedInUrl(linkedin)) errors[`${p}linkedin`] = 'Enter a LinkedIn profile URL.';
    });

    const maxMentors = Math.min(config.maxMentors || competition.rules.maxMentors, 10);
    if (payload.mentors.length > maxMentors) errors.mentors = `Add at most ${maxMentors} mentors.`;
    payload.mentors.forEach((m, i) => {
        const p = `mentors.${i}.`;
        if (complete && !cleanText(m.name, LIMITS.name)) errors[`${p}name`] = "Enter the mentor's full name, or remove this mentor.";
        const linkedin = normalizeLinkedIn(m.linkedin);
        if (linkedin && !isLinkedInUrl(linkedin)) errors[`${p}linkedin`] = 'Enter a LinkedIn profile URL.';
    });

    if (complete) {
        const size = payload.members.length + 1;
        const maxMembers = config.maxMembers ?? competition.rules.maxMembers;
        if (maxMembers && size > maxMembers) errors.members = `This competition allows at most ${maxMembers} people per team, including the leader.`;
        if (competition.rules.minMembers && size < competition.rules.minMembers) {
            errors.members = `This competition needs at least ${competition.rules.minMembers} people per team, including the leader.`;
        }
        if (!payload.processingConsent) errors.processingConsent = 'Please agree to the processing of this registration so EV Society can review it.';
    }
    return errors;
}

/** Normalises a payload from the browser into exactly the fields the backend accepts */
export function normalizeTeamPayload(raw: unknown): TeamSavePayload {
    const r = (raw ?? {}) as Record<string, any>;
    const bool = (v: unknown) => v === true;
    const id = (v: unknown) => cleanText(v, 40);
    const team = r.team ?? {};
    const leader = r.leader ?? {};
    const perms = r.leaderPermissions ?? {};
    return {
        year: Number(r.year) || null,
        categories: Array.isArray(r.categories) ? r.categories.map((c: unknown) => cleanText(c, 60)).filter(Boolean) : [],
        team: {
            name: cleanText(team.name, LIMITS.teamName),
            college: cleanText(team.college, LIMITS.college),
            institutionLogoFileId: id(team.institutionLogoFileId),
            teamLogoFileId: id(team.teamLogoFileId),
            teamPhotoFileId: id(team.teamPhotoFileId),
            teamPhotoConsent: bool(team.teamPhotoConsent),
        },
        leader: {
            memberId: id(leader.memberId) || undefined,
            name: cleanText(leader.name, LIMITS.name),
            phone: cleanText(leader.phone, LIMITS.phone),
            linkedin: normalizeLinkedIn(leader.linkedin),
            photoFileId: id(leader.photoFileId),
            resumeFileId: id(leader.resumeFileId),
            under18: bool(leader.under18),
        },
        members: (Array.isArray(r.members) ? r.members : []).slice(0, LIMITS.membersCap + 1).map((m: any) => ({
            memberId: id(m?.memberId) || undefined,
            name: cleanText(m?.name, LIMITS.name),
            email: normalizeEmail(m?.email),
            phone: cleanText(m?.phone, LIMITS.phone),
            linkedin: normalizeLinkedIn(m?.linkedin),
            photoFileId: id(m?.photoFileId),
            resumeFileId: id(m?.resumeFileId),
            under18: bool(m?.under18),
        })),
        mentors: (Array.isArray(r.mentors) ? r.mentors : []).slice(0, 11).map((m: any) => ({
            mentorId: id(m?.mentorId) || undefined,
            name: cleanText(m?.name, LIMITS.name),
            institution: cleanText(m?.institution, LIMITS.institution),
            linkedin: normalizeLinkedIn(m?.linkedin),
            photoFileId: id(m?.photoFileId),
            listingConsent: bool(m?.listingConsent),
        })),
        leaderPermissions: { photo: bool(perms.photo), linkedin: bool(perms.linkedin), email: bool(perms.email), phone: bool(perms.phone) },
        publicationConsent: bool(r.publicationConsent),
        processingConsent: bool(r.processingConsent),
    };
}
