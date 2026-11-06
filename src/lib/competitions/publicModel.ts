// Turns the backend's public snapshot into the data the public pages render. Every field is
// whitelisted and re-validated here, so even a faulty backend response cannot put private
// fields, raw Drive IDs, resume references or unsafe links on a public page.

import type { CompetitionDefinition } from '@/config/competitions';
import type { CompetitionRuntimeConfig, PublicAward, PublicCompetitionData, PublicMentor, PublicPerson, PublicTeam } from './model';
import { cleanText, isEmail, isLinkedInUrl, isPhone, LIMITS, normalizeEmail, normalizeLinkedIn } from './validation';

const FILE_ID_RE = /^FIL-[2-9A-HJ-NP-Z]{12}$/;
export const TEAM_CODE_RE = /^[A-Za-z0-9][A-Za-z0-9 _\-/]{0,39}$/;

function safeHttpsUrl(value: string): string | null {
    try {
        const url = new URL(value.trim());
        return url.protocol === 'https:' ? url.toString() : null;
    } catch {
        return null;
    }
}

function publicImage(raw: any, file: (id: unknown) => string | null, fallbackAlt: string) {
    if (!raw || typeof raw !== 'object') return null;
    const url = file(raw.fileId);
    if (!url) return null;
    const dim = (v: unknown) => (Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) <= 20000 ? Number(v) : null);
    return { url, width: dim(raw.width), height: dim(raw.height), alt: cleanText(raw.alt, 300) || fallbackAlt };
}
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function mediaUrl(competitionId: string, fileId: string) {
    return `/api/competitions/media/${competitionId}/${fileId}`;
}

export function defaultRuntimeConfig(competition: CompetitionDefinition, registrationOpen = competition.defaults.registrationOpen): CompetitionRuntimeConfig {
    return {
        availableYears: competition.defaults.availableYears,
        registrationOpen,
        registrationYears: competition.defaults.registrationYears,
        defaultRegistrationYear: competition.defaults.defaultRegistrationYear,
        publicVisible: true,
        showRegisteredTeams: competition.defaults.showRegisteredTeams,
        maxMentors: competition.rules.maxMentors,
        maxMembers: competition.rules.maxMembers,
    };
}

const years = (value: unknown, fallback: number[]) => {
    if (!Array.isArray(value)) return fallback;
    const out = value.map(Number).filter((y) => Number.isInteger(y) && y >= 2000 && y <= 2100);
    return out.length ? Array.from(new Set(out)).sort((a, b) => a - b) : fallback;
};

export function sanitizeRuntimeConfig(raw: any, competition: CompetitionDefinition): CompetitionRuntimeConfig {
    // No row in the Competitions tab: show the defaults but keep registration closed
    if (!raw || typeof raw !== 'object') return defaultRuntimeConfig(competition, false);
    const registrationYears = years(raw.registrationYears, []);
    const defaultYear = Number(raw.defaultRegistrationYear);
    return {
        availableYears: years(raw.availableYears, competition.defaults.availableYears),
        registrationOpen: raw.registrationOpen === true && registrationYears.length > 0,
        registrationYears,
        defaultRegistrationYear: registrationYears.includes(defaultYear) ? defaultYear : registrationYears[registrationYears.length - 1] ?? competition.defaults.defaultRegistrationYear,
        publicVisible: raw.publicVisible === true,
        showRegisteredTeams: raw.showRegisteredTeams === true,
        maxMentors: Math.min(10, Math.max(0, Number(raw.maxMentors) || competition.rules.maxMentors)),
        maxMembers: raw.maxMembers ? Math.max(1, Number(raw.maxMembers)) : competition.rules.maxMembers,
    };
}

function person(raw: any, competitionId: string, fileIds: Set<string>): PublicPerson | null {
    const name = cleanText(raw?.name, LIMITS.name);
    if (!name) return null;
    const linkedin = normalizeLinkedIn(raw?.linkedin);
    const email = normalizeEmail(raw?.email);
    const phone = cleanText(raw?.phone, LIMITS.phone);
    const photo = typeof raw?.photoFileId === 'string' && FILE_ID_RE.test(raw.photoFileId) && fileIds.has(raw.photoFileId) ? raw.photoFileId : null;
    return {
        role: raw?.role === 'leader' ? 'leader' : 'member',
        name,
        photoUrl: photo ? mediaUrl(competitionId, photo) : null,
        linkedin: raw?.linkedin && isLinkedInUrl(linkedin) ? linkedin : null,
        email: raw?.email && isEmail(email) ? email : null,
        phone: raw?.phone && isPhone(phone) ? phone : null,
    };
}

