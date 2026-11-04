import React from 'react';

interface AudienceChipsProps {
    heading: string;
    description: string;
    audiences: string[];
}

export default function AudienceChips({ heading, description, audiences }: AudienceChipsProps) {
    return (
        <section className="border-b border-gray-200 bg-white py-12">
            <div className="container-custom grid gap-6 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-5">
                    <h2 className="mb-2 text-xl font-bold text-gray-900">{heading}</h2>
                    <p className="text-gray-600">{description}</p>
                </div>
                <ul className="flex flex-wrap gap-2 lg:col-span-7 lg:justify-end">
                    {audiences.map((audience, index) => (
                        <li
                            key={index}
                            className="rounded-full border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            {audience}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
