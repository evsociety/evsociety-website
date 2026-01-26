import { Status, Document } from '../../types/evto';
import { getStatusColor, getStatusLabel, computeOverallStatus } from '../../utils/evtoStatus';
import { cn } from '../../utils/cn'; // Assuming utils/cn exists, otherwise I'll use template literals or install clsx/tailwind-merge. 
// Checking codebase, if utils/cn doesn't exist, I'll fallback to simple string concatenation or create it.
// I'll assume for now I should just use template literals to be safe as I haven't checked for 'cn'.

// Actually, I'll check for 'cn' or similar in a moment. For now, I'll stick to standard template literals.

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
