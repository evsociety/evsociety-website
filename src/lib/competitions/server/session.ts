import 'server-only';
import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';
import { safeEqualHex } from './envelope';
import { sessionSecret } from './env';

// A team leader's sign-in after confirming an emailed code. The cookie holds only the verified
// email and expiry, signed with COMPETITION_SESSION_SECRET; it is httpOnly and not readable by
// page scripts. Every team action is re-authorised by the backend against the team's leader.

export const SESSION_COOKIE = 'evs_team_session';
const SESSION_HOURS = 4;

export interface TeamSession {
    email: string;
    exp: number;
}

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');

export function encodeSession(secret: string, email: string, now = Date.now()): string {
    const body = b64url(JSON.stringify({ email, exp: now + SESSION_HOURS * 3600 * 1000 }));
    const sig = createHmac('sha256', secret).update(`session.${body}`).digest('hex');
    return `${body}.${sig}`;
}

export function decodeSession(secret: string, value: string | undefined, now = Date.now()): TeamSession | null {
    if (!value || value.length > 2000) return null;
    const [body, sig] = value.split('.');
    if (!body || !sig) return null;
    const expected = createHmac('sha256', secret).update(`session.${body}`).digest('hex');
    if (!safeEqualHex(expected, sig)) return null;
    try {
        const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (typeof parsed.email !== 'string' || typeof parsed.exp !== 'number' || parsed.exp < now) return null;
        return { email: parsed.email, exp: parsed.exp };
    } catch {
        return null;
    }
}

export async function getTeamSession(): Promise<TeamSession | null> {
    const secret = sessionSecret();
    if (!secret) return null;
    const store = await cookies();
    return decodeSession(secret, store.get(SESSION_COOKIE)?.value);
}

export async function startTeamSession(email: string) {
    const secret = sessionSecret();
    if (!secret) throw new Error('Session secret not configured');
    const store = await cookies();
    store.set(SESSION_COOKIE, encodeSession(secret, email), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_HOURS * 3600,
    });
}

export async function endTeamSession() {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
}
