import React from 'react';

interface StructuredSkillTableProps {
    title: string;
    columns: string[];
    rows: any[];
    id?: string;
    headingLevel?: 'h2' | 'h3';
    tone?: 'light' | 'dark';
}

// Row fields in display order; each row uses a subset that matches its table's columns
const FIELD_ORDER = ['domain', 'level', 'role', 'technician', 'engineer', 'qualification', 'expert', 'experience'];

const rowValues = (row: Record<string, string | undefined>) =>
    FIELD_ORDER.filter((field) => row[field] !== undefined).map((field) => row[field] as string);

export default function StructuredSkillTable({ title, columns, rows, id, headingLevel: Heading = 'h3', tone = 'light' }: StructuredSkillTableProps) {
    const headingId = id ? `${id}-heading` : undefined;
    const dark = tone === 'dark';

    return (
        <section id={id} aria-labelledby={headingId} className="scroll-mt-36">
            <Heading id={headingId} className={`mb-5 text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</Heading>

            {/* Wide screens: a real table */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white md:block">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-200 bg-surface">
                            {columns.map((col, i) => (
                                <th key={i} scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((row, rowIndex) => {
                            const [first, ...rest] = rowValues(row);
                            return (
                                <tr key={rowIndex} className="align-top">
                                    <th scope="row" className="px-5 py-4 text-sm font-semibold text-gray-900">{first}</th>
                                    {rest.map((value, i) => (
                                        <td key={i} className="px-5 py-4 text-sm leading-relaxed text-gray-600">{value}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Small screens: one card per row, each value labelled with its column */}
            <ul className="space-y-3 md:hidden">
                {rows.map((row, rowIndex) => {
                    const [first, ...rest] = rowValues(row);
                    return (
                        <li key={rowIndex} className="rounded-2xl border border-gray-200 bg-white p-5">
                            <p className="font-semibold text-gray-900">{first}</p>
                            <dl className="mt-3 space-y-2.5">
                                {rest.map((value, i) => (
                                    <div key={i}>
                                        <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{columns[i + 1]}</dt>
                                        <dd className="mt-0.5 text-sm leading-relaxed text-gray-700">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
