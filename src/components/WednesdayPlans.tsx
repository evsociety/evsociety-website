'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Download, Upload, RotateCcw, Search, Filter, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import wedConfig from '@/data/wednesday-config.json';

// --- Types ---

/* 
QA Checklist:
- Month switching works (Jan–Dec 2026)
- Correct Wednesdays generated
- 1st & 3rd are fixed to “EV Society Member’s Meeting”
- 2nd/4th/5th have dropdown default “Webinar”
- LocalStorage save/restore works
- Export/Import works
- Mobile responsive layout looks like existing cards
*/

type MeetingType = 'EV Society Member’s Meeting' | 'Webinar' | 'Skills Development' | 'EV Workshop Demo' | 'Paper Presentation';
type Status = 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';

interface WednesdayPlan {
    id: string;
    dateIso: string; // YYYY-MM-DD
    dateDisplay: string; // "Wed 7 Jan 2026"
    nthInMonth: number; // 1, 2, 3, 4, 5
    timeSlot: string;
    meetingType: MeetingType;
    customMeetingType?: string; // For "Other" if needed, though reqs specified specific dropdowns.
    title: string;
    description: string;
    status: Status;
    comments: string;
    isFixedType: boolean; // true for 1st & 3rd Wed
}

// --- Constants ---

const YEAR = wedConfig.year;
const MONTHS = wedConfig.months;

const MEETING_TYPES_DROPDOWN: MeetingType[] = wedConfig.meetingTypes as MeetingType[];

const STATUS_OPTS: Status[] = wedConfig.statusOptions as Status[];

const TIME_OPTS = wedConfig.timeSlots;

// --- Helpers ---

const getWednesdaysInMonth = (monthIndex: number): Date[] => {
    const dates: Date[] = [];
    const date = new Date(YEAR, monthIndex, 1);

    // Advance to first Wednesday
    while (date.getDay() !== 3) {
        date.setDate(date.getDate() + 1);
    }

    while (date.getMonth() === monthIndex) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }
    return dates;
};

