// Teams EV Society publishes from code: added to the spreadsheet's published teams, replaced by
// a spreadsheet team with the same slug or year and team code, hidden with the competition.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { INSPACE_COMPETITION } from '@/config/competitions/inspace';
import type { CompetitionDefinition } from '@/config/competitions';
import type { PublicTeam } from '@/lib/competitions/model';
import { emptyCompetitionData, sanitizeSnapshot, withPublishedTeams } from '@/lib/competitions/publicModel';
import { categoryWinners } from '@/app/programs/[programSlug]/winners/winnersData';

// Fictional team: real student data never goes into tests
const codeTeam: PublicTeam = {
    slug: 'team-orion-rocketry-099',
    year: 2026,
    name: 'Team Orion',
    teamCode: 'Rocketry-099',
    college: '',
    entryType: 'Team',
    revision: 1,
    teamLogoUrl: null,
    institutionLogoUrl: null,
    teamPhoto: { url: '/programs/space-innovation/team-orion.jpg', width: 1200, height: 800, alt: 'Team Orion at the award presentation' },
    categories: [{ categoryId: 'model-rocketry', participationVerified: true, winnerVerified: true, achievement: '', verifiedAt: '2026-11-28', officialResultUrl: '' }],
    leader: null,
    members: [{ role: 'member', name: 'Kavya Menon', photoUrl: null, linkedin: null, email: null, phone: null }],
    mentors: [],
    links: [{ label: 'Team Orion on LinkedIn', href: 'https://www.linkedin.com/posts/team-orion' }],
};
const competition: CompetitionDefinition = { ...INSPACE_COMPETITION, publishedTeams: [codeTeam] };

const config = { availableYears: [2026], registrationOpen: true, registrationYears: [2026], defaultRegistrationYear: 2026, publicVisible: true, showRegisteredTeams: false, maxMentors: 4 };
const sheetTeam = (overrides: Record<string, unknown>) => ({ year: 2026, name: 'Team Orion (sheet)', categories: [{ categoryId: 'model-rocketry', participationVerified: true, winnerVerified: true }], ...overrides });

describe('teams published from code', () => {
    it('are added to the spreadsheet teams and count as verified winners', () => {
        const data = withPublishedTeams(sanitizeSnapshot({ config, teams: [sheetTeam({ slug: 'team-vega-2026', teamCode: 'Rocketry-001' })] }, competition), competition);
        expect(data.teams.map((t) => t.slug)).toEqual(['team-vega-2026', 'team-orion-rocketry-099']);
        expect(categoryWinners(data, 'model-rocketry').map((t) => t.slug)).toContain('team-orion-rocketry-099');
        expect(categoryWinners(data, 'can-7usat')).toEqual([]);
    });

    it('give way to a published spreadsheet team with the same slug, or the same year and team code', () => {
        const sameSlug = withPublishedTeams(sanitizeSnapshot({ config, teams: [sheetTeam({ slug: 'team-orion-rocketry-099' })] }, competition), competition);
        expect(sameSlug.teams).toHaveLength(1);
        expect(sameSlug.teams[0].name).toBe('Team Orion (sheet)');
        const sameCode = withPublishedTeams(sanitizeSnapshot({ config, teams: [sheetTeam({ slug: 'orion-2026', teamCode: 'rocketry-099' })] }, competition), competition);
        expect(sameCode.teams.map((t) => t.slug)).toEqual(['orion-2026']);
    });

    it('replace a spreadsheet copy not yet published as a winner, so no slug appears twice', () => {
        const participantOnly = sheetTeam({ slug: 'team-orion-rocketry-099', categories: [{ categoryId: 'model-rocketry', participationVerified: true }] });
        const data = withPublishedTeams(sanitizeSnapshot({ config, teams: [participantOnly] }, competition), competition);
        expect(data.teams).toEqual([codeTeam]);
    });

    it('show without a backend and stay hidden while the competition is not public', () => {
        expect(withPublishedTeams(emptyCompetitionData(competition), competition).teams).toEqual([codeTeam]);
        const hidden = sanitizeSnapshot({ config: { ...config, publicVisible: false }, teams: [] }, competition);
        expect(withPublishedTeams(hidden, competition).teams).toEqual([]);
    });

    it('leave data unchanged when a competition has none', () => {
        const data = emptyCompetitionData(competition);
        expect(withPublishedTeams(data, { ...competition, publishedTeams: undefined })).toBe(data);
    });

    it('are well formed in the IN-SPACe configuration', () => {
        const categoryIds = INSPACE_COMPETITION.categories.map((c) => c.id);
        const teams = INSPACE_COMPETITION.publishedTeams ?? [];
        expect(new Set(teams.map((t) => t.slug)).size).toBe(teams.length);
        for (const team of teams) {
            expect(team.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
            expect(team.name).not.toBe('');
            expect(team.categories.every((c) => categoryIds.includes(c.categoryId) && c.winnerVerified && c.participationVerified)).toBe(true);
            expect(team.categories.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.verifiedAt))).toBe(true);
            if (team.teamPhoto) expect(existsSync(path.join(process.cwd(), 'public', team.teamPhoto.url))).toBe(true);
            for (const link of team.links ?? []) expect(link.href).toMatch(/^https:\/\//);
        }
    });
});
