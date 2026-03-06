import React from 'react';

interface StructuredSkillTableProps {
    title: string;
    columns: string[];
    rows: any[];
}

export default function StructuredSkillTable({ title, columns, rows }: StructuredSkillTableProps) {
    return (
        <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6 px-1">{title}</h3>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {columns.map((col, i) => (
                                    <th key={i} className="py-4 px-6 text-sm font-bold text-gray-700 whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                                        {row.domain || row.level}
                                    </td>
                                    {row.role && (
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {row.role}
                                        </td>
                                    )}
                                    {row.technician && (
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {row.technician}
                                        </td>
                                    )}
                                    {row.engineer !== undefined && (
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {row.engineer}
                                        </td>
                                    )}
                                    {row.qualification !== undefined && (
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {row.qualification}
                                        </td>
                                    )}
                                    {row.expert !== undefined && (
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {row.expert}
                                        </td>
                                    )}
                                    {row.experience !== undefined && (
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {row.experience}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
