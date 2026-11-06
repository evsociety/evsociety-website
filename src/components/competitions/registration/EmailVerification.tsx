'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import type { CompetitionApi } from '@/lib/competitions/client/api';
import { ApiClientError } from '@/lib/competitions/client/api';
import { TextField } from './fields';

// Enter the 6-digit code emailed to the team leader. Calls onVerified once the server has set
// the signed session cookie.
export default function EmailVerification({ api, email, onVerified, onCancel, autoSend = true }: { api: CompetitionApi; email: string; onVerified: (email: string) => void; onCancel: () => void; autoSend?: boolean }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState<'send' | 'verify' | null>(null);
    const [sentAt, setSentAt] = useState<number | null>(null);
    const started = useRef(false);
    const heading = useRef<HTMLHeadingElement>(null);

    const send = async () => {
        setBusy('send');
        setError('');
        try {
            await api.requestCode(email);
            setSentAt(Date.now());
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : 'We could not send the code. Please try again.');
        } finally {
            setBusy(null);
        }
    };

    useEffect(() => {
        heading.current?.focus();
        if (autoSend && !started.current) {
            started.current = true;
            void send();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(code.trim())) {
            setError('Enter the 6-digit code from the email.');
            return;
        }
        setBusy('verify');
        setError('');
        try {
            const res = await api.verifyCode(email, code.trim());
            onVerified(res.email);
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : 'That code could not be checked. Please try again.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <form onSubmit={verify} className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:p-6" aria-labelledby="verify-heading">
            <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                    <h3 id="verify-heading" ref={heading} tabIndex={-1} className="text-lg font-bold focus:outline-none">Confirm your email</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                        {sentAt ? <>We sent a 6-digit code to <strong className="break-all font-semibold">{email}</strong>. It expires in 10 minutes.</> : busy === 'send' ? 'Sending a code…' : <>We will send a 6-digit code to <strong className="break-all font-semibold">{email}</strong>.</>}
                        {' '}Confirming your email keeps your registration secure and lets you edit it later.
                    </p>
                </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[12rem_auto] sm:items-end">
                <TextField path="code" label="Verification code" value={code} onChange={(v) => setCode(v.replace(/[^\d]/g, '').slice(0, 6))} error={error} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={6} />
                <button type="submit" disabled={busy !== null} className="btn-primary min-h-11 sm:mb-[1px] sm:w-fit">
                    {busy === 'verify' && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    Verify and continue
                </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <button type="button" onClick={send} disabled={busy !== null} className="min-h-9 rounded font-semibold text-primary hover:underline disabled:opacity-50">Send a new code</button>
                <button type="button" onClick={onCancel} className="min-h-9 rounded font-semibold text-gray-600 hover:underline">Use a different email</button>
            </div>
        </form>
    );
}
