'use client';

import { Calendar, MapPin, Users, DollarSign, Mail, Phone } from 'lucide-react';
import type { RegistrationType, RegistrationRole, RegistrationItem, ParticipationMode } from '@/types/registration';

interface RegistrationSummaryCardProps {
    type: RegistrationType;
    role: RegistrationRole;
    item: RegistrationItem | null;
    participationMode: ParticipationMode | '';
}

export default function RegistrationSummaryCard({ type, role, item, participationMode }: RegistrationSummaryCardProps) {
    const getTypeLabel = () => {
        const labels = {
            events: 'Event',
            programs: 'Program',
            projects: 'Project',
            webinars: 'Webinar',
        };
        return labels[type];
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleLabel = () => {
        return role === 'attendee' ? 'Attendee' : 'Guest';
    };

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Registration Summary</h3>

            {item ? (
                <div className="space-y-6">
                    {/* Item Details */}
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            {getTypeLabel()}
                        </div>
                        <div className="text-lg font-bold text-gray-900 leading-tight">{item.title}</div>
                    </div>

                    {/* Date/Time */}
                    {(item.date || item.startDate) && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Date
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                    {formatDate(item.date || item.startDate)}
                                </div>
                                {item.time && (
                                    <div className="text-sm text-gray-500 mt-0.5">{item.time}</div>
                                )}
                                {item.duration && (
                                    <div className="text-sm text-gray-500 mt-0.5">Duration: {item.duration}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {item.location && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Location
                                </div>
                                <div className="text-sm font-bold text-gray-900">{item.location}</div>
                            </div>
                        </div>
                    )}

                    {/* Speaker Information */}
                    {item.speaker && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Speaker
                                </div>
                                <div className="text-sm font-bold text-gray-900">{item.speaker}</div>
                                {item.speakerTitle && (
                                    <div className="text-xs text-gray-600 mt-0.5">{item.speakerTitle}</div>
                                )}
                                {item.speakerOrganization && (
                                    <div className="text-xs text-gray-600 mt-0.5">{item.speakerOrganization}</div>
                                )}
                                {item.speakerInstitution && (
                                    <div className="text-xs text-gray-500 mt-0.5">{item.speakerInstitution}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mode */}
                    {participationMode && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Participation Mode
                                </div>
                                <div className="text-sm font-bold text-gray-900 capitalize">{participationMode}</div>
                            </div>
                        </div>
                    )}

                    {/* Role */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Role
                            </div>
                            <div className="text-sm font-bold text-gray-900">{getRoleLabel()}</div>
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Registration Fee
                            </div>
                            <div className="text-sm font-bold text-green-600">Free</div>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                            Support Contact
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href="mailto:evsociety.org@gmail.com" className="text-gray-600 hover:text-primary">
                                    evsociety.org@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href="tel:+918904528357" className="text-gray-600 hover:text-primary">
                                    +91 8904528357
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Select a {getTypeLabel().toLowerCase()} to see details</p>
                </div>
            )}
        </div>
    );
}
