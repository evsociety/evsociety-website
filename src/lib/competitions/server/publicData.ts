import 'server-only';
import { unstable_cache } from 'next/cache';
import type { CompetitionDefinition } from '@/config/competitions';
import type { PublicCompetitionData } from '../model';
import { emptyCompetitionData, sanitizeSnapshot } from '../publicModel';
import { callBackend } from './backend';
import { backendMode } from './env';

// Approved public data, read from the spreadsheet through the backend.
//  - Cached for a minute, and refreshed at once when the spreadsheet's review trigger or a
//    team action calls revalidateTag(competitionTag(id)), so changes appear without a deploy.
//  - Only the sanitised public projection is cached; private fields never enter the cache.
//  - If the backend is down, the last good snapshot this server instance saw is served.

export const PUBLIC_REVALIDATE_SECONDS = 60;
export const competitionTag = (competitionId: string) => `competition:${competitionId}`;

export class CompetitionDataUnavailable extends Error {
    constructor() {
        super('Competition data is temporarily unavailable');
    }
}

type LastGood = Map<string, PublicCompetitionData>;
const lastGood = (): LastGood => {
    const g = globalThis as { __evscLastGood?: LastGood };
    return (g.__evscLastGood ??= new Map());
};

const cachedSnapshot = (competition: CompetitionDefinition) =>
    unstable_cache(
        async () => sanitizeSnapshot(await callBackend('public.snapshot', { competitionId: competition.id }), competition),
        ['competition-public-snapshot-v1', competition.id],
        { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [competitionTag(competition.id)] },
    )();

export interface CompetitionDataResult {
    data: PublicCompetitionData;
    /** live: fresh or cached; stale: last good copy while the backend is unavailable */
    source: 'live' | 'stale' | 'not-configured';
}

export async function getCompetitionData(competition: CompetitionDefinition): Promise<CompetitionDataResult> {
    if (backendMode() === 'unconfigured') return { data: emptyCompetitionData(competition), source: 'not-configured' };
    try {
        const data = await cachedSnapshot(competition);
        lastGood().set(competition.id, data);
        return { data, source: 'live' };
    } catch (err) {
        const previous = lastGood().get(competition.id);
        console.error('[competitions] public data unavailable', competition.id, err instanceof Error ? err.message : err);
        if (previous) return { data: previous, source: 'stale' };
        throw new CompetitionDataUnavailable();
    }
}

/** For pages that should still render (with a notice) when data cannot be loaded */
export async function getCompetitionDataSafe(competition: CompetitionDefinition): Promise<CompetitionDataResult | null> {
    try {
        return await getCompetitionData(competition);
    } catch {
        return null;
    }
}
