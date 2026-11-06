import { handler, requireCompetition } from '@/lib/competitions/server/http';
import { requireFileId, requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { privateImage } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; teamId: string; fileId: string }> };

// Image previews for the signed-in team leader. Resumes are never served by this route.
export const GET = handler(async (_request: Request, { params }: Ctx) => {
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    const file = await privateImage(competition, session.email, requireTeamId(p.teamId), requireFileId(p.fileId));
    if (!/^image\/(jpeg|png|webp)$/.test(file.mime)) return new Response('Not found', { status: 404 });
    return new Response(Buffer.from(file.base64, 'base64'), {
        headers: { 'Content-Type': file.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
    });
});
