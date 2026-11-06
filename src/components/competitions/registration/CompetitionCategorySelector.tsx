'use client';

import { CheckCircle2 } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { FieldError } from './fields';

// Mandatory single choice between the competition's registration options
export default function CompetitionCategorySelector({ competition, value, onChange, error, disabled }: { competition: CompetitionDefinition; value: string; onChange: (id: string) => void; error?: string; disabled?: boolean }) {
    const id = 'field-categories';
    return (
        <fieldset aria-describedby={error ? `${id}-error` : undefined} disabled={disabled}>
            <legend className="text-sm font-medium text-gray-800">Competition category<span className="text-red-700" aria-hidden="true"> *</span></legend>
            <div id={id} className="mt-2 grid gap-3 md:grid-cols-3">
                {competition.registrationOptions.map((option) => {
                    const selected = value === option.id;
                    return (
                        <label key={option.id} className={`relative flex min-h-20 cursor-pointer flex-col justify-center rounded-2xl border p-4 transition-colors motion-reduce:transition-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${selected ? 'border-primary bg-primary-50' : error ? 'border-red-400 bg-white' : 'border-gray-300 bg-white hover:border-gray-400'} ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}>
                            <input type="radio" name="competition-category" value={option.id} checked={selected} onChange={() => onChange(option.id)} className="sr-only" />
                            <span className="pr-7 font-semibold text-gray-900">{option.label}</span>
                            {option.description && <span className="mt-1 pr-7 text-sm text-gray-600">{option.description}</span>}
                            {selected && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-primary" aria-hidden="true" />}
                        </label>
                    );
                })}
            </div>
            <FieldError id={id} message={error} />
        </fieldset>
    );
}
