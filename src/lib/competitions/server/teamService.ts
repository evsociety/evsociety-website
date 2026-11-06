import 'server-only';
import { revalidateTag } from 'next/cache';
import type { CompetitionDefinition } from '@/config/competitions';
import type { FileKind, FileSummary, TeamListItem, TeamView } from '../model';
import { checkUpload, safeFileName } from '../files';
import { imageSize } from '../imageSize';
import { cleanText, isEmail, LIMITS, normalizeEmail, normalizeTeamPayload, validateLeaderStart, validateTeamPayload, validateYearAndCategories } from '../validation';
import { ApiError } from './http';
import { BackendError, callBackend } from './backend';
import { competitionTag, getCompetitionData } from './publicData';

// Team registration and editing. Each function validates on the website first (friendly field
// errors), then calls the backend, which re-checks and authorises against the team's leader.

async function runtimeConfig(competition: CompetitionDefinition) {
    return (await getCompetitionData(competition)).data.config;
}

const refreshPublic = (competition: CompetitionDefinition) => revalidateTag(competitionTag(competition.id));

export async function requestSignInCode(competition: CompetitionDefinition, emailInput: unknown, ip: string) {
    const email = normalizeEmail(emailInput);
    if (!isEmail(email)) throw new ApiError(422, 'VALIDATION', 'Enter a valid email address.', { email: 'Enter a valid email address.' });
    await callBackend('auth.requestCode', { email, competitionName: competition.shortName }, { ip });
    return { email };
}

export async function verifySignInCode(emailInput: unknown, codeInput: unknown, ip: string) {
    const email = normalizeEmail(emailInput);
    const code = cleanText(codeInput, 12).replace(/\s/g, '');
    if (!isEmail(email) || !/^\d{6}$/.test(code)) throw new ApiError(400, 'INVALID_CODE', 'Enter the 6-digit code from the email.', { code: 'Enter the 6-digit code from the email.' });
    const result = await callBackend<{ email: string }>('auth.verifyCode', { email, code }, { ip });
    return result.email;
}

export async function listTeams(competition: CompetitionDefinition, email: string) {
    const result = await callBackend<{ teams: TeamListItem[] }>('teams.list', { competitionId: competition.id }, { actorEmail: email });
    return result.teams;
}

export async function getTeam(competition: CompetitionDefinition, email: string, teamId: string) {
    const result = await callBackend<{ team: TeamView }>('teams.get', { competitionId: competition.id, teamId }, { actorEmail: email });
    return result.team;
}

export async function createDraft(competition: CompetitionDefinition, email: string, body: Record<string, unknown>, ip: string) {
    const config = await runtimeConfig(competition);
    if (!config.registrationOpen) throw new ApiError(403, 'CLOSED', 'Registration is currently closed.');
    const leader = (body.leader ?? {}) as Record<string, unknown>;
    const year = Number(body.year) || null;
    const categories = Array.isArray(body.categories) ? body.categories.map((c) => cleanText(c, 60)) : [];
    const errors = {
        ...validateYearAndCategories(competition, config, year, categories),
        ...validateLeaderStart({ name: String(leader.name ?? ''), email, phone: String(leader.phone ?? '') }),
    };
    if (Object.keys(errors).length) throw new ApiError(422, 'VALIDATION', 'Please correct the highlighted fields.', errors);
    const result = await callBackend<{ team: TeamView }>('teams.createDraft', {
        competitionId: competition.id,
        year,
        categories,
        leader: { name: cleanText(leader.name, LIMITS.name), phone: cleanText(leader.phone, LIMITS.phone) },
        allowAdditional: body.allowAdditional === true,
        idempotencyKey: cleanText(body.idempotencyKey, 80),
    }, { actorEmail: email, ip });
    return result.team;
}

