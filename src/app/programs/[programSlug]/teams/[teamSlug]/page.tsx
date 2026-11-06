import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, GraduationCap } from 'lucide-react';
import AwardsSection from '@/components/competitions/AwardsSection';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import GroupPhoto from '@/components/competitions/GroupPhoto';
import JsonLd from '@/components/competitions/JsonLd';
import StartupShowcase from '@/components/competitions/StartupShowcase';
import TeamMonogram from '@/components/competitions/TeamMonogram';
import TeamShowcase from '@/components/competitions/TeamShowcase';
import TrackView from '@/components/competitions/TrackView';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { categoryLabel, competitionPaths, getCompetition } from '@/config/competitions';
import { SITE_URL } from '@/config/site';
import { GA4_EVENTS } from '@/data/analytics/events';
import { recognitionOf, teamDescription, teamDisplayName, teamPageTitle } from '@/lib/competitions/recognition';
import { getCompetitionData, getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { competitionOr404 } from '../../competitionRoute';

type Props = { params: Promise<{ programSlug: string; teamSlug: string }> };

export const revalidate = 60;
export const dynamicParams = true;
export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { programSlug, teamSlug } = await params;
    const competition = getCompetition(programSlug);
    if (!competition) return {};
    const team = (await getCompetitionDataSafe(competition))?.data.teams.find((t) => t.slug === teamSlug);
    if (!team) return { title: 'Team not found', robots: { index: false } };
    const title = teamPageTitle(team, competition);
    const description = teamDescription(team, competition);
    const url = competitionPaths(competition).team(team.slug);
    return {
        title: { absolute: title },
        description,
        alternates: { canonical: url },
        openGraph: { type: 'website', siteName: 'EV Society™', title, description, url },
        twitter: { card: 'summary_large_image', title, description },
    };
}

