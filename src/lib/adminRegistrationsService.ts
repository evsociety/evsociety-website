/**
 * Admin Registrations Service
 * API calls to Google Apps Script Admin API
 */

import { adminConfig } from '@/config/adminConfig';
import type { AdminFilters, AdminRegistration, AdminApiResponse } from '@/types/admin';
import { getAdminSession } from '@/lib/adminAuth';

/**
 * List registrations with optional filters
 */
export const listRegistrations = async (
    filters?: AdminFilters
): Promise<AdminRegistration[]> => {
    try {
        const session = getAdminSession();

        if (!session) {
            throw new Error('Not authenticated');
        }

        const apiUrl = adminConfig.APPS_SCRIPT_ADMIN_API_URL;

        if (!apiUrl) {
            throw new Error('Admin API URL not configured');
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'listRegistrations',
                filters: filters || {},
                idToken: session.idToken,
            }),
        });

        const data: AdminApiResponse<AdminRegistration[]> = await response.json();

        if (!data.ok) {
            throw new Error(data.error || 'Failed to fetch registrations');
        }

        return data.data || [];

    } catch (error) {
        console.error('[Admin Service] Error listing registrations:', error);
        throw error;
    }
};

/**
 * Export registrations to CSV
 */
export const exportToCSV = (registrations: AdminRegistration[], filename: string): void => {
    try {
        // Define CSV headers
        const headers = [
            'Registration ID',
            'Type',
            'Role',
            'Item Title',
            'Event Date',
            'Event Time',
            'Location',
            'Mode',
            'Full Name',
            'Email',
            'Phone',
            'City',
            'State',
            'Organization',
            'Designation',
            'LinkedIn',
            'Guest Category',
            'Topic/Reason',
            'Invited By',
            'Special Requirements',
            'Skill Area',
            'Interest Level',
            'Participant Type',
            'Experience Level',
            'Session Track',
            'Questions',
            'Registered On',
        ];

        // Build CSV rows
        const rows = registrations.map(reg => [
            reg.registrationId,
            reg.registrationType,
            reg.role,
            reg.itemTitle,
            reg.eventDate || '',
            reg.eventTime || '',
            reg.location || '',
            reg.mode,
            reg.fullName,
            reg.email,
            reg.phone,
            reg.city,
            reg.state,
            reg.organization,
            reg.designation,
            reg.linkedIn || '',
            reg.guestCategory || '',
            reg.topicReason || '',
            reg.invitedBy || '',
            reg.specialRequirements || '',
            reg.skillArea || '',
            reg.interestLevel || '',
            reg.participantType || '',
            reg.experienceLevel || '',
            reg.sessionTrack || '',
            reg.questions || '',
            reg.timestamp,
        ]);


        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('[Admin Service] Export CSV successful:', filename);

    } catch (error) {
        console.error('[Admin Service] Error exporting CSV:', error);
        throw error;
    }
};

/**
 * Generate export filename
 */
export const generateExportFilename = (filters?: AdminFilters): string => {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '').slice(0, 4);

    const itemType = filters?.itemType && filters.itemType !== 'all'
        ? filters.itemType
        : 'All';

    return `EVSociety_Registrations_${itemType}_${date}_${time}.csv`;
};
