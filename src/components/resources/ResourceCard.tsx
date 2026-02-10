'use client';

import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Resource } from '@/types';

interface ResourceCardProps {
    resource: Resource;
}

export const ResourceTypePill = ({ type }: { type: string }) => {
    let colorClass = 'bg-gray-100 text-gray-700'; // Default

    switch (type.toLowerCase()) {
        case 'guideline':
            colorClass = 'bg-blue-50 text-blue-700 border-blue-100';
            break;
        case 'whitepaper':
            colorClass = 'bg-purple-50 text-purple-700 border-purple-100';
            break;
        case 'toolkit':
            colorClass = 'bg-orange-50 text-orange-700 border-orange-100';
            break;
        case 'report':
            colorClass = 'bg-green-50 text-green-700 border-green-100';
            break;
    }

    return (
        <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${colorClass}`}>
            {type}
        </span>
    );
};

export const TagChip = ({ label }: { label: string }) => (
    <span className="px-2.5 py-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-[10px] whitespace-nowrap">
        #{label}
    </span>
);

export default function ResourceCard({ resource }: ResourceCardProps) {
    return (
        <div className="group relative flex flex-col h-full bg-white rounded-[16px] border border-slate-900/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
            {/* Card Body */}
            <div className="flex-grow p-5 md:p-6 flex flex-col">
                {/* Top Row: Icon + Type */}
                <div className="flex justify-between items-start mb-4 md:mb-5">
                    <div className="p-2.5 bg-gray-50 rounded-xl text-primary group-hover:bg-primary/5 transition-colors">
                        <FileText className="w-5 h-5" />
                    </div>
                    <ResourceTypePill type={resource.type} />
                </div>

                {/* Title */}
                <h3 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2 md:mb-3 leading-tight line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
                    {resource.title}
                </h3>

                {/* Description */}
                <p className="text-[14px] md:text-[15px] text-gray-600 leading-[1.6] line-clamp-2 md:line-clamp-3 mb-4 md:mb-5 flex-grow">
                    {resource.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {resource.tags.slice(0, 3).map(tag => (
                        <TagChip key={tag} label={tag} />
                    ))}
                    {resource.tags.length > 3 && (
                        <span className="text-[11px] text-gray-400 font-medium py-1">+{resource.tags.length - 3}</span>
                    )}
                </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="p-4 md:p-5 pt-0 mt-auto">
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow flex items-center justify-center gap-2 h-11 px-4 text-[14px] font-bold text-white bg-primary rounded-[12px] hover:bg-primary-dark transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        Download PDF
                        <Download className="w-4 h-4" />
                    </a>

                    <button
                        className="flex items-center justify-center w-11 h-11 text-gray-400 bg-transparent rounded-[12px] hover:bg-gray-50 hover:text-primary transition-colors border border-transparent hover:border-gray-100"
                        title="Preview"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