export default async function TeamPage({ params }: Props) {
    const { programSlug, teamSlug } = await params;
    const competition = competitionOr404(programSlug);
    const { data } = await getCompetitionData(competition);
    const team = data.teams.find((t) => t.slug === teamSlug);
    if (!team) notFound();
    const paths = competitionPaths(competition);
    const recognition = recognitionOf(team, competition);
    const isWinner = recognition?.stage === 'winner';
    const category = competition.categories.find((c) => c.id === recognition?.category.categoryId);
    const url = `${SITE_URL}${paths.team(team.slug)}`;
    const people = [...(team.leader ? [team.leader] : []), ...team.members];
    const awards = isWinner ? data.awards.filter((a) => a.categoryId === recognition!.category.categoryId && a.year === team.year) : [];
    const verifiedDate = recognition?.category.verifiedAt;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: teamPageTitle(team, competition),
        description: teamDescription(team, competition),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        ...(verifiedDate ? { dateModified: verifiedDate } : {}),
        about: {
            '@type': 'Organization',
            name: team.name,
            ...(team.teamCode ? { identifier: team.teamCode } : {}),
            ...(people.length ? { member: people.map((p) => ({ '@type': 'Person', name: p.name })) } : {}),
        },
        ...(team.teamPhoto ? { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: `${SITE_URL}${team.teamPhoto.url}`, caption: team.teamPhoto.alt, ...(team.teamPhoto.width ? { width: team.teamPhoto.width, height: team.teamPhoto.height } : {}) } } : {}),
    };

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Programs', href: '/programs' },
        { label: competition.shortName, href: paths.overview },
        ...(isWinner && category ? [{ label: 'Winners', href: paths.winners }, { label: category.label, href: paths.categoryWinners(category.slug) }] : [{ label: 'Participating Teams', href: paths.participants }]),
        { label: team.name },
    ];

    return (
        <div className="bg-off-white">
            <JsonLd data={jsonLd} />
            <TrackView event={GA4_EVENTS.TEAM_PROFILE_VIEW} params={{ competition_id: competition.id, competition_year: team.year, category: recognition?.category.categoryId, team_slug: team.slug, content_type: 'team_profile' }} />
            <section className="relative overflow-hidden bg-navy text-white" aria-labelledby="team-title">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gold-300/40" />
                <div className="container-custom py-12 lg:py-16">
                    <Breadcrumbs items={crumbs} />
                    <div className={`mt-10 grid items-center gap-10 ${team.teamPhoto ? 'lg:grid-cols-12 lg:gap-12' : ''}`}>
                        <div className={team.teamPhoto ? 'lg:col-span-5' : 'flex flex-col gap-8 sm:flex-row sm:items-center'}>
                            {!team.teamPhoto && <TeamMonogram name={team.name} logoUrl={team.teamLogoUrl} size="lg" />}
                            <div>
                                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">
                                    <span aria-hidden="true" className="h-px w-8 bg-gold-300" />
                                    EV Society team profile · {team.year}
                                </p>
                                <h1 id="team-title" className="mt-5 break-words text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">{team.name}</h1>
                                {team.teamCode && <p className="mt-4 inline-flex rounded-md bg-white/10 px-3 py-1 font-mono text-lg font-semibold tracking-wide text-gold-300 ring-1 ring-white/15">{team.teamCode}</p>}
                                {recognition && (
                                    <p className="mt-6 flex items-center gap-2.5 text-xl font-semibold text-white">
                                        {isWinner && <Award className="h-6 w-6 shrink-0 text-gold-300" aria-hidden="true" />}
                                        {isWinner ? `${recognition.categoryLabel} Winners` : recognition.headline}
                                        {recognition.achievement && <span className="font-normal text-slate-300">· {recognition.achievement}</span>}
                                    </p>
                                )}
                                <p className="mt-2 text-slate-300">{competition.name}</p>
                                {team.college && (
                                    <p className="mt-4 flex items-start gap-2 text-slate-200">
                                        <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                                        {team.college}
                                    </p>
                                )}
                            </div>
                        </div>
                        {team.teamPhoto && (
                            <div className="lg:col-span-7">
                                <GroupPhoto image={team.teamPhoto} priority tone="dark" sizes="(min-width: 1200px) 680px, (min-width: 1024px) 56vw, 100vw" caption={`${team.name} · ${competition.shortName} ${team.year}`} />
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <CompetitionNav competition={competition} active="team" />

            <div className="container-custom py-12 lg:py-16">
                <section aria-labelledby="about-team" className="max-w-3xl">
                    <h2 id="about-team" className="text-2xl font-bold tracking-tight">About the team</h2>
                    <div className="mt-4 space-y-3 text-lg leading-relaxed text-gray-700">
                        <p>
                            {teamDisplayName(team)}
                            {team.college ? `, from ${team.college},` : ''}{' '}
                            {isWinner
                                ? `is a verified ${recognition!.categoryLabel} winner of the ${competition.name} ${team.year}.`
                                : recognition?.stage === 'participant'
                                    ? `took part in the ${recognition.categoryLabel} category of the ${competition.name} ${team.year}.`
                                    : `is registered for the ${team.categories.map((c) => categoryLabel(competition, c.categoryId)).join(' and ')} ${team.categories.length > 1 ? 'categories' : 'category'} of the ${competition.name} ${team.year}.`}
                            {people.length ? ` The engineering team has ${people.length} ${people.length === 1 ? 'member' : 'members'}.` : ''}
                        </p>
                        <p className="text-base text-gray-600">
                            The competition is organised independently by {competition.organiser}. EV Society publishes verified results and recognises student teams; it does not organise or judge the competition.
                        </p>
                    </div>
                </section>

                <div className="mt-10">
                    <TeamShowcase team={team} competition={competition} variant="page" />
                </div>

                <div className="mt-12"><StartupShowcase startup={null} /></div>

                <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                    {isWinner && category && (
                        <Link href={paths.categoryWinners(category.slug)} className="btn-secondary min-h-11">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {category.winnersLabel}
                        </Link>
                    )}
                    <Link href={paths.participants} className="btn-secondary min-h-11">Participating teams</Link>
                </div>
                <p className="mt-8 max-w-3xl text-sm leading-relaxed text-gray-500">
                    Published with the team&apos;s consent and reviewed by EV Society. Contact details and photographs of individual members appear only with each member&apos;s own consent. To correct or remove information, the team leader can use{' '}
                    <Link href={paths.manage} className="font-semibold text-primary hover:underline">Manage Team Profile</Link> or contact EV Society.
                </p>
            </div>
            <AwardsSection competition={competition} awards={awards} heading="Innovation recognition" sectionId="innovation" />
        </div>
    );
}
