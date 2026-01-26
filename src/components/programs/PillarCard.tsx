import { ProgramPillar } from '../../types/evto';
import { Clock, CheckCircle, HelpCircle } from 'lucide-react';

interface PillarCardProps {
    pillar: ProgramPillar;
    index: number;
}

export default function PillarCard({ pillar, index }: PillarCardProps) {
    return (
        <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full ${index === 0 ? 'border-red-200 shadow-red-50' : 'border-gray-200'}`}>
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${index === 0 ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {index === 0 ? 'Eligibility & Prerequisites' : `Pillar ${index}`}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {pillar.estimatedDuration}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{index === 0 ? pillar.title : pillar.title.replace(/^Pillar \d+ – /, '')}</h3>
                {pillar.themeQuestion && (
                    <p className="text-sm text-gray-600 italic border-l-2 border-primary pl-3 py-1 mb-4">
                        &quot;{pillar.themeQuestion}&quot;
                    </p>
                )}
            </div>

            <div className="space-y-4 flex-grow">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-600" />
                        Key Outcomes
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc marker:text-gray-300">
                        {pillar.keyOutcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-1.5 text-orange-600" />
                        Required Artifacts
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc marker:text-gray-300">
                        {pillar.requiredArtifacts.map((artifact, idx) => (
                            <li key={idx}>{artifact}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
