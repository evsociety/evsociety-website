import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { categoryLabel, competitionPaths } from '@/config/competitions';
import type { PublicTeam } from '@/lib/competitions/model';
import { stageOf } from '@/lib/competitions/model';
import { StageBadge } from './ApprovalStatus';
import MemberProfileCard from './MemberProfileCard';
import MentorCard from './MentorCard';
import TeamMonogram from './TeamMonogram';

interface Props {
    team: PublicTeam;
    competition: CompetitionDefinition;
    /** compact: directory and winners lists; full: the team's own page */
    variant?: 'compact' | 'full';
    /** Show only this category's status (directory filtered by category) */
    categoryId?: string;
    headingLevel?: 'h2' | 'h3';
}

// One profile component for registered teams, participants, winners and team pages; only the
// status and achievement differ. Everything shown has been approved and consented to.
export default function TeamProfileCard({ team, competition, variant = 'compact', categoryId, headingLevel = 'h3' }: Props) {
    const Heading = headingLevel;
    const href = competitionPaths(competition).team(team.slug);
    const categories = categoryId ? team.categories.filter((c) => c.categoryId === categoryId) : team.categories;
    const people = [...(team.leader ? [team.leader] : []), ...team.members];
    const headingId = `team-${team.slug}`;

    const identity = (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <TeamMonogram name={team.name} logoUrl={team.teamLogoUrl} size={variant === 'full' ? 'lg' : 'md'} />
            <div className="min-w-0 flex-1">
                <Heading id={headingId} className={`break-words font-bold tracking-tight text-gray-900 ${variant === 'full' ? 'text-3xl sm:text-4xl' : 'text-xl'}`}>
                    {variant === 'compact' ? (
                        <Link href={href} className="rounded hover:text-primary">{team.name}</Link>
                    ) : team.name}
                </Heading>
                {team.teamCode && <p className="mt-1.5 font-mono text-sm font-semibold tracking-wide text-gray-700">{team.teamCode}</p>}
                {team.college && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-gray-600">
                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                        <span>{team.college}</span>
                    </p>
                )}
                <dl className="mt-4 flex flex-wrap items-center gap-2">
                    <dt className="sr-only">Competition year</dt>
                    <dd className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{team.year}</dd>
                    {categories.map((c) => (
                        <div key={c.categoryId} className="contents">
                            <dt className="sr-only">{categoryLabel(competition, c.categoryId)} status</dt>
                            <dd className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">{categoryLabel(competition, c.categoryId)}</span>
                                <StageBadge stage={stageOf(c)} achievement={c.achievement} />
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
            {team.institutionLogoUrl && (
                <Image src={team.institutionLogoUrl} alt={`${team.college || 'Institution'} logo`} width={64} height={64} unoptimized loading="lazy" className="hidden shrink-0 rounded-xl border border-gray-200 bg-white object-contain p-1.5 sm:block" style={{ width: 64, height: 64 }} />
            )}
        </div>
    );

    if (variant === 'compact') {
        return (
            <article aria-labelledby={headingId} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                {identity}
                {team.mentors.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{team.mentors.length === 1 ? 'Mentor' : 'Mentors'}</p>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                            {team.mentors.map((m, i) => <li key={`${m.name}-${i}`}><MentorCard mentor={m} /></li>)}
                        </ul>
                    </div>
                )}
                {people.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Team</p>
                        <ul className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            {people.map((p, i) => <li key={`${p.name}-${i}`}><MemberProfileCard person={p} variant="compact" /></li>)}
                        </ul>
                    </div>
                )}
                <div className="mt-6">
                    <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 rounded font-semibold text-primary hover:underline">
                        View team profile
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">: {team.name}</span>
                    </Link>
                </div>
            </article>
        );
    }

    return (
        <article aria-labelledby={headingId} className="space-y-12">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                {identity}
                {team.teamPhoto && (
                    <figure className="mt-8 overflow-hidden rounded-2xl bg-gray-100">
                        <Image src={team.teamPhoto.url} alt={team.teamPhoto.alt} width={team.teamPhoto.width ?? 1200} height={team.teamPhoto.height ?? 800} unoptimized loading="lazy" className="h-auto w-full object-contain" />
                    </figure>
                )}
            </div>

            {team.mentors.length > 0 && (
                <section aria-labelledby={`${headingId}-mentors`}>
                    <h3 id={`${headingId}-mentors`} className="text-xl font-bold">{team.mentors.length === 1 ? 'Mentor' : 'Mentors'}</h3>
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {team.mentors.map((m, i) => <li key={`${m.name}-${i}`}><MentorCard mentor={m} /></li>)}
                    </ul>
                </section>
            )}

            {team.leader && (
                <section aria-labelledby={`${headingId}-leader`}>
                    <h3 id={`${headingId}-leader`} className="text-xl font-bold">Team leader</h3>
                    <div className="mt-5 max-w-2xl"><MemberProfileCard person={team.leader} variant="leader" /></div>
                </section>
            )}

            {team.members.length > 0 && (
                <section aria-labelledby={`${headingId}-members`}>
                    <h3 id={`${headingId}-members`} className="flex items-center gap-2 text-xl font-bold">
                        <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                        Team members
                    </h3>
                    <ul className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {team.members.map((p, i) => <li key={`${p.name}-${i}`}><MemberProfileCard person={p} /></li>)}
                    </ul>
                </section>
            )}
        </article>
    );
}
