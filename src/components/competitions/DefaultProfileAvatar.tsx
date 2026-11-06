// Placeholder for people without an approved photograph: their initials on a quiet
// orbit-line pattern. Never a generated face, so it cannot be mistaken for the real person.

const SIZES = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-lg',
    lg: 'h-24 w-24 text-2xl',
    xl: 'h-32 w-32 text-3xl',
} as const;

export function initialsOf(name: string): string {
    const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
    return (first + last).toUpperCase();
}

export default function DefaultProfileAvatar({ name, size = 'md', shape = 'circle' }: { name: string; size?: keyof typeof SIZES; shape?: 'circle' | 'rounded' }) {
    return (
        <span
            role="img"
            aria-label={`${name} (no photograph)`}
            className={`relative inline-grid shrink-0 place-items-center overflow-hidden bg-navy font-semibold tracking-wide text-primary-300 ${SIZES[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}
        >
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-white/10" fill="none" stroke="currentColor" strokeWidth="1">
                <ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(-24 50 50)" />
                <ellipse cx="50" cy="50" rx="34" ry="12" transform="rotate(-24 50 50)" />
                <circle cx="88" cy="32" r="2.2" fill="currentColor" stroke="none" />
            </svg>
            <span aria-hidden="true" className="relative">{initialsOf(name)}</span>
        </span>
    );
}
