// Rendered output of the public profile components (server rendering, no browser needed)

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AwardPDFCard from '@/components/competitions/AwardPDFCard';
import CompetitionJourneys from '@/components/competitions/CompetitionJourneys';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import ContactLinks from '@/components/competitions/ContactLinks';
import DefaultProfileAvatar, { initialsOf } from '@/components/competitions/DefaultProfileAvatar';
import TeamProfileCard from '@/components/competitions/TeamProfileCard';
import WinnersDirectory from '@/components/competitions/WinnersDirectory';
import { INSPACE_COMPETITION } from '@/config/competitions/inspace';
import type { PublicTeam } from '@/lib/competitions/model';
import { DRONE_COMPETITION } from './droneCompetition';

const team: PublicTeam = {
    slug: 'team-astra-2026',
    year: 2026,
    name: 'Team Astra',
    college: 'RV College of Engineering',
    entryType: 'Team',
    revision: 1,
    teamLogoUrl: null,
    institutionLogoUrl: null,
    teamPhotoUrl: null,
    categories: [
        { categoryId: 'model-rocketry', participationVerified: true, winnerVerified: false, achievement: '' },
        { categoryId: 'can-7usat', participationVerified: true, winnerVerified: true, achievement: 'First place' },
    ],
    leader: { role: 'leader', name: 'Asha Rao', photoUrl: '/api/competitions/media/x/FIL-ABCDEFGHJKLM', linkedin: 'https://www.linkedin.com/in/asha', email: null, phone: null },
    members: [{ role: 'member', name: 'Ravi Kumar', photoUrl: null, linkedin: null, email: null, phone: null }],
    mentors: [],
};

describe('profile components', () => {
    it('20: people without an approved photograph get an initials avatar, never a stock face', () => {
        const html = renderToStaticMarkup(<TeamProfileCard team={team} competition={INSPACE_COMPETITION} variant="full" />);
        expect(html).toContain('aria-label="Ravi Kumar (no photograph)"');
        expect(html).toContain('>RK<');
        expect(html).toContain('alt="Photograph of Asha Rao"');
        expect(initialsOf('dr. a. p. j. abdul kalam')).toBe('DK');
        expect(renderToStaticMarkup(<DefaultProfileAvatar name="" />)).toContain('>?<');
    });

    it('21: renders only contact links that exist, and nothing when none do', () => {
        expect(renderToStaticMarkup(<ContactLinks name="Ravi" />)).toBe('');
        const html = renderToStaticMarkup(<ContactLinks name="Asha" linkedin="https://www.linkedin.com/in/asha" />);
        expect(html).toContain('Asha on LinkedIn (opens in a new tab)');
        expect(html).toContain('rel="noopener noreferrer nofollow"');
        expect(html).not.toContain('mailto:');
        expect(html).not.toContain('tel:');
        const html2 = renderToStaticMarkup(<ContactLinks name="Asha" phone="+91 98450 12345" />);
        expect(html2).toContain('href="tel:+919845012345"');
    });

    it('labels participation and winners per category and hides empty mentor sections', () => {
        const html = renderToStaticMarkup(<TeamProfileCard team={team} competition={INSPACE_COMPETITION} />);
        expect(html).toContain('Participation verified');
        expect(html).toContain('Winner verified');
        expect(html).toContain('First place');
        expect(html).not.toContain('Mentor');
        const filtered = renderToStaticMarkup(<TeamProfileCard team={team} competition={INSPACE_COMPETITION} categoryId="model-rocketry" />);
        expect(filtered).not.toContain('Winner verified');
    });

    it('3: the register action always reads "Register Team" with no year', () => {
        const html = renderToStaticMarkup(<CompetitionJourneys competition={INSPACE_COMPETITION} />) + renderToStaticMarkup(<CompetitionNav competition={INSPACE_COMPETITION} active="overview" />);
        const labels = [...html.matchAll(/>(Register Team[^<]*)</g)].map((m) => m[1]);
        expect(labels.length).toBeGreaterThan(1);
        expect(labels.every((l) => l === 'Register Team')).toBe(true);
        expect(html).toContain('href="/programs/inspace-model-rocketry-cansat/register"');
        expect(html).toContain('href="/programs/inspace-model-rocketry-cansat/winners#awards"');
    });

    it('29: an award without a published document shows no view or download link', () => {
        const html = renderToStaticMarkup(<AwardPDFCard award={{ awardId: 'A', year: 2026, categoryId: 'can-7usat', title: 'EV Society CAN-7USAT Innovation Award 2026', status: 'Proposed', document: null, thumbnailUrl: null }} categoryLabel="CAN-7USAT" />);
        expect(html).toContain('has not been published yet');
        expect(html).not.toContain('<a ');
        expect(html).toContain('Proposed');
        const published = renderToStaticMarkup(<AwardPDFCard award={{ awardId: 'B', year: 2026, categoryId: 'can-7usat', title: 'Award', status: 'Proposed', document: { viewUrl: '/a.pdf', downloadUrl: '/a.pdf', kind: 'site' }, thumbnailUrl: null }} categoryLabel="CAN-7USAT" />);
        expect(published).toContain('View PDF');
        expect(published).toContain('download=""');
    });

    it('shows dignified empty states instead of invented winners', () => {
        const html = renderToStaticMarkup(<WinnersDirectory competition={INSPACE_COMPETITION} teams={[]} years={[2026]} defaultYear={2026} />);
        expect(html).toContain('Competition winners will be announced following official verification.');
        expect(html).toContain('Model Rocketry Winners');
        expect(html).toContain('CAN-7USAT Winners');
        expect(html).not.toMatch(/All winners|Combined/i);
    });

    it('30: the same components render a differently configured competition', () => {
        const drone = { ...team, slug: 'sky-2027', year: 2027, name: 'Sky Team', categories: [{ categoryId: 'autonomy', participationVerified: true, winnerVerified: true, achievement: '' }] };
        const html = renderToStaticMarkup(<WinnersDirectory competition={DRONE_COMPETITION} teams={[drone]} years={[2027]} defaultYear={2027} />);
        expect(html).toContain('Autonomous Navigation Winners');
        expect(html).toContain('href="/programs/drone-challenge/teams/sky-2027"');
        const nav = renderToStaticMarkup(<CompetitionNav competition={DRONE_COMPETITION} active="winners" />);
        expect(nav).not.toContain('Innovation Awards');
    });
});
