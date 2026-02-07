'use client';

import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
    onSignOut: () => void;
}

export default function AdminHeader({ onSignOut }: AdminHeaderProps) {
    return (
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white py-16">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="text-sm font-medium text-blue-100 mb-6 uppercase tracking-widest flex items-center justify-between">
                    <span>ADMIN / REGISTRATIONS</span>
                    <button
                        onClick={onSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-semibold"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </nav>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black mb-4 text-white tracking-tight">
                    Admin – Registrations
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-blue-50 leading-relaxed max-w-3xl">
                    View and export registrations by date, type, and role.
                </p>
            </div>
        </div>
    );
}
