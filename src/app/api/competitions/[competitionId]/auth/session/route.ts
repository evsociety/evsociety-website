import { handler, ok, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { registrationAvailable } from '@/lib/competitions/server/env';
import { endTeamSession, getTeamSession } from '@/lib/competitions/server/session';

type Ctx = { params: Promise<{ competitionId: string }> };

export const GET = handler(async (_request: Request, { params }: Ctx) => {
    requireCompetition((await params).competitionId);
    const session = registrationAvailable() ? await getTeamSession() : null;
    return ok({ available: registrationAvailable(), email: session?.email ?? null });
});

// Sign out
export const DELETE = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    requireCompetition((await params).competitionId);
    await endTeamSession();
    return ok({ signedOut: true });
});
