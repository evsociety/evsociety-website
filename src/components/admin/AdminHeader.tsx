'use client';

export default function AdminHeader() {
    return (
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white py-16">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="text-sm font-medium text-blue-100 mb-6 uppercase tracking-widest">
                    <span>ADMIN / REGISTRATIONS</span>
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
