import 'server-only';
import { ApiError } from './http';
import { registrationAvailable } from './env';
import { getTeamSession } from './session';

export function requireRegistrationService() {
    if (!registrationAvailable()) throw new ApiError(503, 'NOT_CONFIGURED', 'Team registration is not available yet. Please check back soon.');
}

export async function requireLeaderSession() {
    requireRegistrationService();
    const session = await getTeamSession();
    if (!session) throw new ApiError(401, 'UNAUTHORIZED', 'Please confirm your email to continue.');
    return session;
}

const TEAM_ID_RE = /^EVS-[2-9A-HJ-NP-Z]{6}$/;
const FILE_ID_RE = /^FIL-[2-9A-HJ-NP-Z]{12}$/;

export function requireTeamId(value: string) {
    if (!TEAM_ID_RE.test(value)) throw new ApiError(404, 'NOT_FOUND', 'Team not found.');
    return value;
}

export function requireFileId(value: string) {
    if (!FILE_ID_RE.test(value)) throw new ApiError(404, 'NOT_FOUND', 'File not found.');
    return value;
}
