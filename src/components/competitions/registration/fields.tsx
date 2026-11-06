'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export function fieldId(path: string) {
    return `field-${path.replace(/[^a-zA-Z0-9]+/g, '-')}`;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {message}
        </p>
    );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'> {
    path: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    hint?: ReactNode;
    optional?: boolean;
}

export function TextField({ path, label, value, onChange, error, hint, optional, required, ...rest }: TextFieldProps) {
    const id = fieldId(path);
    const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
    return (
        <div>
            <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium text-gray-800">
                <span>{label}{required && <span className="text-red-700" aria-hidden="true"> *</span>}</span>
                {optional && <span className="text-xs font-normal text-gray-500">Optional</span>}
            </label>
            {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-gray-500">{hint}</p>}
            <input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className={`mt-1.5 min-h-11 w-full rounded-xl border bg-white px-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary disabled:bg-gray-50 disabled:text-gray-600 ${error ? 'border-red-500' : 'border-gray-300'}`}
                {...rest}
            />
            <FieldError id={id} message={error} />
        </div>
    );
}

export function CheckboxField({ path, checked, onChange, children, error, disabled, description }: { path: string; checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; error?: string; disabled?: boolean; description?: ReactNode }) {
    const id = fieldId(path);
    return (
        <div>
            <div className="flex items-start gap-3">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={[description ? `${id}-desc` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-400 accent-primary"
                />
                <div>
                    <label htmlFor={id} className="text-sm font-medium leading-snug text-gray-800">{children}</label>
                    {description && <p id={`${id}-desc`} className="mt-0.5 text-sm text-gray-500">{description}</p>}
                </div>
            </div>
            <FieldError id={id} message={error} />
        </div>
    );
}

export function SectionCard({ title, description, children, id, aside }: { title: string; description?: ReactNode; children: ReactNode; id?: string; aside?: ReactNode }) {
    return (
        <section aria-labelledby={id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                    <h3 id={id} className="text-lg font-bold">{title}</h3>
                    {description && <div className="mt-1 text-sm leading-relaxed text-gray-600">{description}</div>}
                </div>
                {aside}
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}
