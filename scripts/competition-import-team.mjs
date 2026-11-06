#!/usr/bin/env node
// Imports one team record supplied by EV Society (for example an official winner whose leader
// has not registered) into the competition spreadsheet, through the same Apps Script backend.
//
//   npm run competitions:import -- .data/competition-imports/<file>.json             (local data)
//   npm run competitions:import -- .data/competition-imports/<file>.json --production
//
// The import is create-only: if the team already exists (same competition, year and team code
// or name) nothing changes. Everything starts unapproved; reviewers then approve the profile,
// the photograph, participation and winner status in the sheet, exactly as for any team.
// --production writes to the live spreadsheet and needs COMPETITION_API_URL and
// COMPETITION_API_SECRET in the environment. Keep import files out of git: they hold
// personal data that is not yet approved for publication.

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createAppsScriptRuntime } from '../src/lib/competitions/backend/appsScriptHarness.ts';
import { signEnvelope } from '../src/lib/competitions/server/envelope.ts';
import { imageSize } from '../src/lib/competitions/imageSize.ts';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const production = args.includes('--production');
if (!file) {
    console.error('Usage: npm run competitions:import -- <import.json> [--production]');
    process.exit(1);
}
const spec = JSON.parse(readFileSync(file, 'utf8'));
const dir = path.dirname(path.resolve(file));

const attach = (entry) => {
    if (!entry?.path) return undefined;
    const bytes = readFileSync(path.resolve(dir, entry.path));
    const dims = imageSize(new Uint8Array(bytes));
    return { ...entry, path: undefined, name: path.basename(entry.path), base64: bytes.toString('base64'), width: dims?.width ?? null, height: dims?.height ?? null };
};
const params = { ...spec, teamPhoto: attach(spec.teamPhoto), teamPhotoOriginal: attach(spec.teamPhotoOriginal) };
const request = { action: 'admin.importTeam', params, ctx: { admin: true, actorEmail: process.env.COMPETITION_IMPORT_BY || 'evsociety.org@gmail.com' } };

let result;
if (production) {
    const url = process.env.COMPETITION_API_URL;
    const secret = process.env.COMPETITION_API_SECRET;
    if (!url || !secret) {
        console.error('Set COMPETITION_API_URL and COMPETITION_API_SECRET to import into the live spreadsheet.');
        process.exit(1);
    }
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(signEnvelope(secret, request)), redirect: 'follow' });
    result = await res.json();
} else {
    const storeFile = path.join(process.env.COMPETITION_DEV_DATA_DIR || path.join(process.cwd(), '.data', 'competition-dev'), 'store.json');
    if (!existsSync(storeFile)) {
        console.error('No local competition data yet. Start the dev server and open a competition page first.');
        process.exit(1);
    }
    const store = JSON.parse(readFileSync(storeFile, 'utf8'));
    const rt = createAppsScriptRuntime(store, { quiet: true, effectiveUser: 'evsociety.org@gmail.com' });
    const send = () => rt.call('evscHandleEnvelope', signEnvelope(store.properties.EVSC_API_SECRET, request));
    result = send();
    if (result?.error?.code === 'SETUP_REQUIRED') {
        rt.call('evsCompetitionSetup');
        result = send();
    }
    const tmp = `${storeFile}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(store));
    renameSync(tmp, storeFile);
}

if (!result?.ok) {
    console.error('Import failed:', result?.error?.message ?? result, result?.error?.fields ?? '');
    process.exit(1);
}
const { created, teamId, slug } = result.data;
console.log(created ? `Imported ${spec.teamName} as ${teamId} (${slug}). It is pending review in the sheet.` : `${spec.teamName} already exists as ${teamId} (${slug}); nothing was changed.`);
