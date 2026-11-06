import 'server-only';
import { NextResponse } from 'next/server';
import { getCompetition, type CompetitionDefinition } from '@/config/competitions';
import { BackendError } from './backend';

// Small helpers shared by the competition API routes

export class ApiError extends Error {
    status: number;
    code: string;
    fields: Record<string, string> | null;
    details: Record<string, unknown> | null;
    constructor(status: number, code: string, message: string, fields: Record<string, string> | null = null, details: Record<string, unknown> | null = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = fields;
        this.details = details;
    }
}

const NO_STORE = { 'Cache-Control': 'no-store, private' };

export function ok(body: unknown, init: ResponseInit = {}) {
    return NextResponse.json(body, { ...init, headers: { ...NO_STORE, ...(init.headers ?? {}) } });
}

export function fail(err: unknown) {
    if (err instanceof ApiError || err instanceof BackendError) {
        const headers: Record<string, string> = { ...NO_STORE };
        if (err instanceof BackendError && err.retryAfter) headers['Retry-After'] = String(err.retryAfter);
        return NextResponse.json({ error: { code: err.code, message: err.message, fields: err.fields, details: err.details } }, { status: err.status, headers });
    }
    console.error('[competitions] unexpected API error', err);
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Something went wrong on our side. Please try again.' } }, { status: 500, headers: NO_STORE });
}

/** Wraps a route handler so thrown errors become JSON responses */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
    return async (...args: A) => {
        try {
            return await fn(...args);
        } catch (err) {
            return fail(err);
        }
    };
}

export function requireCompetition(id: string): CompetitionDefinition {
    const competition = getCompetition(id);
    if (!competition) throw new ApiError(404, 'NOT_FOUND', 'Competition not found.');
    return competition;
}

/**
 * Blocks cross-site form posts: state-changing requests must come from this site. Browsers
 * always send Origin on POST/PUT/DELETE from scripts; a mismatch is refused.
 */
export function requireSameOrigin(request: Request) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    if (!origin || !host) throw new ApiError(403, 'FORBIDDEN', 'This request was blocked.');
    let originHost: string;
    try {
        originHost = new URL(origin).host;
    } catch {
        throw new ApiError(403, 'FORBIDDEN', 'This request was blocked.');
    }
    if (originHost !== host) throw new ApiError(403, 'FORBIDDEN', 'This request was blocked.');
}

export async function readJson(request: Request, maxBytes = 200_000): Promise<Record<string, unknown>> {
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
        throw new ApiError(415, 'UNSUPPORTED', 'Expected a JSON request.');
    }
    const text = await request.text();
    if (text.length > maxBytes) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'This request is too large.');
    try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
        return parsed;
    } catch {
        throw new ApiError(400, 'BAD_REQUEST', 'The request could not be read.');
    }
}

export function clientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '';
    return ip.slice(0, 64);
}

type Bucket = { count: number; reset: number };
const buckets = (): Map<string, Bucket> => {
    const g = globalThis as { __evscRateLimits?: Map<string, Bucket> };
    return (g.__evscRateLimits ??= new Map());
};

/**
 * First-line, per-server-instance rate limit. The backend keeps the authoritative limits
 * (per email and per IP, shared across all instances) in Apps Script's cache.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
    const map = buckets();
    const now = Date.now();
    const bucket = map.get(key);
    if (!bucket || bucket.reset < now) {
        map.set(key, { count: 1, reset: now + windowMs });
        if (map.size > 5000) for (const [k, b] of map) if (b.reset < now) map.delete(k);
        return;
    }
    bucket.count += 1;
    if (bucket.count > limit) throw new ApiError(429, 'RATE_LIMITED', 'Too many attempts. Please wait a few minutes and try again.');
}
