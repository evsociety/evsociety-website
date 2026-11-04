'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PillarSubmission } from '../../types/evto';
import DocumentList from './DocumentList';
import { computeProgress } from '../../utils/evtoStatus';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';

export default function PillarAccordion({ pillar }: { pillar: PillarSubmission }) {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();
    const progress = pillar.percentage !== undefined ? pillar.percentage : computeProgress(pillar.documents);
    const isCompleted = progress === 100;
    const isCapstone = pillar.pillarId === 'capstone';
    const isEligibility = pillar.pillarId === 'pillar0';
    const panelId = `pillar-panel-${pillar.pillarId}`;

    return (
        <section id={`pillar-${pillar.pillarId}`} className={`scroll-mt-32 overflow-hidden rounded-2xl border bg-white ${isCompleted ? 'border-green-200' : 'border-gray-200'}`}>
            <h3>
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => {
                        trackEvent('accordion_toggle', {
                            accordion_id: pillar.pillarId,
                            action: isOpen ? 'collapse' : 'expand',
                            page: pathname
                        });
                        setIsOpen(!isOpen);
                    }}
                    className={`flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-surface motion-reduce:transition-none sm:p-5 ${isCapstone ? 'bg-surface' : 'bg-white'}`}
                >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' : isEligibility ? 'bg-navy text-white' : 'bg-primary-50 text-primary'}`}>
                            {isCompleted ? <CheckCircle className="h-5 w-5" role="img" aria-label="Complete" /> : `${progress}%`}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-base font-semibold text-gray-900">
                                {isEligibility ? (
                                    <>
                                        <span>Eligibility & Prerequisites</span>
                                        <span className="ml-2 font-normal text-gray-500">– {pillar.title}</span>
                                    </>
                                ) : pillar.title}
                            </span>
                            {pillar.capstoneTopicSelected && (
                                <span className="mt-1 block truncate text-sm font-medium text-primary">Topic: {pillar.capstoneTopicSelected}</span>
                            )}
                        </span>
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
            </h3>

            {isOpen && (
                <div id={panelId} className="border-t border-gray-100">
                    <DocumentList documents={pillar.documents} />
                </div>
            )}
        </section>
    );
}
