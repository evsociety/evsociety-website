'use client';

import { useState } from 'react';
import Image from 'next/image';

const initials = (name: string) => name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Shows a partner's logo inside a positioned container. When the file is missing or fails to
// load, it shows the partner's initials instead of a broken image.
export default function PartnerLogo({ src, name, sizes, className = 'p-2', textClassName = 'text-lg' }: { src?: string; name: string; sizes: string; className?: string; textClassName?: string }) {
    const [failed, setFailed] = useState(!src);

    if (failed || !src) {
        return (
            <span aria-hidden="true" className={`absolute inset-0 grid place-items-center bg-primary-50 font-bold text-primary ${textClassName}`}>
                {initials(name)}
            </span>
        );
    }

    return (
        <Image
            src={src}
            alt={`${name} logo`}
            fill
            sizes={sizes}
            onError={() => setFailed(true)}
            className={`object-contain ${className}`}
        />
    );
}
