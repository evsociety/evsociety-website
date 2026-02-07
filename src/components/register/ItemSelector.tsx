'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { RegistrationType, RegistrationItem } from '@/types/registration';

interface ItemSelectorProps {
    type: RegistrationType;
    items: RegistrationItem[];
    selectedItem: RegistrationItem | null;
    onItemSelect: (item: RegistrationItem) => void;
}

export default function ItemSelector({ type, items, selectedItem, onItemSelect }: ItemSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getTypeLabel = () => {
        const labels = {
            events: 'Event',
            programs: 'Program',
            projects: 'Project',
            webinars: 'Webinar',
        };
        return labels[type];
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Select {getTypeLabel()}
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all bg-white text-left flex items-center justify-between"
                >
                    <span className={selectedItem ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                        {selectedItem ? selectedItem.title : `Choose a ${getTypeLabel().toLowerCase()}...`}
                    </span>
                    {isOpen ? <X className="w-4 h-4 text-gray-400" /> : <Search className="w-4 h-4 text-gray-400" />}
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden animate-fade-in">
                        <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {filteredItems.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No {getTypeLabel().toLowerCase()}s found
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            onItemSelect(item);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${selectedItem?.id === item.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                            {(item.date || item.startDate) && (
                                                <span>{formatDate(item.date || item.startDate)}</span>
                                            )}
                                            {item.location && <span>• {item.location}</span>}
                                            {item.duration && <span>• {item.duration}</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.categoryTags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold tracking-wider"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
