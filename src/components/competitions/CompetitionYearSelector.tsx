'use client';

export default function CompetitionYearSelector({ years, value, onChange, id, label = 'Competition year' }: { years: number[]; value: number; onChange: (year: number) => void; id: string; label?: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="min-h-11 rounded-xl border border-gray-300 bg-white px-3.5 pr-9 text-base font-medium text-gray-900 focus:border-primary"
            >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
}
