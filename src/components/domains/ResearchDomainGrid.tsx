'use client';

import Link from 'next/link';
import { ArrowUpRight, Drone, Plane, Satellite, Shield } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';
import { RESEARCH_DOMAINS } from '@/data/domains/researchDomains';

const domainIcons = {
    ev: Drone,
    aerospace: Plane,
    defence: Shield,
    space: Satellite,
};

const tones = {
    dark: {
        tile: 'bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-primary-300/50 focus-visible:ring-2 focus-visible:ring-primary-300',
        pill: 'bg-white/10 text-primary-300 ring-1 ring-white/15',
        badge: 'bg-primary-300/10 text-primary-300 ring-1 ring-primary-300/25',
        name: 'text-white',
        arrow: 'bg-white/5 text-primary-300 ring-1 ring-white/10 group-hover:bg-primary-300 group-hover:text-navy group-focus-visible:bg-primary-300 group-focus-visible:text-navy',
    },
    light: {
        tile: 'bg-white ring-1 ring-gray-200 shadow-sm hover:ring-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary',
        pill: 'bg-primary-50 text-primary ring-1 ring-primary-100',
        badge: 'bg-primary-50 text-primary ring-1 ring-primary-100',
        name: 'text-gray-900',
        arrow: 'bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white group-focus-visible:bg-primary group-focus-visible:text-white',
    },
};

// The four umbrella research domains as full-width button rows. A domain with a tag (eVTOL)
// shows it as a label pill; a domain whose page is still a placeholder shows a "Coming soon" pill.
// columns={1} stacks one button per row; columns={4} lays them out four across on wide screens.
export default function ResearchDomainGrid({ tone, columns, analyticsSection }: { tone: 'dark' | 'light'; columns: 1 | 4; analyticsSection: string }) {
    const t = tones[tone];
    return (
        <ul className={`grid grid-cols-1 gap-3 ${columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4 lg:gap-4' : ''}`}>
            {RESEARCH_DOMAINS.map((domain) => {
                const Icon = domainIcons[domain.id];
                return (
                    <li key={domain.id} className="flex">
                        <Link
                            href={domain.link.href}
                            onClick={() => trackEvent('cta_click', {
                                cta_id: `domain_${domain.id}`,
                                section: analyticsSection
                            })}
                            className={`group flex min-h-[4.75rem] w-full items-center gap-4 rounded-2xl px-4 py-3.5 outline-none transition duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${t.tile}`}
                        >
                            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${t.badge}`}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                                <span className={`text-lg font-semibold leading-tight ${t.name}`}>{domain.name}</span>
                                {domain.tag && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.pill}`}>{domain.tag}</span>
                                )}
                                {domain.comingSoon ? (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.pill}`}>{domain.link.label}</span>
                                ) : (
                                    <span className="sr-only">: {domain.link.label}</span>
                                )}
                            </span>
                            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors motion-reduce:transition-none ${t.arrow}`}>
                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
