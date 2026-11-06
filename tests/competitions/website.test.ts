// Website-side logic: validation, the public-data sanitiser, sessions, uploads and signing

import { describe, expect, it } from 'vitest';
import { INSPACE_COMPETITION } from '@/config/competitions/inspace';
import { checkUpload, sniffMime } from '@/lib/competitions/files';
import { emptyCompetitionData, mergeAwards, resolveDocument, sanitizeSnapshot } from '@/lib/competitions/publicModel';
import { stageOf } from '@/lib/competitions/model';
import { decodeSession, encodeSession } from '@/lib/competitions/server/session';
import { asciiJson, signWebhook, verifyWebhook } from '@/lib/competitions/server/envelope';
import { isLinkedInUrl, normalizeLinkedIn, normalizeTeamPayload, optionForCategories, validateLeaderStart, validateTeamPayload } from '@/lib/competitions/validation';
import { JPEG, PDF, PNG } from './helpers';
import { DRONE_COMPETITION } from './droneCompetition';

const config = { registrationYears: [2026], maxMentors: 4, maxMembers: null };
const payload = (overrides: Record<string, unknown> = {}) => normalizeTeamPayload({
    year: 2026,
    categories: ['model-rocketry'],
    team: { name: 'Team Astra', college: 'RVCE' },
    leader: { name: 'Asha', phone: '+91 98450 12345' },
    members: [],
    mentors: [],
    processingConsent: true,
    ...overrides,
});

describe('registration validation', () => {
    it('3: the registration options never carry a year, and map to categories', () => {
        expect(INSPACE_COMPETITION.registrationOptions.map((o) => o.label)).toEqual(['Model Rocketry', 'CAN-7USAT', 'Model Rocketry & CAN-7USAT']);
        expect(optionForCategories(INSPACE_COMPETITION, ['can-7usat', 'model-rocketry'])?.id).toBe('both');
        expect(INSPACE_COMPETITION.registrationOptions.every((o) => !/\d{4}/.test(o.label))).toBe(true);
    });

    it('requires the leader’s name, a valid email and phone to start', () => {
        expect(validateLeaderStart({ name: '', email: 'bad', phone: '12' })).toEqual({
            'leader.name': 'Enter your full name.',
            'leader.email': 'Enter a valid email address, such as name@college.edu.',
            'leader.phone': 'Enter a valid phone number, including the country code if outside India.',
        });
        expect(validateLeaderStart({ name: 'Asha', email: 'asha@rvce.edu.in', phone: '+91 98450 12345' })).toEqual({});
    });

    it('checks year, category, members, mentors and consent on submission', () => {
        const opts = { complete: true, competition: INSPACE_COMPETITION, config, leaderEmail: 'asha@rvce.edu.in' };
        expect(validateTeamPayload(payload(), opts)).toEqual({});
        const errors = validateTeamPayload(payload({
            year: 2027,
            categories: ['model-rocketry', 'model-rocketry'],
            members: [{ name: '', email: 'asha@rvce.edu.in' }, { name: 'B', linkedin: 'https://example.com/x' }],
            mentors: Array.from({ length: 5 }, (_, i) => ({ name: `M${i}` })),
            processingConsent: false,
        }), opts);
        expect(Object.keys(errors).sort()).toEqual(['categories', 'members.0.email', 'members.0.name', 'members.1.linkedin', 'mentors', 'processingConsent', 'year']);
        expect(errors['members.0.email']).toMatch(/team leader/);
    });

    it('lets drafts be incomplete and skips year checks for approved teams', () => {
        const draft = payload({ team: { name: '', college: '' }, processingConsent: false, year: 2025 });
        expect(validateTeamPayload(draft, { complete: false, competition: INSPACE_COMPETITION, config, leaderEmail: 'a@b.co', lockYearAndCategories: true })).toEqual({});
    });

    it('normalises LinkedIn links and refuses other sites', () => {
        expect(normalizeLinkedIn('linkedin.com/in/asha-rao')).toBe('https://linkedin.com/in/asha-rao');
        expect(normalizeLinkedIn('http://www.linkedin.com/in/asha')).toBe('https://www.linkedin.com/in/asha');
        expect(isLinkedInUrl('https://in.linkedin.com/in/asha-rao-123')).toBe(true);
        expect(isLinkedInUrl('https://linkedin.com.evil.test/in/x')).toBe(false);
        expect(isLinkedInUrl('javascript:alert(1)')).toBe(false);
    });

    it('keeps only known fields from the browser and strips control characters', () => {
        const p = normalizeTeamPayload({ team: { name: 'A\u0000B\nC', secret: 'x' }, leader: { name: 'L', isAdmin: true }, members: [{ name: 'M', role: 'Leader' }], extra: 1 });
        expect(p.team.name).toBe('A B C');
        expect(p.team).not.toHaveProperty('secret');
        expect(p.leader).not.toHaveProperty('isAdmin');
        expect(p.members[0]).not.toHaveProperty('role');
        expect(p).not.toHaveProperty('extra');
    });
});

