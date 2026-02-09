'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Search as SearchIcon, Filter, User, Building2, Clock } from 'lucide-react';
import { EVEvent } from '@/types';

interface EventListProps {
    events: EVEvent[];
}

type Tab = 'Upcoming' | 'Completed';

export default function EventList({ events }: EventListProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return events.filter(event => {
            const eventDate = new Date(event.date);
            // Reset time for accurate date comparison
            eventDate.setHours(0, 0, 0, 0);

            // 1. Tab Filter
            if (activeTab === 'Upcoming' && eventDate < today) return false;
            if (activeTab === 'Completed' && eventDate >= today) return false;

            // 2. Search Filter
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                event.title.toLowerCase().includes(query) ||
                event.summary.toLowerCase().includes(query) ||
                (event.speaker && event.speaker.toLowerCase().includes(query));

            if (!matchesSearch) return false;

            // 3. Category Filter
            if (selectedCategory !== 'All') {
                // Determine category from tags or title/mode
                const isWebinar = event.tags.some(t => t.toLowerCase() === 'webinar') || event.title.toLowerCase().includes('webinar');
                const isWorkshop = event.tags.some(t => t.toLowerCase() === 'workshop') || event.title.toLowerCase().includes('workshop');
                const isSummit = event.tags.some(t => t.toLowerCase() === 'summit') || event.title.toLowerCase().includes('summit');
                const isRoundtable = event.tags.some(t => t.toLowerCase() === 'roundtable') || event.title.toLowerCase().includes('roundtable');

                if (selectedCategory === 'Webinar' && !isWebinar) return false;
                if (selectedCategory === 'Workshop' && !isWorkshop) return false;
                if (selectedCategory === 'Summit' && !isSummit) return false;
                if (selectedCategory === 'Roundtable' && !isRoundtable) return false;
            }

            return true;
        }).sort((a, b) => {
            // Upcoming: Ascending (soonest first)
            // Completed: Descending (most recent first)
            if (activeTab === 'Upcoming') {
                return a.date.localeCompare(b.date);
            }
            return b.date.localeCompare(a.date);
        });

    }, [events, activeTab, searchQuery, selectedCategory]);

    const categories = ['All', 'Roundtable', 'Workshop', 'Summit', 'Webinar'];

    return (
        <>
            <section className="py-12 bg-surface/50 border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-col gap-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 w-full">
                            {(['Upcoming', 'Completed'] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab} Events
                                </button>
                            ))}
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Find an event..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/20'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-24">
                <div className="container-custom">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab.toLowerCase()} events found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="group bg-white border border-gray-100 rounded-3xl p-6 md:p-8 hover:shadow-xl transition-all flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                    {/* Date Badge */}
                                    <div className="w-full lg:w-48 shrink-0">
                                        <div className="bg-surface rounded-2xl p-6 text-center border border-gray-50 group-hover:bg-primary/5 transition-colors">
                                            <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="block text-4xl font-black text-gray-900">
                                                {new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit' })}
                                            </span>
                                            <span className="block text-xs font-bold text-primary mt-2">
                                                {new Date(event.date).getFullYear()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow w-full">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {event.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] uppercase font-bold tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>

                                        <p className="text-gray-600 leading-relaxed max-w-2xl mb-6">
                                            {event.summary}
                                        </p>

                                        {/* Speaker Details */}
                                        {event.speaker && (
                                            <div className="mb-6 p-4 bg-surface/50 rounded-xl border border-gray-100 flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{event.speaker}</div>
                                                    <div className="text-xs text-gray-500 font-medium">
                                                        {event.speakerTitle}
                                                        {event.speakerOrganization && ` • ${event.speakerOrganization}`}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>{event.mode} • {event.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span>{event.time || '10:00 AM IST'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
                                        {activeTab === 'Completed' ? (
                                            <button disabled className="btn-secondary w-full lg:px-8 py-3 rounded-xl whitespace-nowrap opacity-50 cursor-not-allowed">
                                                Event Completed
                                            </button>
                                        ) : (
                                            <a href={event.registrationUrl} className="btn-primary w-full lg:px-8 py-3 rounded-xl whitespace-nowrap">
                                                Register Details
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
