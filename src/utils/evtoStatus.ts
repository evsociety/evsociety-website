import { Document, Status } from '../types/evto';

export const STATUS_LABELS: Record<Status, string> = {
    'not-started': 'Not Started',
    'draft': 'Draft',
    'submitted': 'Submitted',
    'in-review': 'In Review',
    'waiting-for-input': 'Waiting for Input',
    'need-more-details': 'Need More Details',
    'rejected': 'Rejected',
    'approved': 'Approved',
    'certificate-approved': 'Certificate Approved',
};

// Map statuses to Tailwind color classes (bg and text)
export const STATUS_COLORS: Record<Status, string> = {
    'not-started': 'bg-gray-100 text-gray-600',
    'draft': 'bg-gray-100 text-gray-700 dashed border border-gray-300',
    'submitted': 'bg-blue-50 text-blue-700 border border-blue-100',
    'in-review': 'bg-yellow-50 text-yellow-700 border border-yellow-100',
    'waiting-for-input': 'bg-orange-50 text-orange-700 border border-orange-100',
    'need-more-details': 'bg-orange-100 text-orange-800 border border-orange-200',
    'rejected': 'bg-red-50 text-red-700 border border-red-100',
    'approved': 'bg-green-50 text-green-700 border border-green-100',
    'certificate-approved': 'bg-purple-50 text-purple-700 border border-purple-100 font-medium',
};

export function getStatusLabel(status: Status): string {
    return STATUS_LABELS[status] || status;
}

export function getStatusColor(status: Status): string {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
}

/**
 * Calculates progress based on approved required documents.
 * progress = (approvedRequiredDocs / totalRequiredDocs) * 100
 */
export function computeProgress(documents: Document[]): number {
    if (!documents || documents.length === 0) return 0;

    const requiredDocs = documents.filter(doc => doc.required);
    if (requiredDocs.length === 0) return 0; // Avoid division by zero if no required docs

    const approvedCount = requiredDocs.filter(doc =>
        doc.status === 'approved' || doc.status === 'certificate-approved'
    ).length;

    return Math.round((approvedCount / requiredDocs.length) * 100);
}

/**
 * Computes overall status based on document statuses if not explicitly set.
 * Logic:
 * - if any rejected => rejected
 * - else if all required approved => certificate-approved (assuming certificateIssued would be handled elsewhere, but purely based on doc status logic)
 * - else if any need-more-details => need-more-details
 * - else if any waiting-for-input => waiting-for-input
 * - else if any in-review => in-review
 * - else if any submitted => submitted
 * - else if any draft => draft
 * - else => not-started
 */
export function computeOverallStatus(documents: Document[]): Status {
    if (!documents || documents.length === 0) return 'not-started';

    const hasStatus = (s: Status) => documents.some(d => d.status === s);
    const requiredDocs = documents.filter(d => d.required);
    const allRequiredApproved = requiredDocs.length > 0 && requiredDocs.every(d => d.status === 'approved' || d.status === 'certificate-approved');

    if (hasStatus('rejected')) return 'rejected';
    if (allRequiredApproved) return 'certificate-approved'; // Approximation
    if (hasStatus('need-more-details')) return 'need-more-details';
    if (hasStatus('waiting-for-input')) return 'waiting-for-input';
    if (hasStatus('in-review')) return 'in-review';
    if (hasStatus('submitted')) return 'submitted';
    if (hasStatus('draft')) return 'draft';

    return 'not-started';
}
