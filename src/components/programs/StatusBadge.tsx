import { Status, Document } from '../../types/evto';
import { getStatusColor, getStatusLabel, computeOverallStatus } from '../../utils/evtoStatus';

interface StatusBadgeProps {
    status?: Status;
    documents?: Document[]; // If provided, computes status from docs
    className?: string; // Allow custom classes
    size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, documents, className = '', size = 'md' }: StatusBadgeProps) {
    const finalStatus = status || (documents ? computeOverallStatus(documents) : 'not-started');
    const colorClass = getStatusColor(finalStatus);
    const label = getStatusLabel(finalStatus);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1 font-semibold'
    };

    return (
        <span className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClasses[size]} ${className}`}>
            {label}
        </span>
    );
}
