'use client';

import { trackEvent } from '@/utils/analytics/ga4';
import Link from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

interface TrackedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;
    linkId: string;
    eventParams?: Record<string, any>;
    children: ReactNode;
    useNextLink?: boolean;
}

export default function TrackedLink({
    href,
    linkId,
    eventParams,
    onClick,
    children,
    useNextLink = true,
    ...props
}: TrackedLinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Check if a custom event name is provided in eventParams
        const customEventName = eventParams?.cta_id ? 'cta_click' :
            eventParams?.project_id ? 'project_open' :
                eventParams?.candidate_id ? 'candidate_open' : null;

        // Determine link type
        const isExternal = href.startsWith('http') && !href.includes('evsociety.org');
        const isDownload = /\.(pdf|doc|docx|xls|xlsx|zip|txt)$/i.test(href);

        let eventName = customEventName || 'link_click';
        let linkType = 'internal';

        if (!customEventName) {
            if (isDownload) {
                eventName = 'file_download';
                linkType = 'download';
            } else if (isExternal) {
                eventName = 'outbound_click';
                linkType = 'outbound';
            }
        }

        // Extract file extension for downloads
        const fileExt = isDownload ? href.split('.').pop()?.toLowerCase() : undefined;
        const fileName = isDownload ? href.split('/').pop()?.split('?')[0] : undefined;

        // Track the event
        trackEvent(eventName, {
            link_id: linkId,
            link_url: href,
            link_type: linkType,
            ...(fileExt && { file_ext: fileExt }),
            ...(fileName && { file_name: fileName }),
            ...eventParams,
        });

        // Call original onClick handler if provided
        if (onClick) {
            onClick(e);
        }
    };

    // Use Next.js Link for internal links, regular <a> for external
    const isExternal = href.startsWith('http') && !href.includes('evsociety.org');

    if (useNextLink && !isExternal) {
        return (
            <Link href={href} onClick={handleClick} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}
