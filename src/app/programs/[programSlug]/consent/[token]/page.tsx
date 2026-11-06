import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { LinkIcon } from 'lucide-react';
import CompetitionHero from '@/components/competitions/CompetitionHero';
import EmptyState from '@/components/competitions/EmptyState';
import ConsentForm from '@/components/competitions/registration/ConsentForm';
import { competitionPaths } from '@/config/competitions';
import { registrationAvailable } from '@/lib/competitions/server/env';
import { getConsent } from '@/lib/competitions/server/teamService';
import { competitionOr404 } from '../../competitionRoute';

type Props = { params: Promise<{ programSlug: string; token: string }> };

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Your profile choices',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};

export default async function ConsentPage({ params }: Props) {
    const { programSlug, token } = await params;
    const competition = competitionOr404(programSlug);
    const h = await headers();
    const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const view = registrationAvailable() ? await getConsent(token, ip).catch(() => null) : null;
    const valid = view && view.competitionId === competition.id;
    return (
        <div className="bg-off-white">
            <CompetitionHero
                competition={competition}
                title={valid ? `Hello, ${view.memberName}` : 'Your profile choices'}
                crumb="Your profile choices"
                subtitle={valid ? `You were added to the team “${view.teamName}” for the ${view.competitionName}${view.year ? ` (${view.year})` : ''}.` : undefined}
            />
            <div className="container-custom py-12 lg:py-16">
                <div className="max-w-2xl">
                    {valid ? (
                        <ConsentForm competitionId={competition.id} token={token} view={view} />
                    ) : (
                        <EmptyState icon={LinkIcon} title="This link has expired or is no longer valid" action={<Link href={competitionPaths(competition).overview} className="btn-secondary min-h-11">Go to the competition</Link>}>
                            Ask your team leader to send a new link from Manage Team Profile.
                        </EmptyState>
                    )}
                </div>
            </div>
        </div>
    );
}
