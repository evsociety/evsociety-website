import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import StartupShowcase from '@/components/competitions/StartupShowcase';
import TeamProfileCard from '@/components/competitions/TeamProfileCard';
import { categoryLabel, competitionPaths, getCompetition } from '@/config/competitions';
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
    const categories = team.categories.map((c) => categoryLabel(competition, c.categoryId)).join(' & ');
    const description = `${team.name}${team.college ? `, ${team.college}` : ''}: ${categories} team in the ${competition.name} ${team.year}.`;
    return {
        title: `${team.name} | ${competition.shortName} ${team.year}`,
        description,
        alternates: { canonical: competitionPaths(competition).team(team.slug) },
        openGraph: { title: team.name, description, url: competitionPaths(competition).team(team.slug) },
    };
}

export default async function TeamPage({ params }: Props) {
    const { programSlug, teamSlug } = await params;
    const competition = competitionOr404(programSlug);
    const { data } = await getCompetitionData(competition);
    const team = data.teams.find((t) => t.slug === teamSlug);
    if (!team) notFound();
    const paths = competitionPaths(competition);
    const isWinner = team.categories.some((c) => c.winnerVerified);
    return (
        <div className="bg-off-white">
            <CompetitionHero
                competition={competition}
                title={team.name}
                crumb={team.name}
                eyebrow={`${team.year} · ${isWinner ? 'Verified winner' : team.categories.some((c) => c.participationVerified) ? 'Verified participant' : 'Registered team'}`}
                extraCrumbs={[{ label: isWinner ? 'Winners' : 'Participating Teams', href: isWinner ? paths.winners : paths.participants }]}
            />
            <CompetitionNav competition={competition} active="team" />
            <div className="container-custom py-12 lg:py-16">
                <TeamProfileCard team={team} competition={competition} variant="full" headingLevel="h2" />
                <div className="mt-12"><StartupShowcase startup={null} /></div>
                <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                    <Link href={paths.participants} className="btn-secondary min-h-11">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        All participating teams
                    </Link>
                    {isWinner && <Link href={paths.winners} className="btn-secondary min-h-11">Competition winners</Link>}
                </div>
                <p className="mt-8 max-w-3xl text-sm leading-relaxed text-gray-500">
                    Profile details are published with the team&apos;s and each member&apos;s consent and reviewed by EV Society. To correct or remove information, the team leader can use{' '}
                    <Link href={paths.manage} className="font-semibold text-primary hover:underline">Manage Team Profile</Link>.
                </p>
            </div>
        </div>
    );
}
