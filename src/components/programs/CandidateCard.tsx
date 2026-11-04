'use client';

import Link from 'next/link';
import { Candidate, Submission } from '../../types/evto';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { computeProgress } from '../../utils/evtoStatus';
import { FileText, Linkedin, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { trackEvent } from '@/utils/analytics/ga4';

interface CandidateCardProps {
    candidates: Candidate[];
    submissions: Submission[];
    baseUrl?: string; // e.g., '/programs/evto/candidates' or '/projects/battery-safety-systems/candidates'
}

export default function CandidateCard({ candidates, submissions, baseUrl = '/programs/evto/candidates' }: CandidateCardProps) {
    if (!candidates || candidates.length === 0) {
        return <div className="text-center py-8 text-gray-500 md:hidden">No candidates found.</div>;
    }

    return (
        <div className="md:hidden space-y-4">
            {candidates.map((candidate) => {
                const submission = submissions.find(s => s.candidateId === candidate.candidateId);
                const progress = (submission && submission.overallPercentage !== undefined)
                    ? submission.overallPercentage
                    : (submission ? computeProgress(submission.pillars.flatMap(p => p.documents)) : 0);
                const status = submission?.overallStatus || 'not-started';

                return (
                    <article key={candidate.candidateId} className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center mb-4">
                            <div className="h-12 w-12 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                {candidate.profileImageUrl ? (
                                    <Image
                                        src={candidate.profileImageUrl}
                                        alt=""
                                        sizes="48px"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div aria-hidden="true" className="h-full w-full flex items-center justify-center bg-primary-50 text-primary font-semibold">
                                        {candidate.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{candidate.fullName}</h3>
                                <p className="text-xs text-gray-600 line-clamp-2">{candidate.designation}</p>
                            </div>
                            <StatusBadge status={status} size="sm" />
                        </div>

                        <div className="mb-4">
                            <ProgressBar value={progress} label="Progress" showPercentage={true} />
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="flex gap-1">
                                {candidate.resumeUrl && (
                                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-primary" aria-label={`Resume of ${candidate.fullName} (opens in a new tab)`}>
                                        <FileText className="w-5 h-5" />
                                    </a>
                                )}
                                {candidate.linkedinUrl && (
                                    <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-[#0077b5]" aria-label={`LinkedIn profile of ${candidate.fullName} (opens in a new tab)`}>
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                            <Link
                                href={`${baseUrl}/${candidate.candidateId}`}
                                onClick={() => trackEvent('candidate_open', {
                                    candidate_id: candidate.candidateId,
                                    page: baseUrl
                                })}
                                className="inline-flex min-h-10 items-center rounded text-sm font-semibold text-primary hover:text-primary-hover"
                            >
                                View Profile <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" /><span className="sr-only">: {candidate.fullName}</span>
                            </Link>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
