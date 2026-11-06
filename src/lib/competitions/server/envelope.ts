// Signed requests between the website server and the Apps Script backend.
// Website → Apps Script: HMAC-SHA256 over kind, timestamp, nonce and payload (evscVerifyEnvelope).
// Apps Script → website: the refresh webhook signs "timestamp.body" with the same secret.

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ENVELOPE_KIND = 'evs-competition-v1';

export interface BackendRequest {
    action: string;
    params: Record<string, unknown>;
    ctx: { actorEmail?: string; ip?: string };
}

/** JSON with non-ASCII characters escaped, so both sides sign exactly the same bytes */
export function asciiJson(value: unknown): string {
    return JSON.stringify(value).replace(/[\u007f-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

export function signEnvelope(secret: string, request: BackendRequest, ts = Date.now(), nonce = randomBytes(16).toString('hex')) {
    const payload = asciiJson(request);
    const sig = createHmac('sha256', secret).update([ENVELOPE_KIND, ts, nonce, payload].join('\n'), 'utf8').digest('hex');
    return { kind: ENVELOPE_KIND, ts, nonce, payload, sig };
}

export function safeEqualHex(a: string, b: string): boolean {
    if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b) || a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

export function signWebhook(secret: string, ts: string, body: string) {
    return createHmac('sha256', secret).update(`${ts}.${body}`, 'utf8').digest('hex');
}

/** Accepts a refresh notice only if it is signed and less than five minutes old */
export function verifyWebhook(secret: string, ts: string | null, body: string, signature: string | null, now = Date.now()): boolean {
    if (!secret || !ts || !signature || !/^\d{10,16}$/.test(ts)) return false;
    if (Math.abs(now - Number(ts)) > 5 * 60 * 1000) return false;
    return safeEqualHex(signWebhook(secret, ts, body), signature);
}
