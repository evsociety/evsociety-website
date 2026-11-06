import 'server-only';
import { ImageResponse } from 'next/og';
import type { CompetitionDefinition } from '@/config/competitions';
import type { PublicTeam } from '../model';
import { recognitionOf } from '../recognition';
import { callBackend } from './backend';

// 1200×630 recognition card, used both as the downloadable card and as the Open Graph / X
// preview image. It uses the team's approved group photograph unchanged (scaled to fit, never
// cropped or covered with text) and only verified wording.

export const CARD_SIZE = { width: 1200, height: 630 };

const NAVY = '#0b1930';
const NAVY_RAISED = '#15294a';
const GOLD = '#e2c47a';
const SKY = '#7dd3fc';

type Font = { name: string; data: ArrayBuffer; weight: 400 | 600 | 800; style: 'normal' };

async function loadInter(weight: 400 | 600 | 800): Promise<Font | null> {
    try {
        // A plain request receives TrueType files, which the image renderer supports
        const css = await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`, { next: { revalidate: 60 * 60 * 24 * 30 } }).then((r) => r.text());
        const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
        if (!url) return null;
        const data = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } }).then((r) => r.arrayBuffer());
        return { name: 'Inter', data, weight, style: 'normal' };
    } catch {
        return null;
    }
}

async function fonts(): Promise<Font[]> {
    const loaded = await Promise.all([loadInter(400), loadInter(600), loadInter(800)]);
    return loaded.filter((f): f is Font => !!f);
}

/** The approved group photograph as a data URL, or null (never anything unapproved) */
export async function teamPhotoDataUrl(competition: CompetitionDefinition, team: PublicTeam): Promise<{ src: string; width: number; height: number } | null> {
    const fileId = team.teamPhoto?.url.split('/').pop();
    if (!team.teamPhoto || !fileId) return null;
    try {
        const file = await callBackend<{ mime: string; base64: string }>('public.media', { competitionId: competition.id, fileId });
        if (!/^image\/(jpeg|png)$/.test(file.mime)) return null;
        return { src: `data:${file.mime};base64,${file.base64}`, width: team.teamPhoto.width ?? 1200, height: team.teamPhoto.height ?? 800 };
    } catch {
        return null;
    }
}

function Rings() {
    // Quiet orbit lines for cards without a photograph
    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[520, 400, 280].map((w) => (
                <div key={w} style={{ position: 'absolute', width: w, height: w * 0.42, border: '1.5px solid rgba(125, 211, 252, 0.22)', borderRadius: '50%', transform: 'rotate(-22deg)' }} />
            ))}
            <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: 6, background: GOLD, top: 200, right: 120 }} />
        </div>
    );
}

interface CardInput {
    competition: CompetitionDefinition;
    eyebrow: string;
    title: string;
    code?: string;
    standing: string;
    detail?: string;
    photo: { src: string; width: number; height: number } | null;
}

export async function renderCard({ competition, eyebrow, title, code, standing, detail, photo }: CardInput, init: ResponseInit = {}) {
    const titleSize = title.length > 34 ? 48 : title.length > 22 ? 58 : 68;
    const photoBox = { width: 600, height: 630 };
    let shown = { width: photoBox.width - 48, height: photoBox.height - 48 };
    if (photo) {
        const scale = Math.min((photoBox.width - 48) / photo.width, (photoBox.height - 48) / photo.height);
        shown = { width: Math.round(photo.width * scale), height: Math.round(photo.height * scale) };
    }
    return new ImageResponse(
        (
            <div style={{ display: 'flex', width: '100%', height: '100%', background: NAVY, fontFamily: 'Inter', color: 'white' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: 600, padding: '56px 52px 48px 60px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 36, height: 3, background: GOLD }} />
                            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 4, color: GOLD }}>EV SOCIETY</div>
                        </div>
                        {/* Original casing: names such as IN-SPACe must not be upper-cased */}
                        <div style={{ marginTop: 40, fontSize: 22, fontWeight: 600, letterSpacing: 0.5, color: SKY }}>{eyebrow}</div>
                        <div style={{ marginTop: 18, fontSize: titleSize, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{title}</div>
                        {code && <div style={{ marginTop: 16, fontSize: 26, fontWeight: 600, color: GOLD, letterSpacing: 1 }}>{code}</div>}
                        <div style={{ marginTop: 30, fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{standing}</div>
                        {detail && <div style={{ marginTop: 10, fontSize: 22, color: '#cbd5e1' }}>{detail}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 17, color: '#94a3b8' }}>
                        <div style={{ display: 'flex' }}>{competition.copy.shareName}</div>
                        <div style={{ display: 'flex' }}>Organised by {competition.copy.organiserShort} · recognition by EV Society</div>
                        <div style={{ display: 'flex', marginTop: 6, color: '#cbd5e1', fontWeight: 600 }}>evsociety.org</div>
                    </div>
                </div>
                <div style={{ position: 'relative', display: 'flex', width: photoBox.width, height: photoBox.height, background: NAVY_RAISED, alignItems: 'center', justifyContent: 'center' }}>
                    {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.src} width={shown.width} height={shown.height} alt="" style={{ borderRadius: 14, objectFit: 'contain' }} />
                    ) : (
                        <Rings />
                    )}
                </div>
            </div>
        ),
        { ...CARD_SIZE, fonts: await fonts(), ...init },
    );
}

/** The card for one published team, describing only its verified standing */
export async function renderTeamCard(competition: CompetitionDefinition, team: PublicTeam, init: ResponseInit = {}) {
    const r = recognitionOf(team, competition);
    const standing = !r ? 'Team profile' : r.stage === 'winner' ? r.headline : r.stage === 'participant' ? `${r.categoryLabel} · Verified participant` : `${r.categoryLabel} · Registered team`;
    return renderCard({
        competition,
        eyebrow: `${r?.categoryLabel ?? competition.shortName} · ${team.year}`,
        title: team.name,
        code: team.teamCode || undefined,
        standing,
        detail: r?.achievement || (team.college ? team.college : undefined),
        photo: await teamPhotoDataUrl(competition, team),
    }, init);
}
