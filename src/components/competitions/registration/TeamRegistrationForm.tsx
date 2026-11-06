'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Info, Loader2, LogOut, RotateCcw, Save, Send, ShieldCheck } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { categoryLabel, competitionPaths } from '@/config/competitions';
import type { CompetitionRuntimeConfig, TeamView } from '@/lib/competitions/model';
import { ApiClientError, competitionApi, newIdempotencyKey } from '@/lib/competitions/client/api';
import { normalizeEmail, validateLeaderStart, validateTeamPayload, validateYearAndCategories } from '@/lib/competitions/validation';
import { ApprovalStatus, LockedBadge, statusHelp } from '../ApprovalStatus';
import { GA4_EVENTS } from '@/data/analytics/events';
import { trackEvent } from '@/utils/analytics/ga4';
import TeamProfileCard from '../TeamProfileCard';
import CompetitionCategorySelector from './CompetitionCategorySelector';
import EmailVerification from './EmailVerification';
import FileUploadField, { ProfilePhotoUploader, ResumeUploader } from './FileUploadField';
import MentorEditor from './MentorEditor';
import TeamMemberEditor from './TeamMemberEditor';
import { CheckboxField, SectionCard, TextField, fieldId } from './fields';
import { adoptIds, categoriesForOption, fromTeamView, initialFormState, previewTeam, toPayload, type FormState } from './formState';

const STEPS = [
    { id: 'competition', label: 'Competition' },
    { id: 'team', label: 'Team' },
    { id: 'people', label: 'Members & Mentors' },
    { id: 'review', label: 'Review & Submit' },
] as const;

function stepOfError(key: string): number {
    if (key === 'year' || key === 'categories' || key === 'leader.name' || key === 'leader.phone' || key === 'leader.email') return 0;
    if (key.startsWith('team.') || key.startsWith('leader.')) return 1;
    if (key.startsWith('members') || key.startsWith('mentors')) return 2;
    return 3;
}

interface Props {
    competition: CompetitionDefinition;
    config: CompetitionRuntimeConfig;
    mode: 'register' | 'manage';
    initialTeam?: TeamView;
    sessionEmail?: string | null;
    onBack?: () => void;
}

type Notice = { tone: 'success' | 'error' | 'info'; text: string; action?: 'reload' };

