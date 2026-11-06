import 'server-only';
import { localSecrets } from './localSecrets';

// Where competition data lives:
//  - "apps-script": the Google Apps Script bound to the EV Society spreadsheet (production)
//  - "local": the same Apps Script code run on this machine against a local copy of the
//    spreadsheet in .data/competition-dev (development only; never on Vercel)
//  - "unconfigured": nothing set up yet; pages show their empty states and registration
//    reports that it is not open
export type BackendMode = 'apps-script' | 'local' | 'unconfigured';

const MIN_SECRET = 32;

export function backendMode(): BackendMode {
    const url = process.env.COMPETITION_API_URL;
    const secret = process.env.COMPETITION_API_SECRET ?? '';
    if (url && /^https:\/\//.test(url) && secret.length >= MIN_SECRET) return 'apps-script';
    if (process.env.VERCEL) return 'unconfigured';
    if (process.env.COMPETITION_DATA_BACKEND === 'local' || process.env.NODE_ENV === 'development') return 'local';
    return 'unconfigured';
}

export function apiSecret(): string {
    const mode = backendMode();
    if (mode === 'apps-script') return process.env.COMPETITION_API_SECRET as string;
    if (mode === 'local') return localSecrets().apiSecret;
    return '';
}

/** Signs team-leader session cookies; separate from the API secret */
export function sessionSecret(): string | null {
    const mode = backendMode();
    if (mode === 'local') return process.env.COMPETITION_SESSION_SECRET || localSecrets().sessionSecret;
    const secret = process.env.COMPETITION_SESSION_SECRET ?? '';
    return secret.length >= MIN_SECRET ? secret : null;
}

/** Team registration needs both a backend and a session secret */
export function registrationAvailable(): boolean {
    return backendMode() !== 'unconfigured' && !!sessionSecret();
}
