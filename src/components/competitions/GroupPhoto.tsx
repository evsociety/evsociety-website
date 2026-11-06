'use client';

import { useRef, type ReactNode } from 'react';
import Image from 'next/image';
import { Expand, X } from 'lucide-react';
import type { PublicImage } from '@/lib/competitions/model';

// An approved event photograph, shown whole: its own aspect ratio, no cropping, no overlays on
// people. Next.js serves resized WebP versions; the lightbox shows the full image.
export default function GroupPhoto({ image, caption, priority = false, sizes = '(min-width: 1200px) 1100px, 100vw', tone = 'light' }: { image: PublicImage; caption?: ReactNode; priority?: boolean; sizes?: string; tone?: 'light' | 'dark' }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const width = image.width ?? 1200;
    const height = image.height ?? 800;
    return (
        <figure>
            <div className={`overflow-hidden rounded-2xl ring-1 ${tone === 'dark' ? 'bg-navy-raised ring-white/15' : 'bg-gray-100 ring-gray-200'}`}>
                <Image
                    src={image.url}
                    alt={image.alt}
                    width={width}
                    height={height}
                    sizes={sizes}
                    priority={priority}
                    quality={85}
                    className="h-auto w-full object-contain"
                />
            </div>
            {/* Controls and caption sit below the photograph, never over the people in it */}
            <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                {caption ? <figcaption className={`text-sm leading-relaxed ${tone === 'dark' ? 'text-slate-300' : 'text-gray-500'}`}>{caption}</figcaption> : <span />}
                <button
                    type="button"
                    onClick={() => dialog.current?.showModal()}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none ${tone === 'dark' ? 'text-white ring-1 ring-white/25 hover:bg-white/10' : 'text-gray-700 ring-1 ring-gray-300 hover:text-primary hover:ring-primary'}`}
                >
                    <Expand className="h-4 w-4" aria-hidden="true" />
                    View full size
                </button>
            </div>
            <dialog
                ref={dialog}
                aria-label={image.alt}
                onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}
                className="m-auto max-h-[94vh] w-[min(96vw,1400px)] max-w-none overflow-hidden rounded-2xl bg-navy p-0 backdrop:bg-navy/85"
            >
                <div className="flex items-center justify-end p-2">
                    <button type="button" onClick={() => dialog.current?.close()} className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Close the photograph">
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="px-2 pb-2">
                    <Image src={image.url} alt={image.alt} width={width} height={height} sizes="96vw" quality={90} className="mx-auto h-auto max-h-[84vh] w-auto max-w-full object-contain" />
                </div>
            </dialog>
        </figure>
    );
}
