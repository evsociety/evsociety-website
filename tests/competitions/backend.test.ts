// End-to-end tests of the Apps Script backend (google-apps-script/competition-platform.js),
// run against an in-memory spreadsheet. Numbers in test names refer to the acceptance tests in
// the platform brief.

import { describe, expect, it } from 'vitest';
import { signEnvelope, verifyWebhook } from '@/lib/competitions/server/envelope';
import { createAppsScriptRuntime, createStore } from '@/lib/competitions/backend/appsScriptHarness';
import { COMPETITION, OWNER, PDF, SECRET, setupBackend } from './helpers';

describe('setup', () => {
    it('creates the platform tabs without touching the existing registrations tab', () => {
        const b = setupBackend();
        const names = b.store.sheets.map((s) => s.name);
        expect(names).toEqual(['EVSociety Registrations', 'Competitions', 'Teams', 'Team_Categories', 'Members', 'Mentors', 'Files', 'Awards', 'Change_Requests', 'Audit_Log']);
        expect(b.rt.sheet('EVSociety Registrations').cells).toEqual([['registrationId', 'type', 'fullName', 'email']]);
        expect(b.store.triggers.map((t) => t.handler).sort()).toEqual(['evsCompetitionOnEdit', 'evsCompetitionOnOpen']);
    });

    it('creates the website API secret when none is set, and never replaces an existing one', () => {
        const store = createStore();
        const rt = createAppsScriptRuntime(store, { quiet: true, effectiveUser: OWNER });
        const report = String(rt.call('evsCompetitionSetup'));
        const created = store.properties.EVSC_API_SECRET;
        expect(created).toMatch(/^[0-9a-f]{64}$/);
        expect(report).toMatch(/Created the website API secret/);
        expect(report).not.toContain(created);
        rt.call('evsCompetitionSetup');
        expect(store.properties.EVSC_API_SECRET).toBe(created);
        const b = setupBackend();
        expect(b.store.properties.EVSC_API_SECRET).toBe(SECRET);
    });

    it('is safe to run again and refuses to take over an unrelated tab', () => {
        const b = setupBackend();
        b.rt.call('evsCompetitionSetup');
        expect(b.rt.rows('Competitions')).toHaveLength(1);
        expect(b.rt.rows('Awards')).toHaveLength(2);
        b.store.sheets.find((s) => s.name === 'Mentors')!.cells[0][0] = 'Something else';
        expect(() => b.rt.call('evsCompetitionSetup')).toThrow(/already exists and is not a competition platform tab/);
    });
});

describe('request signing', () => {
    it('rejects unsigned, forged, expired and replayed requests', () => {
        const b = setupBackend();
        const request = { action: 'public.snapshot', params: { competitionId: COMPETITION }, ctx: {} };
        expect(b.rt.call('evscHandleEnvelope', { kind: 'evs-competition-v1', payload: JSON.stringify(request) }).error.code).toBe('UNAUTHORIZED');
        const forged = signEnvelope('wrong-secret-wrong-secret-wrong-secret-00', request, b.now());
        expect(b.rt.call('evscHandleEnvelope', forged).error.code).toBe('UNAUTHORIZED');
        const old = signEnvelope(SECRET, request, b.now() - 10 * 60 * 1000);
        expect(b.rt.call('evscHandleEnvelope', old).error.code).toBe('UNAUTHORIZED');
        const good = signEnvelope(SECRET, request, b.now());
        expect(b.rt.call('evscHandleEnvelope', good).ok).toBe(true);
        expect(b.rt.call('evscHandleEnvelope', good).error.code).toBe('UNAUTHORIZED');
    });

    it('signs non-ASCII payloads identically on both sides', () => {
        const b = setupBackend();
        const email = b.signIn('leader@college.edu');
        const res = b.ok('teams.createDraft', { competitionId: COMPETITION, year: 2026, categories: ['can-7usat'], leader: { name: 'Sūrya Nārāyaṇ', phone: '+91 98450 00000' } }, { actorEmail: email });
        expect(res.team.data.leader.name).toBe('Sūrya Nārāyaṇ');
    });
});

describe('team leader sign-in', () => {
    it('accepts the emailed code once and limits wrong guesses', () => {
        const b = setupBackend();
        b.ok('auth.requestCode', { email: 'Lead@College.edu' });
        const code = /code is (\d{6})/.exec(b.lastMailTo('lead@college.edu')!.body)![1];
        const wrong = code === '000000' ? '111111' : '000000';
        for (let i = 0; i < 5; i++) expect(b.fail('auth.verifyCode', { email: 'lead@college.edu', code: wrong }).code).toBe('INVALID_CODE');
        // After five wrong attempts even the right code is refused
        expect(b.fail('auth.verifyCode', { email: 'lead@college.edu', code }).code).toBe('INVALID_CODE');
    });

    it('expires codes after ten minutes and rate-limits requests per email', () => {
        const b = setupBackend();
        b.ok('auth.requestCode', { email: 'lead@college.edu' });
        const code = /code is (\d{6})/.exec(b.lastMailTo('lead@college.edu')!.body)![1];
        b.advance(11 * 60 * 1000);
        expect(b.fail('auth.verifyCode', { email: 'lead@college.edu', code }).code).toBe('INVALID_CODE');
        for (let i = 0; i < 3; i++) b.ok('auth.requestCode', { email: 'lead@college.edu' });
        expect(b.fail('auth.requestCode', { email: 'lead@college.edu' }).code).toBe('RATE_LIMITED');
    });
});

