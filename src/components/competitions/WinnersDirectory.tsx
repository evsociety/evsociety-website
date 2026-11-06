'use client';

import { useState } from 'react';
import { ChevronDown, Trophy } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import type { PublicTeam } from '@/lib/competitions/model';
import CategoryTabs from './CategoryTabs';
import EmptyState from './EmptyState';
import TeamProfileCard from './TeamProfileCard';

const winnersIn = (teams: PublicTeam[], year: number, categoryId: string) =>
    teams.filter((t) => t.year === year && t.categories.some((c) => c.categoryId === categoryId && c.winnerVerified && c.participationVerified));

function YearWinners({ competition, teams, year }: { competition: CompetitionDefinition; teams: PublicTeam[]; year: number }) {
    const byCategory = competition.categories.map((c) => ({ category: c, winners: winnersIn(teams, year, c.id) }));
    const first = byCategory.find((c) => c.winners.length)?.category.id ?? competition.categories[0].id;
    const [tab, setTab] = useState(first);
    const total = byCategory.reduce((n, c) => n + c.winners.length, 0);
    const current = byCategory.find((c) => c.category.id === tab)!;
    const idPrefix = `winners-${year}`;
    return (
        <div>
            <CategoryTabs
                tabs={byCategory.map(({ category, winners }) => ({ id: category.id, label: category.winnersLabel, count: winners.length }))}
                value={tab}
                onChange={setTab}
                idPrefix={idPrefix}
                label={`${year} winners by category`}
            />
            <div id={`${idPrefix}-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${tab}`} className="mt-6">
                {current.winners.length ? (
                    <ul className="grid gap-6">
                        {current.winners.map((team) => (
                            <li key={team.slug}>
                                <TeamProfileCard team={team} competition={competition} categoryId={tab} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState icon={Trophy} title={total ? 'Winners will be published following official verification.' : 'Competition winners will be announced following official verification.'}>
                        {total ? `No ${current.category.label} winners have been verified for ${year} yet.` : 'EV Society publishes winners only after official results are verified. No results have been invented or assumed.'}
                    </EmptyState>
                )}
            </div>
        </div>
    );
}

// Years newest first; the latest year with verified results starts expanded
export default function WinnersDirectory({ competition, teams, years, defaultYear }: { competition: CompetitionDefinition; teams: PublicTeam[]; years: number[]; defaultYear: number }) {
    return (
        <ul className="space-y-4">
            {years.map((year) => {
                const count = competition.categories.reduce((n, c) => n + winnersIn(teams, year, c.id).length, 0);
                return (
                    <li key={year}>
                        <details open={year === defaultYear} className="group rounded-2xl border border-gray-200 bg-white shadow-sm open:shadow-md">
                            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 sm:px-7 [&::-webkit-details-marker]:hidden">
                                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="text-2xl font-bold tracking-tight text-gray-900">{year}</span>
                                    <span className="text-sm text-gray-500">{count ? `${count} verified ${count === 1 ? 'winner' : 'winners'}` : 'Results not yet published'}</span>
                                </span>
                                <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                            </summary>
                            <div className="border-t border-gray-100 px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
                                <YearWinners competition={competition} teams={teams} year={year} />
                            </div>
                        </details>
                    </li>
                );
            })}
        </ul>
    );
}
