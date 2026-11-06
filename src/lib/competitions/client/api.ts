'use client';

import type { FileKind, FileSummary, TeamListItem, TeamSavePayload, TeamView } from '../model';

// Browser client for the competition API routes. Errors carry field paths for inline display.

export class ApiClientError extends Error {
    status: number;
    code: string;
    fields: Record<string, string>;
    details: Record<string, any> | null;
    constructor(status: number, code: string, message: string, fields: Record<string, string> | null, details: Record<string, any> | null) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = fields ?? {};
        this.details = details;
    }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
        res = await fetch(url, {
            method,
            headers: body === undefined ? undefined : { 'content-type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
            credentials: 'same-origin',
            cache: 'no-store',
        });
    } catch {
        throw new ApiClientError(0, 'NETWORK', 'You appear to be offline. Check your connection and try again.', null, null);
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        const e = json?.error ?? {};
        throw new ApiClientError(res.status, e.code ?? 'INTERNAL', e.message ?? 'Something went wrong. Please try again.', e.fields ?? null, e.details ?? null);
    }
    return json as T;
}

export function competitionApi(competitionId: string) {
    const base = `/api/competitions/${competitionId}`;
    return {
        session: () => request<{ available: boolean; email: string | null }>('GET', `${base}/auth/session`),
        signOut: () => request<{ signedOut: boolean }>('DELETE', `${base}/auth/session`),
        requestCode: (email: string) => request<{ sent: boolean; email: string }>('POST', `${base}/auth/request-code`, { email }),
        verifyCode: (email: string, code: string) => request<{ email: string }>('POST', `${base}/auth/verify`, { email, code }),
        listTeams: () => request<{ teams: TeamListItem[] }>('GET', `${base}/teams`),
        createDraft: (body: { year: number | null; categories: string[]; leader: { name: string; phone: string }; allowAdditional?: boolean; idempotencyKey: string }) =>
            request<{ team: TeamView }>('POST', `${base}/teams`, body),
        getTeam: (teamId: string) => request<{ team: TeamView }>('GET', `${base}/teams/${teamId}`),
        saveTeam: (teamId: string, body: { data: TeamSavePayload; submit: boolean; expectedVersion: number; editMode: TeamView['editMode']; idempotencyKey: string }) =>
            request<{ team: TeamView; outcome: { mode: string; submitted: boolean; changeRequestId: string | null } }>('PUT', `${base}/teams/${teamId}`, body),
        setPublication: (teamId: string, consent: boolean) => request<{ team: TeamView }>('POST', `${base}/teams/${teamId}/publication`, { consent }),
        requestDeletion: (teamId: string, reason: string) => request<{ team: TeamView }>('POST', `${base}/teams/${teamId}/deletion`, { reason }),
        discardChanges: (teamId: string) => request<{ team: TeamView }>('POST', `${base}/teams/${teamId}/discard`),
        resendConsent: (teamId: string, memberId: string) => request<{ team: TeamView }>('POST', `${base}/teams/${teamId}/consent-requests`, { memberId }),
        privateFileUrl: (teamId: string, fileId: string) => `${base}/teams/${teamId}/files/${fileId}`,
        saveConsent: (token: string, body: { permissions: Record<string, boolean>; under18: boolean }) =>
            request<{ saved: boolean; consentStatus: string }>('POST', `${base}/consent/${token}`, body),
        /** XMLHttpRequest so the form can show upload progress */
        upload: (teamId: string, kind: FileKind, file: Blob, name: string, onProgress: (fraction: number) => void) =>
            new Promise<FileSummary>((resolve, reject) => {
                const form = new FormData();
                form.append('teamId', teamId);
                form.append('kind', kind);
                form.append('file', file, name);
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${base}/uploads`);
                xhr.responseType = 'json';
                xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
                xhr.onerror = () => reject(new ApiClientError(0, 'NETWORK', 'The upload failed. Check your connection and try again.', null, null));
                xhr.onload = () => {
                    const json = xhr.response;
                    if (xhr.status >= 200 && xhr.status < 300 && json?.file) resolve(json.file);
                    else {
                        const e = json?.error ?? {};
                        reject(new ApiClientError(xhr.status, e.code ?? 'INTERNAL', e.message ?? 'The upload failed. Please try again.', e.fields ?? null, null));
                    }
                };
                xhr.send(form);
            }),
    };
}

export type CompetitionApi = ReturnType<typeof competitionApi>;

export function newIdempotencyKey(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
