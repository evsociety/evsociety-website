import { handler, ok, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { requestDeletion } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; teamId: string }> };

// Withdraws the profile at once and asks EV Society to delete the team's data
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    const body = await readJson(request, 3000);
    return ok({ team: await requestDeletion(competition, session.email, requireTeamId(p.teamId), body.reason) });
});