describe('public data sanitiser', () => {
    const raw = {
        config: { availableYears: [2026], registrationOpen: true, registrationYears: [2026], defaultRegistrationYear: 2026, publicVisible: true, showRegisteredTeams: false, maxMentors: 4 },
        publicFileIds: ['FIL-ABCDEFGHJKLM'],
        teams: [
            {
                slug: 'team-astra-2026', year: 2026, name: 'Team Astra', college: 'RVCE',
                teamLogoFileId: 'FIL-ABCDEFGHJKLM', institutionLogoFileId: 'FIL-NOTPUBLIC234',
                categories: [{ categoryId: 'model-rocketry', participationVerified: true, winnerVerified: true, achievement: 'Winner' }, { categoryId: 'unknown', participationVerified: true }],
                people: [
                    { role: 'leader', name: 'Asha', email: 'asha@rvce.edu.in', phone: '+91 98450 12345', linkedin: 'https://www.linkedin.com/in/asha', photoFileId: 'FIL-ABCDEFGHJKLM', resumeFileId: 'FIL-RESUME234567' },
                    { role: 'member', name: 'Ravi', email: 'not-an-email', linkedin: 'javascript:alert(1)' },
                    { role: 'member', name: '' },
                ],
                mentors: [{ name: 'Dr. M', institution: 'IISc', linkedin: 'https://evil.test' }],
                privateNotes: 'never shown',
            },
            { slug: 'Bad Slug!', year: 2026, name: 'Broken', categories: [{ categoryId: 'model-rocketry', participationVerified: true }] },
            { slug: 'registered-only', year: 2026, name: 'Registered Only', categories: [{ categoryId: 'can-7usat', participationVerified: false }] },
        ],
        awards: [{ awardId: 'AWD-INSPACE-2026-CAN7USAT', title: 'EV Society CAN-7USAT Innovation Award 2026', status: 'Confirmed', pdfReference: 'javascript:alert(1)' }],
    };

    it('keeps only whitelisted, valid fields and media the backend listed as public', () => {
        const data = sanitizeSnapshot(raw, INSPACE_COMPETITION);
        expect(data.teams.map((t) => t.slug)).toEqual(['team-astra-2026']);
        const [team] = data.teams;
        expect(team).not.toHaveProperty('privateNotes');
        expect(team.teamLogoUrl).toBe('/api/competitions/media/inspace-model-rocketry-cansat/FIL-ABCDEFGHJKLM');
        expect(team.institutionLogoUrl).toBeNull();
        expect(team.categories).toEqual([{ categoryId: 'model-rocketry', participationVerified: true, winnerVerified: true, achievement: 'Winner' }]);
        expect(team.leader).toEqual({ role: 'leader', name: 'Asha', email: 'asha@rvce.edu.in', phone: '+91 98450 12345', linkedin: 'https://www.linkedin.com/in/asha', photoUrl: '/api/competitions/media/inspace-model-rocketry-cansat/FIL-ABCDEFGHJKLM' });
        expect(team.members).toEqual([{ role: 'member', name: 'Ravi', email: null, phone: null, linkedin: null, photoUrl: null }]);
        expect(team.mentors).toEqual([{ name: 'Dr. M', institution: 'IISc', linkedin: null, photoUrl: null }]);
        expect(JSON.stringify(data)).not.toContain('RESUME');
    });

    it('never labels a registered team as a participant', () => {
        const shown = sanitizeSnapshot({ ...raw, config: { ...raw.config, showRegisteredTeams: true } }, INSPACE_COMPETITION);
        const registered = shown.teams.find((t) => t.slug === 'registered-only')!;
        expect(stageOf(registered.categories[0])).toBe('registered');
        expect(stageOf({ categoryId: 'x', participationVerified: false, winnerVerified: true, achievement: '' })).toBe('registered');
    });

    it('hides everything when the directory is not public, and closes registration without a sheet row', () => {
        const hidden = sanitizeSnapshot({ ...raw, config: { ...raw.config, publicVisible: false } }, INSPACE_COMPETITION);
        expect(hidden.teams).toEqual([]);
        expect(hidden.publicFileIds).toEqual([]);
        expect(sanitizeSnapshot({ teams: [] }, INSPACE_COMPETITION).config.registrationOpen).toBe(false);
        expect(emptyCompetitionData(INSPACE_COMPETITION).awards).toHaveLength(2);
    });

    it('28, 29: award documents come only from published, safe references', () => {
        const awards = mergeAwards(INSPACE_COMPETITION, raw.awards);
        expect(awards.map((a) => [a.title, a.status, a.document])).toEqual([
            ['EV Society CAN-7USAT Innovation Award 2026', 'Confirmed', null],
            ['EV Society Model Rocketry Innovation Award 2026', 'Proposed', null],
        ]);
        expect(resolveDocument('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing')).toEqual({
            viewUrl: 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/preview',
            downloadUrl: 'https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOp',
            kind: 'drive',
        });
        expect(resolveDocument('/programs/space-innovation/award 2026.pdf')?.viewUrl).toBe('/programs/space-innovation/award%202026.pdf');
        for (const bad of ['//evil.test/x.pdf', '/../secret', 'http://insecure.test/x.pdf', 'javascript:alert(1)', 'data:application/pdf;base64,xx']) {
            expect(resolveDocument(bad)).toBeNull();
        }
    });
});

