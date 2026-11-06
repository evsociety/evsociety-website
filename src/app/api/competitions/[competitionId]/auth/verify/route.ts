import { clientIp, handler, ok, rateLimit, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireRegistrationService } from '@/lib/competitions/server/guards';
import { startTeamSession } from '@/lib/competitions/server/session';
import { verifySignInCode } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string }> };

export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    requireRegistrationService();
    requireCompetition((await params).competitionId);
    const ip = clientIp(request);
    rateLimit(`verify:${ip}`, 20, 15 * 60 * 1000);
    const body = await readJson(request, 2000);
    const email = await verifySignInCode(body.email, body.code, ip);
    await startTeamSession(email);
    return ok({ email });
});
