import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Award, Hourglass } from 'lucide-react';
import AwardsSection from '@/components/competitions/AwardsSection';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import TrackView from '@/components/competitions/TrackView';
import KeepCanSatTogether from '@/components/programs/KeepCanSatTogether';
import { competitionPaths, getCompetition } from '@/config/competitions';
import { GA4_EVENTS } from '@/data/analytics/events';
import { getCompetitionData } from '@/lib/competitions/server/publicData';
import { competitionOr404, competitionParams, type CompetitionPageProps } from '../competitionRoute';
import { categoryWinners, winnerYears } from './winnersData';
import { OG_IMAGE } from '@/config/site';

export const revalidate = 60;
export const dynamicParams = false;
export const generateStaticParams = competitionParams;

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
    const competition = getCompetition((await params).programSlug);
    if (!competition) return {};
    const path = competitionPaths(competition).winners;
    return {
        title: competition.copy.winnersTitle,
        description: `${competition.copy.winnersSubtitle} Verified winners by category, with EV Society's innovation awards.`,
        alternates: { canonical: path },
        openGraph: { title: competition.copy.winnersTitle, description: competition.copy.winnersSubtitle, url: path, images: [OG_IMAGE] },
    };
}

// Winners landing page: each category has its own page and URL; this page links to them
export default async function WinnersPage({ params }: CompetitionPageProps) {
    const competition = competitionOr404((await params).programSlug);
    const paths = competitionPaths(competition);
    const { data, source } = await getCompetitionData(competition);
    const categories = competition.categories.map((category) => {
        const winners = categoryWinners(data, category.id);
        const { defaultYear } = winnerYears(data, winners);
        return { category, year: defaultYear, winners: winners.filter((t) => t.year === defaultYear) };
    });
    return (
        <div className="bg-white">
            <TrackView event={GA4_EVENTS.WINNERS_PAGE_VIEW} params={{ competition_id: competition.id }} />
            <CompetitionHero competition={competition} title={<KeepCanSatTogether text={competition.copy.winnersTitle} />} crumb="Winners" subtitle={competition.copy.winnersSubtitle} eyebrow="Competition winners" />
            <CompetitionNav competition={competition} active="winners" />
            <section aria-labelledby="by-category" className="bg-off-white py-12 lg:py-16">
                <div className="container-custom">
                    {source === 'stale' && (
                        <p role="status" className="mb-6 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            Showing the most recent approved information while we reconnect to the latest updates.
                        </p>
                    )}
                    <h2 id="by-category" className="text-2xl font-bold tracking-tight sm:text-3xl">Winners by category</h2>
                    <p className="mt-2 max-w-3xl text-gray-600">Each category has its own winners page. Results appear only after EV Society verifies them against the organiser&apos;s official results.</p>
                    <ul className="mt-8 grid gap-6 lg:grid-cols-2">
                        {categories.map(({ category, year, winners }) => (
                            <li key={category.id}>
                                <article aria-labelledby={`cat-${category.id}`} className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                                    <div className="relative overflow-hidden bg-navy px-7 py-8 text-white">
                                        <div aria-hidden="true" className="absolute -right-16 -top-10 h-48 w-80 rotate-[-18deg] rounded-[50%] border border-primary-300/20" />
                                        <p className="flex items-center gap-3 text-sm font-semibold tracking-wide text-gold-300">
                                            <span aria-hidden="true" className="h-px w-6 bg-gold-300" />
                                            {competition.copy.organiserShort} · {year}
                                        </p>
                                        <h3 id={`cat-${category.id}`} className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{category.winnersLabel}</h3>
                                    </div>
                                    <div className="flex flex-1 flex-col p-7">
                                        {winners.length ? (
                                            <ul className="space-y-3">
                                                {winners.map((t) => (
                                                    <li key={t.slug} className="flex items-start gap-3">
                                                        <Award className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
                                                        <div>
                                                            <Link href={paths.team(t.slug)} className="inline-block text-lg font-bold text-gray-900 hover:text-primary">{t.name}</Link>
                                                            <p className="text-sm text-gray-600">{[t.teamCode, t.categories.find((c) => c.categoryId === category.id)?.achievement, t.college].filter(Boolean).join(' · ') || 'Verified winner'}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="flex items-start gap-3 text-gray-600">
                                                <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
                                                Winner details awaiting verification and publication.
                                            </p>
                                        )}
                                        <div className="mt-auto pt-7">
                                            <Link href={paths.categoryWinners(category.slug)} className="btn-primary min-h-12">
                                                View {category.label} winners
                                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            <AwardsSection competition={competition} awards={data.awards} />
        </div>
    );
}
