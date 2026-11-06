import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import AwardsSection from '@/components/competitions/AwardsSection';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import WinnersDirectory from '@/components/competitions/WinnersDirectory';
import KeepCanSatTogether from '@/components/programs/KeepCanSatTogether';
import { competitionPaths, getCompetition } from '@/config/competitions';
import { getCompetitionData } from '@/lib/competitions/server/publicData';
import { competitionOr404, competitionParams, currentYearInIndia, directoryYears, type CompetitionPageProps } from '../competitionRoute';

export const revalidate = 60;
export const dynamicParams = false;
export const generateStaticParams = competitionParams;

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
    const competition = getCompetition((await params).programSlug);
    if (!competition) return {};
    const path = competitionPaths(competition).winners;
    return {
        title: competition.copy.winnersTitle,
        description: competition.copy.winnersSubtitle,
        alternates: { canonical: path },
        openGraph: { title: competition.copy.winnersTitle, description: competition.copy.winnersSubtitle, url: path },
    };
}

export default async function WinnersPage({ params }: CompetitionPageProps) {
    const competition = competitionOr404((await params).programSlug);
    const { data, source } = await getCompetitionData(competition);
    const winners = data.teams.filter((t) => t.categories.some((c) => c.winnerVerified));
    // Only years that have happened or have results; future years are not shown as if results existed
    const years = directoryYears(data.config.availableYears, winners, currentYearInIndia());
    const listed = years.length ? years : [data.config.defaultRegistrationYear];
    const defaultYear = winners.length ? Math.max(...winners.map((t) => t.year)) : listed[0];
    return (
        <div className="bg-white">
            <CompetitionHero competition={competition} title={<KeepCanSatTogether text={competition.copy.winnersTitle} />} crumb="Winners" subtitle={competition.copy.winnersSubtitle} eyebrow="Competition winners" />
            <CompetitionNav competition={competition} active="winners" />
            <section aria-labelledby="winners-heading" className="py-12 lg:py-16">
                <div className="container-custom">
                    <h2 id="winners-heading" className="sr-only">Winners by year</h2>
                    {source === 'stale' && (
                        <p role="status" className="mb-6 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            Showing the most recent approved information while we reconnect to the latest updates.
                        </p>
                    )}
                    <WinnersDirectory competition={competition} teams={winners} years={listed} defaultYear={defaultYear} />
                    <p className="mt-6 max-w-3xl text-sm leading-relaxed text-gray-500">
                        Winners are listed only after EV Society verifies the official results. Every winning team is also a verified participant.
                    </p>
                </div>
            </section>
            <AwardsSection competition={competition} awards={data.awards} />
        </div>
    );
}
