import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeatureHighlightCardProps {
    pill: string;
    title: string;
    description: string;
    highlightsHeading: string;
    highlights: string[];
    ctaText: string;
    ctaRoute: string;
}

export default function FeatureHighlightCard({
    pill,
    title,
    description,
    highlightsHeading,
    highlights,
    ctaText,
    ctaRoute
}: FeatureHighlightCardProps) {
    return (
        <section className="bg-surface py-16 lg:py-20">
            <div className="container-custom">
                <div className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:grid-cols-12">
                    {/* Left Panel */}
                    <div className="flex flex-col justify-center bg-navy p-8 text-white sm:p-10 md:col-span-5">
                        <span className="mb-4 inline-block w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-primary-300">
                            {pill}
                        </span>
                        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white">{title}</h2>
                        <p className="mb-8 leading-relaxed text-slate-300">
                            {description}
                        </p>
                        <Link
                            href={ctaRoute}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-primary-50 sm:w-fit motion-reduce:transition-none"
                        >
                            {ctaText}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>

                    {/* Right Panel */}
                    <div className="flex flex-col justify-center p-8 sm:p-10 md:col-span-7">
                        <h3 className="mb-6 text-xl font-bold text-gray-900">{highlightsHeading}</h3>
                        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                            {highlights.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 border-b border-gray-100 pb-4">
                                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span className="font-medium text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