export default function TeamRegistrationForm({ competition, config, mode, initialTeam, sessionEmail: initialSession = null, onBack }: Props) {
    const api = useMemo(() => competitionApi(competition.id), [competition.id]);
    const paths = competitionPaths(competition);
    const preview = useCallback((teamId: string) => (fileId: string) => api.privateFileUrl(teamId, fileId), [api]);

    const [team, setTeam] = useState<TeamView | null>(initialTeam ?? null);
    const [form, setForm] = useState<FormState>(() => (initialTeam ? fromTeamView(initialTeam, competition, preview(initialTeam.teamId)) : initialFormState(competition, config.defaultRegistrationYear, initialSession ?? '')));
    const [step, setStep] = useState(initialTeam ? 1 : 0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    // Errors only the server can detect (e.g. a duplicate team name) and the value they refer to
    const [serverErrorValues, setServerErrorValues] = useState<Record<string, string>>({});
    const [notice, setNotice] = useState<Notice | null>(null);
    const [busy, setBusy] = useState<null | 'create' | 'save' | 'submit' | 'action'>(null);
    const [session, setSession] = useState<string | null>(initialSession);
    const [verifying, setVerifying] = useState(false);
    const [duplicate, setDuplicate] = useState<{ teamId: string; teamName: string } | null>(null);
    const [confirmation, setConfirmation] = useState<{ teamId: string; revision: boolean } | null>(null);
    const [dirty, setDirty] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const stepHeading = useRef<HTMLHeadingElement>(null);
    const firstRender = useRef(true);

    const editMode = team?.editMode ?? 'direct';
    const locked = editMode === 'locked';
    const revision = editMode === 'revision';
    const leaderEmail = team?.leaderEmail ?? normalizeEmail(form.leader.email);

    useEffect(() => {
        if (mode !== 'register' || initialSession) return;
        api.session().then((s) => {
            setSession(s.email);
            if (s.email) setForm((f) => (f.leader.email ? f : { ...f, leader: { ...f.leader, email: s.email! } }));
        }).catch(() => undefined);
    }, [api, mode, initialSession]);

    useEffect(() => {
        if (!dirty) return;
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        stepHeading.current?.focus();
    }, [step, confirmation]);

    // As the user corrects fields, their errors disappear; new errors only appear on save
    useEffect(() => {
        if (!Object.keys(errors).length) return;
        const payload = toPayload(form, competition);
        const values = { ...payload, leader: { ...payload.leader, email: form.leader.email } } as Record<string, any>;
        const valueAt = (key: string) => JSON.stringify(key.split('.').reduce<any>((v, part) => (v == null ? v : v[part]), values) ?? null);
        const fresh = {
            ...validateTeamPayload(payload, { complete: true, competition, config, leaderEmail, lockYearAndCategories: revision }),
            ...(team ? {} : validateLeaderStart(form.leader)),
        };
        const next: Record<string, string> = {};
        for (const [key, message] of Object.entries(errors)) {
            if (key in serverErrorValues ? serverErrorValues[key] === valueAt(key) : !!fresh[key]) next[key] = message;
        }
        if (Object.keys(next).length !== Object.keys(errors).length) {
            setErrors(next);
            if (!Object.keys(next).length) setNotice((n) => (n?.tone === 'error' && n.text.includes('highlighted') ? null : n));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form]);

    const patch = (update: (f: FormState) => FormState) => {
        setForm(update);
        setDirty(true);
    };

    const showErrors = (fields: Record<string, string>, message = 'Please correct the highlighted fields.', fromServer = false) => {
        setErrors(fields);
        if (fromServer) {
            const payload = toPayload(form, competition);
            const values = { ...payload, leader: { ...payload.leader, email: form.leader.email } } as Record<string, any>;
            setServerErrorValues(Object.fromEntries(Object.keys(fields).map((key) => [key, JSON.stringify(key.split('.').reduce<any>((v, part) => (v == null ? v : v[part]), values) ?? null)])));
        } else setServerErrorValues({});
        const keys = Object.keys(fields);
        if (!keys.length) return;
        const target = Math.min(...keys.map(stepOfError));
        setStep(target);
        setNotice({ tone: 'error', text: message });
        requestAnimationFrame(() => {
            const first = keys.filter((k) => stepOfError(k) === target)[0];
            const el = document.getElementById(fieldId(first)) ?? document.getElementById('field-categories');
            el?.scrollIntoView({ block: 'center' });
            el?.focus({ preventScroll: true });
        });
    };

    const handleError = (err: unknown) => {
        if (err instanceof ApiClientError) {
            if (err.code === 'VALIDATION' || err.code === 'DUPLICATE_TEAM') return showErrors(err.fields, err.message, true);
            if (err.code === 'CONFLICT') return setNotice({ tone: 'error', text: err.message, action: 'reload' });
            if (err.code === 'UNAUTHORIZED') {
                setSession(null);
                return setNotice({ tone: 'error', text: 'Your sign-in has expired. Confirm your email again to continue.' });
            }
            return setNotice({ tone: 'error', text: err.message });
        }
        setNotice({ tone: 'error', text: 'Something went wrong. Please try again.' });
    };

    const loadTeam = async (teamId: string, toStep = 1) => {
        const res = await api.getTeam(teamId);
        setTeam(res.team);
        setForm(fromTeamView(res.team, competition, preview(res.team.teamId)));
        setDirty(false);
        setErrors({});
        setStep(toStep);
    };

    const createDraft = async (email: string, allowAdditional = false) => {
        setBusy('create');
        setNotice(null);
        try {
            const res = await api.createDraft({
                year: form.year,
                categories: categoriesForOption(competition, form.optionId),
                leader: { name: form.leader.name, phone: form.leader.phone },
                allowAdditional,
                idempotencyKey: newIdempotencyKey(),
            });
            setTeam(res.team);
            setForm((f) => ({ ...f, leader: { ...f.leader, email } }));
            setDuplicate(null);
            trackEvent(GA4_EVENTS.TEAM_REGISTRATION_START, { competition_id: competition.id, competition_year: res.team.data.year ?? undefined, category: res.team.data.categories.join('+') });
            setDirty(false);
            setStep(1);
            setNotice({ tone: 'success', text: `Draft saved. Your Team Registration ID is ${res.team.teamId}.` });
        } catch (err) {
            if (err instanceof ApiClientError && err.code === 'DUPLICATE_LEADER' && err.details?.teamId) {
                setDuplicate({ teamId: String(err.details.teamId), teamName: String(err.details.teamName || 'your team') });
            } else if (err instanceof ApiClientError && err.code === 'UNAUTHORIZED') {
                setSession(null);
                setVerifying(true);
            } else handleError(err);
        } finally {
            setBusy(null);
        }
    };

    const save = async (submit: boolean): Promise<boolean> => {
        if (!team) return false;
        const payload = toPayload(form, competition);
        const clientErrors = validateTeamPayload(payload, { complete: submit, competition, config, leaderEmail, lockYearAndCategories: revision });
        if (Object.keys(clientErrors).length) {
            showErrors(clientErrors);
            return false;
        }
        setBusy(submit ? 'submit' : 'save');
        setNotice(null);
        try {
            const res = await api.saveTeam(team.teamId, { data: payload, submit, expectedVersion: team.version, editMode: team.editMode, idempotencyKey: newIdempotencyKey() });
            setTeam(res.team);
            setForm((f) => adoptIds(f, res.team));
            setErrors({});
            setDirty(false);
            if (submit && res.outcome.submitted) {
                // Sent only after the server confirmed the submission, never for failed attempts
                if (res.outcome.mode !== 'revision') {
                    trackEvent(GA4_EVENTS.TEAM_REGISTRATION_SUBMIT, { competition_id: competition.id, competition_year: res.team.data.year ?? undefined, category: res.team.data.categories.join('+') });
                }
                setConfirmation({ teamId: res.team.teamId, revision: res.outcome.mode === 'revision' });
            } else {
                setNotice({ tone: 'success', text: revision ? 'Changes saved. They are not public until you submit them and EV Society approves them.' : 'Saved.' });
            }
            return true;
        } catch (err) {
            handleError(err);
            return false;
        } finally {
            setBusy(null);
        }
    };

    const continueFromCompetition = async () => {
        if (team) {
            if (await save(false)) setStep(1);
            return;
        }
        const categories = categoriesForOption(competition, form.optionId);
        const fieldErrors = { ...validateYearAndCategories(competition, config, form.year, categories), ...validateLeaderStart(form.leader) };
        if (Object.keys(fieldErrors).length) return showErrors(fieldErrors);
        setErrors({});
        const email = normalizeEmail(form.leader.email);
        if (session && session === email) return createDraft(email);
        setVerifying(true);
    };

    const next = async () => {
        if (step === 0) return continueFromCompetition();
        if (locked) return setStep((s) => Math.min(s + 1, STEPS.length - 1));
        if (await save(false)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const teamAction = async (action: () => Promise<{ team: TeamView }>, message: string) => {
        setBusy('action');
        setNotice(null);
        try {
            const res = await action();
            setTeam(res.team);
            setForm((f) => ({ ...fromTeamView(res.team, competition, preview(res.team.teamId)), processingConsent: f.processingConsent }));
            setDirty(false);
            setNotice({ tone: 'success', text: message });
        } catch (err) {
            handleError(err);
        } finally {
            setBusy(null);
        }
    };

    const signOut = async () => {
        await api.signOut().catch(() => undefined);
        window.location.href = paths.manage;
    };

    /* ── Confirmation ── */
    if (confirmation) {
        return (
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-10">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
                <h2 ref={stepHeading} tabIndex={-1} className="mt-5 text-2xl font-bold focus:outline-none sm:text-3xl">
                    {confirmation.revision ? 'Changes submitted for review' : 'Registration submitted for review'}
                </h2>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-gray-600">
                    {confirmation.revision
                        ? 'Your current public profile stays as it is until EV Society approves these changes.'
                        : 'Thank you. EV Society will review your team profile before anything is published.'}
                </p>
                <div className="mt-8 inline-flex flex-col rounded-2xl bg-navy px-6 py-5 text-white">
                    <span className="text-sm font-medium text-slate-300">Team Registration ID</span>
                    <span className="mt-1 font-mono text-2xl font-bold tracking-wider">{confirmation.teamId}</span>
                </div>
                <h3 className="mt-10 text-lg font-bold">What happens next</h3>
                <ol className="mt-4 max-w-2xl list-decimal space-y-2 pl-5 leading-relaxed text-gray-700">
                    <li>EV Society reviews the registration. You will receive an email about the decision at <strong className="font-semibold">{leaderEmail}</strong>.</li>
                    <li>Team members with an email address receive a link to choose whether their photo, LinkedIn and contact details are shown.</li>
                    <li>Participation and winners are verified separately; registration on its own does not make a team a participant.</li>
                </ol>
                <p className="mt-6 max-w-2xl text-sm text-gray-500">{competition.copy.registrationNotice}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    {mode === 'register' ? (
                        <Link href={`${paths.manage}?team=${confirmation.teamId}`} className="btn-primary min-h-12">Manage Team Profile</Link>
                    ) : (
                        <button type="button" onClick={() => { setConfirmation(null); setStep(1); }} className="btn-primary min-h-12">Back to the profile</button>
                    )}
                    <Link href={paths.overview} className="btn-secondary min-h-12">Back to the competition</Link>
                </div>
            </div>
        );
    }

    const selectedCategories = categoriesForOption(competition, form.optionId);
    const yearOptions = Array.from(new Set([...(config.registrationYears.length ? config.registrationYears : [config.defaultRegistrationYear]), ...(form.year ? [form.year] : [])])).sort((a, b) => b - a);
    const canSubmit = !locked && team && (revision || team.status === 'Draft' || team.status === 'Changes Requested');
    const submitLabel = revision ? 'Submit changes for review' : team?.status === 'Changes Requested' ? 'Resubmit for Review' : 'Submit for Review';

    return (
        <div>
            {/* Manage: status of this team */}
            {mode === 'manage' && team && (
                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500">Team Registration ID <span className="font-mono font-semibold text-gray-800">{team.teamId}</span></p>
                            <h2 className="mt-1 break-words text-2xl font-bold">{form.team.name || 'Untitled team'}</h2>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <ApprovalStatus status={team.status} />
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">Public profile: {team.publication.status}</span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm text-gray-600">{statusHelp(team.status)}</p>
                        </div>
                        {onBack && (
                            <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                All my teams
                            </button>
                        )}
                    </div>
                    {team.reviewComments && (
                        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-semibold text-amber-900">Comments from EV Society</p>
                            <p className="mt-1 whitespace-pre-line text-sm text-amber-900">{team.reviewComments}</p>
                        </div>
                    )}
                    {team.pendingChange && (
                        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-primary">{team.pendingChange.status === 'Draft' ? 'You have unsubmitted changes' : team.pendingChange.status === 'Changes Requested' ? 'EV Society asked for changes to your update' : 'Your changes are waiting for review'}</p>
                                <p className="mt-1 text-sm text-gray-700">The public profile shows the last approved version until EV Society approves your changes.</p>
                                {team.pendingChange.reviewComments && <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{team.pendingChange.reviewComments}</p>}
                            </div>
                            <button type="button" disabled={busy !== null} onClick={() => teamAction(() => api.discardChanges(team.teamId), 'Your pending changes were discarded.')} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-700 hover:border-red-400 hover:text-red-700">
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Discard changes
                            </button>
                        </div>
                    )}
                    {team.publication.status === 'Published' && (
                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                            {team.slug && <Link href={paths.team(team.slug)} className="inline-flex min-h-10 items-center font-semibold text-primary hover:underline">View public profile</Link>}
                            <button type="button" disabled={busy !== null} onClick={() => teamAction(() => api.setPublication(team.teamId, false), 'Your profile was removed from the website.')} className="inline-flex min-h-10 items-center font-semibold text-gray-600 hover:text-red-700 hover:underline">
                                Withdraw the public profile now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Progress */}
            <nav aria-label="Registration steps" className="mb-8">
                <ol className="grid grid-cols-4 gap-2">
                    {STEPS.map((s, i) => {
                        const current = i === step;
                        const reachable = !!team || i <= step;
                        const done = i < step || (!!team && i === 0);
                        return (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    disabled={!reachable || busy !== null}
                                    onClick={() => setStep(i)}
                                    aria-current={current ? 'step' : undefined}
                                    className="group flex w-full flex-col items-start gap-2 text-left disabled:cursor-not-allowed"
                                >
                                    <span className={`h-1.5 w-full rounded-full ${current ? 'bg-primary' : done ? 'bg-primary-200' : 'bg-gray-200'}`} />
                                    <span className={`text-xs font-semibold sm:text-sm ${current ? 'text-primary' : 'text-gray-500 group-enabled:group-hover:text-gray-800'}`}>
                                        <span className="sr-only">Step {i + 1}: </span>
                                        <span aria-hidden="true" className="hidden sm:inline">{i + 1}. </span>
                                        {s.label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            {notice && (
                <div role={notice.tone === 'error' ? 'alert' : 'status'} className={`mb-6 flex flex-col gap-3 rounded-xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${notice.tone === 'error' ? 'bg-red-50 text-red-800 ring-1 ring-red-200' : notice.tone === 'success' ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-primary-50 text-primary ring-1 ring-primary-200'}`}>
                    <p className="flex items-start gap-2">
                        {notice.tone === 'error' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                        {notice.text}
                    </p>
                    {notice.action === 'reload' && team && (
                        <button type="button" onClick={() => loadTeam(team.teamId, step).then(() => setNotice({ tone: 'info', text: 'Loaded the latest saved version.' })).catch(handleError)} className="shrink-0 rounded-full bg-white px-3.5 py-1.5 font-semibold text-red-800 ring-1 ring-red-200">
                            Reload latest version
                        </button>
                    )}
                </div>
            )}

            {locked && (
                <div className="mb-6 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
                    {team?.lockedReason === 'deletion-requested' ? 'A deletion request is in progress for this team, so the profile can no longer be edited.' : 'This registration was not accepted, so it can no longer be edited. Contact EV Society with any questions.'}
                </div>
            )}

            <h2 ref={stepHeading} tabIndex={-1} className="mb-6 text-2xl font-bold focus:outline-none">
                <span className="sr-only">Step {step + 1} of {STEPS.length}: </span>{STEPS[step].label}
            </h2>

            {/* Step 1: Competition and team leader */}
            {step === 0 && (
                <div className="space-y-6">
                    <SectionCard id="sec-competition" title="Competition details" description={revision ? 'The year and category are fixed once a registration is approved.' : 'Choose the competition year and the category your team is entering.'} aside={revision ? <LockedBadge>Fixed after approval</LockedBadge> : undefined}>
                        <div className="grid gap-6">
                            <div className="max-w-xs">
                                <label htmlFor="field-year" className="text-sm font-medium text-gray-800">Competition year<span className="text-red-700" aria-hidden="true"> *</span></label>
                                <select
                                    id="field-year"
                                    value={form.year ?? ''}
                                    disabled={revision || locked}
                                    onChange={(e) => patch((f) => ({ ...f, year: Number(e.target.value) || null }))}
                                    aria-invalid={errors.year ? true : undefined}
                                    aria-describedby={errors.year ? 'field-year-error' : undefined}
                                    className={`mt-1.5 min-h-11 w-full rounded-xl border bg-white px-3.5 text-base text-gray-900 disabled:bg-gray-50 ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                                {errors.year && <p id="field-year-error" className="mt-1.5 text-sm font-medium text-red-700">{errors.year}</p>}
                            </div>
                            <CompetitionCategorySelector competition={competition} value={form.optionId} onChange={(id) => patch((f) => ({ ...f, optionId: id }))} error={errors.categories} disabled={revision || locked} />
                        </div>
                    </SectionCard>

                    <SectionCard id="sec-leader" title="Team leader" description="The team leader manages this registration. We confirm the email address with a one-time code.">
                        <fieldset disabled={locked} className="grid gap-5 md:grid-cols-2">
                            <TextField path="leader.name" label="Full name" required value={form.leader.name} onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, name: v } }))} error={errors['leader.name']} autoComplete="name" maxLength={120} />
                            <TextField path="leader.phone" label="Phone number" required type="tel" value={form.leader.phone} onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, phone: v } }))} error={errors['leader.phone']} autoComplete="tel" placeholder="+91 98450 12345" maxLength={20} />
                            <div className="md:col-span-2">
                                <TextField
                                    path="leader.email"
                                    label="Email address"
                                    required
                                    type="email"
                                    value={form.leader.email}
                                    onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, email: v } }))}
                                    error={errors['leader.email']}
                                    autoComplete="email"
                                    disabled={!!team || verifying}
                                    hint={team ? 'The team leader’s email cannot be changed here. Contact EV Society if the leader changes.' : undefined}
                                    maxLength={254}
                                />
                            </div>
                        </fieldset>
                        {session && !team && mode === 'register' && (
                            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                Email confirmed: <strong className="font-semibold">{session}</strong>
                                <button type="button" onClick={signOut} className="inline-flex min-h-8 items-center gap-1 font-semibold text-primary hover:underline">
                                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                                    Sign out
                                </button>
                            </p>
                        )}
                    </SectionCard>

                    {verifying && (
                        <EmailVerification
                            api={api}
                            email={normalizeEmail(form.leader.email)}
                            onVerified={(email) => { setSession(email); setVerifying(false); void createDraft(email); }}
                            onCancel={() => setVerifying(false)}
                        />
                    )}

                    {duplicate && (
                        <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                            <p className="font-semibold text-amber-900">You already have a {form.year} registration: {duplicate.teamName} ({duplicate.teamId}).</p>
                            <p className="mt-1 text-sm text-amber-900">Continue that registration, or start a separate one if you lead another team.</p>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <button type="button" onClick={() => loadTeam(duplicate.teamId).then(() => setDuplicate(null)).catch(handleError)} className="btn-primary min-h-11">Continue existing registration</button>
                                <button type="button" onClick={() => createDraft(normalizeEmail(form.leader.email), true)} className="btn-secondary min-h-11">Register another team</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Team */}
            {step === 1 && (
                <fieldset disabled={locked} className="space-y-6">
                    <SectionCard id="sec-team" title="Team details">
                        <div className="grid gap-5 md:grid-cols-2">
                            <TextField path="team.name" label="Team name" required value={form.team.name} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, name: v } }))} error={errors['team.name']} maxLength={120} />
                            <TextField path="team.college" label="College / university name" required value={form.team.college} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, college: v } }))} error={errors['team.college']} autoComplete="organization" maxLength={200} />
                            <TextField path="team.teamCode" label="Competition team ID" optional value={form.team.teamCode} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, teamCode: v } }))} error={errors['team.teamCode']} hint="The identifier the organiser gave your team, for example Rocketry-014." maxLength={40} />
                            {competition.fields.institutionLogo && <FileUploadField path="team.institutionLogoFileId" label="Institution logo" kind="institution-logo" shape="logo" value={form.team.institutionLogo} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, institutionLogo: v } }))} api={api} teamId={team?.teamId ?? null} error={errors['team.institutionLogoFileId']} />}
                            {competition.fields.teamLogo && <FileUploadField path="team.teamLogoFileId" label="Team logo" kind="team-logo" shape="logo" value={form.team.teamLogo} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, teamLogo: v } }))} api={api} teamId={team?.teamId ?? null} error={errors['team.teamLogoFileId']} />}
                            {competition.fields.teamPhoto && (
                                <div className="md:col-span-2">
                                    <FileUploadField path="team.teamPhotoFileId" label="Team photograph" kind="team-photo" shape="wide" value={form.team.teamPhoto} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, teamPhoto: v, teamPhotoConsent: v ? f.team.teamPhotoConsent : false } }))} api={api} teamId={team?.teamId ?? null} error={errors['team.teamPhotoFileId']} />
                                    {form.team.teamPhoto && (
                                        <div className="mt-3">
                                            <CheckboxField path="team.teamPhotoConsent" checked={form.team.teamPhotoConsent} onChange={(v) => patch((f) => ({ ...f, team: { ...f.team, teamPhotoConsent: v } }))} description="Without this confirmation the team photograph is kept private. EV Society also reviews every photograph before publishing it.">
                                                Everyone in this photograph has agreed to it being published
                                            </CheckboxField>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </SectionCard>
                    <SectionCard id="sec-leader-profile" title={`Team leader profile${form.leader.name ? `: ${form.leader.name}` : ''}`} description="Optional details for the team leader’s profile card.">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <TextField path="leader.linkedin" label="LinkedIn profile" optional value={form.leader.linkedin} onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, linkedin: v } }))} error={errors['leader.linkedin']} inputMode="url" placeholder="https://www.linkedin.com/in/…" maxLength={300} />
                            </div>
                            <ProfilePhotoUploader path="leader.photoFileId" value={form.leader.photo} onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, photo: v } }))} api={api} teamId={team?.teamId ?? null} error={errors['leader.photoFileId']} />
                            <ResumeUploader path="leader.resumeFileId" value={form.leader.resume} onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, resume: v } }))} api={api} teamId={team?.teamId ?? null} error={errors['leader.resumeFileId']} />
                            <div className="md:col-span-2">
                                <CheckboxField path="leader.under18" checked={form.leader.under18} onChange={(v) => patch((f) => ({ ...f, leader: { ...f.leader, under18: v } }))} description="Nothing about people under 18 is published until EV Society has a parent's or guardian's consent.">
                                    The team leader is under 18
                                </CheckboxField>
                            </div>
                        </div>
                    </SectionCard>
                </fieldset>
            )}

            {/* Step 3: Members and mentors */}
            {step === 2 && (
                <div className="space-y-6">
                    <SectionCard id="sec-members" title="Team members" description="Add everyone in the team besides the leader. Only a full name is required.">
                        <TeamMemberEditor
                            competition={competition}
                            members={form.members}
                            onChange={(members) => patch((f) => ({ ...f, members }))}
                            errors={errors}
                            api={api}
                            teamId={team?.teamId ?? null}
                            consents={team?.memberConsents}
                            canResend={!!team && team.status !== 'Draft' && !locked}
                            onResendConsent={(memberId) => team && teamAction(() => api.resendConsent(team.teamId, memberId), 'Consent email sent.')}
                            disabled={locked}
                        />
                    </SectionCard>
                    <SectionCard id="sec-mentors" title="Mentors" description={`Faculty or industry mentors who guided the team, up to ${team?.maxMentors ?? config.maxMentors}.`}>
                        <MentorEditor competition={competition} mentors={form.mentors} onChange={(mentors) => patch((f) => ({ ...f, mentors }))} errors={errors} api={api} teamId={team?.teamId ?? null} maxMentors={team?.maxMentors ?? config.maxMentors} disabled={locked} />
                    </SectionCard>
                </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
                <div className="space-y-6">
                    <SectionCard id="sec-summary" title="Summary">
                        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                            {[
                                ['Competition year', String(form.year ?? '—'), 0],
                                ['Category', selectedCategories.map((c) => categoryLabel(competition, c)).join(' & ') || '—', 0],
                                ['Team name', form.team.name || '—', 1],
                                ['College / university', form.team.college || '—', 1],
                                ['Team leader', `${form.leader.name || '—'} · ${leaderEmail}`, 0],
                                ['Team members', form.members.length ? form.members.map((m) => m.name || 'Unnamed').join(', ') : 'None added', 2],
                                ['Mentors', form.mentors.length ? form.mentors.map((m) => m.name || 'Unnamed').join(', ') : 'None added', 2],
                                ['Uploads', `${[form.team.teamLogo, form.team.institutionLogo, form.team.teamPhoto, form.leader.photo, ...form.members.map((m) => m.photo), ...form.mentors.map((m) => m.photo)].filter(Boolean).length} photo(s) and logo(s), ${[form.leader.resume, ...form.members.map((m) => m.resume)].filter(Boolean).length} resume(s)`, 2],
                            ].map(([label, value, target]) => (
                                <div key={label as string} className="border-b border-gray-100 pb-3">
                                    <dt className="flex items-center justify-between gap-2 font-medium text-gray-500">
                                        {label}
                                        {!locked && <button type="button" onClick={() => setStep(target as number)} className="rounded text-xs font-semibold text-primary hover:underline">Edit<span className="sr-only"> {label}</span></button>}
                                    </dt>
                                    <dd className="mt-1 break-words text-gray-900">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </SectionCard>

                    <SectionCard id="sec-privacy" title="Data privacy and publication" description="Choose what may be published. You can change these choices at any time from Manage Team Profile.">
                        <fieldset disabled={locked} className="space-y-6">
                            <CheckboxField path="processingConsent" checked={form.processingConsent} onChange={(v) => patch((f) => ({ ...f, processingConsent: v }))} error={errors.processingConsent} description={<>Required. EV Society uses this information to review the registration, as described in our <Link href="/policies" className="font-semibold text-primary hover:underline">policies</Link>. Resumes are kept private and are never published.</>}>
                                I agree to EV Society processing this registration data for review
                            </CheckboxField>
                            <CheckboxField path="publicationConsent" checked={form.publicationConsent} onChange={(v) => patch((f) => ({ ...f, publicationConsent: v }))} description="Optional. The approved profile shows the team name, college, mentors and member names. Withdrawing this removes the profile at once.">
                                Publish our team’s approved profile on EV Society
                            </CheckboxField>
                            <fieldset className="rounded-xl border border-gray-200 p-4">
                                <legend className="px-1 text-sm font-semibold text-gray-800">What may be shown about you, {form.leader.name || 'the team leader'}</legend>
                                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                    <CheckboxField path="leaderPermissions.photo" checked={form.leaderPermissions.photo} onChange={(v) => patch((f) => ({ ...f, leaderPermissions: { ...f.leaderPermissions, photo: v } }))} disabled={!form.leader.photo}>My photograph</CheckboxField>
                                    <CheckboxField path="leaderPermissions.linkedin" checked={form.leaderPermissions.linkedin} onChange={(v) => patch((f) => ({ ...f, leaderPermissions: { ...f.leaderPermissions, linkedin: v } }))} disabled={!form.leader.linkedin}>My LinkedIn profile</CheckboxField>
                                    <CheckboxField path="leaderPermissions.email" checked={form.leaderPermissions.email} onChange={(v) => patch((f) => ({ ...f, leaderPermissions: { ...f.leaderPermissions, email: v } }))}>My email address</CheckboxField>
                                    <CheckboxField path="leaderPermissions.phone" checked={form.leaderPermissions.phone} onChange={(v) => patch((f) => ({ ...f, leaderPermissions: { ...f.leaderPermissions, phone: v } }))}>My phone number</CheckboxField>
                                </div>
                            </fieldset>
                            <div className="flex gap-3 rounded-xl bg-off-white p-4 text-sm leading-relaxed text-gray-700">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                <p>
                                    Adding someone to the team does not publish their personal details. After submission, each member with an email address is asked to choose
                                    whether their photograph, LinkedIn profile, email and phone are shown. Members without an email appear by name only. Nothing about
                                    anyone under 18 is published without a parent&apos;s or guardian&apos;s consent.
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">{competition.copy.registrationNotice}</p>
                        </fieldset>
                    </SectionCard>

                    <div>
                        <button type="button" onClick={() => setShowPreview((v) => !v)} aria-expanded={showPreview} aria-controls="profile-preview" className="btn-secondary min-h-11">
                            {showPreview ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                            {showPreview ? 'Hide preview' : 'Preview Team Profile'}
                        </button>
                        {showPreview && (
                            <div id="profile-preview" className="mt-6 rounded-2xl border-2 border-dashed border-primary-200 bg-off-white p-4 sm:p-6">
                                <p className="mb-5 text-sm text-gray-600">
                                    Preview of the public profile if EV Society approves it. Members&apos; photos, LinkedIn and contact details are added once each member agrees.
                                </p>
                                <TeamProfileCard team={previewTeam(form, competition, team?.slug ?? '')} competition={competition} variant="full" headingLevel="h3" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {step > 0 && (
                            <button type="button" onClick={() => setStep((s) => s - 1)} disabled={busy !== null} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 font-semibold text-gray-700 hover:bg-gray-100">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {team && !locked && (
                            <button type="button" onClick={() => save(false)} disabled={busy !== null} className="btn-secondary min-h-12">
                                {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                                {team.status === 'Draft' && !revision ? 'Save Draft' : 'Save changes'}
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button type="button" onClick={next} disabled={busy !== null || (step === 0 && verifying)} className="btn-primary min-h-12">
                                {(busy === 'create' || busy === 'save') && step === 0 ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
                                {step === 0 && !team ? 'Continue' : 'Save and continue'}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        ) : canSubmit ? (
                            <button type="button" onClick={() => save(true)} disabled={busy !== null} className="btn-primary min-h-12">
                                {busy === 'submit' ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                                {submitLabel}
                            </button>
                        ) : team?.status === 'Pending Review' ? (
                            <p className="text-sm text-gray-600">Submitted. EV Society sees your latest saved changes.</p>
                        ) : null}
                    </div>
                </div>
            </div>

            {mode === 'manage' && team && !locked && (
                <details className="mt-12 rounded-2xl border border-gray-200 bg-white p-5">
                    <summary className="flex min-h-10 cursor-pointer items-center text-sm font-semibold text-gray-700">Remove this team’s data</summary>
                    <p className="mt-3 max-w-2xl text-sm text-gray-600">
                        This withdraws the public profile immediately and asks EV Society to delete the team, its members&apos; details and all uploaded files.
                    </p>
                    <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => {
                            if (window.confirm('Withdraw the profile and ask EV Society to delete this team’s data? This cannot be undone once processed.')) {
                                void teamAction(() => api.requestDeletion(team.teamId, ''), 'Deletion requested. The profile has been removed from the website.');
                            }
                        }}
                        className="mt-4 inline-flex min-h-11 items-center rounded-full border border-red-300 px-5 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                        Request deletion
                    </button>
                </details>
            )}
        </div>
    );
}
