'use client';

import { useEffect, useRef } from 'react';
import type { CompetitionEventParams } from '@/data/analytics/events';
import { trackEvent } from '@/utils/analytics/ga4';

// Sends one view event per page visit (in addition to the site's normal page_view).
// On a full page load this effect can run before the GA4 snippet (loaded afterInteractive) has
// defined gtag, so it waits briefly for it instead of dropping the event. The ref guard keeps
// React's development double-run from counting the visit twice.
export default function TrackView({ event, params }: { event: string; params: CompetitionEventParams }) {
    const sent = useRef(false);
    const key = JSON.stringify(params);
    useEffect(() => {
        if (sent.current) return;
        let tries = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const send = () => {
            if (typeof window.gtag === 'function') {
                sent.current = true;
                trackEvent(event, JSON.parse(key));
            } else if (++tries < 50) {
                timer = setTimeout(send, 100);
            }
        };
        send();
        return () => clearTimeout(timer);
    }, [event, key]);
    return null;
}
