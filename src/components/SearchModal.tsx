'use client';

import { useState, useEffect } from 'react';
import { Search, X, ChevronRight, Building2, School, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { searchDirectory } from '@/utils/data';
import { Partner, EVEvent } from '@/types';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ partners: Partner[], events: EVEvent[] }>({ partners: [], events: [] });

    useEffect(() => {
        if (query.length > 1) {
            setResults(searchDirectory(query));
        } else {
            setResults({ partners: [], events: [] });
        }
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

            <div className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="text"
                        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm outline-none"
                        placeholder="Search partners, domains, events..."
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button onClick={onClose} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {(results.partners.length > 0 || results.events.length > 0) ? (
                    <div className="max-h-96 overflow-y-auto p-4">
                        {results.partners.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Partners</h3>
                                <ul className="space-y-2">
                                    {results.partners.map(partner => (
                                        <li key={partner.id}>
                                            <Link href={`/partners/${partner.slug}`} onClick={onClose} className="flex items-center p-2 rounded-lg hover:bg-gray-50 group">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3 text-gray-500">
                                                    {partner.type === 'company' && <Building2 className="w-4 h-4" />}
                                                    {partner.type === 'institute' && <School className="w-4 h-4" />}
                                                    {partner.type === 'researcher' && <UserCircle2 className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{partner.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{partner.shortDescription}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {results.events.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Events</h3>
                                <ul className="space-y-2">
                                    {results.events.map(event => (
                                        <li key={event.id}>
                                            <Link href="/events" onClick={onClose} className="flex items-center p-2 rounded-lg hover:bg-gray-50 group">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : query.length > 1 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        No results found for &ldquo;{query}&rdquo;.
                    </div>
                ) : (
                    <div className="p-10 text-center text-sm text-gray-400">
                        Start typing to search...
                    </div>
                )}

                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 text-xs text-gray-500">
                    <span>Search dynamic directory and pages</span>
                    <span>ESC to close</span>
                </div>
            </div>
        </div>
    );
}
