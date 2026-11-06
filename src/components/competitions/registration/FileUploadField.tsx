'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FileText, ImagePlus, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import type { FileKind } from '@/lib/competitions/model';
import { formatBytes, UPLOAD_RULES } from '@/lib/competitions/files';
import type { CompetitionApi } from '@/lib/competitions/client/api';
import { ApiClientError } from '@/lib/competitions/client/api';
import type { FileRef } from './formState';
import { FieldError, fieldId } from './fields';

const MAX_DIMENSION: Partial<Record<FileKind, number>> = {
    'member-photo': 900,
    'mentor-photo': 900,
    'team-photo': 1800,
    'team-logo': 600,
    'institution-logo': 600,
};

// Shrinks photographs in the browser before upload (faster uploads, stable layouts). Logos stay
// PNG so transparency is kept; anything that cannot be decoded is refused with a clear message.
async function prepareImage(file: File, kind: FileKind): Promise<{ blob: Blob; name: string }> {
    const max = MAX_DIMENSION[kind] ?? 1200;
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
        throw new Error('This image could not be read. Please use a JPG or PNG file.');
    }
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const keepPng = (kind === 'team-logo' || kind === 'institution-logo') && file.type !== 'image/jpeg';
    if (scale === 1 && file.size <= UPLOAD_RULES[kind].maxBytes && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        bitmap.close();
        return { blob: file, name: file.name };
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This image could not be prepared for upload.');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const type = keepPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
    if (!blob) throw new Error('This image could not be prepared for upload.');
    return { blob, name: file.name.replace(/\.[^.]+$/, '') + (keepPng ? '.png' : '.jpg') };
}

interface Props {
    path: string;
    label: string;
    kind: FileKind;
    value: FileRef | null;
    onChange: (value: FileRef | null) => void;
    api: CompetitionApi;
    teamId: string | null;
    hint?: string;
    error?: string;
    disabled?: boolean;
    /** Square portrait preview (photos) or wide preview (team photograph) */
    shape?: 'portrait' | 'wide' | 'logo';
}

export default function FileUploadField({ path, label, kind, value, onChange, api, teamId, hint, error, disabled, shape = 'portrait' }: Props) {
    const id = fieldId(path);
    const input = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [problem, setProblem] = useState<string>('');
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const rule = UPLOAD_RULES[kind];
    const isImage = kind !== 'resume';

    useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);

    const choose = async (file: File | undefined) => {
        if (!file || !teamId) return;
        setProblem('');
        try {
            let blob: Blob = file;
            let name = file.name;
            if (isImage) {
                ({ blob, name } = await prepareImage(file, kind));
            } else if (file.type && file.type !== 'application/pdf') {
                throw new Error('Upload the resume as a PDF file.');
            }
            if (blob.size > rule.maxBytes) throw new Error(`This file is larger than ${formatBytes(rule.maxBytes)}.`);
            setProgress(0);
            const uploaded = await api.upload(teamId, kind, blob, name, setProgress);
            const preview = isImage ? URL.createObjectURL(blob) : undefined;
            if (preview) setLocalPreview(preview);
            onChange({ fileId: uploaded.fileId, name: uploaded.name, size: uploaded.size, previewUrl: preview });
        } catch (err) {
            setProblem(err instanceof ApiClientError || err instanceof Error ? err.message : 'The upload failed. Please try again.');
        } finally {
            setProgress(null);
            if (input.current) input.current.value = '';
        }
    };

    const message = problem || error;
    const busy = progress !== null;
    const previewBox = shape === 'wide' ? 'h-20 w-32 rounded-xl' : shape === 'logo' ? 'h-16 w-16 rounded-xl' : 'h-16 w-16 rounded-full';
    return (
        <div>
            <p id={`${id}-label`} className="flex items-baseline justify-between gap-2 text-sm font-medium text-gray-800">
                <span>{label}</span>
                <span className="text-xs font-normal text-gray-500">Optional</span>
            </p>
            <div className={`mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-dashed p-3 ${message ? 'border-red-400' : 'border-gray-300'} bg-off-white`}>
                <span className={`relative grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-gray-200 ${previewBox}`}>
                    {value?.previewUrl && isImage ? (
                        <Image src={value.previewUrl} alt={`Preview of ${label.toLowerCase()}`} fill unoptimized className={shape === 'logo' ? 'object-contain p-1' : 'object-cover'} />
                    ) : isImage ? (
                        <ImagePlus className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                        <FileText className={`h-5 w-5 ${value ? 'text-primary' : 'text-gray-400'}`} aria-hidden="true" />
                    )}
                </span>
                <div className="min-w-[9rem] flex-1">
                    {busy ? (
                        <div>
                            <p className="flex items-center gap-2 text-sm font-medium text-gray-700"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Uploading… {Math.round((progress ?? 0) * 100)}%</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label={`Uploading ${label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress ?? 0) * 100)}>
                                <div className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
                            </div>
                        </div>
                    ) : value ? (
                        <p className="truncate text-sm font-medium text-gray-900" title={value.name}>{value.name}{value.size ? <span className="font-normal text-gray-500"> · {formatBytes(value.size)}</span> : null}</p>
                    ) : (
                        <p className="text-sm text-gray-500">{hint ?? (isImage ? 'JPG, PNG or WebP' : `PDF, up to ${formatBytes(rule.maxBytes)}`)}</p>
                    )}
                    {!teamId && <p className="text-xs text-gray-500">Available after you confirm your email.</p>}
                </div>
                <div className="flex shrink-0 gap-1.5">
                    <input
                        ref={input}
                        id={id}
                        type="file"
                        accept={rule.mimes.join(',')}
                        className="sr-only"
                        aria-labelledby={`${id}-label`}
                        aria-describedby={message ? `${id}-error` : undefined}
                        disabled={disabled || busy || !teamId}
                        onChange={(e) => choose(e.target.files?.[0])}
                    />
                    <button
                        type="button"
                        onClick={() => input.current?.click()}
                        disabled={disabled || busy || !teamId}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-800 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {value ? <RefreshCw className="h-4 w-4" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                        {value ? 'Replace' : 'Upload'}
                        <span className="sr-only"> {label}</span>
                    </button>
                    {value && !busy && (
                        <button type="button" onClick={() => onChange(null)} disabled={disabled} className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${label}`}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
            <FieldError id={id} message={message} />
        </div>
    );
}

export function ProfilePhotoUploader(props: Omit<Props, 'kind' | 'label' | 'shape'> & { label?: string; kind?: 'member-photo' | 'mentor-photo' }) {
    return <FileUploadField {...props} kind={props.kind ?? 'member-photo'} label={props.label ?? 'Profile photograph'} shape="portrait" hint="Head-and-shoulders photo, JPG or PNG" />;
}

export function ResumeUploader(props: Omit<Props, 'kind' | 'label' | 'shape'> & { label?: string }) {
    return <FileUploadField {...props} kind="resume" label={props.label ?? 'Resume (PDF)'} hint="PDF, up to 4 MB. Kept private: resumes are never published." />;
}
