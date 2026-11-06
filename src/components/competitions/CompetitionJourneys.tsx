import Link from 'next/link';
import { ArrowRight, Award, ClipboardPen, FileBadge, Info, Users } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { competitionPaths } from '@/config/competitions';

// The four team-platform journeys: register, participants, winners and award documents.
// The register action never names a year; the year is chosen inside the form.
export default function CompetitionJourneys({ competition, headingLevel = 'h3' }: { competition: CompetitionDefinition; headingLevel?: 'h2' | 'h3' }) {
    const paths = competitionPaths(competition);
    const Heading = headingLevel;
    const journeys = [
        { title: 'Register Team', text: 'Create your team’s profile with members, mentors and photographs. EV Society reviews every submission before anything is published.', href: paths.register, cta: 'Register Team', Icon: ClipboardPen, primary: true },
        ...(competition.directories.participants ? [{ title: 'Participating Teams', text: 'Teams whose participation EV Society has verified, by year and category.', href: paths.participants, cta: 'View participating teams', Icon: Users, primary: false }] : []),
        ...(competition.directories.winners ? [{ title: 'Competition Winners', text: 'Officially verified winners in each category, published after results are confirmed.', href: paths.winners, cta: 'View winners', Icon: Award, primary: false }] : []),
        ...(competition.awards ? [{ title: 'Innovation Awards', text: 'EV Society’s innovation award documents for the winning teams.', href: paths.awards, cta: 'View award documents', Icon: FileBadge, primary: false }] : []),
    ];
    return (
        <div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {journeys.map(({ title, text, href, cta, Icon, primary }) => (
                    <li key={title}>
                        <Link
                            href={href}
                            className={`group flex h-full flex-col rounded-2xl p-6 transition-shadow motion-reduce:transition-none ${primary ? 'bg-navy text-white shadow-lg shadow-navy/10 hover:shadow-xl' : 'border border-gray-200 bg-white hover:shadow-md'}`}
                        >
                            <Icon className={`h-6 w-6 ${primary ? 'text-primary-300' : 'text-primary'}`} aria-hidden="true" />
                            <Heading className={`mt-5 text-lg font-bold ${primary ? 'text-white' : ''}`}>{title}</Heading>
                            <p className={`mt-2 flex-1 text-sm leading-relaxed ${primary ? 'text-slate-300' : 'text-gray-600'}`}>{text}</p>
                            <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${primary ? 'text-primary-300' : 'text-primary'}`}>
                                {cta}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-off-white p-5 text-sm leading-relaxed text-gray-600 sm:flex-row sm:items-start sm:justify-between">
                <p className="flex gap-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{competition.copy.registrationNotice}</span>
                </p>
                <Link href={paths.manage} className="inline-flex min-h-10 shrink-0 items-center font-semibold text-primary hover:underline">Manage Team Profile</Link>
            </div>
        </div>
    );
}
