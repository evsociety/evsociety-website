import { clientIp, handler, ok, rateLimit, readJson, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireRegistrationService } from '@/lib/competitions/server/guards';
import { saveConsent } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string; token: string }> };

// A team member's own publication choices, from the link emailed to them
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    requireRegistrationService();
    const p = await params;
    const competition = requireCompetition(p.competitionId);
    const ip = clientIp(request);
    rateLimit(`consent:${ip}`, 30, 60 * 60 * 1000);
    const body = await readJson(request, 2000);
    return ok(await saveConsent(competition, p.token, body, ip));
});