describe('registration', () => {
    it('1, 4, 11: registers a Model Rocketry team for 2026 into the spreadsheet', () => {
        const b = setupBackend();
        const { teamId, team } = b.registerTeam({ leaderEmail: 'asha@rvce.edu.in', categories: ['model-rocketry'] });
        expect(teamId).toMatch(/^EVS-[2-9A-HJ-NP-Z]{6}$/);
        expect(team.status).toBe('Pending Review');
        const row = b.rt.rows('Teams').find((r) => r['Team ID'] === teamId)!;
        expect(row).toMatchObject({ 'Year': 2026, 'Team Name': 'Team Astra', 'College': 'RV College of Engineering', 'Registration Status': 'Pending Review', 'Slug': 'team-astra-2026' });
        expect(b.rt.rows('Team_Categories').filter((r) => r['Team ID'] === teamId).map((r) => r['Category ID'])).toEqual(['model-rocketry']);
        const leader = b.rt.rows('Members').find((r) => r['Team ID'] === teamId)!;
        expect(leader).toMatchObject({ 'Role': 'Leader', 'Email': 'asha@rvce.edu.in', 'Full Name': 'Asha Rao' });
        expect(row['Leader Member ID']).toBe(leader['Member ID']);
    });

    it('5: registers a CAN-7USAT-only team', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@nitk.edu.in', categories: ['can-7usat'] });
        expect(b.rt.rows('Team_Categories').filter((r) => r['Team ID'] === teamId).map((r) => r['Category ID'])).toEqual(['can-7usat']);
    });

    it('6, 7: both categories create one team, one set of members and two category associations', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@iitm.ac.in', categories: ['model-rocketry', 'can-7usat'], members: [{ name: 'Ravi K' }, { name: 'Meera S' }] });
        expect(b.rt.rows('Teams').filter((r) => r['Team ID'] === teamId)).toHaveLength(1);
        expect(b.rt.rows('Members').filter((r) => r['Team ID'] === teamId)).toHaveLength(3);
        expect(b.rt.rows('Team_Categories').filter((r) => r['Team ID'] === teamId).map((r) => r['Category ID']).sort()).toEqual(['can-7usat', 'model-rocketry']);
    });

    it('2: a different team registers for 2027 once administrators open that year', () => {
        const b = setupBackend();
        const email = b.signIn('lead2027@college.edu');
        const closed = b.fail('teams.createDraft', { competitionId: COMPETITION, year: 2027, categories: ['can-7usat'], leader: { name: 'Kiran', phone: '+91 90000 00000' } }, { actorEmail: email });
        expect(closed.code).toBe('VALIDATION');
        b.review('Competitions', 'Competition ID', COMPETITION, 'Registration Years', '2026, 2027');
        b.review('Competitions', 'Competition ID', COMPETITION, 'Available Years', '2026, 2027');
        const { teamId } = b.registerTeam({ leaderEmail: 'lead2027@college.edu', year: 2027, categories: ['can-7usat'], name: 'Orbit Works' });
        expect(b.rt.rows('Teams').find((r) => r['Team ID'] === teamId)!['Year']).toBe(2027);
        b.registerTeam({ leaderEmail: 'other@college.edu', year: 2026, name: 'Team Vyom' });
        expect(new Set(b.rt.rows('Teams').map((r) => r['Year']))).toEqual(new Set([2026, 2027]));
    });

    it('8, 9, 10: stores multiple members, up to four mentors, photos and resumes', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({
            leaderEmail: 'lead@pes.edu',
            members: [
                { name: 'Ravi Kumar', email: 'ravi@pes.edu', photo: true, resume: true, linkedin: 'linkedin.com/in/ravi-kumar' },
                { name: 'Meera S', photo: true },
                { name: 'John D', resume: true },
            ],
            mentors: [{ name: 'Dr. A' }, { name: 'Dr. B' }, { name: 'Prof. C' }, { name: 'Dr. D', institution: 'ISRO' }],
        });
        const members = b.rt.rows('Members').filter((r) => r['Team ID'] === teamId && r['Role'] === 'Member');
        expect(members.map((m) => m['Full Name'])).toEqual(['Ravi Kumar', 'Meera S', 'John D']);
        expect(members[0]['LinkedIn']).toBe('https://linkedin.com/in/ravi-kumar');
        expect(b.rt.rows('Mentors').filter((r) => r['Team ID'] === teamId)).toHaveLength(4);
        const files = b.rt.rows('Files').filter((r) => r['Team ID'] === teamId);
        expect(files.filter((f) => f['Kind'] === 'resume')).toHaveLength(3);
        expect(files.filter((f) => f['Kind'] === 'member-photo')).toHaveLength(3);
        // Files are stored in the private upload folder, under a folder for the team
        const folder = Object.values(b.store.folders).find((f) => f.name === teamId)!;
        expect(Object.values(b.store.files).filter((f) => f.folder === folder.id)).toHaveLength(files.length);
    });

    it('refuses a fifth mentor, wrong file types and files from another team', () => {
        const b = setupBackend();
        const { email, teamId, data } = b.registerTeam({ leaderEmail: 'lead@pes.edu', submit: false });
        const tooMany = { ...data, mentors: [1, 2, 3, 4, 5].map((n) => ({ name: `Mentor ${n}`, institution: '', linkedin: '', photoFileId: '', listingConsent: true })) };
        expect(b.fail('teams.save', { competitionId: COMPETITION, teamId, data: tooMany }, { actorEmail: email }).fields).toHaveProperty('mentors');
        expect(b.fail('files.upload', { competitionId: COMPETITION, teamId, kind: 'resume', base64: Buffer.from('not a pdf'.repeat(20)).toString('base64') }, { actorEmail: email }).message).toMatch(/PDF/);
        expect(b.fail('files.upload', { competitionId: COMPETITION, teamId, kind: 'member-photo', base64: PDF.toString('base64') }, { actorEmail: email }).message).toMatch(/JPG/);
        const other = b.registerTeam({ leaderEmail: 'other@college.edu', name: 'Other Team', submit: false });
        const foreign = { ...data, leader: { ...data.leader, photoFileId: other.data.leader.photoFileId } };
        expect(b.fail('teams.save', { competitionId: COMPETITION, teamId, data: foreign }, { actorEmail: email }).fields).toHaveProperty(['leader.photoFileId']);
    });

    it('requires the essentials on submission but allows partial drafts', () => {
        const b = setupBackend();
        const email = b.signIn('lead@college.edu');
        const draft = b.ok('teams.createDraft', { competitionId: COMPETITION, year: 2026, categories: ['model-rocketry'], leader: { name: 'Asha', phone: '+91 98450 12345' } }, { actorEmail: email }).team;
        const partial = { year: 2026, categories: ['model-rocketry'], team: { name: '', college: '' }, leader: { name: 'Asha', phone: '+91 98450 12345' }, members: [{ name: '' }], mentors: [] };
        expect(b.ok('teams.save', { competitionId: COMPETITION, teamId: draft.teamId, data: partial }, { actorEmail: email }).team.status).toBe('Draft');
        const error = b.fail('teams.save', { competitionId: COMPETITION, teamId: draft.teamId, data: partial, submit: true }, { actorEmail: email });
        expect(Object.keys(error.fields!).sort()).toEqual(['members.0.name', 'processingConsent', 'team.college', 'team.name']);
    });

    it('detects duplicate registrations and repeated submissions', () => {
        const b = setupBackend();
        const first = b.registerTeam({ leaderEmail: 'lead@college.edu', name: 'Team Astra', college: 'RVCE' });
        // The same leader starting again for the same year is pointed to the existing team
        const again = b.fail('teams.createDraft', { competitionId: COMPETITION, year: 2026, categories: ['can-7usat'], leader: { name: 'Asha', phone: '+91 98450 12345' } }, { actorEmail: first.email });
        expect(again.code).toBe('DUPLICATE_LEADER');
        expect(again.details.teamId).toBe(first.teamId);
        // Another leader registering the same team name from the same college
        const dup = b.registerTeam({ leaderEmail: 'second@college.edu', submit: false, name: 'team  ASTRA', college: 'rvce' });
        const err = b.fail('teams.save', { competitionId: COMPETITION, teamId: dup.teamId, data: { ...dup.data, team: { ...dup.data.team, name: 'Team-Astra' } }, submit: true }, { actorEmail: dup.email });
        expect(err.code).toBe('DUPLICATE_TEAM');
        // A double-clicked "Start registration" creates one draft
        const email = b.signIn('third@college.edu');
        const params = { competitionId: COMPETITION, year: 2026, categories: ['can-7usat'], leader: { name: 'T', phone: '+91 98450 99999' }, idempotencyKey: 'click-1' };
        const a = b.ok('teams.createDraft', params, { actorEmail: email });
        const c = b.ok('teams.createDraft', params, { actorEmail: email });
        expect(c.team.teamId).toBe(a.team.teamId);
        expect(b.rt.rows('Teams').filter((r) => r['Team ID'] === a.team.teamId)).toHaveLength(1);
    });

    it('refuses saves based on an out-of-date version', () => {
        const b = setupBackend();
        const { email, teamId, data, team } = b.registerTeam({ leaderEmail: 'lead@college.edu', submit: false });
        b.ok('teams.save', { competitionId: COMPETITION, teamId, data, expectedVersion: team.version }, { actorEmail: email });
        expect(b.fail('teams.save', { competitionId: COMPETITION, teamId, data, expectedVersion: team.version }, { actorEmail: email }).code).toBe('CONFLICT');
    });

    it('only lets the verified team leader read or change a team', () => {
        const b = setupBackend();
        const { teamId, data } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        const intruder = b.signIn('someone@else.com');
        expect(b.fail('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: intruder }).code).toBe('NOT_FOUND');
        expect(b.fail('teams.save', { competitionId: COMPETITION, teamId, data }, { actorEmail: intruder }).code).toBe('NOT_FOUND');
        expect(b.fail('files.upload', { competitionId: COMPETITION, teamId, kind: 'resume', base64: PDF.toString('base64') }, { actorEmail: intruder }).code).toBe('NOT_FOUND');
        expect(b.fail('teams.get', { competitionId: COMPETITION, teamId }, {}).code).toBe('UNAUTHORIZED');
        expect(b.ok('teams.list', { competitionId: COMPETITION }, { actorEmail: intruder }).teams).toEqual([]);
    });

    it('stores formula-like input as plain text', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu', name: '=HYPERLINK("https://evil.test","x")', college: '+cmd|calc', members: [{ name: '@SUM(A1)' }] });
        const sheetsWithFormulas = b.store.sheets.filter((s) => Object.keys(s.formulas).length);
        expect(sheetsWithFormulas).toEqual([]);
        expect(b.rt.rows('Teams').find((r) => r['Team ID'] === teamId)!['Team Name']).toBe('=HYPERLINK("https://evil.test","x")');
    });
});

