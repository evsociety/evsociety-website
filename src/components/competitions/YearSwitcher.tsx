'use client';

import { useState } from 'react';
import { GA4_EVENTS } from '@/data/analytics/events';
import { trackEvent } from '@/utils/analytics/ga4';

// Switches between year sections rendered on the server (data-year-section="2026"). All years
// are in the HTML, so search engines and visitors without JavaScript still see every result.
export default function YearSwitcher({ years, defaultYear, competitionId, categoryId }: { years: number[]; defaultYear: number; competitionId: string; categoryId: string }) {
    const [year, setYear] = useState(defaultYear);
    const select = (next: number) => {
        setYear(next);
        document.querySelectorAll<HTMLElement>('[data-year-section]').forEach((el) => {
            el.hidden = el.dataset.yearSection !== String(next);
        });
        trackEvent(GA4_EVENTS.COMPETITION_YEAR_SELECT, { competition_id: competitionId, competition_year: next, category: categoryId });
    };
    return (
        <div role="radiogroup" aria-label="Competition year" className="inline-flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-gray-200">
            {years.map((y) => (
                <button
                    key={y}
                    type="button"
                    role="radio"
                    aria-checked={y === year}
                    onClick={() => select(y)}
                    className={`min-h-10 rounded-full px-5 text-sm font-semibold transition-colors motion-reduce:transition-none ${y === year ? 'bg-navy text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    {y}
                </button>
            ))}
        </div>
    );
}
