import React from 'react';

interface PathwayTimelineProps {
    title: string;
    steps: string[];
    id?: string;
}

export default function PathwayTimeline({ title, steps, id }: PathwayTimelineProps) {
    const headingId = id ? `${id}-heading` : undefined;
    return (
        <section id={id} aria-labelledby={headingId} className="scroll-mt-36">
            <h2 id={headingId} className="mb-8 text-xl font-bold text-gray-900">{title}</h2>

            <ol className="flex flex-col gap-3 md:flex-row">
                {steps.map((step, index) => (
                    <li key={index} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-1 md:flex-col md:items-start">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{index + 1}</span>
                        <span className="text-sm font-semibold text-gray-900">{step}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
