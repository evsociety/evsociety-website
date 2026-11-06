import { createAppsScriptRuntime, createStore } from '@/lib/competitions/backend/appsScriptHarness';
import { signEnvelope } from '@/lib/competitions/server/envelope';

export const OWNER = 'evsociety.org@gmail.com';
export const COMPETITION = 'inspace-model-rocketry-cansat';
export const SECRET = 'test-api-secret-0123456789abcdef0123456789abcdef';

// Smallest byte sequences that pass the file-type checks (padded past the 64-byte minimum)
const pad = (head: number[], size = 200) => Buffer.from([...head, ...new Array(size).fill(0x20)]);
export const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
export const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
export const PDF = Buffer.concat([Buffer.from('%PDF-1.4\n'), pad([], 200)]);

export interface MemberSpec {
    name: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    photo?: boolean;
    resume?: boolean;
    under18?: boolean;
}

export function setupBackend() {
    const store = createStore();
    store.properties.EVSC_API_SECRET = SECRET;
    store.properties.EVSC_SITE_URL = 'https://www.evsociety.test';
    store.properties.EVSC_REVALIDATE_URLS = 'https://www.evsociety.test/api/competitions/revalidate';
    store.mailQuota = 10_000;
    let clock = Date.parse('2026-11-06T09:00:00Z');
    const rt = createAppsScriptRuntime(store, { quiet: true, effectiveUser: OWNER, now: () => clock });
    rt.call('evsCompetitionSetup');

    const send = (action: string, params: Record<string, unknown>, ctx: Record<string, string> = {}) =>
        rt.call('evscHandleEnvelope', signEnvelope(SECRET, { action, params, ctx }, clock));

    const ok = (action: string, params: Record<string, unknown>, ctx: Record<string, string> = {}) => {
        const res = send(action, params, ctx);
        if (!res.ok) throw Object.assign(new Error(`${action} failed: ${res.error.code} ${res.error.message} ${JSON.stringify(res.error.fields)}`), { error: res.error });
        return res.data;
    };

    const fail = (action: string, params: Record<string, unknown>, ctx: Record<string, string> = {}) => {
        const res = send(action, params, ctx);
        if (res.ok) throw new Error(`${action} unexpectedly succeeded`);
        return res.error as { code: string; message: string; fields: Record<string, string> | null; details: any };
    };

    const lastMailTo = (email: string) => [...store.outbox].reverse().find((m) => m.to === email);

    const signIn = (email: string, ip = '203.0.113.7') => {
        ok('auth.requestCode', { email }, { ip });
        const code = /code is (\d{6})/.exec(lastMailTo(email.toLowerCase())!.body)![1];
        return ok('auth.verifyCode', { email, code }, { ip }).email as string;
    };

    const upload = (email: string, teamId: string, kind: string, bytes: Buffer = kind === 'resume' ? PDF : JPEG) =>
        ok('files.upload', { competitionId: COMPETITION, teamId, kind, base64: bytes.toString('base64'), originalName: `${kind}.bin` }, { actorEmail: email }).file;

    /** A complete registration from sign-in to submission */
    const registerTeam = (opts: {
        leaderEmail: string;
        leaderName?: string;
        year?: number;
        categories?: string[];
        name?: string;
        college?: string;
        members?: MemberSpec[];
        mentors?: { name: string; institution?: string; linkedin?: string; listingConsent?: boolean; photo?: boolean }[];
        leaderPhoto?: boolean;
        leaderResume?: boolean;
        leaderLinkedin?: string;
        leaderPermissions?: Partial<Record<'photo' | 'linkedin' | 'email' | 'phone', boolean>>;
        publicationConsent?: boolean;
        submit?: boolean;
    }) => {
        const email = signIn(opts.leaderEmail);
        const draft = ok('teams.createDraft', {
            competitionId: COMPETITION,
            year: opts.year ?? 2026,
            categories: opts.categories ?? ['model-rocketry'],
            leader: { name: opts.leaderName ?? 'Asha Rao', phone: '+91 98450 12345' },
        }, { actorEmail: email, ip: '203.0.113.7' }).team;
        const teamId = draft.teamId as string;
        const file = (kind: string, want?: boolean) => (want ? upload(email, teamId, kind).fileId : '');
        const data = {
            year: opts.year ?? 2026,
            categories: opts.categories ?? ['model-rocketry'],
            team: { name: opts.name ?? 'Team Astra', college: opts.college ?? 'RV College of Engineering', institutionLogoFileId: '', teamLogoFileId: file('team-logo', true), teamPhotoFileId: '', teamPhotoConsent: false },
            leader: { name: opts.leaderName ?? 'Asha Rao', phone: '+91 98450 12345', linkedin: opts.leaderLinkedin ?? 'https://www.linkedin.com/in/asha-rao', photoFileId: file('member-photo', opts.leaderPhoto ?? true), resumeFileId: file('resume', opts.leaderResume ?? true), under18: false },
            members: (opts.members ?? []).map((m) => ({
                name: m.name, email: m.email ?? '', phone: m.phone ?? '', linkedin: m.linkedin ?? '',
                photoFileId: file('member-photo', m.photo), resumeFileId: file('resume', m.resume), under18: m.under18 ?? false,
            })),
            mentors: (opts.mentors ?? []).map((m) => ({ name: m.name, institution: m.institution ?? '', linkedin: m.linkedin ?? '', photoFileId: file('mentor-photo', m.photo), listingConsent: m.listingConsent ?? true })),
            leaderPermissions: { photo: true, linkedin: true, email: false, phone: false, ...(opts.leaderPermissions ?? {}) },
            publicationConsent: opts.publicationConsent ?? true,
            processingConsent: true,
        };
        const saved = ok('teams.save', { competitionId: COMPETITION, teamId, data, submit: opts.submit ?? true, expectedVersion: draft.version }, { actorEmail: email });
        return { email, teamId, team: saved.team, outcome: saved.outcome, data };
    };

    const review = (tab: string, idColumn: string, id: string, column: string, value: string, user = OWNER) => rt.edit(tab, idColumn, id, column, value, user);

    const categoryRow = (teamId: string, categoryId: string) => rt.rows('Team_Categories').find((r) => r['Team ID'] === teamId && r['Category ID'] === categoryId)!;

    /** Approve, allow publication, and verify participation in the given categories */
    const publish = (teamId: string, participation: string[] = [], winners: string[] = []) => {
        review('Teams', 'Team ID', teamId, 'Registration Status', 'Approved');
        review('Teams', 'Team ID', teamId, 'Profile Approved', 'Yes');
        review('Teams', 'Team ID', teamId, 'Publication Approved', 'Yes');
        participation.forEach((c) => review('Team_Categories', 'Association ID', String(categoryRow(teamId, c)['Association ID']), 'Participation Verified', 'Yes'));
        winners.forEach((c) => review('Team_Categories', 'Association ID', String(categoryRow(teamId, c)['Association ID']), 'Winner Verified', 'Yes'));
    };

    const snapshot = (competitionId = COMPETITION) => ok('public.snapshot', { competitionId });

    return {
        store, rt, send, ok, fail, signIn, upload, registerTeam, review, publish, snapshot, categoryRow, lastMailTo,
        advance: (ms: number) => { clock += ms; },
        now: () => clock,
    };
}

export type Backend = ReturnType<typeof setupBackend>;
