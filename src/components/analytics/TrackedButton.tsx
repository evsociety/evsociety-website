'use client';

import { trackEvent } from '@/utils/analytics/ga4';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface TrackedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    eventName: string;
    eventParams?: Record<string, any>;
    children: ReactNode;
}

export default function TrackedButton({
    eventName,
    eventParams,
    onClick,
    children,
    ...props
}: TrackedButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Track the event first
        trackEvent(eventName, eventParams);

        // Then call the original onClick handler if provided
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button onClick={handleClick} {...props}>
            {children}
        </button>
    );
}
