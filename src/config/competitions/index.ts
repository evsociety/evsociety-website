import { INSPACE_COMPETITION } from './inspace';
import type { CompetitionDefinition } from './types';

export type * from './types';

// Every competition on the platform. Adding one here (plus a row in the Competitions tab of
// the spreadsheet) enables its register, manage, participants, winners and team pages.
// See docs/competition-platform/ADDING-A-COMPETITION.md.
export const COMPETITIONS: CompetitionDefinition[] = [INSPACE_COMPETITION];

export function getCompetition(idOrSlug: string): CompetitionDefinition | null {
    return COMPETITIONS.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null;
}

export function competitionPaths(competition: CompetitionDefinition) {
    const base = competition.basePath;
    return {
        overview: base,
        register: `${base}/register`,
        manage: `${base}/manage`,
        participants: `${base}/participants`,
        winners: `${base}/winners`,
        awards: `${base}/winners#awards`,
        team: (slug: string) => `${base}/teams/${slug}`,
        consent: (token: string) => `${base}/consent/${token}`,
    };
}

export function categoryLabel(competition: CompetitionDefinition, categoryId: string): string {
    return competition.categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}
