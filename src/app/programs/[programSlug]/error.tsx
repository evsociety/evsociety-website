'use client';

import Link from 'next/link';
import { CloudOff } from 'lucide-react';

// Shown when competition data cannot be loaded and no earlier copy is available
export default function CompetitionError({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="container-custom py-20">
            <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-off-white text-primary ring-1 ring-gray-200">
                    <CloudOff className="h-6 w-6" aria-hidden="true" />
                </span>
                <h1 className="mt-5 text-2xl font-bold">Team profiles are temporarily unavailable</h1>
                <p className="mt-3 leading-relaxed text-gray-600">We could not load the latest approved information. Please try again in a few minutes.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button type="button" onClick={reset} className="btn-primary min-h-11">Try again</button>
                    <Link href="/programs" className="btn-secondary min-h-11">All programs</Link>
                </div>
            </div>
        </div>
    );
}
