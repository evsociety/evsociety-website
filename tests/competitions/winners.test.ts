// Winners platform: administrator imports of official teams, group-photograph approval, official
// result references, and the wording rules that keep pages, captions and cards to verified facts.

import { describe, expect, it } from 'vitest';
import { INSPACE_COMPETITION } from '@/config/competitions/inspace';
import { imageSize } from '@/lib/competitions/imageSize';
import type { PublicTeam, PublicTeamCategory } from '@/lib/competitions/model';
import { formatVerifiedDate, recognitionOf, shareCaption, teamDescription, teamDisplayName, teamPageTitle } from '@/lib/competitions/recognition';
import { signEnvelope } from '@/lib/competitions/server/envelope';
import { COMPETITION, JPEG, SECRET, setupBackend, type Backend } from './helpers';

const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP'), Buffer.alloc(200, 0x20)]);
// Fictional team: real student data never goes into this public repository
const MEMBERS = ['Kavya Menon', 'Ishaan Verma', 'Diya Kulkarni', 'Arnav Bose', 'Sara Thomas', 'Vihaan Reddy', 'Tara Joshi', 'Neel Desai'];
const ALT = 'Team Orion Model Rocketry competition group at an award presentation in 2026.';

const importSpec = (overrides: Record<string, unknown> = {}) => ({
    competitionId: COMPETITION,
    year: 2026,
    categories: ['model-rocketry'],
    teamName: 'Team Orion',
    teamCode: 'Rocketry-099',
    college: '',
    members: MEMBERS,
    mentors: [],
    publicationConsent: true,
    sourceNote: 'Supplied by the project owner for the winners page.',
    teamPhoto: { base64: JPEG.toString('base64'), name: 'group-photo.jpg', width: 1132, height: 754, alt: ALT, consent: true },
    teamPhotoOriginal: { base64: WEBP.toString('base64'), name: 'group-photo-original.webp', width: 1132, height: 754 },
    ...overrides,
});

const importTeam = (b: Backend, params: Record<string, unknown>, ctx: Record<string, unknown> = { admin: true, actorEmail: 'evsociety.org@gmail.com' }) =>
    b.rt.call('evscHandleEnvelope', signEnvelope(SECRET, { action: 'admin.importTeam', params, ctx } as any, b.now()));

const counts = (b: Backend) => Object.fromEntries(['Teams', 'Members', 'Mentors', 'Team_Categories', 'Files'].map((tab) => [tab, b.rt.rows(tab).length]));

