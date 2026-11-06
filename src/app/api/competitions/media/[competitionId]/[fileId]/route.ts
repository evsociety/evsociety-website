import { getCompetition } from '@/config/competitions';
import { callBackend } from '@/lib/competitions/server/backend';
import { getCompetitionData } from '@/lib/competitions/server/publicData';

type Ctx = { params: Promise<{ competitionId: string; fileId: string }> };

const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } });

// Public photographs and logos. Served only while the current public snapshot references the
// file (approved profile, individual consent); resumes and pending uploads are never listed.
export async function GET(_request: Request, { params }: Ctx) {
    const { competitionId, fileId } = await params;
    const competition = getCompetition(competitionId);
    if (!competition || !/^FIL-[2-9A-HJ-NP-Z]{12}$/.test(fileId)) return notFound();
    try {
        const { data } = await getCompetitionData(competition);
        if (!data.publicFileIds.includes(fileId)) return notFound();
        const file = await callBackend<{ mime: string; base64: string }>('public.media', { competitionId, fileId });
        if (!/^image\/(jpeg|png|webp)$/.test(file.mime)) return notFound();
        return new Response(Buffer.from(file.base64, 'base64'), {
            headers: {
                'Content-Type': file.mime,
                // Short CDN lifetime so a withdrawn photo stops being served within minutes
                'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
                'X-Content-Type-Options': 'nosniff',
                'Content-Disposition': 'inline',
            },
        });
    } catch {
        return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
