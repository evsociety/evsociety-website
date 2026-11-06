'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import type { CompetitionApi } from '@/lib/competitions/client/api';
import type { MentorDraft } from './formState';
import { emptyMentor } from './formState';
import { CheckboxField, TextField } from './fields';
import { ProfilePhotoUploader } from './FileUploadField';

export default function MentorEditor({ competition, mentors, onChange, errors, api, teamId, maxMentors, disabled }: { competition: CompetitionDefinition; mentors: MentorDraft[]; onChange: (m: MentorDraft[]) => void; errors: Record<string, string>; api: CompetitionApi; teamId: string | null; maxMentors: number; disabled?: boolean }) {
    const update = (index: number, patch: Partial<MentorDraft>) => onChange(mentors.map((m, i) => (i === index ? { ...m, ...patch } : m)));
    return (
        <div>
            {mentors.length === 0 && <p className="rounded-xl bg-off-white px-4 py-3 text-sm text-gray-600">No mentors added. Mentors are optional.</p>}
            <ol className="space-y-5">
                {mentors.map((m, i) => {
                    const p = `mentors.${i}`;
                    return (
                        <li key={m.key} className="rounded-2xl border border-gray-200 bg-white p-5">
                            <fieldset disabled={disabled}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <legend className="text-base font-semibold text-gray-900">Mentor {i + 1}{m.name ? `: ${m.name}` : ''}</legend>
                                    <button type="button" onClick={() => onChange(mentors.filter((_, j) => j !== i))} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        Remove<span className="sr-only"> mentor {i + 1}</span>
                                    </button>
                                </div>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <TextField path={`${p}.name`} label="Full name" required value={m.name} onChange={(v) => update(i, { name: v })} error={errors[`${p}.name`]} autoComplete="off" maxLength={120} />
                                    {competition.fields.mentorInstitution && <TextField path={`${p}.institution`} label="Institution / organisation" optional value={m.institution} onChange={(v) => update(i, { institution: v })} error={errors[`${p}.institution`]} maxLength={200} />}
                                    <TextField path={`${p}.linkedin`} label="LinkedIn URL" optional value={m.linkedin} onChange={(v) => update(i, { linkedin: v })} error={errors[`${p}.linkedin`]} inputMode="url" placeholder="https://www.linkedin.com/in/…" maxLength={300} />
                                    {competition.fields.mentorPhoto && <ProfilePhotoUploader kind="mentor-photo" label="Photograph" path={`${p}.photoFileId`} value={m.photo} onChange={(v) => update(i, { photo: v })} api={api} teamId={teamId} error={errors[`${p}.photoFileId`]} disabled={disabled} />}
                                </div>
                                <div className="mt-5">
                                    <CheckboxField path={`${p}.listingConsent`} checked={m.listingConsent} onChange={(v) => update(i, { listingConsent: v })} description="Mentors are shown on the public profile only with this confirmation.">
                                        {m.name || 'This mentor'} has agreed to be listed on the team&apos;s public profile
                                    </CheckboxField>
                                </div>
                            </fieldset>
                        </li>
                    );
                })}
            </ol>
            {errors.mentors && <p className="mt-3 text-sm font-medium text-red-700">{errors.mentors}</p>}
            {!disabled && (mentors.length < maxMentors ? (
                <button type="button" onClick={() => onChange([...mentors, emptyMentor()])} className="btn-secondary mt-5 min-h-11">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Mentor
                </button>
            ) : (
                <p className="mt-4 text-sm text-gray-500">You have added the maximum of {maxMentors} mentors.</p>
            ))}
        </div>
    );
}
