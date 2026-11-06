'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ApiClientError, competitionApi } from '@/lib/competitions/client/api';
import type { ConsentViewData } from './consentTypes';
import { CheckboxField } from './fields';

// A team member's own choices about what EV Society shows about them
export default function ConsentForm({ competitionId, token, view }: { competitionId: string; token: string; view: ConsentViewData }) {
    const api = useMemo(() => competitionApi(competitionId), [competitionId]);
    const [hidden, setHidden] = useState(view.permissions.hidden);
    const [perms, setPerms] = useState({ photo: view.permissions.photo, linkedin: view.permissions.linkedin, email: view.permissions.email, phone: view.permissions.phone });
    const [under18, setUnder18] = useState(view.under18);
    const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState('saving');
        setError('');
        try {
            await api.saveConsent(token, { permissions: { hidden, ...perms }, under18 });
            setState('saved');
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : 'Your choices could not be saved. Please try again.');
            setState('idle');
        }
    };

    const items: { key: keyof typeof perms; label: string; detail?: string }[] = [
        { key: 'photo', label: 'My photograph' },
        { key: 'linkedin', label: 'My LinkedIn profile', detail: view.preview.linkedin },
        { key: 'email', label: 'My email address', detail: view.preview.email },
        { key: 'phone', label: 'My phone number', detail: view.preview.phone },
    ];
    const available = items.filter((i) => view.available[i.key]);

    if (state === 'saved') {
        return (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-bold">Your choices are saved</h2>
                <p className="mt-2 leading-relaxed text-gray-600">
                    {hidden ? 'You will not appear on the team’s public profile.' : 'EV Society will show only what you allowed, and only if the team’s profile is approved.'} You can change this at any time with the same link while it is valid.
                </p>
                <button type="button" onClick={() => setState('idle')} className="btn-secondary mt-6 min-h-11">Change my choices</button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <fieldset>
                <legend className="text-lg font-bold">What may EV Society show about you?</legend>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    If the team&apos;s profile is approved, your name can appear as a member of {view.teamName}. Choose which of your other details may be shown too. Your resume is never published.
                </p>
                <div className="mt-6 space-y-4">
                    {available.length ? available.map((item) => (
                        <CheckboxField key={item.key} path={`consent.${item.key}`} checked={!hidden && perms[item.key]} disabled={hidden} onChange={(v) => setPerms((p) => ({ ...p, [item.key]: v }))} description={item.detail}>
                            {item.label}
                        </CheckboxField>
                    )) : <p className="text-sm text-gray-600">The team leader has not added a photo or contact details for you.</p>}
                </div>
                <div className="mt-6 border-t border-gray-100 pt-6">
                    <CheckboxField path="consent.hidden" checked={hidden} onChange={setHidden} description="Your name and details will not appear on the public profile.">
                        Do not show me on the public profile at all
                    </CheckboxField>
                </div>
                <div className="mt-4">
                    <CheckboxField path="consent.under18" checked={under18} onChange={setUnder18} description="If you are under 18, nothing about you is published until a parent or guardian has agreed. EV Society will contact your team leader.">
                        I am under 18
                    </CheckboxField>
                </div>
            </fieldset>
            {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={state === 'saving'} className="btn-primary mt-6 min-h-12">
                {state === 'saving' && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                Save my choices
            </button>
        </form>
    );
}
