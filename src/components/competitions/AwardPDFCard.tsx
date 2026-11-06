'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Download, Eye, FileText, FileX2, X } from 'lucide-react';
import type { PublicAward } from '@/lib/competitions/model';

const STATUS_STYLE: Record<PublicAward['status'], string> = {
    Proposed: 'bg-primary-50 text-primary ring-primary-200',
    Confirmed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    Awarded: 'bg-amber-50 text-amber-900 ring-amber-300',
};

// An award document card. Actions appear only for a document the administrator published;
// otherwise the card says the document is not available yet, with no broken link.
export default function AwardPDFCard({ award, categoryLabel }: { award: PublicAward; categoryLabel: string }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const doc = award.document;
    const openViewer = (e: React.MouseEvent) => {
        // Phones open the PDF in their own viewer; larger screens get the embedded viewer
        if (!dialog.current || !window.matchMedia('(min-width: 768px)').matches) return;
        e.preventDefault();
        dialog.current.showModal();
    };
    const titleId = `award-${award.awardId}`;
    return (
        <article aria-labelledby={titleId} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-off-white">
                {award.thumbnailUrl ? (
                    <Image src={award.thumbnailUrl} alt={`First page of ${award.title}`} fill unoptimized className="object-contain p-4" />
                ) : (
                    <div aria-hidden="true" className="absolute inset-0 grid place-items-center p-6">
                        <div className={`flex aspect-[3/4] h-full max-h-56 flex-col rounded-lg bg-white p-5 shadow-md ring-1 ring-gray-200 ${doc ? '' : 'opacity-60'}`}>
                            {doc ? <FileText className="h-7 w-7 text-primary" /> : <FileX2 className="h-7 w-7 text-gray-400" />}
                            <span className="mt-4 h-2 w-4/5 rounded bg-gray-200" />
                            <span className="mt-2 h-2 w-3/5 rounded bg-gray-200" />
                            <span className="mt-6 h-1.5 w-full rounded bg-gray-100" />
                            <span className="mt-1.5 h-1.5 w-full rounded bg-gray-100" />
                            <span className="mt-1.5 h-1.5 w-2/3 rounded bg-gray-100" />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{categoryLabel}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLE[award.status]}`}>{award.status}</span>
                </div>
                <h3 id={titleId} className="mt-4 text-xl font-bold leading-snug">{award.title}</h3>
                {doc ? (
                    <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                        <a href={doc.viewUrl} target="_blank" rel="noopener noreferrer" onClick={openViewer} className="btn-primary min-h-11 flex-1">
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            View PDF
                            <span className="sr-only">: {award.title}</span>
                        </a>
                        <a href={doc.downloadUrl} {...(doc.kind === 'site' ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' })} className="btn-secondary min-h-11 flex-1">
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Download PDF
                            <span className="sr-only">: {award.title}</span>
                        </a>
                    </div>
                ) : (
                    <p className="mt-auto flex items-start gap-2 pt-6 text-sm text-gray-600">
                        <FileX2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                        The award document has not been published yet. It will appear here once EV Society releases it.
                    </p>
                )}
            </div>
            {doc && (
                <dialog ref={dialog} aria-labelledby={`${titleId}-viewer`} className="m-auto h-[90vh] w-[min(64rem,94vw)] max-w-none rounded-2xl p-0 shadow-2xl backdrop:bg-navy/70">
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
                            <p id={`${titleId}-viewer`} className="truncate font-semibold text-gray-900">{award.title}</p>
                            <div className="flex items-center gap-2">
                                <a href={doc.viewUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-50">Open in new tab</a>
                                <button type="button" onClick={() => dialog.current?.close()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-gray-100" aria-label="Close document viewer">
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        <iframe src={doc.viewUrl} title={award.title} className="w-full flex-1" loading="lazy" />
                    </div>
                </dialog>
            )}
        </article>
    );
}
