import { handler, ok, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { setPublicationConsent } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; teamId: string }> };

// The team's consent to a public profile; withdrawing it takes effect immediately
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    const body = await readJson(request, 1000);
    return ok({ team: await setPublicationConsent(competition, session.email, requireTeamId(p.teamId), body.consent === true) });
});
