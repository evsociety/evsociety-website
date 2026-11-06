// Upload rules shared by the browser (early feedback, image resizing) and the upload API route
// (authoritative checks on the actual bytes). Limits stay under Vercel's 4.5 MB request body.

import type { FileKind } from './model';

export const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const UPLOAD_RULES: Record<FileKind, { mimes: readonly string[]; maxBytes: number; label: string }> = {
    'member-photo': { mimes: IMAGE_MIMES, maxBytes: 3 * 1024 * 1024, label: 'Profile photograph' },
    'mentor-photo': { mimes: IMAGE_MIMES, maxBytes: 3 * 1024 * 1024, label: 'Mentor photograph' },
    'team-photo': { mimes: IMAGE_MIMES, maxBytes: 3 * 1024 * 1024, label: 'Team photograph' },
    'team-logo': { mimes: IMAGE_MIMES, maxBytes: 2 * 1024 * 1024, label: 'Team logo' },
    'institution-logo': { mimes: IMAGE_MIMES, maxBytes: 2 * 1024 * 1024, label: 'Institution logo' },
    resume: { mimes: ['application/pdf'], maxBytes: 4 * 1024 * 1024, label: 'Resume (PDF)' },
};

export const FILE_KINDS = Object.keys(UPLOAD_RULES) as FileKind[];

export function isFileKind(value: unknown): value is FileKind {
    return typeof value === 'string' && (FILE_KINDS as string[]).includes(value);
}

/** Detects the real type from the first bytes; the browser-reported type is not trusted */
export function sniffMime(bytes: Uint8Array): string {
    const b = (i: number) => bytes[i];
    if (bytes.length >= 5 && b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46 && b(4) === 0x2d) return 'application/pdf';
    if (bytes.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'image/jpeg';
    if (bytes.length >= 8 && b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 && b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a) return 'image/png';
    if (bytes.length >= 12 && b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50) return 'image/webp';
    return '';
}

export function checkUpload(kind: FileKind, bytes: Uint8Array): { ok: true; mime: string } | { ok: false; message: string } {
    const rule = UPLOAD_RULES[kind];
    const mime = sniffMime(bytes);
    if (!rule.mimes.includes(mime)) {
        return { ok: false, message: kind === 'resume' ? 'Upload the resume as a PDF file.' : 'Upload a JPG, PNG or WebP image.' };
    }
    if (bytes.length > rule.maxBytes) return { ok: false, message: `This file is larger than ${formatBytes(rule.maxBytes)}.` };
    if (bytes.length < 64) return { ok: false, message: 'This file appears to be empty.' };
    return { ok: true, mime };
}

export function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} bytes`;
}

/** File names are shown back to the team leader only; keep them short and printable */
export function safeFileName(name: string): string {
    return name.replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 120) || 'upload';
}