describe('sessions, uploads and signing', () => {
    const secret = 'session-secret-0123456789abcdef0123456789';

    it('signs session cookies and rejects tampered or expired ones', () => {
        const value = encodeSession(secret, 'asha@rvce.edu.in', 1_000);
        expect(decodeSession(secret, value, 2_000)).toEqual({ email: 'asha@rvce.edu.in', exp: 1_000 + 4 * 3600 * 1000 });
        const [body, sig] = value.split('.');
        const forged = Buffer.from(JSON.stringify({ email: 'admin@evsociety.org', exp: 9e15 })).toString('base64url');
        expect(decodeSession(secret, `${forged}.${sig}`, 2_000)).toBeNull();
        expect(decodeSession('another-secret-0123456789abcdef01234', value, 2_000)).toBeNull();
        expect(decodeSession(secret, value, 1_000 + 5 * 3600 * 1000)).toBeNull();
        expect(decodeSession(secret, body, 2_000)).toBeNull();
    });

    it('detects file types from bytes, not names', () => {
        expect(sniffMime(new Uint8Array(JPEG))).toBe('image/jpeg');
        expect(sniffMime(new Uint8Array(PNG))).toBe('image/png');
        expect(sniffMime(new Uint8Array(PDF))).toBe('application/pdf');
        expect(checkUpload('resume', new Uint8Array(JPEG))).toEqual({ ok: false, message: 'Upload the resume as a PDF file.' });
        expect(checkUpload('member-photo', new Uint8Array(PDF)).ok).toBe(false);
        expect(checkUpload('member-photo', new Uint8Array(Buffer.concat([JPEG, Buffer.alloc(4 * 1024 * 1024)])))).toEqual({ ok: false, message: 'This file is larger than 3 MB.' });
        expect(checkUpload('team-logo', new Uint8Array(PNG))).toEqual({ ok: true, mime: 'image/png' });
    });

    it('escapes non-ASCII so both sides sign identical bytes', () => {
        expect(asciiJson({ name: 'Sūrya ₹' })).toBe('{"name":"S\\u016brya \\u20b9"}');
    });

    it('accepts only fresh, correctly signed refresh notices', () => {
        const body = '{"competitionId":"inspace-model-rocketry-cansat"}';
        const ts = String(1_700_000_000_000);
        const sig = signWebhook(secret, ts, body);
        expect(verifyWebhook(secret, ts, body, sig, 1_700_000_000_000)).toBe(true);
        expect(verifyWebhook(secret, ts, body, sig, 1_700_000_000_000 + 6 * 60 * 1000)).toBe(false);
        expect(verifyWebhook(secret, ts, body.replace('inspace', 'other'), sig, 1_700_000_000_000)).toBe(false);
        expect(verifyWebhook('', ts, body, sig, 1_700_000_000_000)).toBe(false);
    });
});

describe('30: a new competition is configuration, not code', () => {
    it('runs the same validation and sanitiser for a drone competition', () => {
        const opts = { complete: true, competition: DRONE_COMPETITION, config: { registrationYears: [2027], maxMentors: 2, maxMembers: 4 }, leaderEmail: 'pilot@nitk.edu.in' };
        const ok = normalizeTeamPayload({ year: 2027, categories: ['autonomy'], team: { name: 'Sky', college: 'NITK' }, leader: { name: 'P', phone: '+91 98450 22222' }, members: [{ name: 'A' }], processingConsent: true });
        expect(validateTeamPayload(ok, opts)).toEqual({});
        const tooBig = { ...ok, members: ['A', 'B', 'C', 'D'].map((name) => ({ ...ok.members[0], name })), categories: ['model-rocketry'] };
        expect(Object.keys(validateTeamPayload(tooBig, opts)).sort()).toEqual(['categories', 'members']);
        const data = sanitizeSnapshot({ config: { availableYears: [2027], registrationYears: [2027], registrationOpen: true, publicVisible: true }, teams: [{ slug: 'sky-2027', year: 2027, name: 'Sky', categories: [{ categoryId: 'autonomy', participationVerified: true }] }] }, DRONE_COMPETITION);
        expect(data.teams[0].slug).toBe('sky-2027');
        expect(data.awards).toEqual([]);
    });
});
