import { clientIp, handler, ok, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession } from '@/lib/competitions/server/guards';
import { createDraft, listTeams } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string }> };

// Teams led by the signed-in email
export const GET = handler(async (_request: Request, { params }: Ctx) => {
    const session = await requireLeaderSession();
    const competition = requireCompetition((await params).competitionId);
    return ok({ teams: await listTeams(competition, session.email) });
});

// Starts a draft registration after the leader's email is confirmed
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const competition = requireCompetition((await params).competitionId);
    const body = await readJson(request, 5000);
    const team = await createDraft(competition, session.email, body, clientIp(request));
    return ok({ team }, { status: 201 });
});
