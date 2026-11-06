'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search, SearchX, Users } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import type { PublicCompetitionData, PublicTeam } from '@/lib/competitions/model';
import CategoryTabs from './CategoryTabs';
import CompetitionYearSelector from './CompetitionYearSelector';
import EmptyState from './EmptyState';
import TeamProfileCard from './TeamProfileCard';

type View = 'participants' | 'registered';

interface Props {
    competition: CompetitionDefinition;
    teams: PublicTeam[];
    stats: PublicCompetitionData['stats'];
    years: number[];
    defaultYear: number;
    showRegisteredTeams: boolean;
}

const matches = (team: PublicTeam, q: string) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return team.name.toLowerCase().includes(needle) || team.college.toLowerCase().includes(needle);
};

// Year, category and search filters run in the browser over the published list, so the page
// itself stays cached and fast. Filters are mirrored in the URL for sharing.
export default function ParticipantsDirectory({ competition, teams, stats, years, defaultYear, showRegisteredTeams }: Props) {
    const [year, setYear] = useState(defaultYear);
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [view, setView] = useState<View>('participants');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const y = Number(params.get('year'));
        if (years.includes(y)) setYear(y);
        const c = params.get('category');
        if (c && competition.categories.some((cat) => cat.id === c)) setCategory(c);
        const q = params.get('q');
        if (q) setQuery(q.slice(0, 80));
        if (params.get('view') === 'registered' && showRegisteredTeams) setView('registered');
    }, [competition.categories, years, showRegisteredTeams]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (year !== defaultYear) params.set('year', String(year));
        if (category !== 'all') params.set('category', category);
        if (query) params.set('q', query);
        if (view === 'registered') params.set('view', 'registered');
        const qs = params.toString();
        window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`);
    }, [year, category, query, view, defaultYear]);

    const inView = (team: PublicTeam, categoryId: string) => {
        const cats = categoryId === 'all' ? team.categories : team.categories.filter((c) => c.categoryId === categoryId);
        return view === 'registered' ? cats.length > 0 : cats.some((c) => c.participationVerified);
    };

    const yearTeams = useMemo(() => teams.filter((t) => t.year === year), [teams, year]);
    const counts = Object.fromEntries(['all', ...competition.categories.map((c) => c.id)].map((id) => [id, yearTeams.filter((t) => inView(t, id)).length]));
    const results = yearTeams.filter((t) => inView(t, category) && matches(t, query.trim()));
    const yearStats = stats[String(year)];
    const approved = category === 'all' ? yearStats?.approvedRegistrations ?? 0 : yearStats?.categories[category]?.approvedRegistrations ?? 0;
    const tabs = [{ id: 'all', label: 'All categories', count: counts.all }, ...competition.categories.map((c) => ({ id: c.id, label: c.label, count: counts[c.id] }))];

    let empty: React.ReactNode = null;
    if (!results.length) {
        if (query.trim() && yearTeams.some((t) => inView(t, category))) {
            empty = (
                <EmptyState icon={SearchX} title={`No teams match “${query.trim()}”`} action={<button type="button" onClick={() => setQuery('')} className="btn-secondary min-h-11">Clear search</button>}>
                    Try a different team or college name.
                </EmptyState>
            );
        } else if (view === 'participants' && approved > 0) {
            empty = <EmptyState icon={Users} title="Participating teams will be featured after participation verification." />;
        } else {
            empty = <EmptyState icon={ClipboardList} title="Team registrations will appear here after review and approval." />;
        }
    }

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-4 md:grid-cols-[10rem_1fr] md:items-end">
                    <CompetitionYearSelector id="participants-year" years={years} value={year} onChange={setYear} />
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="participants-search" className="text-sm font-medium text-gray-700">Search teams or colleges</label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input
                                id="participants-search"
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value.slice(0, 80))}
                                placeholder="Team or college name"
                                className="min-h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <CategoryTabs tabs={tabs} value={category} onChange={setCategory} idPrefix="participants" label="Competition category" />
                    {showRegisteredTeams && (
                        <fieldset className="flex shrink-0 items-center gap-1 rounded-full border border-gray-200 p-1">
                            <legend className="sr-only">Which teams to show</legend>
                            {(['participants', 'registered'] as View[]).map((v) => (
                                <label key={v} className={`cursor-pointer rounded-full px-3.5 py-2 text-sm font-semibold ${view === v ? 'bg-navy text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                    <input type="radio" name="participants-view" value={v} checked={view === v} onChange={() => setView(v)} className="sr-only" />
                                    {v === 'participants' ? 'Verified participants' : 'Registered teams'}
                                </label>
                            ))}
                        </fieldset>
                    )}
                </div>
            </div>

            <div id="participants-panel" role="tabpanel" aria-labelledby={`participants-tab-${category}`} className="mt-8">
                <p className="mb-5 text-sm text-gray-600" aria-live="polite">
                    {results.length
                        ? `${results.length} ${results.length === 1 ? 'team' : 'teams'} · ${year}${view === 'registered' ? ' · registration approved' : ' · participation verified'}`
                        : `No teams to show for ${year}`}
                </p>
                {view === 'registered' && results.length > 0 && (
                    <p className="mb-6 rounded-xl bg-off-white px-4 py-3 text-sm text-gray-600">
                        Registered teams have an approved EV Society profile. A team is labelled a participant only after EV Society verifies its participation.
                    </p>
                )}
                {empty ?? (
                    <ul className="grid gap-6">
                        {results.map((team) => (
                            <li key={team.slug}>
                                <TeamProfileCard team={team} competition={competition} categoryId={category === 'all' ? undefined : category} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
