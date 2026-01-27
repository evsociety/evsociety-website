'use client';

import { useState } from 'react';
import { PillarSubmission } from '../../types/evto';
import DocumentList from './DocumentList';
import { computeProgress } from '../../utils/evtoStatus';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

export default function PillarAccordion({ pillar }: { pillar: PillarSubmission }) {
    const [isOpen, setIsOpen] = useState(true);
    const progress = pillar.percentage !== undefined ? pillar.percentage : computeProgress(pillar.documents);
    const isCompleted = progress === 100;
    const isCapstone = pillar.pillarId === 'capstone';

    return (
        <div className={`bg-white border rounded-lg transition-all ${isCompleted ? 'border-green-200' : 'border-gray-200'} shadow-sm overflow-hidden`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 ${isCapstone ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition-colors text-left focus:outline-none`}
            >
                <div className="flex items-center flex-1 min-w-0 mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isCompleted ? 'bg-green-100 text-green-600' :
                        pillar.pillarId === 'pillar0' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : (
                            <span className="text-xs font-bold">{progress}%</span>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className={`text-base font-semibold truncate ${isCapstone ? 'text-purple-900' :
                            pillar.pillarId === 'pillar0' ? (isCompleted ? 'text-green-700' : 'text-red-700') : 'text-gray-900'
                            }`}>
                            {pillar.pillarId === 'pillar0' ? (
                                <>
                                    <span>Eligibility & Prerequisites</span>
                                    <span className="text-gray-500 font-normal ml-2">– {pillar.title}</span>
                                </>
                            ) : pillar.title}
                        </h3>
                        {pillar.capstoneTopicSelected && (
                            <p className="text-sm font-medium text-purple-600 truncate mt-1">Topic: {pillar.capstoneTopicSelected}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
            </button >

            {isOpen && (
                <div className="border-t border-gray-100">
                    <DocumentList documents={pillar.documents} />
                </div>
            )
            }
        </div >
    );
}
