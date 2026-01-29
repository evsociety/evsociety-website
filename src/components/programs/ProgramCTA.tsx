'use client';

import Link from 'next/link';
import { trackEvent } from '@/utils/analytics/ga4';

interface ProgramCTAProps {
    href: string;
    ctaId: string;
    page: string;
    section: string;
    children: React.ReactNode;
    className?: string;
}

export default function ProgramCTA({ href, ctaId, page, section, children, className }: ProgramCTAProps) {
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
