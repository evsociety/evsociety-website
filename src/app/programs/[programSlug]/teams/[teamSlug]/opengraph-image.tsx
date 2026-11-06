import { getCompetition } from '@/config/competitions';
import { getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { CARD_SIZE, renderCard, renderTeamCard } from '@/lib/competitions/server/recognitionCard';

export const size = CARD_SIZE;
export const contentType = 'image/png';
export const alt = 'EV Society team profile';
export const revalidate = 300;

// Social preview for a team profile: the same card as the downloadable recognition card
export default async function Image({ params }: { params: Promise<{ programSlug: string; teamSlug: string }> }) {
    const { programSlug, teamSlug } = await params;
    const competition = getCompetition(programSlug)!;
    const team = (await getCompetitionDataSafe(competition))?.data.teams.find((t) => t.slug === teamSlug);
    if (team) return renderTeamCard(competition, team);
    return renderCard({ competition, eyebrow: competition.shortName, title: 'EV Society team profiles', standing: competition.copy.winnersSubtitle, photo: null });
}
