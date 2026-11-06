import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import EmptyState from '@/components/competitions/EmptyState';
import ManageTeamProfile from '@/components/competitions/registration/ManageTeamProfile';
import { competitionPaths, getCompetition } from '@/config/competitions';
import { registrationAvailable } from '@/lib/competitions/server/env';
import { getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { defaultRuntimeConfig } from '@/lib/competitions/publicModel';
import { competitionOr404, competitionParams, type CompetitionPageProps } from '../competitionRoute';

export const revalidate = 60;
export const dynamicParams = false;
export const generateStaticParams = competitionParams;

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
    const competition = getCompetition((await params).programSlug);
    if (!competition) return {};
    return {
        title: `Manage Team Profile | ${competition.shortName}`,
        description: 'Sign in as the team leader to update your team profile, members and mentors.',
        alternates: { canonical: competitionPaths(competition).manage },
        robots: { index: false, follow: true },
    };
}

export default async function ManageTeamPage({ params }: CompetitionPageProps) {
    const competition = competitionOr404((await params).programSlug);
    const result = await getCompetitionDataSafe(competition);
    const config = result?.data.config ?? defaultRuntimeConfig(competition, false);
    return (
        <div className="bg-off-white">
            <CompetitionHero
                competition={competition}
                title="Manage Team Profile"
                crumb="Manage Team Profile"
                subtitle="Update your team’s details, members, mentors and photographs. Changes to an approved profile are reviewed before they are published."
            />
            <CompetitionNav competition={competition} active="manage" />
            <div className="container-custom py-12 lg:py-16">
                <div className="max-w-4xl">
                    {registrationAvailable() ? (
                        <ManageTeamProfile competition={competition} config={config} />
                    ) : (
                        <EmptyState icon={Wrench} title="Team profiles are opening soon" action={<Link href={competition.basePath} className="btn-secondary min-h-11">Back to the competition</Link>}>
                            The team platform is being set up. Please check back shortly.
                        </EmptyState>
                    )}
                </div>
            </div>
        </div>
    );
}
