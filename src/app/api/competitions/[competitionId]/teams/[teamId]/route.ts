import { handler, ok, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { getTeam, saveTeam } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; teamId: string }> };

export const GET = handler(async (_request: Request, { params }: Ctx) => {
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    return ok({ team: await getTeam(competition, session.email, requireTeamId(p.teamId)) });
});

// Saves the team (draft, update or submission for review). Published teams create a pending
// revision instead; the approved profile stays public until EV Society approves the change.
export const PUT = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    const body = await readJson(request, 150_000);
    return ok(await saveTeam(competition, session.email, requireTeamId(p.teamId), body));
});