function mentor(raw: any, competitionId: string, fileIds: Set<string>): PublicMentor | null {
    const name = cleanText(raw?.name, LIMITS.name);
    if (!name) return null;
    const linkedin = normalizeLinkedIn(raw?.linkedin);
    const photo = typeof raw?.photoFileId === 'string' && FILE_ID_RE.test(raw.photoFileId) && fileIds.has(raw.photoFileId) ? raw.photoFileId : null;
    return {
        name,
        institution: cleanText(raw?.institution, LIMITS.institution),
        linkedin: raw?.linkedin && isLinkedInUrl(linkedin) ? linkedin : null,
        photoUrl: photo ? mediaUrl(competitionId, photo) : null,
    };
}

/** A configured document reference: a site path, a Google Drive link or another https link */
export function resolveDocument(ref: unknown): PublicAward['document'] {
    const s = typeof ref === 'string' ? ref.trim() : '';
    if (!s) return null;
    if (s.startsWith('/') && !s.startsWith('//') && !s.includes('..')) {
        const encoded = encodeURI(s);
        return { viewUrl: encoded, downloadUrl: encoded, kind: 'site' };
    }
    let url: URL;
    try {
        url = new URL(s);
    } catch {
        return null;
    }
    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'drive.google.com' || url.hostname === 'docs.google.com') {
        const id = /\/d\/([A-Za-z0-9_-]{10,})/.exec(url.pathname)?.[1] ?? url.searchParams.get('id');
        if (id && /^[A-Za-z0-9_-]{10,}$/.test(id)) {
            return {
                viewUrl: `https://drive.google.com/file/d/${id}/preview`,
                downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
                kind: 'drive',
            };
        }
        return null;
    }
    return { viewUrl: url.toString(), downloadUrl: url.toString(), kind: 'external' };
}

const resolveImage = (ref: unknown): string | null => {
    const doc = resolveDocument(ref);
    if (!doc) return null;
    // Drive previews need a public share and are not images; only direct images are used
    return doc.kind === 'drive' ? null : doc.viewUrl;
};

/** Code-configured award cards, overlaid with what the administrator published in the sheet */
export function mergeAwards(competition: CompetitionDefinition, rawAwards: any[]): PublicAward[] {
    const statuses = ['Proposed', 'Confirmed', 'Awarded'] as const;
    const fromSheet = new Map<string, any>();
    (Array.isArray(rawAwards) ? rawAwards : []).forEach((a) => {
        if (a && typeof a.awardId === 'string') fromSheet.set(a.awardId, a);
    });
    const out: PublicAward[] = [];
    const seen = new Set<string>();
    for (const doc of competition.awards?.documents ?? []) {
        const row = fromSheet.get(doc.id);
        seen.add(doc.id);
        const status = row && statuses.includes(row.status) ? row.status : doc.status;
        out.push({
            awardId: doc.id,
            year: doc.year,
            categoryId: doc.categoryId,
            title: cleanText(row?.title, 200) || doc.title,
            status,
            document: resolveDocument(row ? row.pdfReference : doc.pdf),
            thumbnailUrl: resolveImage(row ? row.thumbnailReference : doc.thumbnail),
        });
    }
    fromSheet.forEach((row, id) => {
        if (seen.has(id)) return;
        const title = cleanText(row.title, 200);
        if (!title || !competition.categories.some((c) => c.id === row.categoryId)) return;
        out.push({
            awardId: id,
            year: Number(row.year) || null,
            categoryId: row.categoryId,
            title,
            status: statuses.includes(row.status) ? row.status : 'Proposed',
            document: resolveDocument(row.pdfReference),
            thumbnailUrl: resolveImage(row.thumbnailReference),
        });
    });
    return out;
}

