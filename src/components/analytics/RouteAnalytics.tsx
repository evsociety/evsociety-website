'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/utils/analytics/ga4';

export default function RouteAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const initialLoad = useRef(true);

    useEffect(() => {
        // Skip tracking on initial mount to avoid duplicate with SSR
        if (initialLoad.current) {
            initialLoad.current = false;
            // Track the initial page view
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
            trackPageView(url);
            return;
        }

        // Track subsequent route changes
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        trackPageView(url);
    }, [pathname, searchParams]);

    return null;
}
