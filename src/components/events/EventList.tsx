'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Search as SearchIcon, Filter, User, Building2, Clock } from 'lucide-react';
import { EVEvent } from '@/types';

interface EventListProps {
    events: EVEvent[];
}

type Tab = 'Upcoming' | 'Completed' | 'Speakers';

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
            if (activeTab === 'Speakers') return false; // Speakers handled separately
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

    // Group active webinars with speakers for the Speakers tab
    const speakerGroups = useMemo(() => {
        if (activeTab !== 'Speakers') return [];

        const webinarEvents = events.filter(e =>
            e.speaker && (e.tags.some(t => t.toLowerCase() === 'webinar') || e.title.toLowerCase().includes('webinar'))
        );

        const groups: Record<string, {
            speaker: string;
            speakerTitle?: string;
            speakerOrganization?: string;
            speakerInstitution?: string;
            webinars: EVEvent[];
        }> = {};

        webinarEvents.forEach(event => {
            const speakerName = event.speaker!;
            if (!groups[speakerName]) {
                const rawObj = (require('@/data/registrations.json').webinars || []).find((w: any) => w.speaker === speakerName);

                groups[speakerName] = {
                    speaker: speakerName,
                    speakerTitle: event.speakerTitle,
                    speakerOrganization: event.speakerOrganization,
                    speakerInstitution: rawObj?.speakerInstitution, // Fetch from raw JSON if needed
                    webinars: []
                };
            }
            groups[speakerName].webinars.push(event);
        });

        // Sort speakers alphabetically
        const sortedSpeakerKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));

        // Return sorted arrays of speaker groups, sorting their events by date ascending
        return sortedSpeakerKeys.map(key => {
            const group = groups[key];
            group.webinars.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return group;
        });
    }, [events, activeTab]);

    const categories = ['All', 'Roundtable', 'Workshop', 'Summit', 'Webinar'];

    return (
        <>
            <section className="py-12 bg-surface/50 border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-col gap-6">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 w-full">
                            {(['Upcoming', 'Completed', 'Speakers'] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'Speakers' ? 'Speakers' : `${tab} Events`}
                                </button>
                            ))}
                        </div>

                        {/* Search & Filter - Hide on Speakers Tab */}
                        {activeTab !== 'Speakers' && (
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
                        )}
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-24">
                <div className="container-custom">
                    {activeTab === 'Speakers' ? (
                        speakerGroups.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No speakers found</h3>
                                <p className="text-gray-500">There are no speakers registered yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {speakerGroups.map(group => (
                                    <div key={group.speaker} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="bg-surface/50 p-6 md:p-8 border-b border-gray-100 flex items-start gap-5">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <User className="w-8 h-8 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{group.speaker}</h2>
                                                {(group.speakerTitle || group.speakerOrganization || group.speakerInstitution) && (
                                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                        {group.speakerTitle && <div className="font-medium text-gray-900">{group.speakerTitle}</div>}
                                                        {group.speakerOrganization && <div>{group.speakerOrganization}</div>}
                                                        {group.speakerInstitution && <div>{group.speakerInstitution}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8 space-y-6 bg-white">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Sessions by {group.speaker}</h3>
                                            {group.webinars.map(event => (
                                                <div key={event.id} className="group relative border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                                                    <div className="flex-grow">
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {event.tags.map(tag => (
                                                                <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] uppercase font-bold tracking-wider">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                                            {event.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-2xl">
                                                            {event.summary}
                                                        </p>
                                                        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {event.time || 'TBA'}</div>
                                                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {event.mode} • {event.city}</div>
                                                        </div>
                                                    </div>

                                                    {/* Right Side: Actions */}
                                                    <div className="w-full md:w-56 shrink-0 flex flex-col gap-3">
                                                        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 items-end">
                                                            {event.posterLinkURL && (
                                                                <a href={event.posterLinkURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-center py-2 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors w-full md:w-40 border border-blue-100">
                                                                    Webinar Poster
                                                                </a>
                                                            )}
                                                            {event.youtubeURL && (
                                                                <a href={event.youtubeURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-center py-2 px-4 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors w-full md:w-40 border border-red-100">
                                                                    YouTube
                                                                </a>
                                                            )}
                                                            {event.presentationURL && (
                                                                <a href={event.presentationURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-center py-2 px-4 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors w-full md:w-40 border border-green-100">
                                                                    Presentation
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : filteredEvents.length === 0 ? (
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
                                    <div className="w-full lg:w-48 shrink-0 flex flex-col gap-4">
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
                                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>{event.mode} • {event.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span>{event.time || '10:00 AM IST'}</span>
                                            </div>
                                            {(event.posterLinkURL || event.youtubeURL || event.presentationURL) && (
                                                <div className="flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
                                                    {event.posterLinkURL && (
                                                        <a href={event.posterLinkURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors">
                                                            Webinar Poster
                                                        </a>
                                                    )}
                                                    {event.youtubeURL && (
                                                        <a href={event.youtubeURL} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 hover:underline font-bold transition-colors">
                                                            YouTube
                                                        </a>
                                                    )}
                                                    {event.presentationURL && (
                                                        <a href={event.presentationURL} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 hover:underline font-bold transition-colors">
                                                            Presentation
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Action Button */}
                                    <div className="w-full lg:w-64 shrink-0 mt-4 lg:mt-0 flex flex-col gap-4">
                                        {activeTab === 'Completed' ? (
                                            <button disabled className="btn-secondary w-full px-8 py-3 rounded-xl whitespace-nowrap opacity-50 cursor-not-allowed">
                                                Event Completed
                                            </button>
                                        ) : (
                                            <a href={event.registrationUrl} className="btn-primary w-full px-8 py-3 rounded-xl text-center whitespace-nowrap">
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
