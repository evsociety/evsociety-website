import Link from 'next/link';
import { ArrowRight, ArrowUpRight, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { competitionPaths } from '@/config/competitions';
import { SITE_URL } from '@/config/site';
import type { PublicTeam } from '@/lib/competitions/model';
import { formatVerifiedDate, recognitionOf, shareCaption, teamDisplayName } from '@/lib/competitions/recognition';
import GroupPhoto from './GroupPhoto';
import MemberProfileCard from './MemberProfileCard';
import MentorCard from './MentorCard';
import ShareControls from './ShareControls';
import TeamMonogram from './TeamMonogram';

interface Props {
    team: PublicTeam;
    competition: CompetitionDefinition;
    /** Present the team's standing in this category (category winners pages) */
    categoryId?: string;
    /** feature: a section on a winners page; page: the main content of the team's own page */
    variant?: 'feature' | 'page';
    priorityPhoto?: boolean;
}

// Editorial presentation of one team: identity, verified standing and its source, the approved
// group photograph, the engineering team, mentors and share actions. Only fields that were
// approved and consented to are present in `team`; empty sections are left out entirely.
export default function TeamShowcase({ team, competition, categoryId, variant = 'feature', priorityPhoto = false }: Props) {
    const paths = competitionPaths(competition);
    const recognition = recognitionOf(team, competition, categoryId);
    const profileUrl = `${SITE_URL}${paths.team(team.slug)}`;
    const headingId = `showcase-${team.slug}`;
    const people = [...(team.leader ? [team.leader] : []), ...team.members];
    const verifiedOn = recognition ? formatVerifiedDate(recognition.category.verifiedAt) : '';
    const standingLabel = recognition?.stage === 'winner' ? 'Verified winner' : recognition?.stage === 'participant' ? 'Verified participant' : 'Registered team';
    const analytics = { competition_id: competition.id, competition_year: team.year, category: recognition?.category.categoryId, team_slug: team.slug };

    return (
        <article aria-labelledby={headingId} className={variant === 'feature' ? 'rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10' : ''}>
            {variant === 'feature' && (
                <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <TeamMonogram name={team.name} logoUrl={team.teamLogoUrl} size="lg" />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                            {standingLabel}{recognition ? ` · ${recognition.categoryLabel}` : ''} · {team.year}
                        </p>
                        <h2 id={headingId} className="mt-3 break-words text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            <Link href={paths.team(team.slug)} className="rounded hover:text-primary">{team.name}</Link>
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600">
                            {team.teamCode && <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-semibold tracking-wide text-gray-800">{team.teamCode}</span>}
                            {team.college && (
                                <span className="inline-flex items-start gap-1.5">
                                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                                    {team.college}
                                </span>
                            )}
                        </div>
                    </div>
                </header>
            )}
            {variant === 'page' && <h2 id={headingId} className="sr-only">{teamDisplayName(team)}</h2>}

            {recognition && recognition.stage !== 'registered' && (
                <section aria-label="Verified achievement" className={`${variant === 'feature' ? 'mt-8' : ''} rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:p-6`}>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                                {recognition.stage === 'winner' ? `${recognition.categoryLabel} winner, ${competition.shortName} ${team.year}` : `Verified participant, ${recognition.categoryLabel}, ${team.year}`}
                                {recognition.achievement ? ` · ${recognition.achievement}` : ''}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                {verifiedOn ? `Verified by EV Society on ${verifiedOn}. ` : 'Verified by EV Society. '}
                                The competition is organised independently by {competition.copy.organiserShort}.
                            </p>
                            {recognition.category.officialResultUrl && (
                                <a href={recognition.category.officialResultUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                                    Official result from {competition.copy.organiserShort}
                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {team.teamPhoto && variant === 'feature' && (
                <div className="mt-8">
                    <GroupPhoto image={team.teamPhoto} priority={priorityPhoto} caption={`${team.name} · ${competition.shortName} ${team.year}`} sizes="(min-width: 1200px) 1040px, (min-width: 640px) 90vw, 100vw" />
                </div>
            )}

            {people.length > 0 && (
                <section aria-labelledby={`${headingId}-team`} className="mt-10">
                    <div className="flex items-baseline justify-between gap-4">
                        <h3 id={`${headingId}-team`} className="flex items-center gap-2 text-xl font-bold">
                            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                            Engineering team
                        </h3>
                        <p className="text-sm text-gray-500">{people.length} {people.length === 1 ? 'member' : 'members'}</p>
                    </div>
                    {team.leader && <div className="mt-5 max-w-2xl"><MemberProfileCard person={team.leader} variant="leader" /></div>}
                    {team.members.length > 0 && (
                        <ul className="mt-5 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {team.members.map((p, i) => <li key={`${p.name}-${i}`}><MemberProfileCard person={p} /></li>)}
                        </ul>
                    )}
                </section>
            )}

            {team.mentors.length > 0 && (
                <section aria-labelledby={`${headingId}-mentors`} className="mt-10">
                    <h3 id={`${headingId}-mentors`} className="text-xl font-bold">{team.mentors.length === 1 ? 'Mentor' : 'Mentors'}</h3>
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {team.mentors.map((m, i) => <li key={`${m.name}-${i}`}><MentorCard mentor={m} /></li>)}
                    </ul>
                </section>
            )}

            {recognition && recognition.stage !== 'registered' && (
                <section aria-labelledby={`${headingId}-share`} className="mt-10 border-t border-gray-100 pt-8">
                    <h3 id={`${headingId}-share`} className="text-lg font-bold">Share this achievement</h3>
                    <p className="mt-1 text-sm text-gray-600">Share the team&apos;s permanent profile with universities, employers and mentors.</p>
                    <div className="mt-5">
                        <ShareControls
                            url={profileUrl}
                            title={`${teamDisplayName(team)} | EV Society`}
                            caption={shareCaption(team, competition, profileUrl)}
                            cardUrl={paths.recognitionCard(team.slug)}
                            cardFileName={`${team.slug}-recognition-card.png`}
                            analytics={analytics}
                        />
                    </div>
                </section>
            )}

            {variant === 'feature' && (
                <div className="mt-8">
                    <Link href={paths.team(team.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded font-semibold text-primary hover:underline">
                        Open the team profile
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">: {team.name}</span>
                    </Link>
                </div>
            )}
        </article>
    );
}
