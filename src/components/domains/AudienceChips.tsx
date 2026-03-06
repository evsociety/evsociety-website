import React from 'react';

interface AudienceChipsProps {
    heading: string;
    description: string;
    audiences: string[];
}

export default function AudienceChips({ heading, description, audiences }: AudienceChipsProps) {
    return (
        <section className="py-12 border-b border-gray-100 bg-white">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                    <div className="max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{heading}</h2>
                        <p className="text-gray-600">{description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end flex-1">
                        {audiences.map((audience, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors cursor-default"
                            >
                                {audience}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
