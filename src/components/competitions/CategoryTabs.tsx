'use client';

import { useRef, type KeyboardEvent } from 'react';

export interface TabItem {
    id: string;
    label: string;
    count?: number;
}

// Accessible tabs (arrow keys move between tabs); the caller renders the panel with
// id `${idPrefix}-panel` and aria-labelledby `${idPrefix}-tab-${value}`
export default function CategoryTabs({ tabs, value, onChange, idPrefix, label }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; idPrefix: string; label: string }) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        let next = index + delta;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next === index || (!delta && e.key !== 'Home' && e.key !== 'End')) return;
        e.preventDefault();
        next = (next + tabs.length) % tabs.length;
        onChange(tabs[next].id);
        refs.current[next]?.focus();
    };
    return (
        <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto rounded-full bg-gray-100 p-1">
            {tabs.map((tab, i) => {
                const selected = tab.id === value;
                return (
                    <button
                        key={tab.id}
                        ref={(el) => { refs.current[i] = el; }}
                        id={`${idPrefix}-tab-${tab.id}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`${idPrefix}-panel`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(tab.id)}
                        onKeyDown={(e) => onKey(e, i)}
                        className={`flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors motion-reduce:transition-none ${selected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {tab.label}
                        {typeof tab.count === 'number' && (
                            <span className={`rounded-full px-1.5 text-xs ${selected ? 'bg-primary-50 text-primary' : 'bg-gray-200 text-gray-600'}`}>{tab.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
