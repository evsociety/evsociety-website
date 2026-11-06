import { handler, ok, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { discardChanges } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; teamId: string }> };

// Withdraws a pending revision of a published profile
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    return ok({ team: await discardChanges(competition, session.email, requireTeamId(p.teamId)) });
});
