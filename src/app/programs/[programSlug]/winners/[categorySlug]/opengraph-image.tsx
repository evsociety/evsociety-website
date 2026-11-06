import { getCompetition } from '@/config/competitions';
import { getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { CARD_SIZE, renderCard, renderTeamCard } from '@/lib/competitions/server/recognitionCard';
import { categoryOr404Data, categoryWinners, winnerYears } from '../winnersData';

export const size = CARD_SIZE;
export const contentType = 'image/png';
export const alt = 'EV Society competition winners';
export const revalidate = 300;

// Social preview for a category's winners page: the latest verified winning team with its
// approved photograph, or a text-only card while results are awaiting verification
export default async function Image({ params }: { params: Promise<{ programSlug: string; categorySlug: string }> }) {
    const { programSlug, categorySlug } = await params;
    const competition = getCompetition(programSlug)!;
    const category = categoryOr404Data(competition, categorySlug)!;
    const result = await getCompetitionDataSafe(competition);
    const winners = result ? categoryWinners(result.data, category.id) : [];
    const { defaultYear } = result ? winnerYears(result.data, winners) : { defaultYear: competition.defaults.defaultRegistrationYear };
    const featured = winners.find((t) => t.year === defaultYear);
    if (featured) return renderTeamCard(competition, featured);
    return renderCard({
        competition,
        eyebrow: `${competition.copy.organiserShort} · ${category.label}`,
        title: category.winnersLabel,
        standing: 'Results are published after official verification',
        photo: null,
    });
}
