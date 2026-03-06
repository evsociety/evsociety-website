import React from 'react';
import Link from 'next/link';

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
        <section className="py-12 bg-gray-50 border-b border-gray-100">
            <div className="container-custom">
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
                    <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-1.5 rounded-bl-xl font-bold text-xs uppercase tracking-wider hidden">
                        {pill}
                    </div>
                    <div className="grid md:grid-cols-12 gap-0">
                        {/* Left Panel */}
                        <div className="md:col-span-5 bg-gray-900 text-white p-10 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-xs font-semibold border border-blue-800 mb-4">
                                    {pill}
                                </span>
                                <h2 className="text-3xl font-black mb-4 leading-tight text-white">{title}</h2>
                                <p className="text-gray-400 leading-relaxed font-medium">
                                    {description}
                                </p>
                            </div>

                            <Link
                                href={ctaRoute}
                                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors w-full sm:w-fit"
                            >
                                {ctaText}
                            </Link>
                        </div>

                        {/* Right Panel */}
                        <div className="md:col-span-7 p-10 flex flex-col justify-center bg-white">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">{highlightsHeading}</h3>
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                                {highlights.map((item, i) => (
                                    <div key={i} className="flex items-start">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 mr-3" />
                                        <span className="text-gray-600 text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
