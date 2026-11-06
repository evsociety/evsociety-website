import { getCompetition } from '@/config/competitions';
import { getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { renderTeamCard } from '@/lib/competitions/server/recognitionCard';

type Ctx = { params: Promise<{ programSlug: string; teamSlug: string }> };

// Downloadable 1200×630 recognition card for a published team (PNG)
export async function GET(_request: Request, { params }: Ctx) {
    const { programSlug, teamSlug } = await params;
    const competition = getCompetition(programSlug);
    if (!competition || !/^[a-z0-9-]{1,90}$/.test(teamSlug)) return new Response('Not found', { status: 404 });
    const team = (await getCompetitionDataSafe(competition))?.data.teams.find((t) => t.slug === teamSlug);
    if (!team) return new Response('Not found', { status: 404 });
    return renderTeamCard(competition, team, {
        headers: {
            'Content-Disposition': `attachment; filename="${team.slug}-recognition-card.png"`,
            // Short lifetime so a withdrawn profile or photograph stops being served promptly
            'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
    });
}
