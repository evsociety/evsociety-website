'use client';

import { X } from 'lucide-react';
import type { AdminRegistration } from '@/types/admin';
import { useEffect } from 'react';

interface AdminRegistrationDetailModalProps {
    registration: AdminRegistration;
    onClose: () => void;
}

export default function AdminRegistrationDetailModal({
    registration,
    onClose,
}: AdminRegistrationDetailModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const DetailRow = ({ label, value }: { label: string; value?: string }) => {
        if (!value) return null;
        return (
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700 min-w-[160px]">
                    {label}:
                </span>
                <span className="text-sm text-gray-900 break-words">
                    {value}
                </span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary to-blue-700 text-white px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Registration Details</h2>
                        <p className="text-blue-100 text-sm">ID: {registration.registrationId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-8">
                    {/* Registration Summary */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary">
                            Registration Summary
                        </h3>
                        <div className="space-y-0">
                            <DetailRow label="Registration Type" value={registration.registrationType} />
                            <DetailRow label="Item Type" value={registration.itemType} />
                            <DetailRow label="Role" value={registration.role} />
                            <DetailRow label="Item ID" value={registration.itemId} />
                            <DetailRow label="Item Title" value={registration.itemTitle} />
                            <DetailRow label="Event Date" value={registration.eventDate} />
                            <DetailRow label="Event Time" value={registration.eventTime} />
                            <DetailRow label="Location" value={registration.location} />
                            <DetailRow label="Mode" value={registration.mode} />
                            <DetailRow label="Registered On" value={registration.timestamp} />
                        </div>
                    </section>

                    {/* Participant Details */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-primary">
                            Participant Details
                        </h3>
                        <div className="space-y-0">
                            <DetailRow label="Full Name" value={registration.fullName} />
                            <DetailRow label="Email" value={registration.email} />
                            <DetailRow label="Phone" value={registration.phone} />
                            <DetailRow label="City" value={registration.city} />
                            <DetailRow label="State" value={registration.state} />
                            <DetailRow label="Organization" value={registration.organization} />
                            <DetailRow label="Designation" value={registration.designation} />
                            <DetailRow label="LinkedIn" value={registration.linkedIn} />
                        </div>
                    </section>

                    {/* Guest Details (if role is guest) */}
                    {registration.role === 'guest' && (
                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-600">
                                Guest Details
                            </h3>
                            <div className="space-y-0">
                                <DetailRow label="Guest Category" value={registration.guestCategory} />
                                <DetailRow label="Topic/Reason" value={registration.topicReason} />
                                <DetailRow label="Invited By" value={registration.invitedBy} />
                                <DetailRow label="Special Requirements" value={registration.specialRequirements} />
                            </div>
                        </section>
                    )}

                    {/* Project/Program Extras */}
                    {(registration.skillArea || registration.interestLevel || registration.participantType || registration.experienceLevel || registration.questions) && (
                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                                Additional Information
                            </h3>
                            <div className="space-y-0">
                                <DetailRow label="Skill Area" value={registration.skillArea} />
                                <DetailRow label="Interest Level" value={registration.interestLevel} />
                                <DetailRow label="Participant Type" value={registration.participantType} />
                                <DetailRow label="Experience Level" value={registration.experienceLevel} />
                                <DetailRow label="Questions" value={registration.questions} />
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="btn-primary px-6 py-2.5 w-full sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
