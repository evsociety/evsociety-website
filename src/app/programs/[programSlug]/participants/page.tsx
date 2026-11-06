import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import ParticipantsDirectory from '@/components/competitions/ParticipantsDirectory';
import { competitionPaths, getCompetition } from '@/config/competitions';
import { getCompetitionData } from '@/lib/competitions/server/publicData';
import { competitionOr404, competitionParams, directoryYears, type CompetitionPageProps } from '../competitionRoute';
import { OG_IMAGE } from '@/config/site';

export const revalidate = 60;
export const dynamicParams = false;
export const generateStaticParams = competitionParams;

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
    const competition = getCompetition((await params).programSlug);
    if (!competition) return {};
    const path = competitionPaths(competition).participants;
    return {
        title: `${competition.copy.participantsTitle} | ${competition.shortName}`,
        description: competition.copy.participantsSubtitle,
        alternates: { canonical: path },
        openGraph: { title: `${competition.copy.participantsTitle} | ${competition.shortName}`, description: competition.copy.participantsSubtitle, url: path, images: [OG_IMAGE] },
    };
}

export default async function ParticipantsPage({ params }: CompetitionPageProps) {
    const competition = competitionOr404((await params).programSlug);
    const { data, source } = await getCompetitionData(competition);
    const years = directoryYears(data.config.availableYears, data.teams);
    const withParticipants = data.teams.filter((t) => t.categories.some((c) => c.participationVerified)).map((t) => t.year);
    const defaultYear = withParticipants.length ? Math.max(...withParticipants) : years.includes(data.config.defaultRegistrationYear) ? data.config.defaultRegistrationYear : years[0];
    const paths = competitionPaths(competition);
    return (
        <div className="bg-off-white">
            <CompetitionHero competition={competition} title={competition.copy.participantsTitle} crumb="Participating Teams" subtitle={competition.copy.participantsSubtitle}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href={paths.register} className="btn-primary min-h-12">Register Team</Link>
                    <Link href={paths.winners} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-6 font-semibold text-white hover:bg-white/10">Competition Winners</Link>
                </div>
            </CompetitionHero>
            <CompetitionNav competition={competition} active="participants" />
            <div className="container-custom py-12 lg:py-16">
                {source === 'stale' && (
                    <p role="status" className="mb-6 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Showing the most recent approved information while we reconnect to the latest updates.
                    </p>
                )}
                <ParticipantsDirectory competition={competition} teams={data.teams} stats={data.stats} years={years} defaultYear={defaultYear} showRegisteredTeams={data.config.showRegisteredTeams} />
            </div>
        </div>
    );
}
