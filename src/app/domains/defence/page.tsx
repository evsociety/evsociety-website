import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { RESEARCH_DOMAINS } from '@/data/domains/researchDomains';

export const metadata: Metadata = {
    title: 'Defence Research Domain',
    description: 'EV Society’s Defence research domain is coming soon.',
    alternates: {
        canonical: '/domains/defence',
    },
    // Placeholder page: keep it out of search results until it has content
    robots: {
        index: false,
        follow: true,
    },
};

// Placeholder for the Defence domain named in the organisation descriptor. It makes no claim
// about programs, facilities or authorisations; content will be added once it is published.
export default function DefenceDomainPage() {
    const publishedDomains = RESEARCH_DOMAINS.filter((domain) => domain.id !== 'defence');

    return (
        <div className="bg-white">
            <section className="relative bg-navy text-white">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
                <div className="container-custom py-14 lg:py-24">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Research Domains', href: '/domains' }, { label: 'Defence' }]} />

                    <div className="mt-12 max-w-3xl">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-300/10 text-primary-300 ring-1 ring-primary-300/25">
                            <Shield className="h-7 w-7" aria-hidden="true" />
                        </span>
                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">Research domain</p>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Defence</h1>
                            <span className="rounded-full bg-primary-300 px-3 py-1 text-sm font-semibold text-navy">Coming soon</span>
                        </div>
                        <p className="mt-6 text-xl leading-relaxed text-slate-300">
                            This page is being prepared. Programs, projects and resources for the Defence research domain will be published here when they are ready.
                        </p>
                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/contact"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                            >
                                Contact EV Society
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link
                                href="/domains"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10 motion-reduce:transition-none"
                            >
                                All research domains
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-surface py-16 lg:py-20" aria-labelledby="published-domains-heading">
                <div className="container-custom">
                    <h2 id="published-domains-heading" className="mb-8 text-2xl font-bold text-gray-900">Explore published domains</h2>
                    <ul className="grid gap-4 md:grid-cols-3">
                        {publishedDomains.map((domain) => domain.link && (
                            <li key={domain.id}>
                                <Link
                                    href={domain.link.href}
                                    className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:ring-primary motion-reduce:transition-none"
                                >
                                    <span>
                                        <span className="block text-lg font-semibold text-gray-900">{domain.name}</span>
                                        <span className="mt-1 block text-sm text-gray-600">{domain.link.label}</span>
                                    </span>
                                    <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