describe('admin review in the sheet', () => {
    it('12: a rejected registration is never public and can no longer be edited', () => {
        const b = setupBackend();
        const { teamId, email, data } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.review('Teams', 'Team ID', teamId, 'Review Comments', 'Not an eligible team.');
        b.review('Teams', 'Team ID', teamId, 'Registration Status', 'Rejected');
        b.review('Teams', 'Team ID', teamId, 'Profile Approved', 'Yes');
        b.review('Teams', 'Team ID', teamId, 'Publication Approved', 'Yes');
        b.review('Team_Categories', 'Association ID', String(b.categoryRow(teamId, 'model-rocketry')['Association ID']), 'Participation Verified', 'Yes');
        expect(b.snapshot().teams).toEqual([]);
        expect(b.lastMailTo('lead@college.edu')!.subject).toMatch(/Rejected/);
        expect(b.lastMailTo('lead@college.edu')!.body).toMatch(/Not an eligible team/);
        expect(b.fail('teams.save', { competitionId: COMPETITION, teamId, data }, { actorEmail: email }).code).toBe('LOCKED');
    });

    it('13, 14, 16: an approved, verified participant shows only approved, consented information', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({
            leaderEmail: 'lead@college.edu',
            members: [{ name: 'Ravi Kumar', email: 'ravi@college.edu', phone: '+91 90000 11111', linkedin: 'https://www.linkedin.com/in/ravi', photo: true, resume: true }],
            mentors: [{ name: 'Dr. Mentor', institution: 'IISc', linkedin: 'https://www.linkedin.com/in/mentor' }, { name: 'Not Agreed', listingConsent: false }],
            leaderPermissions: { photo: true, linkedin: true, email: false, phone: false },
        });
        b.publish(teamId);
        // Approval alone is not participation
        expect(b.snapshot().teams).toEqual([]);
        b.review('Team_Categories', 'Association ID', String(b.categoryRow(teamId, 'model-rocketry')['Association ID']), 'Participation Verified', 'Yes');
        const [team] = b.snapshot().teams;
        expect(team).toMatchObject({ slug: 'team-astra-2026', name: 'Team Astra', college: 'RV College of Engineering', year: 2026 });
        expect(team.categories).toMatchObject([{ categoryId: 'model-rocketry', participationVerified: true, winnerVerified: false, achievement: '', officialResultUrl: '' }]);
        expect(team.categories[0].verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const leader = team.people.find((p: any) => p.role === 'leader');
        expect(leader).toMatchObject({ name: 'Asha Rao', linkedin: 'https://www.linkedin.com/in/asha-rao', email: null, phone: null });
        expect(leader.photoFileId).toMatch(/^FIL-/);
        // The member has not answered the consent email: name only
        expect(team.people.find((p: any) => p.role === 'member')).toEqual({ role: 'member', name: 'Ravi Kumar', photoFileId: null, linkedin: null, email: null, phone: null });
        expect(team.mentors).toEqual([{ name: 'Dr. Mentor', institution: 'IISc', linkedin: 'https://www.linkedin.com/in/mentor', photoFileId: null }]);
        const json = JSON.stringify(b.snapshot());
        expect(json).not.toMatch(/resume|ravi@college|90000|lead@college/i);
    });

    it('15: with the registered-teams view on, an unverified team is listed as registered only', () => {
        const b = setupBackend();
        b.review('Competitions', 'Competition ID', COMPETITION, 'Show Registered Teams', 'Yes');
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.publish(teamId);
        const [team] = b.snapshot().teams;
        expect(team.categories[0]).toMatchObject({ participationVerified: false, winnerVerified: false });
    });

    it('17, 18, 19: winners are verified per category and always count as participants', () => {
        const b = setupBackend();
        const both = b.registerTeam({ leaderEmail: 'a@college.edu', name: 'Team Both', categories: ['model-rocketry', 'can-7usat'] });
        const plain = b.registerTeam({ leaderEmail: 'b@college.edu', name: 'Team Plain' });
        b.publish(both.teamId, ['model-rocketry', 'can-7usat'], ['can-7usat']);
        b.publish(plain.teamId, ['model-rocketry']);
        b.review('Team_Categories', 'Association ID', String(b.categoryRow(both.teamId, 'can-7usat')['Association ID']), 'Achievement', 'First place');
        const teams = b.snapshot().teams;
        const bothTeam = teams.find((t: any) => t.name === 'Team Both');
        expect(bothTeam.categories).toMatchObject([
            { categoryId: 'model-rocketry', participationVerified: true, winnerVerified: false, achievement: '' },
            { categoryId: 'can-7usat', participationVerified: true, winnerVerified: true, achievement: 'First place' },
        ]);
        expect(teams.find((t: any) => t.name === 'Team Plain').categories[0].winnerVerified).toBe(false);
        const stats = b.snapshot().stats['2026'].categories;
        expect(stats['can-7usat']).toEqual({ approvedRegistrations: 1, participants: 1, winners: 1 });
        expect(stats['model-rocketry']).toEqual({ approvedRegistrations: 2, participants: 2, winners: 0 });
    });

    it('refuses invalid decisions and explains why in a cell note', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        const assoc = String(b.categoryRow(teamId, 'model-rocketry')['Association ID']);
        const res = b.review('Team_Categories', 'Association ID', assoc, 'Winner Verified', 'Yes');
        expect(res.value).toBe('No');
        expect(res.note).toMatch(/Verify participation/);
        expect(b.review('Teams', 'Team ID', teamId, 'Publication Approved', 'Yes').note).toMatch(/Approve the profile/);
        expect(b.review('Teams', 'Team ID', teamId, 'Registration Status', 'Maybe').note).toMatch(/Choose one of/);
        expect(b.rt.rows('Audit_Log').filter((r) => r['Event Type'] === 'review.invalid')).toHaveLength(3);
    });

    it('ignores decisions from unlisted or unidentified accounts', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        const stranger = b.review('Teams', 'Team ID', teamId, 'Registration Status', 'Approved', 'editor@gmail.com');
        expect(stranger.value).toBe('Pending Review');
        expect(stranger.note).toMatch(/not listed as a reviewer/);
        expect(b.review('Teams', 'Team ID', teamId, 'Registration Status', 'Approved', '').note).toMatch(/could not be identified/);
        b.store.properties.EVSC_REVIEWERS = 'editor@gmail.com';
        expect(b.review('Teams', 'Team ID', teamId, 'Registration Status', 'Approved', 'editor@gmail.com').value).toBe('Approved');
        expect(b.rt.rows('Teams').find((r) => r['Team ID'] === teamId)!['Last Reviewed By']).toBe('editor@gmail.com');
    });

    it('treats approvals typed in without the review trigger as not approved', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.publish(teamId, ['model-rocketry']);
        expect(b.snapshot().teams).toHaveLength(1);
        const other = b.registerTeam({ leaderEmail: 'other@college.edu', name: 'Sneaky Team' });
        // Simulate values written straight into the cells (API, script or trigger not installed)
        const teams = b.rt.sheet('Teams');
        const headers = teams.cells[0].map(String);
        const row = teams.cells.find((r) => r[0] === other.teamId)!;
        for (const [col, value] of [['Registration Status', 'Approved'], ['Profile Approved', 'Yes'], ['Publication Approved', 'Yes']]) row[headers.indexOf(col)] = value;
        const cats = b.rt.sheet('Team_Categories');
        const catRow = cats.cells.find((r) => r[1] === other.teamId)!;
        catRow[cats.cells[0].map(String).indexOf('Participation Verified')] = 'Yes';
        b.rt.call('evscInvalidatePublic', COMPETITION);
        expect(b.snapshot().teams.map((t: any) => t.name)).toEqual(['Team Astra']);
    });

    it('asks the website to refresh after a decision, signed so the website can verify it', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.review('Teams', 'Team ID', teamId, 'Registration Status', 'Approved');
        const call = b.store.fetches.at(-1)!;
        expect(call.url).toBe('https://www.evsociety.test/api/competitions/revalidate');
        expect(JSON.parse(call.payload).competitionId).toBe(COMPETITION);
        expect(verifyWebhook(SECRET, call.headers['x-evs-timestamp'], call.payload, call.headers['x-evs-signature'], Number(call.headers['x-evs-timestamp']))).toBe(true);
        expect(verifyWebhook(SECRET, call.headers['x-evs-timestamp'], call.payload.replace(COMPETITION, 'other'), call.headers['x-evs-signature'], Number(call.headers['x-evs-timestamp']))).toBe(false);
    });
});

