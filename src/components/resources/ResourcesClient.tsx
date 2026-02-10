'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { Resource } from '@/types';
import ResourceCard from './ResourceCard';

// --- Types ---
interface ResourcesClientProps {
    resources: Resource[];
}

type FilterDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    availableTypes: string[];
    availableTags: string[];
};

type FilterState = {
    search: string;
    types: string[];
    tags: string[];
};

// --- Helper Components ---

const FilterSectionHeader = ({ title }: { title: string }) => (
    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
        {title}
    </h4>
);

const SearchInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
            type="text"
            placeholder="Search keywords..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-[12px] text-sm outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-gray-400 font-medium"
        />
    </div>
);

const CheckboxFilter = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center gap-3 cursor-pointer group py-1.5 select-none">
        <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${checked ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary/50'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <span className={`text-[14px] font-medium transition-colors ${checked ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
            {label}
        </span>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    </label>
);

const TagFilterButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-all ${active
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
    >
        {label}
    </button>
);

const FilterDrawer = ({ isOpen, onClose, filters, setFilters, availableTypes, availableTags }: FilterDrawerProps) => {
    // Local copy of filters to avoid applying immediately if desired, but applying live feels snappier.
    // We'll apply directly for simplicity as per requirement "drawer... Include Clear & Apply".
    // Actually, prompt says "Include Clear filters and Apply actions", implies deferred application.
    // Let's implement deferred state for the drawer.

    const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

    // Sync draft when drawer opens
    React.useEffect(() => {
        if (isOpen) setDraftFilters(filters);
    }, [isOpen, filters]);

    if (!isOpen) return null;

    const toggleType = (t: string) => {
        setDraftFilters(prev => ({
            ...prev,
            types: prev.types.includes(t) ? prev.types.filter(x => x !== t) : [...prev.types, t]
        }));
    };

    const toggleTag = (t: string) => {
        setDraftFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(t) ? prev.tags.filter(x => x !== t) : [...prev.tags, t]
        }));
    };

    const handleApply = () => {
        setFilters(draftFilters);
        onClose();
    };

    const handleClear = () => {
        setDraftFilters({ ...draftFilters, types: [], tags: [] });
    };

    return (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">

                {/* Drawer Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-grow overflow-y-auto p-5 space-y-8">
                    {/* Search in Drawer? No, search usually stays on top. But prompt says "Sidebar filters..." */}
                    {/* Let's keep Search in the main view and just put faceted filters in drawer. */}

                    {/* Resource Type */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Resource Type</h4>
                        <div className="space-y-3">
                            {availableTypes.map(type => (
                                <CheckboxFilter
                                    key={type}
                                    label={type}
                                    checked={draftFilters.types.includes(type)}
                                    onChange={() => toggleType(type)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Topics</h4>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <TagFilterButton
                                    key={tag}
                                    label={tag}
                                    active={draftFilters.tags.includes(tag)}
                                    onClick={() => toggleTag(tag)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-5 border-t border-gray-100 bg-white pb-safe">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Client Component ---

export default function ResourcesClient({ resources }: ResourcesClientProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        types: [],
        tags: []
    });

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Derived Data
    const availableTypes = useMemo(() => Array.from(new Set(resources.map(r => r.type))), [resources]);
    const availableTags = useMemo(() => {
        const allTags = resources.flatMap(r => r.tags);
        return Array.from(new Set(allTags));
    }, [resources]);

    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            const matchesSearch = filters.search === '' ||
                r.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                r.summary.toLowerCase().includes(filters.search.toLowerCase());

            const matchesType = filters.types.length === 0 || filters.types.includes(r.type);

            const matchesTags = filters.tags.length === 0 || r.tags.some(t => filters.tags.includes(t));

            return matchesSearch && matchesType && matchesTags;
        });
    }, [resources, filters]);

    // Handle Search Change
    const handleSearchChange = (val: string) => setFilters(prev => ({ ...prev, search: val }));

    // Toggle Filters (Desktop)
    const toggleType = (t: string) => {
        setFilters(prev => ({
            ...prev,
            types: prev.types.includes(t) ? prev.types.filter(x => x !== t) : [...prev.types, t]
        }));
    };

    const toggleTag = (t: string) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(t) ? prev.tags.filter(x => x !== t) : [...prev.tags, t]
        }));
    };

    const clearFilters = () => setFilters({ search: '', types: [], tags: [] });

    return (
        <section className="py-12 md:py-20 lg:py-24 bg-gray-50/50 min-h-screen">
            <div className="container-custom">

                {/* Mobile Header: Search + Filter Toggle */}
                <div className="lg:hidden mb-8 sticky top-20 z-30 bg-white/80 backdrop-blur-md p-4 -mx-4 rounded-[20px] shadow-sm border border-gray-100/50">
                    <div className="flex gap-3">
                        <div className="flex-grow">
                            <SearchInput value={filters.search} onChange={handleSearchChange} />
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-[12px] text-gray-700 shadow-sm relative"
                        >
                            <Filter className="w-5 h-5" />
                            {(filters.types.length > 0 || filters.tags.length > 0) && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border border-white" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1 space-y-10 sticky top-32 h-fit">
                        <div>
                            <FilterSectionHeader title="Search" />
                            <SearchInput value={filters.search} onChange={handleSearchChange} />
                        </div>

                        <div>
                            <FilterSectionHeader title="Resource Type" />
                            <div className="space-y-2">
                                {availableTypes.map(type => (
                                    <CheckboxFilter
                                        key={type}
                                        label={type}
                                        checked={filters.types.includes(type)}
                                        onChange={() => toggleType(type)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <FilterSectionHeader title="Popular Tags" />
                            <div className="flex flex-wrap gap-2">
                                {availableTags.slice(0, 10).map(tag => (
                                    <TagFilterButton
                                        key={tag}
                                        label={tag}
                                        active={filters.tags.includes(tag)}
                                        onClick={() => toggleTag(tag)}
                                    />
                                ))}
                            </div>
                        </div>

                        {(filters.types.length > 0 || filters.tags.length > 0 || filters.search !== '') && (
                            <button
                                onClick={clearFilters}
                                className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" /> Clear filters
                            </button>
                        )}
                    </aside>

                    {/* Main Content Grid */}
                    <div className="lg:col-span-3">
                        {/* Results Count (Desktop) */}
                        <div className="hidden lg:flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-gray-500">
                                Showing {filteredResources.length} resources
                            </span>
                            {/* Sorting could go here */}
                        </div>

                        {filteredResources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                                {filteredResources.map((res) => (
                                    <ResourceCard key={res.id} resource={res} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[24px] border border-dashed border-gray-200">
                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No resources found</h3>
                                <p className="text-gray-500 max-w-xs mb-6">
                                    We couldn&apos;t find any resources matching your current filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-[12px] hover:bg-black transition-all"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* CTA Box */}
                        <div className="mt-16 p-8 md:p-10 bg-gradient-to-br from-blue-50 to-white rounded-[24px] border border-blue-100 text-center shadow-sm">
                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Request Custom Research</h4>
                            <p className="text-sm md:text-base text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                                Can&apos;t find the specific data or insights you need? Our dedicated research wing can help you with tailored reports and analysis.
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-[12px] hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                            >
                                Submit a Request
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <FilterDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                filters={filters}
                setFilters={setFilters}
                availableTypes={availableTypes}
                availableTags={availableTags}
            />
        </section>
    );
}
