import type { Metadata } from 'next';
import Link from 'next/link';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import CompetitionNav from '@/components/competitions/CompetitionNav';
import CompetitionJourneys from '@/components/competitions/CompetitionJourneys';
import { COMPETITIONS, getCompetition } from '@/config/competitions';
import { competitionOr404, type CompetitionPageProps } from './competitionRoute';

// Landing page for competitions configured with a generic landing. Competitions with their own
// page (such as IN-SPACe) use their static route, which takes precedence.
export const dynamicParams = false;
export function generateStaticParams() {
    return COMPETITIONS.filter((c) => c.landing === 'generic').map((c) => ({ programSlug: c.slug }));
}

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
    const competition = getCompetition((await params).programSlug);
    if (!competition) return {};
    return { title: competition.name, description: competition.copy.registerSubtitle, alternates: { canonical: competition.basePath } };
}

export default async function CompetitionLandingPage({ params }: CompetitionPageProps) {
    const competition = competitionOr404((await params).programSlug);
    return (
        <div className="bg-white">
            <CompetitionHero competition={competition} title={competition.name} crumb={competition.shortName} subtitle={competition.copy.registerSubtitle}>
                <div className="mt-8"><Link href={`${competition.basePath}/register`} className="btn-primary min-h-12">Register Team</Link></div>
            </CompetitionHero>
            <CompetitionNav competition={competition} active="overview" />
            <div className="container-custom py-16"><CompetitionJourneys competition={competition} /></div>
        </div>
    );
}
