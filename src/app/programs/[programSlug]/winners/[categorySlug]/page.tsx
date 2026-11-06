import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowRight, Hourglass } from 'lucide-react';
import AwardsSection from '@/components/competitions/AwardsSection';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import EmptyState from '@/components/competitions/EmptyState';
import GroupPhoto from '@/components/competitions/GroupPhoto';
import JsonLd from '@/components/competitions/JsonLd';
import TeamShowcase from '@/components/competitions/TeamShowcase';
import TrackView from '@/components/competitions/TrackView';
import YearSwitcher from '@/components/competitions/YearSwitcher';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { COMPETITIONS, competitionPaths, getCompetition } from '@/config/competitions';
import { SITE_URL } from '@/config/site';
import { GA4_EVENTS } from '@/data/analytics/events';
import { teamDisplayName } from '@/lib/competitions/recognition';
import { getCompetitionData, getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { competitionOr404 } from '../../competitionRoute';
import { categoryOr404Data, categoryWinners, winnerYears } from '../winnersData';

type Props = { params: Promise<{ programSlug: string; categorySlug: string }> };

export const revalidate = 60;
export const dynamicParams = false;
export function generateStaticParams() {
    return COMPETITIONS.flatMap((c) => c.categories.map((cat) => ({ programSlug: c.slug, categorySlug: cat.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { programSlug, categorySlug } = await params;
    const competition = getCompetition(programSlug);
    const category = competition ? categoryOr404Data(competition, categorySlug) : null;
    if (!competition || !category) return {};
    const result = await getCompetitionDataSafe(competition);
    const winners = result ? categoryWinners(result.data, category.id) : [];
    const latest = winners.length ? Math.max(...winners.map((t) => t.year)) : null;
    const latestWinners = winners.filter((t) => t.year === latest);
    // Titles name a year and team only when a verified result exists
    const title = latestWinners.length
        ? `${category.label} Winners ${latest} | ${latestWinners.map((t) => t.name).join(', ')} | EV Society`
        : `${category.label} Competition Winners | EV Society`;
    const description = latestWinners.length
        ? `${latestWinners.map(teamDisplayName).join(', ')}: verified ${category.label} winners of the ${competition.name} ${latest}. Meet the engineering team${latestWinners.length > 1 ? 's' : ''} on EV Society.`
        : `${category.winnersTitle}. ${category.label} winners are published on EV Society after official verification of the results.`;
    const url = competitionPaths(competition).categoryWinners(category.slug);
    return {
        title: { absolute: title },
        description,
        alternates: { canonical: url },
        openGraph: { type: 'website', siteName: 'EV Society™', title, description, url },
        twitter: { card: 'summary_large_image', title, description },
    };
}

export default async function CategoryWinnersPage({ params }: Props) {
    const { programSlug, categorySlug } = await params;
    const competition = competitionOr404(programSlug);
    const category = categoryOr404Data(competition, categorySlug);
    if (!category) notFound();
    const paths = competitionPaths(competition);
    const { data, source } = await getCompetitionData(competition);
    const winners = categoryWinners(data, category.id);
    const { years, defaultYear } = winnerYears(data, winners);
    const featured = winners.find((t) => t.year === defaultYear) ?? null;
    const heroPhoto = featured?.teamPhoto ?? null;
    const others = competition.categories.filter((c) => c.id !== category.id);
    const awards = data.awards.filter((a) => a.categoryId === category.id);
    const url = `${SITE_URL}${paths.categoryWinners(category.slug)}`;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: category.winnersTitle,
        description: category.winnersIntro,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        ...(winners.length
            ? {
                mainEntity: {
                    '@type': 'ItemList',
                    name: `${category.label} winners`,
                    itemListElement: winners.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `${teamDisplayName(t)}, ${t.year}`, url: `${SITE_URL}${paths.team(t.slug)}` })),
                },
            }
            : {}),
        ...(heroPhoto ? { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: `${SITE_URL}${heroPhoto.url}`, caption: heroPhoto.alt } } : {}),
    };

    return (
        <div className="bg-off-white">
            <JsonLd data={jsonLd} />
            <TrackView event={GA4_EVENTS.WINNER_CATEGORY_VIEW} params={{ competition_id: competition.id, competition_year: defaultYear, category: category.id, content_type: 'winners_category' }} />
            <section className="relative overflow-hidden bg-navy text-white" aria-labelledby="category-title">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gold-300/40" />
                <div className="container-custom py-12 lg:py-16">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: competition.shortName, href: paths.overview }, { label: 'Winners', href: paths.winners }, { label: category.label }]} />
                    <div className={`mt-10 grid items-center gap-10 ${heroPhoto ? 'lg:grid-cols-12 lg:gap-12' : ''}`}>
                        <div className={heroPhoto ? 'lg:col-span-5' : 'max-w-4xl'}>
                            <p className="flex items-center gap-3 text-sm font-semibold tracking-wide text-gold-300">
                                <span aria-hidden="true" className="h-px w-8 bg-gold-300" />
                                {competition.copy.organiserShort} · {category.label}
                            </p>
                            <h1 id="category-title" className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">{category.winnersTitle}</h1>
                            <p className="mt-5 text-lg leading-relaxed text-slate-300">{category.winnersIntro}</p>
                            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                                <div>
                                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Year</dt>
                                    <dd className="mt-1 text-2xl font-bold">{defaultYear}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{featured ? 'Winning team' : 'Results'}</dt>
                                    <dd className="mt-1 text-2xl font-bold">
                                        {featured ? <Link href={paths.team(featured.slug)} className="rounded hover:text-gold-300">{teamDisplayName(featured)}</Link> : <span className="text-slate-300">Awaiting verification</span>}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        {heroPhoto && featured && (
                            <div className="lg:col-span-7">
                                <GroupPhoto image={heroPhoto} priority tone="dark" sizes="(min-width: 1200px) 680px, (min-width: 1024px) 56vw, 100vw" caption={`${featured.name} · ${competition.shortName} ${featured.year}`} />
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <CompetitionNav competition={competition} active="winners" />

            <div className="container-custom py-12 lg:py-16">
                {source === 'stale' && (
                    <p role="status" className="mb-6 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Showing the most recent approved information while we reconnect to the latest updates.
                    </p>
                )}
                {years.length > 1 && (
                    <div className="mb-8 flex flex-wrap items-center gap-4">
                        <p className="text-sm font-semibold text-gray-700">Competition year</p>
                        <YearSwitcher years={years} defaultYear={defaultYear} competitionId={competition.id} categoryId={category.id} />
                    </div>
                )}
                {years.map((year) => {
                    const yearWinners = winners.filter((t) => t.year === year);
                    return (
                        <section key={year} data-year-section={year} hidden={year !== defaultYear} aria-labelledby={`winners-${year}`}>
                            <h2 id={`winners-${year}`} className="text-2xl font-bold tracking-tight sm:text-3xl">{year} {category.label} winners</h2>
                            <div className="mt-8 space-y-10">
                                {yearWinners.length ? (
                                    yearWinners.map((team) => <TeamShowcase key={team.slug} team={team} competition={competition} categoryId={category.id} />)
                                ) : (
                                    <EmptyState icon={Hourglass} title="Winner details awaiting verification and publication.">
                                        EV Society publishes {category.label} winners only after verifying the official results from {competition.copy.organiserShort}. No results have been assumed or invented.
                                    </EmptyState>
                                )}
                            </div>
                        </section>
                    );
                })}

                <nav aria-label="More from this competition" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {others.map((c) => (
                        <Link key={c.id} href={paths.categoryWinners(c.slug)} className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 font-semibold text-gray-900 hover:border-primary">
                            {c.winnersLabel}
                            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                        </Link>
                    ))}
                    <Link href={paths.winners} className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 font-semibold text-gray-900 hover:border-primary">
                        All competition winners
                        <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                    </Link>
                    <Link href={paths.participants} className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 font-semibold text-gray-900 hover:border-primary">
                        Participating teams
                        <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                    </Link>
                </nav>
            </div>
            <AwardsSection competition={competition} awards={awards} heading="Innovation award" sectionId="award" />
        </div>
    );
}
