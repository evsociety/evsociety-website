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
}

export default function CandidateTable({ candidates, submissions }: CandidateTableProps) {
    if (!candidates || candidates.length === 0) {
        return <div className="text-center py-12 text-gray-500">No candidates found.</div>;
    }

    return (
        <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Designation
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overall Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                            Progress
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate) => {
                        const submission = submissions.find(s => s.candidateId === candidate.candidateId);
                        const progress = (submission && submission.overallPercentage !== undefined)
                            ? submission.overallPercentage
                            : (submission ? computeProgress(submission.pillars.flatMap(p => p.documents)) : 0);
                        const status = submission?.overallStatus || 'not-started';

                        return (
                            <tr key={candidate.candidateId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                            {candidate.profileImageUrl ? (
                                                <Image
                                                    src={candidate.profileImageUrl}
                                                    alt={candidate.fullName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400 font-semibold text-sm">
                                                    {candidate.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{candidate.fullName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 line-clamp-2" title={candidate.designation}>
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
                                    <Link href={`/programs/evto/candidates/${candidate.candidateId}`} className="text-primary hover:text-blue-700">
                                        View Profile
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