const generateDefaultPlan = (date: Date, nth: number): WednesdayPlan => {
    const isFixed = nth === 1 || nth === 3;
    let meetingType: MeetingType = 'Webinar';

    if (isFixed) {
        meetingType = wedConfig.fixedMeetingType as MeetingType;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateIso = `${year}-${month}-${day}`;

    return {
        id: dateIso,
        dateIso: dateIso,
        dateDisplay: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        nthInMonth: nth,
        timeSlot: '8:00 PM – 8:30 PM',
        meetingType,
        title: '',
        description: '',
        status: 'Planned',
        comments: '',
        isFixedType: isFixed
    };
};

const getStorageKey = (monthIndex: number) => {
    const m = (monthIndex + 1).toString().padStart(2, '0');
    return `evsociety_wedplan_${YEAR}_${m}`;
};

// --- Component ---

export default function WednesdayPlans() {
    const [selectedMonth, setSelectedMonth] = useState(0); // 0 = Jan
    const [plans, setPlans] = useState<WednesdayPlan[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load & Month Change
    useEffect(() => {
        loadMonthData(selectedMonth);
    }, [selectedMonth]);

    const loadMonthData = (monthIndex: number) => {
        const key = getStorageKey(monthIndex);
        const stored = localStorage.getItem(key);

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Validate if needed, but for now mostly trust local storage
                setPlans(parsed);
                return;
            } catch (e) {
                console.error("Failed to parse stored plans", e);
            }
        }

        // Generate defaults if nothing stored
        const weds = getWednesdaysInMonth(monthIndex);
        const defaults = weds.map((d, i) => generateDefaultPlan(d, i + 1));
        setPlans(defaults);
        // We don't auto-save immediately to avoid overwriting empty storage with defaults if not intended,
        // but requirements say "On page reload, restore...". If nothing stored, showing defaults is correct.
    };

    // Auto-save on every edit
    useEffect(() => {
        if (plans.length > 0) {
            const key = getStorageKey(selectedMonth);
            localStorage.setItem(key, JSON.stringify(plans));
        }
    }, [plans, selectedMonth]);

    const updatePlan = (id: string, updates: Partial<WednesdayPlan>) => {
        setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(plans, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const mName = MONTHS[selectedMonth];
        link.download = `evsociety_wedplan_${YEAR}_${mName}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json) && json.length > 0 && json[0].dateIso) {
                    setPlans(json);
                    alert('Import successful!');
                } else {
                    alert('Invalid JSON format for Wednesday Plans.');
                }
            } catch (err) {
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const handleReset = () => {
        if (confirm(`Are you sure you want to reset data for ${MONTHS[selectedMonth]} ${YEAR}? This cannot be undone.`)) {
            const key = getStorageKey(selectedMonth);
            localStorage.removeItem(key);
            // Reload defaults
            const weds = getWednesdaysInMonth(selectedMonth);
            const defaults = weds.map((d, i) => generateDefaultPlan(d, i + 1));
            setPlans(defaults);
        }
    };

    // Memoize filtered plans
    const filteredPlans = useMemo(() => {
        return plans.filter(p => {
            const matchesSearch =
                p.dateDisplay.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.meetingType.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filterType === 'All' ||
                p.meetingType === filterType ||
                p.status === filterType;

            return matchesSearch && matchesFilter;
        });
    }, [plans, searchQuery, filterType]);

    // Status Badge Color Helper
    const getStatusColor = (s: Status) => {
        switch (s) {
            case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // Planned
        }
    };

    return (
        <section className="py-16 md:py-24 bg-white border-t border-gray-100" id="wednesday-plans">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Wednesday Plans – {YEAR}</h2>
                    <p className="text-gray-600 text-lg">Monthly schedule for member meetings and skill activities</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-6 mb-8">

                    {/* Month Selector - Row 1 */}
                    <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
                        {MONTHS.map((m, idx) => (
                            <button
                                key={m}
                                onClick={() => setSelectedMonth(idx)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap 
                                    ${selectedMonth === idx
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                                    }`}
                            >
                                {m} {YEAR}
                            </button>
                        ))}
                    </div>

                    {/* Actions - Row 2 */}
                    <div className="flex flex-wrap gap-3">
                        <button onClick={handleExport} className="btn-secondary py-2 px-4 gap-2 text-sm h-10 w-full sm:w-auto">
                            <Download className="w-4 h-4" /> Export Month JSON
                        </button>
                        <button onClick={handleImportClick} className="btn-secondary py-2 px-4 gap-2 text-sm h-10 w-full sm:w-auto">
                            <Upload className="w-4 h-4" /> Import Month JSON
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />

                        <button onClick={handleReset} className="btn-secondary py-2 px-4 gap-2 text-sm h-10 text-red-600 hover:bg-red-50 hover:border-red-200 w-full sm:w-auto">
                            <RotateCcw className="w-4 h-4" /> Reset Month
                        </button>
                    </div>
                </div>

                {/* Filters & Search - Middle Row */}
                <div className="bg-surface/50 p-4 rounded-2xl border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search plan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Filter Pills */}
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                            <span className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
                                <Filter className="w-3 h-3 mr-1" /> Filter:
                            </span>
                            {['All', 'Member Meeting', 'Webinar', 'Skills Development', ...STATUS_OPTS].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterType(f)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border
                                    ${filterType === f
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {f === 'EV Society Member’s Meeting' ? 'Member Meeting' : f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid / Cards */}
                {filteredPlans.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No Wednesdays found fitting your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredPlans.map((plan) => (
                            <div key={plan.id} className="card group p-5 md:p-6 hover:shadow-lg transition-all border-l-4 border-l-primary/10 hover:border-l-primary">
                                <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

                                    {/* Left Column: Date & Meta */}
                                    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col bg-surface rounded-xl p-3 text-center border border-gray-100 min-w-[70px]">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">WED</span>
                                                <span className="text-xl font-black text-gray-900">{plan.dateIso.split('-')[2]}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-primary">{plan.dateDisplay.split(' ').slice(2).join(' ')}</div>
                                                <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                    Week {plan.nthInMonth}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Time Slot */}
                                            <div className="relative">
                                                <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <select
                                                    value={plan.timeSlot}
                                                    onChange={(e) => updatePlan(plan.id, { timeSlot: e.target.value })}
                                                    className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none appearance-none cursor-pointer hover:bg-white transition-colors text-gray-700 font-medium"
                                                >
                                                    {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90" />
                                            </div>

                                            {/* Status Badge Dropdown trigger-ish */}
                                            <div className="relative">
                                                <select
                                                    value={plan.status}
                                                    onChange={(e) => updatePlan(plan.id, { status: e.target.value as Status })}
                                                    className={`w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-bold rounded-lg border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-all uppercase tracking-wide ${getStatusColor(plan.status)}`}
                                                >
                                                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <ChevronRight className="h-3 w-3 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Column: Main Content */}
                                    <div className="flex-grow space-y-4">
                                        {/* Meeting Type */}
                                        <div>
                                            {plan.isFixedType ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary text-sm font-bold rounded-lg">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {plan.meetingType}
                                                </div>
                                            ) : (
                                                <div className="relative max-w-sm">
                                                    <select
                                                        value={plan.meetingType}
                                                        onChange={(e) => updatePlan(plan.id, { meetingType: e.target.value as MeetingType })}
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                                                    >
                                                        {MEETING_TYPES_DROPDOWN.map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Title Input */}
                                        <input
                                            type="text"
                                            value={plan.title}
                                            onChange={(e) => updatePlan(plan.id, { title: e.target.value })}
                                            placeholder="Enter Event Title..."
                                            className="w-full text-lg font-bold text-gray-900 placeholder:text-gray-300 border-0 border-b border-transparent hover:border-gray-200 focus:border-primary focus:ring-0 bg-transparent px-0 py-1 transition-all"
                                        />

                                        {/* Description */}
                                        <textarea
                                            value={plan.description}
                                            onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                                            placeholder="Add a short description (2-3 lines)..."
                                            rows={2}
                                            className="w-full text-sm text-gray-600 placeholder:text-gray-300 bg-gray-50/50 border border-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-200 rounded-lg p-3 outline-none resize-none transition-all"
                                        />
                                    </div>

                                    {/* Right Column: Comments & Actions */}
                                    <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1">
                                            Internal Comments
                                        </label>
                                        <div className="relative flex-grow">
                                            <textarea
                                                value={plan.comments}
                                                onChange={(e) => updatePlan(plan.id, { comments: e.target.value })}
                                                className="w-full h-full min-h-[80px] text-xs text-gray-600 bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 outline-none focus:border-yellow-300 focus:bg-yellow-50 transition-all resize-none"
                                                placeholder="Notes about speakers, logistics..."
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
