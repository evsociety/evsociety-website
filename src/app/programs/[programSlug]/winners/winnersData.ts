import type { CompetitionDefinition, CompetitionCategory } from '@/config/competitions';
import type { PublicCompetitionData, PublicTeam } from '@/lib/competitions/model';
import { currentYearInIndia, directoryYears } from '../competitionRoute';

/** Teams verified as winners in one category, newest year first, then by name */
export function categoryWinners(data: PublicCompetitionData, categoryId: string): PublicTeam[] {
    return data.teams
        .filter((t) => t.categories.some((c) => c.categoryId === categoryId && c.winnerVerified && c.participationVerified))
        .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
}

/**
 * Years to show: years with verified winners plus configured years that have started.
 * Future years never appear as if results existed.
 */
export function winnerYears(data: PublicCompetitionData, winners: PublicTeam[]): { years: number[]; defaultYear: number } {
    const years = directoryYears(data.config.availableYears, winners, currentYearInIndia());
    const listed = years.length ? years : [data.config.defaultRegistrationYear];
    const defaultYear = winners.length ? Math.max(...winners.map((t) => t.year)) : listed[0];
    return { years: listed, defaultYear };
}

export function categoryOr404Data(competition: CompetitionDefinition, slug: string): CompetitionCategory | null {
    return competition.categories.find((c) => c.slug === slug) ?? null;
}
