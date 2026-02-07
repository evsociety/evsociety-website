'use client';

import { Filter, X, Download } from 'lucide-react';
import type { AdminFilters } from '@/types/admin';

interface AdminFiltersBarProps {
    filters: AdminFilters;
    onFilterChange: (filters: AdminFilters) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    onExportCSV: () => void;
    totalRecords: number;
}

export default function AdminFiltersBar({
    filters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    onExportCSV,
    totalRecords,
}: AdminFiltersBarProps) {
    const handleFieldChange = (field: keyof AdminFilters, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <div className="bg-surface rounded-2xl border border-gray-200 p-6 mb-8">
            {/* Filters Title */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                </div>
                <span className="text-sm text-gray-600">
                    <strong>{totalRecords}</strong> registrations found
                </span>
            </div>

            {/* Filter Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Item Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Item Type
                    </label>
                    <select
                        value={filters.itemType || 'all'}
                        onChange={(e) => handleFieldChange('itemType', e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        <option value="all">All</option>
                        <option value="events">Events</option>
                        <option value="programs">Programs</option>
                        <option value="projects">Projects</option>
                        <option value="webinars">Webinars</option>
                    </select>
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Role
                    </label>
                    <select
                        value={filters.role || 'all'}
                        onChange={(e) => handleFieldChange('role', e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        <option value="all">All</option>
                        <option value="attendee">Attendee</option>
                        <option value="guest">Guest</option>
                    </select>
                </div>

                {/* Mode */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mode
                    </label>
                    <select
                        value={filters.mode || 'all'}
                        onChange={(e) => handleFieldChange('mode', e.target.value as any)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        <option value="all">All</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>

                {/* Item Title Search */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Item Title
                    </label>
                    <input
                        type="text"
                        value={filters.searchTitle || ''}
                        onChange={(e) => handleFieldChange('searchTitle', e.target.value)}
                        placeholder="Search by title..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* Date From */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) => handleFieldChange('dateFrom', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* Date To */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={(e) => handleFieldChange('dateTo', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* City Search */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                    </label>
                    <input
                        type="text"
                        value={filters.city || ''}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        placeholder="Search by city..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={onApplyFilters}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" />
                    Apply Filters
                </button>

                <button
                    onClick={onClearFilters}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Clear
                </button>

                <button
                    onClick={onExportCSV}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 ml-auto"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
        </div>
    );
}
