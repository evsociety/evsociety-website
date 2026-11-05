import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPartnerBySlug, getPartners } from '@/utils/data';
import { Globe, Linkedin, MapPin, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import PartnerLogo from '@/components/partners/PartnerLogo';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { OG_IMAGE } from '@/config/site';

// Mandatory for static exports or to pre-render these routes
export async function generateStaticParams() {
    const partners = getPartners();
    return partners.map((partner) => ({
        slug: partner.slug,
    }));
}

// Dynamic metadata generation for each partner
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const partner = getPartnerBySlug(slug);

    if (!partner) {
        return {
            title: 'Partner Not Found',
        };
    }

    return {
        title: partner.name,
        description: partner.shortDescription,
        alternates: {
            canonical: `/partners/${partner.slug}`,
        },
        openGraph: {
            title: `${partner.name} | EV Society™`,
            description: partner.shortDescription,
            type: 'profile',
            images: [OG_IMAGE],
        },
    };
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const partner = getPartnerBySlug(slug);

    if (!partner) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <section className="relative bg-navy text-white">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
                <div className="container-custom py-12 lg:py-16">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Partners', href: '/partners' }, { label: partner.name }]} />
                    <Link href="/partners" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 motion-reduce:transition-none">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to Directory
                    </Link>

                    <div className="mt-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-12">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-white ring-4 ring-white/10">
                            <PartnerLogo src={partner.logo} name={partner.name} sizes="112px" className="p-4" textClassName="text-3xl" />
                        </div>

                        <div className="min-w-0 flex-grow">
                            <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Partner type and tags">
                                <li className="rounded-full bg-primary-300 px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy">
                                    {partner.type}
                                </li>
                                {partner.tags.map(tag => (
                                    <li key={tag} className="rounded-full px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/20">{tag}</li>
                                ))}
                            </ul>
                            <h1 className="mb-5 text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
                                {partner.name}
                            </h1>
                            <div className="flex flex-wrap gap-x-8 gap-y-3 text-slate-300">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary-300" aria-hidden="true" />
                                    <span>{[partner.location.city, partner.location.state, partner.location.country].filter(Boolean).join(", ")}</span>
                                </div>
                                {partner.links.website && (
                                    <a href={partner.links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded hover:text-white">
                                        <Globe className="h-5 w-5 text-primary-300" aria-hidden="true" />
                                        <span>{new URL(partner.links.website).hostname}</span>
                                        <span className="sr-only"> (opens in a new tab)</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {(partner.links.website || partner.links.linkedin) && (
                            <div className="flex w-full flex-col gap-3 lg:w-60">
                                {partner.links.website && (
                                    <a href={partner.links.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none">
                                        Visit Website
                                        <span className="sr-only"> (opens in a new tab)</span>
                                    </a>
                                )}
                                {partner.links.linkedin && (
                                    <a href={partner.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 font-semibold text-white transition-colors hover:bg-white/10 motion-reduce:transition-none">
                                        <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
                                        <span className="sr-only"> (opens in a new tab)</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8">
                            <div className="prose prose-lg max-w-none">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Professional Profile</h2>
                                <p className="text-xl text-gray-600 leading-relaxed mb-12">
                                    {partner.about}
                                </p>

                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Strategic Focus Areas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                                    {partner.domains.map(domain => (
                                        <div key={domain} className="p-6 bg-surface rounded-2xl border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900">{domain}</span>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Collaborations</h3>
                                <p className="text-gray-500 italic bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                                    No recent collaborations listed yet for this partner. Check back later for updates on projects and whitepapers.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="space-y-8 lg:sticky lg:top-28">
                                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Quick Actions</h4>
                                    <div className="space-y-4">
                                        {/* Previously buttons with no action; they now lead to the existing contact and membership pages */}
                                        <Link href="/contact" className="w-full flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-primary hover:text-white transition-all group font-bold text-gray-700">
                                            Request Intro
                                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                        </Link>
                                        <Link href="/join" className="w-full flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-primary hover:text-white transition-all group font-bold text-gray-700">
                                            Join Working Group
                                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden">
                                    <h4 className="text-lg font-bold mb-4 relative z-10 text-white">Institutional Support</h4>
                                    <p className="text-sm text-slate-300 mb-6 relative z-10 leading-relaxed">
                                        This partner is a verified member of the <span className="text-white font-extrabold">EV Society™</span> ecosystem.
                                    </p>
                                    <Link href="/join" className="inline-flex min-h-10 items-center px-6 bg-white text-navy rounded-full text-sm font-bold relative z-10 hover:bg-primary-50">
                                        Verify Partnership
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
