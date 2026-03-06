import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface PathwayTimelineProps {
    title: string;
    steps: string[];
}

export default function PathwayTimeline({ title, steps }: PathwayTimelineProps) {
    return (
        <div className="mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-8 px-1 text-center md:text-left">{title}</h3>

            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-2">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center md:flex-1 w-full md:w-auto relative group hover:border-primary hover:shadow-md transition-all">
                            <span className="block text-sm font-bold text-gray-900">{step}</span>
                        </div>

                        {index < steps.length - 1 && (
                            <div className="text-gray-300 md:px-2 flex justify-center">
                                <ArrowRight className="w-5 h-5 hidden md:block" />
                                <ArrowDown className="w-5 h-5 md:hidden" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
