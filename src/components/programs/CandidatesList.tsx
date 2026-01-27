'use client';

import { useState } from 'react';
import { Candidate, Submission, Status } from '../../types/evto';
import { Search, Filter } from 'lucide-react';
import { STATUS_LABELS } from '../../utils/evtoStatus';
import CandidateTable from './CandidateTable';
import CandidateCard from './CandidateCard';

interface CandidatesListProps {
    candidates: Candidate[];
    submissions: Submission[];
    baseUrl?: string; // e.g., '/programs/evto/candidates' or '/projects/battery-pack-aadhaar-systems/candidates'
}

export default function CandidatesList({ candidates: initialCandidates, submissions, baseUrl = '/programs/evto/candidates' }: CandidatesListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

    // Filter Logic
    const filteredCandidates = initialCandidates.filter(candidate => {
        const matchesSearch =
            candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.designation.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            const submission = submissions.find(s => s.candidateId === candidate.candidateId);
            const status = submission?.overallStatus || 'not-started';
            matchesStatus = status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    // Sort by last updated (descending)
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        const subA = submissions.find(s => s.candidateId === a.candidateId);
        const subB = submissions.find(s => s.candidateId === b.candidateId);
        const dateA = subA?.lastUpdated || '';
        const dateB = subB?.lastUpdated || '';
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
    });

    return (
        <>
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search by name or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center w-full md:w-auto gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <CandidateTable candidates={sortedCandidates} submissions={submissions} baseUrl={baseUrl} />
            <CandidateCard candidates={sortedCandidates} submissions={submissions} baseUrl={baseUrl} />

            {sortedCandidates.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200 border-dashed">
                    <p className="text-gray-500 text-lg">No candidates found matching your criteria.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                        className="mt-4 text-primary hover:text-blue-700 font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </>
    );
}
