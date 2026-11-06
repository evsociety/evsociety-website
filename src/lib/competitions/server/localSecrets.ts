import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Secrets for local development only, generated once per checkout in .data (gitignored)

export function localDataDir(): string {
    return process.env.COMPETITION_DEV_DATA_DIR || path.join(process.cwd(), '.data', 'competition-dev');
}

export function localSecrets(): { apiSecret: string; sessionSecret: string } {
    const g = globalThis as { __evscLocalSecrets?: { apiSecret: string; sessionSecret: string } };
    if (g.__evscLocalSecrets) return g.__evscLocalSecrets;
    const dir = localDataDir();
    const file = path.join(dir, 'secrets.json');
    let secrets: { apiSecret: string; sessionSecret: string };
    if (existsSync(file)) {
        secrets = JSON.parse(readFileSync(file, 'utf8'));
    } else {
        mkdirSync(dir, { recursive: true });
        secrets = { apiSecret: randomBytes(32).toString('hex'), sessionSecret: randomBytes(32).toString('hex') };
        writeFileSync(file, JSON.stringify(secrets, null, 2), { mode: 0o600 });
    }
    g.__evscLocalSecrets = secrets;
    return secrets;
}
