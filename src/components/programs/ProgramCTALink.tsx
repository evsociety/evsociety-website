'use client';

import Link from 'next/link';
import { trackEvent } from '@/utils/analytics/ga4';

interface ProgramCTALinkProps {
    href: string;
    ctaId: string;
    page: string;
    section: string;
    children: React.ReactNode;
    className?: string;
}

export default function ProgramCTALink({
    href,
    ctaId,
    page,
    section,
    children,
    className
}: ProgramCTALinkProps) {
    return (
        <Link
            href={href}
            onClick={() => trackEvent('cta_click', {
                cta_id: ctaId,
                page,
                section
            })}
            className={className}
        >
            {children}
        </Link>
    );
}
