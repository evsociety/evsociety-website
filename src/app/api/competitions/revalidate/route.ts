import { revalidateTag } from 'next/cache';
import { getCompetition } from '@/config/competitions';
import { apiSecret } from '@/lib/competitions/server/env';
import { verifyWebhook } from '@/lib/competitions/server/envelope';
import { competitionTag } from '@/lib/competitions/server/publicData';

// Called by the spreadsheet's review trigger after an approval or publication change, so the
// public pages update at once instead of waiting for the one-minute refresh.
export async function POST(request: Request) {
    const body = await request.text();
    if (body.length > 2000) return Response.json({ ok: false }, { status: 413 });
    const valid = verifyWebhook(apiSecret(), request.headers.get('x-evs-timestamp'), body, request.headers.get('x-evs-signature'));
    if (!valid) return Response.json({ ok: false }, { status: 401 });
    let competitionId = '';
    try {
        competitionId = String(JSON.parse(body).competitionId ?? '');
    } catch {
        return Response.json({ ok: false }, { status: 400 });
    }
    const competition = getCompetition(competitionId);
    if (!competition) return Response.json({ ok: false }, { status: 404 });
    revalidateTag(competitionTag(competition.id));
    return Response.json({ ok: true, revalidated: competition.id });
}
