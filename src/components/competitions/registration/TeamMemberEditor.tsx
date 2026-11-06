'use client';

import { Mail, Plus, Trash2 } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import type { MemberConsentState } from '@/lib/competitions/model';
import type { CompetitionApi } from '@/lib/competitions/client/api';
import type { MemberDraft } from './formState';
import { emptyMember } from './formState';
import { CheckboxField, TextField } from './fields';
import { ProfilePhotoUploader, ResumeUploader } from './FileUploadField';

interface Props {
    competition: CompetitionDefinition;
    members: MemberDraft[];
    onChange: (members: MemberDraft[]) => void;
    errors: Record<string, string>;
    api: CompetitionApi;
    teamId: string | null;
    consents?: Record<string, MemberConsentState>;
    onResendConsent?: (memberId: string) => void;
    canResend?: boolean;
    disabled?: boolean;
}

const CONSENT_LABEL: Record<string, { text: string; cls: string }> = {
    'Not requested': { text: 'Consent email not sent yet', cls: 'bg-gray-100 text-gray-700' },
    'Requested': { text: 'Waiting for member’s consent', cls: 'bg-amber-50 text-amber-900' },
    'Given': { text: 'Member approved their details', cls: 'bg-emerald-50 text-emerald-800' },
    'Declined': { text: 'Member chose name only', cls: 'bg-gray-100 text-gray-700' },
    'Declined (hidden)': { text: 'Member asked to be hidden', cls: 'bg-gray-100 text-gray-700' },
};

// Repeatable team member fields. The platform sets no team-size limit; a competition may.
export default function TeamMemberEditor({ competition, members, onChange, errors, api, teamId, consents, onResendConsent, canResend, disabled }: Props) {
    const f = competition.fields;
    const update = (index: number, patch: Partial<MemberDraft>) => onChange(members.map((m, i) => (i === index ? { ...m, ...patch } : m)));
    const remove = (index: number) => onChange(members.filter((_, i) => i !== index));
    const maxOthers = competition.rules.maxMembers ? competition.rules.maxMembers - 1 : 50;
    return (
        <div>
            {members.length === 0 && (
                <p className="rounded-xl bg-off-white px-4 py-3 text-sm text-gray-600">No team members added yet. The team leader is already part of the team.</p>
            )}
            <ol className="space-y-5">
                {members.map((m, i) => {
                    const p = `members.${i}`;
                    const consent = m.memberId ? consents?.[m.memberId] : undefined;
                    const status = consent ? CONSENT_LABEL[consent.consentStatus] : undefined;
                    return (
                        <li key={m.key} className="rounded-2xl border border-gray-200 bg-white p-5">
                            <fieldset disabled={disabled}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <legend className="text-base font-semibold text-gray-900">Team member {i + 1}{m.name ? `: ${m.name}` : ''}</legend>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {status && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>{status.text}</span>}
                                        {canResend && m.memberId && m.email && consent && ['Not requested', 'Requested'].includes(consent.consentStatus) && (
                                            <button type="button" onClick={() => onResendConsent?.(m.memberId!)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-primary hover:bg-primary-50">
                                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                                Resend consent email
                                            </button>
                                        )}
                                        <button type="button" onClick={() => remove(i)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            Remove<span className="sr-only"> team member {i + 1}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <TextField path={`${p}.name`} label="Full name" required value={m.name} onChange={(v) => update(i, { name: v })} error={errors[`${p}.name`]} autoComplete="off" maxLength={120} />
                                    <TextField path={`${p}.linkedin`} label="LinkedIn URL" optional value={m.linkedin} onChange={(v) => update(i, { linkedin: v })} error={errors[`${p}.linkedin`]} inputMode="url" placeholder="https://www.linkedin.com/in/…" maxLength={300} />
                                    {f.memberEmail && <TextField path={`${p}.email`} label="Email" optional type="email" value={m.email} onChange={(v) => update(i, { email: v })} error={errors[`${p}.email`]} hint="Used to ask this member to approve what is shown about them." autoComplete="off" maxLength={254} />}
                                    {f.memberPhone && <TextField path={`${p}.phone`} label="Phone" optional type="tel" value={m.phone} onChange={(v) => update(i, { phone: v })} error={errors[`${p}.phone`]} autoComplete="off" maxLength={20} />}
                                    {f.memberPhoto && <ProfilePhotoUploader path={`${p}.photoFileId`} value={m.photo} onChange={(v) => update(i, { photo: v })} api={api} teamId={teamId} error={errors[`${p}.photoFileId`]} disabled={disabled} />}
                                    {f.memberResume && <ResumeUploader path={`${p}.resumeFileId`} value={m.resume} onChange={(v) => update(i, { resume: v })} api={api} teamId={teamId} error={errors[`${p}.resumeFileId`]} disabled={disabled} />}
                                </div>
                                <div className="mt-5">
                                    <CheckboxField path={`${p}.under18`} checked={m.under18} onChange={(v) => update(i, { under18: v })} description="Nothing about members under 18 is published until EV Society has a parent's or guardian's consent.">
                                        This member is under 18
                                    </CheckboxField>
                                </div>
                            </fieldset>
                        </li>
                    );
                })}
            </ol>
            {errors.members && <p className="mt-3 text-sm font-medium text-red-700">{errors.members}</p>}
            {members.length < maxOthers && !disabled && (
                <button type="button" onClick={() => onChange([...members, emptyMember()])} className="btn-secondary mt-5 min-h-11">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Team Member
                </button>
            )}
        </div>
    );
}
