import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentDownloadCardProps {
    title: string;
    statusLabel: string;
    buttonText: string;
    downloadUrl: string;
}

export default function DocumentDownloadCard({ title, statusLabel, buttonText, downloadUrl }: DocumentDownloadCardProps) {
    return (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 w-full">
            <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-xl font-bold">Framework Snapshot</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mr-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate" title={title}>
                            {title}
                        </p>
                        <p className="text-sm text-gray-500">{statusLabel}</p>
                    </div>
                </div>
            </div>

            <a
                href={downloadUrl}
                target={downloadUrl !== '#' ? "_blank" : undefined}
                rel={downloadUrl !== '#' ? "noopener noreferrer" : undefined}
                className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors ${downloadUrl === '#'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
            >
                {downloadUrl === '#' ? 'Coming Soon' : buttonText}
            </a>
        </div>
    );
}
