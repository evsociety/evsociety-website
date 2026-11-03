'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';

const POSTER_ID = 'space-innovation-awards-2026';
const STORAGE_KEY = `poster-seen:${POSTER_ID}`;
const DISPLAY_SECONDS = 5;

const POSTER_CTAS = [
    { id: 'evsociety', label: 'EV Society', href: 'https://www.evsociety.org' },
    { id: 'itelematics', label: 'iTelematics', href: 'https://itelematics.com/' },
    { id: 'gamyaa', label: 'GAMYAA', href: 'https://gamyaa.in/' },
    { id: 'apex_rocket', label: 'APEX Rocket', href: 'https://www.apexrocketsystems.com/' },
];

// Shows the poster once per browser session, then closes itself after DISPLAY_SECONDS.
// The countdown starts once the poster has loaded and pauses while the poster is
// hovered (or tapped on touch screens) or the tab is in the background.
export default function PosterPopup() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isTabHidden, setIsTabHidden] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) return;
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // Storage unavailable (e.g. private mode): show the poster anyway
        }
        setIsOpen(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        dialogRef.current?.showModal();

        const syncVisibility = () => setIsTabHidden(document.hidden);
        syncVisibility();
        document.addEventListener('visibilitychange', syncVisibility);
        return () => document.removeEventListener('visibilitychange', syncVisibility);
    }, [isOpen]);

    if (!isOpen) return null;

    const close = () => setIsOpen(false);

    return (
        <dialog
            ref={dialogRef}
            data-poster-popup
            aria-label="EV Society Space Innovation Awards 2026–27"
            onClose={close}
            onClick={(e) => {
                if (e.target === e.currentTarget) close();
            }}
            className="fixed inset-0 m-0 open:flex h-full max-h-none w-full max-w-none overflow-y-auto border-0 bg-gray-950/80 p-4 backdrop-blur-sm animate-fade-in backdrop:bg-transparent motion-reduce:animate-none"
        >
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                // Panel width follows the portrait poster so poster + buttons fit in one viewport height
                style={{ width: 'min(100%, 600px, calc((100dvh - 2rem - 127px) * 0.7071))' }}
                className="@container relative m-auto min-w-[min(100%,300px)] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10 animate-slide-up motion-reduce:animate-none"
            >
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-gray-900/70 text-white ring-1 ring-white/30 transition-colors hover:bg-gray-900/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>

                <Image
                    src="/posters/space-innovation-awards-2026.webp"
                    alt="EV Society Space Innovation Awards 2026–27: EV Society CAN-7USAT Innovation Award 2026 and EV Society Model Rocketry Innovation Award 2026, each with a cash prize of Rs. 10,000. The winning CAN-7USAT team is invited to a 3-month engineering development program. Final submission and demonstration deadline: 15 February 2027. Industry partners: Gamyaa AeroSystems, iTelematics Software Private Limited and APEX Rocket Systems."
                    width={1654}
                    height={2339}
                    sizes="(max-width: 640px) 100vw, 600px"
                    priority
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                    className="block h-auto w-full bg-gray-100"
                />

                <span
                    aria-hidden="true"
                    onAnimationEnd={close}
                    style={{
                        animationDuration: `${DISPLAY_SECONDS}s`,
                        animationPlayState: !isLoaded || isHovered || isTabHidden ? 'paused' : 'running',
                    }}
                    className="block h-[3px] origin-left bg-primary animate-countdown"
                />

                <div className="grid grid-cols-2 gap-2 p-3 @lg:grid-cols-4">
                    {POSTER_CTAS.map((cta, index) => {
                        const isPrimary = index === 0;
                        const isExternal = !cta.href.includes('evsociety.org');
                        return (
                            <a
                                key={cta.id}
                                href={cta.href}
                                {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
                                onClick={() => trackEvent('cta_click', {
                                    cta_id: `poster_${cta.id}`,
                                    page: '/',
                                    section: 'poster_popup'
                                })}
                                className={`inline-flex min-h-11 items-center justify-center rounded-md px-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isPrimary
                                    ? 'bg-primary text-white hover:bg-primary-hover'
                                    : 'border border-gray-300 bg-white text-gray-800 hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {cta.label}
                                {isExternal && <span className="sr-only"> (opens in a new tab)</span>}
                            </a>
                        );
                    })}
                </div>
            </div>
        </dialog>
    );
}
