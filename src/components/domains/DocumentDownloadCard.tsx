import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentDownloadCardProps {
    title: string;
    statusLabel: string;
    buttonText: string;
    downloadUrl: string;
}

export default function DocumentDownloadCard({ title, statusLabel, buttonText, downloadUrl }: DocumentDownloadCardProps) {
    const isAvailable = downloadUrl !== '#';
    return (
        // min-w-0 lets the truncated file name shrink inside grid layouts instead of widening the column
        <div className="w-full min-w-0 rounded-2xl border border-gray-200 bg-surface p-7">
            <div className="mb-5 flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-bold">Framework Snapshot</h3>
            </div>
            <div className="mb-5 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary">
                    <FileText className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900" title={title}>
                        {title}
                    </p>
                    <p className="text-sm text-gray-500">{statusLabel}</p>
                </div>
            </div>

            {isAvailable ? (
                <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center rounded-full bg-navy font-semibold text-white transition-colors hover:bg-navy-raised motion-reduce:transition-none"
                >
                    {buttonText}
                    <span className="sr-only"> (opens in a new tab)</span>
                </a>
            ) : (
                <p className="flex min-h-11 w-full items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600">
                    Coming Soon
                </p>
            )}
        </div>
    );
}
