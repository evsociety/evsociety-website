import { ProgramPillar } from '../../types/evto';
import { Clock, Target, FileText } from 'lucide-react';

interface PillarCardProps {
    pillar: ProgramPillar;
    index: number;
}

export default function PillarCard({ pillar, index }: PillarCardProps) {
    const isEligibility = index === 0;
    return (
        <article className={`flex h-full flex-col rounded-2xl border bg-white p-7 ${isEligibility ? 'border-navy/30 ring-1 ring-navy/10' : 'border-gray-200'}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${isEligibility ? 'bg-navy text-white' : 'bg-primary-50 text-primary'}`}>
                    {isEligibility ? 'Eligibility & Prerequisites' : `Pillar ${index}`}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {pillar.estimatedDuration}
                </span>
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">{isEligibility ? pillar.title : pillar.title.replace(/^Pillar \d+ – /, '')}</h3>
            {pillar.themeQuestion && (
                <p className="mb-5 border-l-2 border-primary py-1 pl-3 text-sm italic text-gray-600">
                    &quot;{pillar.themeQuestion}&quot;
                </p>
            )}

            <div className="flex-grow space-y-5">
                <div>
                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <Target className="h-4 w-4 text-primary" aria-hidden="true" />
                        Key Outcomes
                    </h4>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-gray-600 marker:text-gray-300">
                        {pillar.keyOutcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                        ))}
                    </ul>
                </div>

                <div className="border-t border-gray-100 pt-5">
                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                        Required Artifacts
                    </h4>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-gray-600 marker:text-gray-300">
                        {pillar.requiredArtifacts.map((artifact, idx) => (
                            <li key={idx}>{artifact}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </article>
    );
}
