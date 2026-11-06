'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, LogOut, Plus } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { categoryLabel, competitionPaths } from '@/config/competitions';
import type { CompetitionRuntimeConfig, TeamListItem, TeamView } from '@/lib/competitions/model';
import { ApiClientError, competitionApi } from '@/lib/competitions/client/api';
import { isEmail, normalizeEmail } from '@/lib/competitions/validation';
import { ApprovalStatus } from '../ApprovalStatus';
import EmailVerification from './EmailVerification';
import TeamRegistrationForm from './TeamRegistrationForm';
import { TextField } from './fields';

type Phase = { name: 'loading' } | { name: 'signin' } | { name: 'verify'; email: string } | { name: 'teams' } | { name: 'team'; team: TeamView };

// Manage Team Profile: sign in with an emailed code, choose a team, then edit it
export default function ManageTeamProfile({ competition, config }: { competition: CompetitionDefinition; config: CompetitionRuntimeConfig }) {
    const api = useMemo(() => competitionApi(competition.id), [competition.id]);
    const paths = competitionPaths(competition);
    const [phase, setPhase] = useState<Phase>({ name: 'loading' });
    const [session, setSession] = useState<string | null>(null);
    const [teams, setTeams] = useState<TeamListItem[]>([]);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const openTeam = async (teamId: string) => {
        setError('');
        try {
            const res = await api.getTeam(teamId);
            setPhase({ name: 'team', team: res.team });
            const url = new URL(window.location.href);
            url.searchParams.set('team', teamId);
            window.history.replaceState(null, '', url.toString());
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : 'This team could not be loaded.');
            setPhase({ name: 'teams' });
        }
    };

    const loadTeams = async (preferred?: string | null) => {
        const res = await api.listTeams();
        setTeams(res.teams);
        const wanted = preferred && res.teams.find((t) => t.teamId === preferred);
        if (wanted) return openTeam(wanted.teamId);
        if (res.teams.length === 1 && !preferred) return openTeam(res.teams[0].teamId);
        setPhase({ name: 'teams' });
    };

    useEffect(() => {
        const preferred = new URLSearchParams(window.location.search).get('team');
        api.session().then(async (s) => {
            setSession(s.email);
            if (!s.email) return setPhase({ name: 'signin' });
            await loadTeams(preferred);
        }).catch(() => setPhase({ name: 'signin' }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api]);

    const backToTeams = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('team');
        window.history.replaceState(null, '', url.toString());
        setPhase({ name: 'loading' });
        loadTeams(null).catch(() => setPhase({ name: 'signin' }));
    };

    const signOut = async () => {
        await api.signOut().catch(() => undefined);
        setSession(null);
        setTeams([]);
        setPhase({ name: 'signin' });
    };

    if (phase.name === 'loading') {
        return <p className="flex items-center gap-2 text-gray-600" role="status"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Loading…</p>;
    }

    if (phase.name === 'signin' || phase.name === 'verify') {
        return (
            <div className="max-w-xl">
                {phase.name === 'signin' ? (
                    <form
                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const value = normalizeEmail(email);
                            if (!isEmail(value)) return setError('Enter the team leader’s email address.');
                            setError('');
                            setPhase({ name: 'verify', email: value });
                        }}
                    >
                        <h2 className="text-xl font-bold">Sign in as the team leader</h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">Enter the email address used to register your team. We will email you a one-time code; no password is needed.</p>
                        <div className="mt-6">
                            <TextField path="manage.email" label="Team leader’s email" type="email" required value={email} onChange={setEmail} error={error} autoComplete="email" maxLength={254} />
                        </div>
                        <button type="submit" className="btn-primary mt-6 min-h-12">Email me a code</button>
                    </form>
                ) : (
                    <EmailVerification
                        api={api}
                        email={phase.email}
                        onVerified={(verified) => { setSession(verified); setPhase({ name: 'loading' }); void loadTeams(new URLSearchParams(window.location.search).get('team')); }}
                        onCancel={() => setPhase({ name: 'signin' })}
                    />
                )}
                <p className="mt-6 text-sm text-gray-600">
                    Not registered yet? <Link href={paths.register} className="font-semibold text-primary hover:underline">Register Team</Link>
                </p>
            </div>
        );
    }

    if (phase.name === 'team') {
        return (
            <TeamRegistrationForm
                key={phase.team.teamId}
                competition={competition}
                config={config}
                mode="manage"
                initialTeam={phase.team}
                sessionEmail={session}
                onBack={backToTeams}
            />
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">Signed in as <strong className="font-semibold text-gray-900">{session}</strong></p>
                <button type="button" onClick={signOut} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                </button>
            </div>
            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            {teams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-off-white p-8 text-center">
                    <p className="text-lg font-semibold text-gray-900">No team registrations found for this email.</p>
                    <p className="mt-2 text-gray-600">Registrations are managed by the team leader’s email address.</p>
                    <Link href={paths.register} className="btn-primary mt-6 min-h-12">Register Team</Link>
                </div>
            ) : (
                <ul className="grid gap-4">
                    {teams.map((t) => (
                        <li key={t.teamId}>
                            <button type="button" onClick={() => openTeam(t.teamId)} className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between motion-reduce:transition-none">
                                <span className="min-w-0">
                                    <span className="block break-words text-lg font-bold text-gray-900">{t.name || 'Untitled team'}</span>
                                    <span className="mt-1 block text-sm text-gray-600">
                                        {[t.year, t.categories.map((c) => categoryLabel(competition, c)).join(' & '), t.college].filter(Boolean).join(' · ')}
                                    </span>
                                    <span className="mt-1 block font-mono text-xs text-gray-500">{t.teamId}</span>
                                </span>
                                <span className="flex shrink-0 flex-wrap items-center gap-2">
                                    <ApprovalStatus status={t.status} size="sm" />
                                    {t.pendingChange && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">Changes {t.pendingChange === 'Draft' ? 'not submitted' : 'in review'}</span>}
                                    <ArrowRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <Link href={paths.register} className="btn-secondary mt-6 min-h-11">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Register another team
            </Link>
        </div>
    );
}
