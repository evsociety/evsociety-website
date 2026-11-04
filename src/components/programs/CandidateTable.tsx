import Link from 'next/link';
import { Candidate, Submission } from '../../types/evto';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { computeProgress } from '../../utils/evtoStatus';
import { FileText, Linkedin, User } from 'lucide-react';
import Image from 'next/image';

interface CandidateTableProps {
    candidates: Candidate[];
    submissions: Submission[];
    baseUrl?: string; // e.g., '/programs/evto/candidates' or '/projects/battery-safety-systems/candidates'
}

export default function CandidateTable({ candidates, submissions, baseUrl = '/programs/evto/candidates' }: CandidateTableProps) {
    if (!candidates || candidates.length === 0) {
        return <div className="text-center py-12 text-gray-500">No candidates found.</div>;
    }

    return (
        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white md:block">
            <table className="min-w-full divide-y divide-gray-200">
                <caption className="sr-only">Candidates, their status and progress</caption>
                <thead className="bg-surface">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Designation
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Overall Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                            Progress
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Last Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {candidates.map((candidate) => {
                        const submission = submissions.find(s => s.candidateId === candidate.candidateId);
                        const progress = (submission && submission.overallPercentage !== undefined)
                            ? submission.overallPercentage
                            : (submission ? computeProgress(submission.pillars.flatMap(p => p.documents)) : 0);
                        const status = submission?.overallStatus || 'not-started';

                        return (
                            <tr key={candidate.candidateId} className="transition-colors hover:bg-surface motion-reduce:transition-none">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                            {candidate.profileImageUrl ? (
                                                <Image
                                                    src={candidate.profileImageUrl}
                                                    alt=""
                                                    sizes="40px"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div aria-hidden="true" className="h-full w-full flex items-center justify-center bg-primary-50 text-primary font-semibold text-sm">
                                                    {candidate.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{candidate.fullName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 line-clamp-2" title={candidate.designation}>
                                        {candidate.designation}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={status} size="sm" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ProgressBar value={progress} showPercentage={true} className="w-full" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {submission?.lastUpdated || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`${baseUrl}/${candidate.candidateId}`} className="rounded font-semibold text-primary hover:text-primary-hover">
                                        View Profile<span className="sr-only">: {candidate.fullName}</span>
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
