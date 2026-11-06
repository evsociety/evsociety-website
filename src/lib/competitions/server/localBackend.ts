import 'server-only';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createAppsScriptRuntime, createStore, type HarnessStore } from '../backend/appsScriptHarness';
import { signEnvelope, type BackendRequest } from './envelope';
import { localDataDir, localSecrets } from './localSecrets';

// Development backend: runs the real Apps Script against a local spreadsheet copy stored in
// .data/competition-dev/store.json. Emails are printed to the terminal instead of being sent.

// Who the local "spreadsheet owner" is; review edits made with scripts/competition-dev-admin.ts
// act as this account, which is the default reviewer
export const LOCAL_OWNER = 'evsociety.org@gmail.com';

function storeFile() {
    return path.join(localDataDir(), 'store.json');
}

export function loadLocalStore(): HarnessStore {
    const file = storeFile();
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
    return initialiseStore();
}

export function saveLocalStore(store: HarnessStore) {
    const file = storeFile();
    mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(store));
    renameSync(tmp, file);
}

function initialiseStore(): HarnessStore {
    const store = createStore();
    const { apiSecret } = localSecrets();
    store.properties.EVSC_API_SECRET = apiSecret;
    store.properties.EVSC_SITE_URL = process.env.COMPETITION_DEV_SITE_URL || 'http://localhost:3123';
    store.properties.EVSC_REVALIDATE_URLS = `${store.properties.EVSC_SITE_URL}/api/competitions/revalidate`;
    store.mailQuota = 1000;
    createAppsScriptRuntime(store, { quiet: true, effectiveUser: LOCAL_OWNER }).call('evsCompetitionSetup');
    saveLocalStore(store);
    return store;
}

function printMail(store: HarnessStore, from: number) {
    for (const mail of store.outbox.slice(from)) {
        console.log(`\n[competition dev mail] To: ${mail.to}\nSubject: ${mail.subject}\n${mail.body}\n`);
    }
}

let queue: Promise<unknown> = Promise.resolve();

export function callLocalBackend(request: BackendRequest): Promise<any> {
    // One request at a time, like the script lock in Apps Script
    const run = queue.then(() => {
        const store = loadLocalStore();
        const sent = store.outbox.length;
        const runtime = createAppsScriptRuntime(store, { quiet: true, effectiveUser: LOCAL_OWNER });
        const result = runtime.call('evscHandleEnvelope', signEnvelope(localSecrets().apiSecret, request));
        // Keep the local store small: the outbox and fetch log only need recent entries
        printMail(store, sent);
        store.outbox = store.outbox.slice(-200);
        store.fetches = store.fetches.slice(-50);
        saveLocalStore(store);
        return result;
    });
    queue = run.catch(() => undefined);
    return run;
}
