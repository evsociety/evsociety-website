#!/usr/bin/env node
// Local stand-in for reviewing in Google Sheets. Edits the local development spreadsheet
// (.data/competition-dev/store.json) exactly as a reviewer would, running the real review
// trigger from google-apps-script/competition-platform.js, then asks the local site to refresh.
//
//   npm run competitions:dev-admin -- list
//   npm run competitions:dev-admin -- approve EVS-ABC234            (approve + profile + publication)
//   npm run competitions:dev-admin -- participant EVS-ABC234 model-rocketry
//   npm run competitions:dev-admin -- winner EVS-ABC234 can-7usat "First place"
//   npm run competitions:dev-admin -- changes                       (list change requests)
//   npm run competitions:dev-admin -- decide CHG-XXXX Approved|Rejected|"Changes Requested"
//   npm run competitions:dev-admin -- set Teams EVS-ABC234 "Registration Status" Rejected
//   npm run competitions:dev-admin -- mail [count]                  (recent emails: codes, consent links)
//
// Never used in production; real reviews happen in the spreadsheet.

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createAppsScriptRuntime } from '../src/lib/competitions/backend/appsScriptHarness.ts';

const DIR = process.env.COMPETITION_DEV_DATA_DIR || path.join(process.cwd(), '.data', 'competition-dev');
const FILE = path.join(DIR, 'store.json');
const OWNER = 'evsociety.org@gmail.com';
const ID = { Teams: 'Team ID', Team_Categories: 'Association ID', Members: 'Member ID', Awards: 'Award ID', Change_Requests: 'Change Request ID', Competitions: 'Competition ID' };

if (!existsSync(FILE)) {
    console.error('No local competition data yet. Start the dev server and open a competition page first.');
    process.exit(1);
}
const store = JSON.parse(readFileSync(FILE, 'utf8'));
const rt = createAppsScriptRuntime(store, { quiet: true, effectiveUser: OWNER });
const fetchesBefore = store.fetches.length;
const [command, ...args] = process.argv.slice(2);

const save = () => {
    const tmp = `${FILE}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(store));
    renameSync(tmp, FILE);
};

const edit = (tab, id, column, value) => {
    const res = rt.edit(tab, ID[tab], id, column, value, OWNER);
    console.log(`${tab} ${id} · ${column} = ${res.value}${res.note ? `  (not applied: ${res.note.replace(/^Change not applied \([^)]*\): /, '')})` : ''}`);
};

const association = (teamId, categoryId) => {
    const row = rt.rows('Team_Categories').find((r) => r['Team ID'] === teamId && r['Category ID'] === categoryId);
    if (!row) throw new Error(`Team ${teamId} is not registered for ${categoryId}`);
    return String(row['Association ID']);
};

switch (command) {
    case 'list': {
        const cats = rt.rows('Team_Categories');
        for (const t of rt.rows('Teams')) {
            const c = cats.filter((x) => x['Team ID'] === t['Team ID']).map((x) => `${x['Category ID']}[${x['Participation Verified'] === 'Yes' ? 'P' : '-'}${x['Winner Verified'] === 'Yes' ? 'W' : '-'}]`).join(' ');
            console.log(`${t['Team ID']}  ${String(t['Team Name'] || '(untitled)').padEnd(28)} ${t['Year']}  ${String(t['Registration Status']).padEnd(18)} profile:${t['Profile Approved']} publish:${t['Publication Approved']} consent:${t['Publication Consent']}  ${c}  ${t['Profile Publication Status']}`);
        }
        break;
    }
    case 'approve':
        edit('Teams', args[0], 'Registration Status', 'Approved');
        edit('Teams', args[0], 'Profile Approved', 'Yes');
        edit('Teams', args[0], 'Publication Approved', 'Yes');
        break;
    case 'participant':
        edit('Team_Categories', association(args[0], args[1]), 'Participation Verified', 'Yes');
        break;
    case 'winner':
        edit('Team_Categories', association(args[0], args[1]), 'Winner Verified', 'Yes');
        if (args[2]) edit('Team_Categories', association(args[0], args[1]), 'Achievement', args[2]);
        break;
    case 'changes':
        for (const cr of rt.rows('Change_Requests')) console.log(`${cr['Change Request ID']}  ${cr['Team ID']}  ${cr['Review Status']}\n  ${String(cr['Summary of Changes']).replace(/\n/g, '\n  ')}`);
        break;
    case 'decide':
        edit('Change_Requests', args[0], 'Review Status', args[1]);
        break;
    case 'set':
        edit(args[0], args[1], args[2], args[3] ?? '');
        break;
    case 'mail':
        for (const m of store.outbox.slice(-(Number(args[0]) || 3))) console.log(`\nTo: ${m.to}\nSubject: ${m.subject}\n${m.body}`);
        break;
    default:
        console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 16).join('\n'));
        process.exit(command ? 1 : 0);
}

save();
// Replay the website-refresh calls the trigger made, so the local site updates at once
for (const call of store.fetches.slice(fetchesBefore)) {
    try {
        const res = await fetch(call.url, { method: 'POST', headers: { 'content-type': 'application/json', ...call.headers }, body: call.payload });
        console.log(`website refresh: ${res.status}`);
    } catch {
        console.log('website refresh skipped (dev server not running)');
    }
}
