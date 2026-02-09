'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import type { AdminRegistration } from '@/types/admin';
import AdminRegistrationDetailModal from './AdminRegistrationDetailModal';
import { trackEvent } from '@/utils/analytics/ga4';

interface AdminRegistrationsTableProps {
    registrations: AdminRegistration[];
}

export default function AdminRegistrationsTable({ registrations }: AdminRegistrationsTableProps) {
    const [selectedRegistration, setSelectedRegistration] = useState<AdminRegistration | null>(null);

    const handleViewDetails = (registration: AdminRegistration) => {
        setSelectedRegistration(registration);
        trackEvent('admin_row_view_opened', {
            registration_id: registration.registrationId,
            item_type: registration.itemType,
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return timestamp;
        }
    };

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden mt-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>

                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Item Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    City
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Organization
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Mode
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Registered On
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Reg ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {registrations.map((registration, index) => (
                                <tr
                                    key={registration.registrationId || index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                            {registration.itemType || registration.registrationType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                        {registration.itemTitle}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${registration.role === 'guest'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {registration.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {registration.fullName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {registration.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {registration.phone}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {registration.city}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                        {registration.organization}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                            {registration.mode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {formatTimestamp(registration.timestamp)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                        {registration.registrationId?.slice(0, 8)}...
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                                        <button
                                            onClick={() => handleViewDetails(registration)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-semibold"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 mt-8">
                {registrations.map((registration, index) => (
                    <div
                        key={registration.registrationId || index}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">
                                    {registration.fullName}
                                </h3>
                                <p className="text-xs text-gray-600">{registration.email}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${registration.role === 'guest'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {registration.role}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Item:</span>
                                <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate">
                                    {registration.itemTitle}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Type:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                    {registration.itemType || registration.registrationType}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">City:</span>
                                <span className="font-semibold text-gray-900">{registration.city}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Mode:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                    {registration.mode}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleViewDetails(registration)}
                            className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            View Full Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedRegistration && (
                <AdminRegistrationDetailModal
                    registration={selectedRegistration}
                    onClose={() => setSelectedRegistration(null)}
                />
            )}
        </>
    );
}
