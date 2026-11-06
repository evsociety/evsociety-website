import { ApiError, clientIp, handler, ok, rateLimit, requireCompetition, requireSameOrigin } from '@/lib/competitions/server/http';
import { requireLeaderSession, requireTeamId } from '@/lib/competitions/server/guards';
import { isFileKind } from '@/lib/competitions/files';
import { uploadFile } from '@/lib/competitions/server/teamService';

type Ctx = { params: Promise<{ competitionId: string }> };

// One file per request (multipart/form-data: teamId, kind, file). The file type is checked
// from its bytes, and the backend stores it in a private Drive folder.
export const POST = handler(async (request: Request, { params }: Ctx) => {
    requireSameOrigin(request);
    const session = await requireLeaderSession();
    const competition = requireCompetition((await params).competitionId);
    const ip = clientIp(request);
    rateLimit(`upload:${ip}`, 60, 60 * 60 * 1000);
    const length = Number(request.headers.get('content-length') ?? 0);
    if (length > 4.4 * 1024 * 1024) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'This file is too large.');
    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        throw new ApiError(400, 'BAD_REQUEST', 'The upload could not be read.');
    }
    const kind = form.get('kind');
    const file = form.get('file');
    if (!isFileKind(kind)) throw new ApiError(422, 'VALIDATION', 'Unsupported upload.');
    if (!(file instanceof File)) throw new ApiError(422, 'VALIDATION', 'Choose a file to upload.');
    const teamId = requireTeamId(String(form.get('teamId') ?? ''));
    return ok({ file: await uploadFile(competition, session.email, teamId, kind, file, ip) }, { status: 201 });
});