describe('administrator import of an official team', () => {
    it('creates one pending, unpublished record with the members in the order supplied', () => {
        const b = setupBackend();
        const res = importTeam(b, importSpec());
        expect(res.ok).toBe(true);
        expect(res.data).toMatchObject({ created: true, slug: 'team-orion-rocketry-099' });
        const team = b.rt.rows('Teams').find((r) => r['Team ID'] === res.data.teamId)!;
        expect(team).toMatchObject({
            'Team Name': 'Team Orion', 'Team Code': 'Rocketry-099', 'College': '', 'Leader Member ID': '',
            'Registration Status': 'Pending Review', 'Profile Approved': 'No', 'Publication Approved': 'No', 'Team Photo Approved': 'No',
            'Team Photo Consent': 'Yes', 'Profile Publication Status': 'Not published',
        });
        const members = b.rt.rows('Members').filter((r) => r['Team ID'] === res.data.teamId);
        expect(members.map((m) => m['Full Name'])).toEqual(MEMBERS);
        expect(members.map((m) => m['Display Order'])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        // Nobody is named leader, and no contact details are invented
        expect(members.every((m) => m['Role'] === 'Member' && !m['Email'] && !m['Phone'] && !m['LinkedIn'])).toBe(true);
        expect(b.rt.rows('Mentors')).toHaveLength(0);
        expect(b.rt.rows('Team_Categories').filter((r) => r['Team ID'] === res.data.teamId)).toMatchObject([
            { 'Category ID': 'model-rocketry', 'Participation Verified': 'No', 'Winner Verified': 'No', 'Achievement': '', 'Official Result Reference': '' },
        ]);
        const files = b.rt.rows('Files').filter((r) => r['Team ID'] === res.data.teamId);
        expect(files.map((f) => [f['Kind'], f['MIME Type'], f['Image Width'], f['Image Height']])).toEqual([
            ['team-photo', 'image/jpeg', 1132, 754],
            ['team-photo-original', 'image/webp', 1132, 754],
        ]);
        expect(files[0]['Alt Text']).toBe(ALT);
        expect(b.rt.rows('Audit_Log').filter((r) => r['Event Type'] === 'team.imported')).toHaveLength(1);
        // Nothing is public until reviewers approve it in the sheet
        expect(b.snapshot().teams).toEqual([]);
    });

    it('is create-only: running it again, or with a different name for the same team code, changes nothing', () => {
        const b = setupBackend();
        const first = importTeam(b, importSpec()).data;
        const before = counts(b);
        expect(importTeam(b, importSpec()).data).toEqual({ created: false, teamId: first.teamId, slug: first.slug });
        expect(importTeam(b, importSpec({ teamName: 'Orion Rocketry', members: ['Someone Else'] })).data).toMatchObject({ created: false, teamId: first.teamId });
        expect(importTeam(b, importSpec({ teamCode: '', teamName: 'team  orion' })).data).toMatchObject({ created: false, teamId: first.teamId });
        expect(counts(b)).toEqual(before);
        expect(b.rt.rows('Members').filter((r) => r['Team ID'] === first.teamId).map((m) => m['Full Name'])).toEqual(MEMBERS);
    });

    it('is refused without the administrator flag, even in a correctly signed request', () => {
        const b = setupBackend();
        expect(importTeam(b, importSpec(), {}).error.code).toBe('UNAUTHORIZED');
        expect(importTeam(b, importSpec(), { admin: 'true' }).error.code).toBe('UNAUTHORIZED');
        expect(b.rt.rows('Teams')).toHaveLength(0);
    });

    it('validates the year, categories, members, team code and address', () => {
        const b = setupBackend();
        const res = importTeam(b, importSpec({ year: 2031, categories: ['rocket-league'], members: ['Asha', ''], teamCode: 'Bad<code>', slug: 'Not A Slug' }));
        expect(res.error.code).toBe('VALIDATION');
        expect(Object.keys(res.error.fields).sort()).toEqual(['categories', 'members', 'slug', 'teamCode', 'year']);
        expect(b.rt.rows('Teams')).toHaveLength(0);
    });

    it('builds the address from the team code, and refuses an address another team uses', () => {
        const b = setupBackend();
        expect(importTeam(b, importSpec({ teamPhoto: undefined, teamPhotoOriginal: undefined })).data.slug).toBe('team-orion-rocketry-099');
        expect(importTeam(b, importSpec({ teamName: 'Team Vayu', teamCode: '', slug: 'team-orion-rocketry-099' })).error.code).toBe('DUPLICATE_TEAM');
        expect(importTeam(b, importSpec({ teamName: 'Team Vayu', teamCode: '' })).data.slug).toBe('team-vayu-2026');
    });
});

describe('group photograph approval', () => {
    const publishImported = (b: Backend) => {
        const { teamId } = importTeam(b, importSpec()).data;
        b.publish(teamId, ['model-rocketry'], ['model-rocketry']);
        return teamId as string;
    };

    it('keeps the photograph private until a reviewer approves it, then publishes it with its size and alt text', () => {
        const b = setupBackend();
        const teamId = publishImported(b);
        let [team] = b.snapshot().teams;
        expect(team).toMatchObject({ name: 'Team Orion', teamCode: 'Rocketry-099', college: '', teamPhoto: null, mentors: [] });
        expect(team.people.map((p: any) => [p.role, p.name])).toEqual(MEMBERS.map((name) => ['member', name]));
        const [photo, original] = b.rt.rows('Files').filter((r) => r['Team ID'] === teamId).map((f) => String(f['File ID']));
        expect(b.fail('public.media', { competitionId: COMPETITION, fileId: photo }).code).toBe('NOT_FOUND');

        b.review('Teams', 'Team ID', teamId, 'Team Photo Approved', 'Yes');
        [team] = b.snapshot().teams;
        expect(team.teamPhoto).toEqual({ fileId: photo, width: 1132, height: 754, alt: ALT });
        expect(b.ok('public.media', { competitionId: COMPETITION, fileId: photo }).mime).toBe('image/jpeg');
        // The preserved original is an archive copy and is never served publicly
        expect(b.fail('public.media', { competitionId: COMPETITION, fileId: original }).code).toBe('NOT_FOUND');

        b.review('Teams', 'Team ID', teamId, 'Team Photo Approved', 'No');
        expect(b.snapshot().teams[0].teamPhoto).toBeNull();
    });

    it('treats a photo approval typed in without the review trigger as not approved', () => {
        const b = setupBackend();
        const teamId = publishImported(b);
        const sheet = b.rt.sheet('Teams');
        const headers = sheet.cells[0].map(String);
        sheet.cells.find((r) => r[0] === teamId)![headers.indexOf('Team Photo Approved')] = 'Yes';
        b.rt.call('evscInvalidatePublic', COMPETITION);
        expect(b.snapshot().teams[0].teamPhoto).toBeNull();
    });

    it('needs the team’s consent as well as approval, and a new photo in a revision is approved with the revision', () => {
        const b = setupBackend();
        const { email, teamId } = b.registerTeam({ leaderEmail: 'lead@college.edu' });
        b.publish(teamId, ['model-rocketry']);
        const view = b.ok('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: email }).team;
        const file = b.ok('files.upload', { competitionId: COMPETITION, teamId, kind: 'team-photo', base64: JPEG.toString('base64'), originalName: 'group.jpg', width: 1600, height: 900 }, { actorEmail: email }).file;
        const save = (consent: boolean) => b.ok('teams.save', {
            competitionId: COMPETITION, teamId, submit: true,
            data: { ...view.data, team: { ...view.data.team, teamPhotoFileId: file.fileId, teamPhotoConsent: consent }, leaderPermissions: view.leaderPermissions, publicationConsent: true, processingConsent: true },
        }, { actorEmail: email });

        save(false);
        let cr = b.rt.rows('Change_Requests').at(-1)!;
        b.review('Change_Requests', 'Change Request ID', String(cr['Change Request ID']), 'Review Status', 'Approved');
        expect(b.snapshot().teams[0].teamPhoto).toBeNull();

        const next = b.ok('teams.get', { competitionId: COMPETITION, teamId }, { actorEmail: email }).team;
        b.ok('teams.save', {
            competitionId: COMPETITION, teamId, submit: true,
            data: { ...next.data, team: { ...next.data.team, teamPhotoConsent: true }, leaderPermissions: next.leaderPermissions, publicationConsent: true, processingConsent: true },
        }, { actorEmail: email });
        cr = b.rt.rows('Change_Requests').at(-1)!;
        b.review('Change_Requests', 'Change Request ID', String(cr['Change Request ID']), 'Review Status', 'Approved');
        expect(b.snapshot().teams[0].teamPhoto).toMatchObject({ fileId: file.fileId, width: 1600, height: 900 });
    });
});

describe('official result reference', () => {
    it('accepts only https links and publishes them with the verified category', () => {
        const b = setupBackend();
        const { teamId } = importTeam(b, importSpec()).data;
        b.publish(teamId, ['model-rocketry'], ['model-rocketry']);
        const assoc = String(b.categoryRow(teamId, 'model-rocketry')['Association ID']);
        for (const bad of ['http://www.inspace.gov.in/results', 'javascript:alert(1)', 'www.inspace.gov.in']) {
            const res = b.review('Team_Categories', 'Association ID', assoc, 'Official Result Reference', bad);
            expect(res.note).toMatch(/https:\/\//);
            expect(b.snapshot().teams[0].categories[0].officialResultUrl).toBe('');
        }
        b.review('Team_Categories', 'Association ID', assoc, 'Official Result Reference', 'https://www.inspace.gov.in/results/2026');
        const [category] = b.snapshot().teams[0].categories;
        expect(category).toMatchObject({ categoryId: 'model-rocketry', winnerVerified: true, officialResultUrl: 'https://www.inspace.gov.in/results/2026' });
        expect(category.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('verified-only wording', () => {
    const category = (overrides: Partial<PublicTeamCategory> = {}): PublicTeamCategory => ({
        categoryId: 'model-rocketry', participationVerified: true, winnerVerified: false, achievement: '', verifiedAt: '2026-11-06', officialResultUrl: '', ...overrides,
    });
    const team = (categories: PublicTeamCategory[], overrides: Partial<PublicTeam> = {}): PublicTeam => ({
        slug: 'team-orion-rocketry-099', year: 2026, name: 'Team Orion', teamCode: 'Rocketry-099', college: '', entryType: 'Team', revision: 1,
        teamLogoUrl: null, institutionLogoUrl: null, teamPhoto: null, categories, leader: null,
        members: MEMBERS.map((name) => ({ role: 'member' as const, name, photoUrl: null, linkedin: null, email: null, phone: null })),
        mentors: [], ...overrides,
    });
    const URL = 'https://www.evsociety.org/programs/inspace-model-rocketry-cansat/teams/team-orion-rocketry-099';

    it('calls a team a winner only when the win is verified', () => {
        const winner = team([category({ winnerVerified: true })]);
        expect(recognitionOf(winner, INSPACE_COMPETITION)).toMatchObject({ stage: 'winner', headline: 'Model Rocketry Winners' });
        expect(teamPageTitle(winner, INSPACE_COMPETITION)).toBe('Team Orion (Rocketry-099) — Model Rocketry Winners 2026 | EV Society');
        expect(shareCaption(winner, INSPACE_COMPETITION, URL)).toContain('Model Rocketry Winners, IN-SPACe India Student Competition 2026');

        const participant = team([category()]);
        expect(teamPageTitle(participant, INSPACE_COMPETITION)).toBe('Team Orion (Rocketry-099) — Model Rocketry Participants 2026 | EV Society');
        for (const text of [shareCaption(participant, INSPACE_COMPETITION, URL), teamDescription(participant, INSPACE_COMPETITION), teamPageTitle(participant, INSPACE_COMPETITION)]) {
            expect(text).not.toMatch(/winner/i);
        }
        // "Winner Verified" without verified participation is not a win
        const unverified = team([category({ participationVerified: false, winnerVerified: true })]);
        expect(recognitionOf(unverified, INSPACE_COMPETITION)?.stage).toBe('registered');
        expect(shareCaption(unverified, INSPACE_COMPETITION, URL)).toBe(`Meet Team Orion (Rocketry-099) on EV Society: ${URL}`);
    });

    it('describes missing details by leaving them out, never by inventing them', () => {
        const winner = team([category({ winnerVerified: true })]);
        const description = teamDescription(winner, INSPACE_COMPETITION);
        expect(description).toBe('Team Orion (Rocketry-099) is a verified Model Rocketry winner of the IN-SPACe Model Rocketry/CAN-7USAT India Student Competition 2026. Meet the 8-member engineering team on EV Society. The competition is organised by IN-SPACe.');
        expect(description).not.toMatch(/ from |undefined|null|first place|rank/i);
        expect(recognitionOf(winner, INSPACE_COMPETITION)?.achievement).toBe('');
        expect(teamDisplayName(team([], { teamCode: '' }))).toBe('Team Orion');
        expect(recognitionOf(team([]), INSPACE_COMPETITION)).toBeNull();
    });

    it('picks the strongest verified standing across categories, or the one asked for', () => {
        const both = team([category({ categoryId: 'model-rocketry' }), category({ categoryId: 'can-7usat', winnerVerified: true, achievement: 'First place' })]);
        expect(recognitionOf(both, INSPACE_COMPETITION)).toMatchObject({ stage: 'winner', categoryLabel: 'CAN-7USAT', achievement: 'First place' });
        expect(recognitionOf(both, INSPACE_COMPETITION, 'model-rocketry')).toMatchObject({ stage: 'participant', achievement: '' });
    });

    it('formats verification dates and ignores anything else', () => {
        expect(formatVerifiedDate('2026-11-06')).toBe('6 November 2026');
        expect(formatVerifiedDate('')).toBe('');
        expect(formatVerifiedDate('06/11/2026')).toBe('');
    });
});

describe('image dimensions', () => {
    const be16 = (n: number) => [n >> 8, n & 0xff];
    const le24 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff];

    it('reads JPEG, PNG and WebP headers', () => {
        const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...new Array(14).fill(0), 0xff, 0xc0, 0x00, 0x11, 0x08, ...be16(754), ...be16(1132), 0x03, ...new Array(20).fill(0)]);
        expect(imageSize(jpeg)).toEqual({ width: 1132, height: 754 });
        const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0x04, 0xb0, 0, 0, 0x02, 0x76, 8, 6, 0, 0, 0]);
        expect(imageSize(png)).toEqual({ width: 1200, height: 630 });
        const webp = Uint8Array.from([...Buffer.from('RIFF'), 0, 0, 0, 0, ...Buffer.from('WEBPVP8X'), 10, 0, 0, 0, 0, 0, 0, 0, ...le24(1131), ...le24(753)]);
        expect(imageSize(webp)).toEqual({ width: 1132, height: 754 });
    });

    it('returns null for anything it cannot read', () => {
        expect(imageSize(Uint8Array.from(JPEG))).toBeNull();
        expect(imageSize(Uint8Array.from(Buffer.from('%PDF-1.4')))).toBeNull();
        expect(imageSize(new Uint8Array(0))).toBeNull();
    });
});
