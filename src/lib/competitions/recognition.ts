// What a team may be called publicly, derived only from verified fields. Titles, descriptions,
// share captions, recognition cards and structured data all use these helpers, so no page can
// claim more than EV Society has verified.

import type { CompetitionDefinition } from '@/config/competitions';
import { categoryLabel } from '@/config/competitions';
import type { PublicTeam, PublicTeamCategory } from './model';
import { stageOf } from './model';

export interface Recognition {
    category: PublicTeamCategory;
    categoryLabel: string;
    stage: 'winner' | 'participant' | 'registered';
    /** e.g. "Model Rocketry Winners" or "Model Rocketry · Participation verified" */
    headline: string;
    achievement: string;
}

/** The team's strongest verified standing, optionally within one category */
export function recognitionOf(team: PublicTeam, competition: CompetitionDefinition, categoryId?: string): Recognition | null {
    const pool = categoryId ? team.categories.filter((c) => c.categoryId === categoryId) : team.categories;
    if (!pool.length) return null;
    const rank = { winner: 0, participant: 1, registered: 2 } as const;
    const best = [...pool].sort((a, b) => rank[stageOf(a)] - rank[stageOf(b)])[0];
    const stage = stageOf(best);
    const label = categoryLabel(competition, best.categoryId);
    return {
        category: best,
        categoryLabel: label,
        stage,
        headline: stage === 'winner' ? `${label} Winners` : stage === 'participant' ? `${label} · Participation verified` : `${label} · Registration approved`,
        achievement: stage === 'winner' ? best.achievement : '',
    };
}

export const teamDisplayName = (team: PublicTeam) => (team.teamCode ? `${team.name} (${team.teamCode})` : team.name);

export function teamPageTitle(team: PublicTeam, competition: CompetitionDefinition): string {
    const r = recognitionOf(team, competition);
    if (!r) return `${teamDisplayName(team)} | EV Society`;
    const standing = r.stage === 'winner' ? `${r.categoryLabel} Winners` : r.stage === 'participant' ? `${r.categoryLabel} Participants` : `${r.categoryLabel} Team`;
    return `${teamDisplayName(team)} — ${standing} ${team.year} | EV Society`;
}

export function teamDescription(team: PublicTeam, competition: CompetitionDefinition): string {
    const r = recognitionOf(team, competition);
    const who = `${teamDisplayName(team)}${team.college ? ` from ${team.college}` : ''}`;
    const standing = !r
        ? `a team in the ${competition.name} ${team.year}`
        : r.stage === 'winner'
            ? `a verified ${r.categoryLabel} winner${r.achievement ? ` (${r.achievement})` : ''} of the ${competition.name} ${team.year}`
            : r.stage === 'participant'
                ? `a verified ${r.categoryLabel} participant in the ${competition.name} ${team.year}`
                : `a registered ${r.categoryLabel} team for the ${competition.name} ${team.year}`;
    const people = team.members.length + (team.leader ? 1 : 0);
    return `${who} is ${standing}.${people ? ` Meet the ${people}-member engineering team` : ' View the team profile'} on EV Society. The competition is organised by ${competition.copy.organiserShort}.`;
}

/**
 * Suggested post text. Only verified standings are described; anything else gets a neutral
 * invitation to view the profile. LinkedIn cannot pre-fill post text, so this is offered as a
 * "Copy caption" action alongside the share link.
 */
export function shareCaption(team: PublicTeam, competition: CompetitionDefinition, url: string): string {
    const r = recognitionOf(team, competition);
    const name = teamDisplayName(team);
    if (r?.stage === 'winner') {
        return `Celebrating ${name} — ${r.categoryLabel} Winners, ${competition.copy.shareName} ${team.year}.\n\nRecognising the engineering talent, teamwork and innovation behind this achievement.\n\nExplore the team profile on EV Society: ${url}`;
    }
    if (r?.stage === 'participant') {
        return `${name} took part in the ${r.categoryLabel} category of the ${competition.copy.shareName} ${team.year}.\n\nMeet the engineering team on EV Society: ${url}`;
    }
    return `Meet ${name} on EV Society: ${url}`;
}

export function formatVerifiedDate(iso: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
    const date = new Date(`${iso}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
