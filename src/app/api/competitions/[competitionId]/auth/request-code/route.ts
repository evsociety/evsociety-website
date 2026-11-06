import { clientIp, handler, ok, rateLimit, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireRegistrationService } from '@/lib/competitions/server/guards';
import { requestSignInCode } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string }> };

// Emails a 6-digit code that confirms the team leader controls the address
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    requireRegistrationService();
    const competition = requireCompetition((await params).competitionId);
    const ip = clientIp(request);
    rateLimit(`code:${ip}`, 10, 15 * 60 * 1000);
    const body = await readJson(request, 2000);
    const { email } = await requestSignInCode(competition, body.email, ip);
    return ok({ sent: true, email });
});
