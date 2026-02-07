'use client';

import type { RegistrationType } from '@/types/registration';

interface RegistrationTypeSelectorProps {
    selectedType: RegistrationType;
    onTypeChange: (type: RegistrationType) => void;
}

const types: { value: RegistrationType; label: string }[] = [
    { value: 'events', label: 'Events' },
    { value: 'programs', label: 'Programs' },
    { value: 'projects', label: 'Projects' },
    { value: 'webinars', label: 'Webinars' },
];

export default function RegistrationTypeSelector({ selectedType, onTypeChange }: RegistrationTypeSelectorProps) {
    return (
        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:overflow-x-auto pb-2">
            {types.map((type) => (
                <button
                    key={type.value}
                    onClick={() => onTypeChange(type.value)}
                    className={`w-full sm:w-auto px-2 sm:px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex justify-center items-center ${selectedType === type.value
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:text-primary'
                        }`}
                >
                    {type.label}
                </button>
            ))}
        </div>
    );
}
