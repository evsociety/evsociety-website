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
    baseUrl?: string; // e.g., '/programs/evto/candidates' or '/projects/battery-safety-systems/candidates'
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
            <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                    <label htmlFor="candidate-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Search</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            id="candidate-search"
                            type="search"
                            className="block min-h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Search by name or designation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="candidate-status" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                        Status
                    </label>
                    <select
                        id="candidate-status"
                        className="block min-h-11 w-full rounded-xl border border-gray-300 bg-white pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-56"
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

            <p className="mb-3 text-sm text-gray-500" aria-live="polite">
                Showing {sortedCandidates.length} of {initialCandidates.length} candidates
            </p>

            {/* List */}
            {/* The table and cards have their own empty messages, so only render them when there are results */}
            {sortedCandidates.length > 0 && (
                <>
                    <CandidateTable candidates={sortedCandidates} submissions={submissions} baseUrl={baseUrl} />
                    <CandidateCard candidates={sortedCandidates} submissions={submissions} baseUrl={baseUrl} />
                </>
            )}

            {sortedCandidates.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                    <p className="text-lg text-gray-600">No candidates found matching your criteria.</p>
                    <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                        className="mt-4 rounded font-semibold text-primary hover:text-primary-hover"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </>
    );
}