export async function saveTeam(competition: CompetitionDefinition, email: string, teamId: string, body: Record<string, unknown>) {
    const config = await runtimeConfig(competition);
    const payload = normalizeTeamPayload(body.data);
    const submit = body.submit === true;
    const errors = validateTeamPayload(payload, {
        complete: submit,
        competition,
        config,
        leaderEmail: email,
        // The backend decides whether year and categories may still change; this only avoids
        // a false error for approved teams whose year has since closed for new registrations
        lockYearAndCategories: body.editMode === 'revision',
    });
    if (Object.keys(errors).length) throw new ApiError(422, 'VALIDATION', 'Please correct the highlighted fields.', errors);
    const result = await callBackend<{ team: TeamView; outcome: { mode: string; submitted: boolean; changeRequestId: string | null } }>('teams.save', {
        competitionId: competition.id,
        teamId,
        data: payload,
        submit,
        expectedVersion: typeof body.expectedVersion === 'number' ? body.expectedVersion : null,
        idempotencyKey: cleanText(body.idempotencyKey, 80),
    }, { actorEmail: email });
    // Consent changes take effect immediately, so the public pages are refreshed on every save
    refreshPublic(competition);
    return result;
}

export async function setPublicationConsent(competition: CompetitionDefinition, email: string, teamId: string, consent: boolean) {
    const result = await callBackend<{ team: TeamView }>('teams.setPublication', { competitionId: competition.id, teamId, consent }, { actorEmail: email });
    refreshPublic(competition);
    return result.team;
}

export async function requestDeletion(competition: CompetitionDefinition, email: string, teamId: string, reason: unknown) {
    const result = await callBackend<{ team: TeamView }>('teams.requestDeletion', { competitionId: competition.id, teamId, reason: cleanText(reason, 1000) }, { actorEmail: email });
    refreshPublic(competition);
    return result.team;
}

export async function discardChanges(competition: CompetitionDefinition, email: string, teamId: string) {
    const result = await callBackend<{ team: TeamView }>('teams.discardChanges', { competitionId: competition.id, teamId }, { actorEmail: email });
    return result.team;
}

export async function resendConsent(competition: CompetitionDefinition, email: string, teamId: string, memberId: string) {
    const result = await callBackend<{ team: TeamView }>('teams.resendConsent', { competitionId: competition.id, teamId, memberId: cleanText(memberId, 40) }, { actorEmail: email });
    return result.team;
}

export async function uploadFile(competition: CompetitionDefinition, email: string, teamId: string, kind: FileKind, file: File, ip: string) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const check = checkUpload(kind, bytes);
    if (!check.ok) throw new ApiError(422, 'VALIDATION', check.message, { file: check.message });
    const dims = check.mime.startsWith('image/') ? imageSize(bytes) : null;
    const result = await callBackend<{ file: FileSummary }>('files.upload', {
        competitionId: competition.id,
        teamId,
        kind,
        originalName: safeFileName(file.name || kind),
        base64: Buffer.from(bytes).toString('base64'),
        width: dims?.width ?? null,
        height: dims?.height ?? null,
    }, { actorEmail: email, ip });
    return result.file;
}

export async function privateImage(competition: CompetitionDefinition, email: string, teamId: string, fileId: string) {
    return callBackend<{ mime: string; base64: string }>('files.private', { competitionId: competition.id, teamId, fileId }, { actorEmail: email });
}

export interface ConsentView {
    competitionId: string;
    competitionName: string;
    teamName: string;
    year: number | null;
    memberName: string;
    available: { photo: boolean; linkedin: boolean; email: boolean; phone: boolean };
    preview: { linkedin: string; email: string; phone: string };
    permissions: { hidden: boolean; photo: boolean; linkedin: boolean; email: boolean; phone: boolean };
    under18: boolean;
    consentStatus: string;
}

export async function getConsent(token: string, ip: string): Promise<ConsentView | null> {
    if (!/^[a-f0-9]{48}$/.test(token)) return null;
    try {
        return await callBackend<ConsentView>('consent.get', { token }, { ip });
    } catch (err) {
        if (err instanceof BackendError && err.code === 'NOT_FOUND') return null;
        throw err;
    }
}

export async function saveConsent(competition: CompetitionDefinition, token: string, body: Record<string, unknown>, ip: string) {
    if (!/^[a-f0-9]{48}$/.test(token)) throw new ApiError(404, 'NOT_FOUND', 'This link has expired or is no longer valid.');
    const p = (body.permissions ?? {}) as Record<string, unknown>;
    const result = await callBackend<{ saved: boolean; consentStatus: string; competitionId: string }>('consent.save', {
        token,
        permissions: { hidden: p.hidden === true, photo: p.photo === true, linkedin: p.linkedin === true, email: p.email === true, phone: p.phone === true },
        under18: body.under18 === true,
    }, { ip });
    if (result.competitionId === competition.id) refreshPublic(competition);
    return result;
}
