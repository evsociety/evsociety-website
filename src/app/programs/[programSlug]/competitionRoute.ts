import { notFound } from 'next/navigation';
import { COMPETITIONS, getCompetition, type CompetitionDefinition } from '@/config/competitions';
import type { PublicTeam } from '@/lib/competitions/model';

// Shared by the competition sub-pages under /programs/[programSlug]/…

export type CompetitionPageProps = { params: Promise<{ programSlug: string }> };

export function competitionParams() {
    return COMPETITIONS.map((c) => ({ programSlug: c.slug }));
}

export function competitionOr404(slug: string): CompetitionDefinition {
    const competition = getCompetition(slug);
    if (!competition || competition.slug !== slug || competition.basePath !== `/programs/${slug}`) notFound();
    return competition;
}

export function currentYearInIndia(): number {
    return Number(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date()));
}

/** Years to offer in a directory: configured years plus any year that has published teams */
export function directoryYears(available: number[], teams: PublicTeam[], upTo?: number): number[] {
    const years = new Set<number>([...teams.map((t) => t.year), ...available.filter((y) => (upTo ? y <= upTo : true))]);
    return Array.from(years).sort((a, b) => b - a);
}