export function sanitizeSnapshot(raw: any, competition: CompetitionDefinition): PublicCompetitionData {
    const competitionId = competition.id;
    const config = sanitizeRuntimeConfig(raw?.config, competition);
    const fileIds = new Set<string>((Array.isArray(raw?.publicFileIds) ? raw.publicFileIds : []).filter((id: unknown) => typeof id === 'string' && FILE_ID_RE.test(id)));
    const categoryIds = competition.categories.map((c) => c.id);
    const teams: PublicTeam[] = [];
    const seenSlugs = new Set<string>();
    for (const t of Array.isArray(raw?.teams) ? raw.teams : []) {
        const slug = typeof t?.slug === 'string' ? t.slug : '';
        const name = cleanText(t?.name, LIMITS.teamName);
        const year = Number(t?.year);
        if (!SLUG_RE.test(slug) || slug.length > 90 || seenSlugs.has(slug) || !name || !Number.isInteger(year)) continue;
        const categories = (Array.isArray(t.categories) ? t.categories : [])
            .filter((c: any) => c && categoryIds.includes(c.categoryId))
            .map((c: any) => {
                const participationVerified = c.participationVerified === true;
                const winnerVerified = participationVerified && c.winnerVerified === true;
                const result = typeof c.officialResultUrl === 'string' ? safeHttpsUrl(c.officialResultUrl) : null;
                return {
                    categoryId: c.categoryId as string,
                    participationVerified,
                    winnerVerified,
                    achievement: winnerVerified ? cleanText(c.achievement, 200) : '',
                    verifiedAt: participationVerified && typeof c.verifiedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.verifiedAt) ? c.verifiedAt : '',
                    officialResultUrl: participationVerified && result ? result : '',
                };
            });
        if (!categories.length) continue;
        if (!config.showRegisteredTeams && !categories.some((c: { participationVerified: boolean }) => c.participationVerified)) continue;
        const people = (Array.isArray(t.people) ? t.people : []).map((p: any) => person(p, competitionId, fileIds)).filter((p: PublicPerson | null): p is PublicPerson => !!p);
        const file = (id: unknown) => (typeof id === 'string' && FILE_ID_RE.test(id) && fileIds.has(id) ? mediaUrl(competitionId, id) : null);
        seenSlugs.add(slug);
        teams.push({
            slug,
            year,
            name,
            teamCode: TEAM_CODE_RE.test(cleanText(t.teamCode, 40)) ? cleanText(t.teamCode, 40) : '',
            college: cleanText(t.college, LIMITS.college),
            entryType: t.entryType === 'Individual' ? 'Individual' : 'Team',
            revision: Number(t.revision) || 1,
            teamLogoUrl: file(t.teamLogoFileId),
            institutionLogoUrl: file(t.institutionLogoFileId),
            teamPhoto: publicImage(t.teamPhoto, file, `Group photograph of ${name}`),
            categories,
            leader: people.find((p: PublicPerson) => p.role === 'leader') ?? null,
            members: people.filter((p: PublicPerson) => p.role === 'member'),
            mentors: (Array.isArray(t.mentors) ? t.mentors : []).map((m: any) => mentor(m, competitionId, fileIds)).filter((m: PublicMentor | null): m is PublicMentor => !!m).slice(0, config.maxMentors),
        });
    }
    const stats: PublicCompetitionData['stats'] = {};
    if (raw?.stats && typeof raw.stats === 'object') {
        for (const [year, value] of Object.entries<any>(raw.stats)) {
            if (!/^\d{4}$/.test(year)) continue;
            const categories: Record<string, { approvedRegistrations: number; participants: number; winners: number }> = {};
            for (const id of categoryIds) {
                const c = value?.categories?.[id];
                if (c) categories[id] = { approvedRegistrations: Number(c.approvedRegistrations) || 0, participants: Number(c.participants) || 0, winners: Number(c.winners) || 0 };
            }
            stats[year] = { approvedRegistrations: Number(value?.approvedRegistrations) || 0, categories };
        }
    }
    const visibleTeams = config.publicVisible ? teams : [];
    return {
        competitionId,
        generatedAt: typeof raw?.generatedAt === 'string' ? raw.generatedAt : new Date().toISOString(),
        config,
        teams: visibleTeams,
        stats,
        awards: mergeAwards(competition, raw?.awards),
        publicFileIds: config.publicVisible ? Array.from(fileIds) : [],
    };
}

/** Data for when no backend is configured: nothing published, awards from code config */
export function emptyCompetitionData(competition: CompetitionDefinition): PublicCompetitionData {
    return {
        competitionId: competition.id,
        generatedAt: new Date().toISOString(),
        config: defaultRuntimeConfig(competition, false),
        teams: [],
        stats: {},
        awards: mergeAwards(competition, []),
        publicFileIds: [],
    };
}
