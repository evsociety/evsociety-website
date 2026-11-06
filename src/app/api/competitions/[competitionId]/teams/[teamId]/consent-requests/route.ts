import { handler, ok, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { resendConsent } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; teamId: string }> };

// Re-sends a member's email asking them to choose what is published about them
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    const body = await readJson(request, 1000);
    return ok({ team: await resendConsent(competition, session.email, requireTeamId(p.teamId), String(body.memberId ?? '')) });
});
