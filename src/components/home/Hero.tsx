'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';
import { ORGANISATION_DESCRIPTOR, ORGANISATION_NAME } from '@/config/site';
import ResearchDomainGrid from '@/components/domains/ResearchDomainGrid';

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-navy text-white" aria-labelledby="home-title">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
            <div className="container-custom grid gap-14 pt-16 pb-28 lg:grid-cols-12 lg:gap-12 lg:pt-24 lg:pb-36">
                <div className="lg:col-span-7">
                    <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-300 ring-1 ring-white/15">
                        Official Professional Body
                    </p>
                    <h1 id="home-title" className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                        {ORGANISATION_NAME}
                    </h1>
                    <p className="mt-4 max-w-xl text-xl font-semibold leading-snug text-primary-300 sm:text-2xl">
                        {ORGANISATION_DESCRIPTOR}
                    </p>

                    <div className="mt-10 max-w-2xl border-l-2 border-primary-300/40 pl-6">
                        <p className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                            Accelerating the future of electric mobility—safely and sustainably.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-slate-300">
                            <span className="font-extrabold text-white">EV Society™</span> is a non-profit educational and technical community advancing electric mobility through research, safety, standards, skills, and collaboration across industry, academia, startups, and the public.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/join"
                            onClick={() => trackEvent('cta_click', {
                                cta_id: 'hero_join',
                                page: '/',
                                section: 'hero'
                            })}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                        >
                            Join EV Society™
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </Link>
                        <Link
                            href="/domains"
                            onClick={() => trackEvent('cta_click', {
                                cta_id: 'hero_explore_domains',
                                page: '/',
                                section: 'hero'
                            })}
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-8 text-lg font-semibold text-white transition-colors hover:bg-white/10 motion-reduce:transition-none"
                        >
                            Explore Focus Areas
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-5 lg:self-center">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">Research domains</h2>
                    <div className="mt-5">
                        <ResearchDomainGrid tone="dark" columns={1} analyticsSection="home_hero_domains" />
                    </div>
                </div>
            </div>
        </section>
    );
}
