import 'server-only';
import { apiSecret, backendMode } from './env';
import { signEnvelope, type BackendRequest } from './envelope';

export class BackendError extends Error {
    code: string;
    status: number;
    fields: Record<string, string> | null;
    details: Record<string, unknown> | null;
    retryAfter: number | null;

    constructor(code: string, message: string, extra: { fields?: Record<string, string> | null; details?: Record<string, unknown> | null; retryAfter?: number | null } = {}) {
        super(message);
        this.code = code;
        this.status = STATUS[code] ?? 500;
        this.fields = extra.fields ?? null;
        this.details = extra.details ?? null;
        this.retryAfter = extra.retryAfter ?? null;
    }
}

const STATUS: Record<string, number> = {
    VALIDATION: 422,
    INVALID_CODE: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    DUPLICATE_LEADER: 409,
    DUPLICATE_TEAM: 409,
    LOCKED: 423,
    CLOSED: 403,
    RATE_LIMITED: 429,
    PAYLOAD_TOO_LARGE: 413,
    BUSY: 503,
    UNAVAILABLE: 503,
    NOT_CONFIGURED: 503,
    SETUP_REQUIRED: 503,
    INTERNAL: 500,
    UNKNOWN_ACTION: 500,
};

// Messages the backend may return that are safe to show; anything else gets a generic message
const SAFE_CODES = new Set(['VALIDATION', 'INVALID_CODE', 'NOT_FOUND', 'CONFLICT', 'DUPLICATE_LEADER', 'DUPLICATE_TEAM', 'LOCKED', 'CLOSED', 'RATE_LIMITED', 'PAYLOAD_TOO_LARGE', 'BUSY', 'UNAVAILABLE', 'UNAUTHORIZED']);

async function callAppsScript(request: BackendRequest): Promise<any> {
    const envelope = signEnvelope(apiSecret(), request);
    let res: Response;
    try {
        res = await fetch(process.env.COMPETITION_API_URL as string, {
            method: 'POST',
            // text/plain avoids a CORS preflight and is what Apps Script expects
            headers: { 'content-type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(envelope),
            redirect: 'follow',
            cache: 'no-store',
            signal: AbortSignal.timeout(25_000),
        });
    } catch (err) {
        console.error('[competitions] backend unreachable', request.action, err);
        throw new BackendError('UNAVAILABLE', 'The registration service is temporarily unavailable. Please try again shortly.');
    }
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        console.error('[competitions] backend returned a non-JSON response', request.action, res.status, text.slice(0, 200));
        throw new BackendError('UNAVAILABLE', 'The registration service is temporarily unavailable. Please try again shortly.');
    }
}

export async function callBackend<T = any>(action: string, params: Record<string, unknown>, ctx: BackendRequest['ctx'] = {}): Promise<T> {
    const mode = backendMode();
    if (mode === 'unconfigured') throw new BackendError('NOT_CONFIGURED', 'Team registration is not available yet.');
    const request: BackendRequest = { action, params, ctx };
    let response: any;
    if (mode === 'local') {
        const { callLocalBackend } = await import('./localBackend');
        response = await callLocalBackend(request);
    } else {
        response = await callAppsScript(request);
    }
    if (response?.ok === true) return response.data as T;
    const error = response?.error ?? {};
    const code = typeof error.code === 'string' ? error.code : 'INTERNAL';
    if (!SAFE_CODES.has(code)) console.error('[competitions] backend error', action, code, error.message);
    throw new BackendError(code, SAFE_CODES.has(code) && typeof error.message === 'string' ? error.message : 'Something went wrong on our side. Please try again.', {
        fields: error.fields && typeof error.fields === 'object' ? error.fields : null,
        details: error.details && typeof error.details === 'object' ? error.details : null,
        retryAfter: typeof error.retryAfter === 'number' ? error.retryAfter : null,
    });
}
