import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CalendarX2, Info, Wrench } from 'lucide-react';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import EmptyState from '@/components/competitions/EmptyState';
import TeamRegistrationForm from '@/components/competitions/registration/TeamRegistrationForm';
import { competitionPaths, getCompetition } from '@/config/competitions';
import { registrationAvailable } from '@/lib/competitions/server/env';
import { getCompetitionDataSafe } from '@/lib/competitions/server/publicData';
import { competitionOr404, competitionParams, type CompetitionPageProps } from '../competitionRoute';
import { OG_IMAGE } from '@/config/site';

export const revalidate = 60;
export const dynamicParams = false;
export const generateStaticParams = competitionParams;

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
    const competition = getCompetition((await params).programSlug);
    if (!competition) return {};
    const path = competitionPaths(competition).register;
    return {
        title: `Register Team | ${competition.shortName}`,
        description: competition.copy.registerSubtitle,
        alternates: { canonical: path },
        openGraph: { title: `Register Team | ${competition.shortName}`, description: competition.copy.registerSubtitle, url: path, images: [OG_IMAGE] },
    };
}

export default async function RegisterTeamPage({ params }: CompetitionPageProps) {
    const competition = competitionOr404((await params).programSlug);
    const paths = competitionPaths(competition);
    const result = await getCompetitionDataSafe(competition);
    const available = registrationAvailable();
    const config = result?.data.config;

    let body: React.ReactNode;
    if (!available) {
        body = (
            <EmptyState icon={Wrench} title="Team registration is opening soon" action={<Link href={paths.overview} className="btn-secondary min-h-11">Back to the competition</Link>}>
                The registration service is being set up. Please check back shortly.
            </EmptyState>
        );
    } else if (!result || !config) {
        body = (
            <EmptyState icon={Wrench} title="Registration is temporarily unavailable" tone="warning">
                We could not reach the registration service. Please try again in a few minutes.
            </EmptyState>
        );
    } else if (!config.registrationOpen) {
        body = (
            <EmptyState icon={CalendarX2} title="Registration is currently closed" action={<Link href={paths.manage} className="btn-secondary min-h-11">Manage Team Profile</Link>}>
                Already registered? You can still sign in to manage your team profile.
            </EmptyState>
        );
    } else {
        body = <TeamRegistrationForm competition={competition} config={config} mode="register" />;
    }

    return (
        <div className="bg-off-white">
            <CompetitionHero competition={competition} title="Register Team" crumb="Register Team" subtitle={competition.copy.registerSubtitle} />
            <CompetitionNav competition={competition} active="register" />
            <div className="container-custom grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
                <div className="lg:col-span-8">{body}</div>
                <aside className="space-y-5 lg:col-span-4" aria-label="About registration">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                        <p className="leading-relaxed text-gray-700">{competition.copy.registerIntro}</p>
                        <p className="mt-4 text-sm text-gray-600">
                            Already registered? <Link href={paths.manage} className="font-semibold text-primary hover:underline">Manage Team Profile</Link>
                        </p>
                    </div>
                    <div className="flex gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-6 text-sm leading-relaxed text-gray-700">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                            <p>{competition.copy.registrationNotice}</p>
                            {competition.organiserUrl && (
                                <a href={competition.organiserUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1 font-semibold text-primary hover:underline">
                                    Official competition information
                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-600">
                        <p className="font-semibold text-gray-900">What you will need</p>
                        <ul className="mt-3 list-disc space-y-1.5 pl-5">
                            <li>The team leader&apos;s name, email and phone</li>
                            <li>The team name and college or university</li>
                            <li>Team members&apos; names (emails help them approve their own details)</li>
                            <li>Optional: photographs, LinkedIn links, resumes and up to {config?.maxMentors ?? competition.rules.maxMentors} mentors</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
