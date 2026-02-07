'use client';

import { useState, useEffect } from 'react';
import { isAdminAuthenticated, initGoogleSignIn, renderGoogleSignInButton, signOutAdmin } from '@/lib/adminAuth';
import { listRegistrations, exportToCSV, generateExportFilename } from '@/lib/adminRegistrationsService';
import { trackEvent } from '@/utils/analytics/ga4';
import type { AdminRegistration, AdminFilters } from '@/types/admin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminFiltersBar from '@/components/admin/AdminFiltersBar';
import AdminRegistrationsTable from '@/components/admin/AdminRegistrationsTable';
import AdminAccessDenied from '@/components/admin/AdminAccessDenied';
import { Loader2 } from 'lucide-react';

export default function AdminRegistrationsClient() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState<AdminRegistration[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<AdminFilters>({
        itemType: 'all',
        role: 'all',
        searchTitle: '',
        dateFrom: '',
        dateTo: '',
        mode: 'all',
        city: '',
    });

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAdminAuthenticated();
            setIsAuthenticated(authenticated);
            setIsCheckingAuth(false);

            if (!authenticated) {
                trackEvent('admin_access_denied', {
                    page_path: '/admin/registrations',
                });
            }
        };

        checkAuth();
    }, []);

    // Initialize Google Sign-In after auth check
    useEffect(() => {
        if (!isCheckingAuth && !isAuthenticated) {
            // Load Google Sign-In script
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            script.onload = () => {
                initGoogleSignIn((email, idToken) => {
                    setIsAuthenticated(true);
                    trackEvent('admin_sign_in_success', {
                        admin_email: email,
                    });
                    // Reload to fetch data
                    window.location.reload();
                });

                // Render sign-in button after a short delay
                setTimeout(() => {
                    renderGoogleSignInButton('google-signin-button');
                }, 100);
            };

            return () => {
                document.head.removeChild(script);
            };
        }
    }, [isCheckingAuth, isAuthenticated]);

    // Fetch registrations when authenticated
    useEffect(() => {
        if (isAuthenticated && registrations.length === 0) {
            fetchRegistrations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Fetch registrations from API
    const fetchRegistrations = async (filtersToApply?: AdminFilters) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await listRegistrations(filtersToApply || filters);
            setRegistrations(data);
            setFilteredRegistrations(data);

            trackEvent('admin_registrations_view', {
                total_registrations: data.length,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch registrations';
            setError(errorMessage);
            console.error('Error fetching registrations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (newFilters: AdminFilters) => {
        setFilters(newFilters);
    };

    // Handle apply filters
    const handleApplyFilters = () => {
        fetchRegistrations(filters);
        trackEvent('admin_filter_applied', {
            item_type: filters.itemType,
            role: filters.role,
            mode: filters.mode,
            has_date_filter: !!(filters.dateFrom || filters.dateTo),
        });
    };

    // Handle clear filters
    const handleClearFilters = () => {
        const clearedFilters: AdminFilters = {
            itemType: 'all',
            role: 'all',
            searchTitle: '',
            dateFrom: '',
            dateTo: '',
            mode: 'all',
            city: '',
        };
        setFilters(clearedFilters);
        fetchRegistrations(clearedFilters);
    };

    // Handle export CSV
    const handleExportCSV = () => {
        try {
            const filename = generateExportFilename(filters);
            exportToCSV(filteredRegistrations, filename);

            trackEvent('admin_export_clicked', {
                format: 'csv',
                total_records: filteredRegistrations.length,
                item_type: filters.itemType,
            });
        } catch (err) {
            console.error('Export error:', err);
            alert('Failed to export data');
        }
    };

    // Loading state
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Not authenticated - show access denied
    if (!isAuthenticated) {
        return <AdminAccessDenied />;
    }

    // Authenticated - show admin interface
    return (
        <div className="bg-white min-h-screen">
            <AdminHeader />

            <section className="py-12">
                <div className="container-custom">
                    {/* Filters Bar */}
                    <AdminFiltersBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onApplyFilters={handleApplyFilters}
                        onClearFilters={handleClearFilters}
                        onExportCSV={handleExportCSV}
                        totalRecords={filteredRegistrations.length}
                    />

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-3 text-gray-600">Loading registrations...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mt-6">
                            <p className="font-semibold">Error</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && filteredRegistrations.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-12 rounded-xl mt-6 text-center">
                            <p className="text-lg font-semibold">No registrations found</p>
                            <p className="text-sm mt-2">Try adjusting your filters or check back later.</p>
                        </div>
                    )}

                    {/* Registrations Table */}
                    {!isLoading && !error && filteredRegistrations.length > 0 && (
                        <AdminRegistrationsTable registrations={filteredRegistrations} />
                    )}
                </div>
            </section>
        </div>
    );
}