describe('published profile revisions', () => {
    it('22, 23, 24, 25: edits wait for approval, then replace the public profile', () => {
        const b = setupBackend();
        const { email, teamId, data } = b.registerTeam({ leaderEmail: 'lead@college.edu', members: [{ name: 'Ravi Kumar' }] });
        b.publish(teamId, ['model-rocketry']);
        const view = b.ok('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: email }).team;
        expect(view.editMode).toBe('revision');
        const edited = { ...view.data, team: { ...view.data.team, name: 'Team Astra Aerospace' }, members: [...view.data.members, { name: 'New Member', email: '', phone: '', linkedin: '', photoFileId: '', resumeFileId: '', under18: false }] };
        const saved = b.ok('teams.save', { competitionId: COMPETITION, teamId, data: { ...edited, leaderPermissions: { photo: true, linkedin: true }, publicationConsent: true, processingConsent: true }, submit: true, expectedVersion: view.version }, { actorEmail: email });
        expect(saved.outcome).toMatchObject({ mode: 'revision', submitted: true });
        expect(saved.team.pendingChange.status).toBe('Pending Review');
        // 23: the approved version stays public
        let [team] = b.snapshot().teams;
        expect(team.name).toBe('Team Astra');
        expect(team.people).toHaveLength(2);
        const cr = b.rt.rows('Change_Requests')[0];
        expect(String(cr['Summary of Changes'])).toContain('Team name: "Team Astra" → "Team Astra Aerospace"');
        expect(String(cr['Summary of Changes'])).toContain('Member added: New Member');
        // 24, 25: approval publishes the new version, keeping the original URL
        b.review('Change_Requests', 'Change Request ID', String(cr['Change Request ID']), 'Review Status', 'Approved');
        [team] = b.snapshot().teams;
        expect(team.name).toBe('Team Astra Aerospace');
        expect(team.slug).toBe('team-astra-2026');
        expect(team.revision).toBe(2);
        expect(team.people.map((p: any) => p.name)).toEqual(['Asha Rao', 'Ravi Kumar', 'New Member']);
        expect(b.ok('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: email }).team.pendingChange).toBeNull();
        expect(data.team.name).toBe('Team Astra');
    });

    it('keeps year and categories fixed once approved and rejects revisions cleanly', () => {
        const b = setupBackend();
        const { email, teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.publish(teamId, ['model-rocketry']);
        const view = b.ok('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: email }).team;
        const payload = { ...view.data, categories: ['can-7usat'], team: { ...view.data.team, college: 'Changed College' }, leaderPermissions: view.leaderPermissions, publicationConsent: true, processingConsent: true };
        b.ok('teams.save', { competitionId: COMPETITION, teamId, data: payload, submit: true }, { actorEmail: email });
        const cr = b.rt.rows('Change_Requests')[0];
        b.review('Change_Requests', 'Change Request ID', String(cr['Change Request ID']), 'Review Comments', 'Please use the official college name.');
        b.review('Change_Requests', 'Change Request ID', String(cr['Change Request ID']), 'Review Status', 'Rejected');
        expect(b.snapshot().teams[0].college).toBe('RV College of Engineering');
        expect(b.rt.rows('Team_Categories').filter((r) => r['Team ID'] === teamId).map((r) => r['Category ID'])).toEqual(['model-rocketry']);
        expect(b.lastMailTo('lead@college.edu')!.body).toMatch(/official college name/);
        // A decided change request cannot be decided again
        expect(b.review('Change_Requests', 'Change Request ID', String(cr['Change Request ID']), 'Review Status', 'Approved').note).toMatch(/Pending Review/);
    });
});

describe('privacy and consent', () => {
    it('26: members choose what is shown about them through their own link', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({
            leaderEmail: 'lead@college.edu',
            members: [{ name: 'Ravi Kumar', email: 'ravi@college.edu', phone: '+91 90000 11111', linkedin: 'https://www.linkedin.com/in/ravi', photo: true }],
        });
        b.publish(teamId, ['model-rocketry']);
        const mail = b.lastMailTo('ravi@college.edu')!;
        const token = /\/consent\/([a-f0-9]{48})/.exec(mail.body)![1];
        expect(mail.body).toContain('https://www.evsociety.test/programs/inspace-model-rocketry-cansat/consent/');
        const view = b.ok('consent.get', { token });
        expect(view).toMatchObject({ memberName: 'Ravi Kumar', teamName: 'Team Astra', available: { photo: true, linkedin: true, email: true, phone: true } });
        expect(view.preview.email).not.toContain('ravi@');
        b.ok('consent.save', { token, permissions: { photo: true, linkedin: true, email: false, phone: false } });
        let member = b.snapshot().teams[0].people.find((p: any) => p.role === 'member');
        expect(member).toMatchObject({ linkedin: 'https://www.linkedin.com/in/ravi', email: null, phone: null });
        expect(member.photoFileId).toMatch(/^FIL-/);
        // Withdrawal is immediate, and a member can hide themselves completely
        b.ok('consent.save', { token, permissions: { hidden: true } });
        member = b.snapshot().teams[0].people.find((p: any) => p.role === 'member');
        expect(member).toBeUndefined();
        expect(b.fail('consent.get', { token: 'f'.repeat(48) }).code).toBe('NOT_FOUND');
    });

    it('resets a member’s consent when the leader changes their photo or contact details', () => {
        const b = setupBackend();
        const { email, teamId, data } = b.registerTeam({ leaderEmail: 'lead@college.edu', members: [{ name: 'Ravi', email: 'ravi@college.edu', linkedin: 'https://www.linkedin.com/in/ravi' }] });
        const token = /\/consent\/([a-f0-9]{48})/.exec(b.lastMailTo('ravi@college.edu')!.body)![1];
        b.ok('consent.save', { token, permissions: { linkedin: true } });
        const view = b.ok('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: email }).team;
        const members = view.data.members.map((m: any) => ({ ...m, linkedin: 'https://www.linkedin.com/in/someone-else' }));
        b.ok('teams.save', { competitionId: COMPETITION, teamId, data: { ...data, members, leaderPermissions: {}, publicationConsent: true, processingConsent: true } }, { actorEmail: email });
        const row = b.rt.rows('Members').find((r) => r['Full Name'] === 'Ravi')!;
        // A new request has gone out for the changed details
        expect(row['Consent Status']).toBe('Requested');
        expect(row['Publication Permissions']).toBe('');
        expect(b.fail('consent.get', { token }).code).toBe('NOT_FOUND');
    });

    it('hides members under 18 until an administrator verifies guardian consent', () => {
        const b = setupBackend();
        const { teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu', members: [{ name: 'Young Member', under18: true }] });
        b.publish(teamId, ['model-rocketry']);
        expect(b.snapshot().teams[0].people.map((p: any) => p.name)).toEqual(['Asha Rao']);
        const minor = b.rt.rows('Members').find((r) => r['Full Name'] === 'Young Member')!;
        b.review('Members', 'Member ID', String(minor['Member ID']), 'Guardian Consent Verified', 'Yes');
        expect(b.snapshot().teams[0].people.map((p: any) => p.name)).toEqual(['Asha Rao', 'Young Member']);
    });

    it('27: never serves resumes or unpublished images as public media', () => {
        const b = setupBackend();
        const { email, teamId, data } = b.registerTeam({ leaderEmail: 'lead@college.edu', leaderPermissions: { photo: true } });
        b.publish(teamId, ['model-rocketry']);
        const snap = b.snapshot();
        const resumeId = data.leader.resumeFileId;
        expect(snap.publicFileIds).toContain(data.leader.photoFileId);
        expect(snap.publicFileIds).not.toContain(resumeId);
        expect(b.fail('public.media', { competitionId: COMPETITION, fileId: resumeId }).code).toBe('NOT_FOUND');
        expect(b.ok('public.media', { competitionId: COMPETITION, fileId: data.leader.photoFileId }).mime).toBe('image/jpeg');
        // Even the team leader's private preview route refuses resumes
        expect(b.fail('files.private', { competitionId: COMPETITION, teamId, fileId: resumeId }, { actorEmail: email }).code).toBe('NOT_FOUND');
        expect(b.ok('files.private', { competitionId: COMPETITION, teamId, fileId: data.leader.photoFileId }, { actorEmail: email }).mime).toBe('image/jpeg');
    });

    it('withdraws a profile immediately when the team withdraws consent or asks for deletion', () => {
        const b = setupBackend();
        const { email, teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.publish(teamId, ['model-rocketry']);
        expect(b.snapshot().teams).toHaveLength(1);
        b.ok('teams.setPublication', { competitionId: COMPETITION, teamId, consent: false }, { actorEmail: email });
        expect(b.snapshot().teams).toHaveLength(0);
        expect(b.rt.rows('Teams').find((r) => r['Team ID'] === teamId)!['Profile Publication Status']).toBe('Withdrawn by team');
        b.ok('teams.setPublication', { competitionId: COMPETITION, teamId, consent: true }, { actorEmail: email });
        expect(b.snapshot().teams).toHaveLength(1);
        b.ok('teams.requestDeletion', { competitionId: COMPETITION, teamId, reason: 'Graduated' }, { actorEmail: email });
        expect(b.snapshot().teams).toHaveLength(0);
        expect(b.lastMailTo(OWNER)!.subject).toContain(teamId);
        b.rt.call('evscDeleteTeamData', teamId, OWNER);
        for (const tab of ['Teams', 'Members', 'Mentors', 'Team_Categories', 'Files']) {
            expect(b.rt.rows(tab).filter((r) => r['Team ID'] === teamId)).toEqual([]);
        }
        expect(Object.values(b.store.files).every((f) => f.trashed)).toBe(true);
    });
});

describe('innovation award documents', () => {
    it('28, 29: documents appear only after an administrator publishes a real reference', () => {
        const b = setupBackend();
        let awards = b.snapshot().awards;
        expect(awards.map((a: any) => [a.title, a.status, a.pdfReference])).toEqual([
            ['EV Society CAN-7USAT Innovation Award 2026', 'Proposed', null],
            ['EV Society Model Rocketry Innovation Award 2026', 'Proposed', null],
        ]);
        b.review('Awards', 'Award ID', 'AWD-INSPACE-2026-CAN7USAT', 'PDF Reference', 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing');
        expect(b.snapshot().awards[0].pdfReference).toBeNull();
        b.review('Awards', 'Award ID', 'AWD-INSPACE-2026-CAN7USAT', 'Publication Status', 'Published');
        awards = b.snapshot().awards;
        expect(awards[0].pdfReference).toBe('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing');
        expect(awards[0].status).toBe('Proposed');
        expect(b.review('Awards', 'Award ID', 'AWD-INSPACE-2026-ROCKETRY', 'PDF Reference', 'javascript:alert(1)').note).toMatch(/https/);
    });
});

describe('reusable for other competitions', () => {
    it('30: a drone competition is configured with a Competitions row and uses the same flows', () => {
        const b = setupBackend();
        b.rt.call('evscTable', 'Competitions');
        const competitions = b.rt.sheet('Competitions');
        const headers = competitions.cells[0].map(String);
        const row = headers.map((h) => ({ 'Competition ID': 'drone-challenge', 'Name': 'EV Society Drone Challenge', 'Slug': 'drone-challenge', 'Organiser': 'EV Society' } as Record<string, string>)[h] ?? '');
        competitions.cells.push(row);
        for (const [field, value] of [['Categories', 'autonomy, payload'], ['Available Years', '2027'], ['Registration Years', '2027'], ['Default Registration Year', '2027'], ['Registration Status', 'Open'], ['Public Visibility', 'Public'], ['Configuration', '{"maxMentors":2,"maxMembers":4}']]) {
            expect(b.review('Competitions', 'Competition ID', 'drone-challenge', field, value).note).toBe('');
        }
        const email = b.signIn('pilot@college.edu');
        const draft = b.ok('teams.createDraft', { competitionId: 'drone-challenge', year: 2027, categories: ['autonomy'], leader: { name: 'Pilot', phone: '+91 98450 22222' } }, { actorEmail: email }).team;
        expect(draft.maxMentors).toBe(2);
        const data = { year: 2027, categories: ['autonomy'], team: { name: 'Sky Team', college: 'NITK' }, leader: { name: 'Pilot', phone: '+91 98450 22222' }, members: ['A', 'B', 'C', 'D'].map((name) => ({ name })), mentors: [], processingConsent: true, publicationConsent: true, leaderPermissions: {} };
        expect(b.fail('teams.save', { competitionId: 'drone-challenge', teamId: draft.teamId, data, submit: true }, { actorEmail: email }).fields).toHaveProperty('members');
        data.members = data.members.slice(0, 3);
        b.ok('teams.save', { competitionId: 'drone-challenge', teamId: draft.teamId, data, submit: true }, { actorEmail: email });
        b.publish(draft.teamId, ['autonomy'], ['autonomy']);
        expect(b.snapshot('drone-challenge').teams[0]).toMatchObject({ name: 'Sky Team', categories: [{ categoryId: 'autonomy', winnerVerified: true }] });
        // Teams from one competition never appear in another
        expect(b.snapshot().teams).toEqual([]);
        expect(b.fail('teams.get', { competitionId: COMPETITION, teamId: draft.teamId }, { actorEmail: email }).code).toBe('NOT_FOUND');
    });
});
