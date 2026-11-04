import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import FeatureHighlightCard from '@/components/domains/FeatureHighlightCard';
import ResearchDomainGrid from '@/components/domains/ResearchDomainGrid';
import { SKILL_MATRIX_DATA } from '@/data/domains/skillMatrix';
import {
    Zap,
    Battery,
    ShieldCheck,
    Cpu,
    Recycle,
    Settings,
    Car,
    Users
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Focus Areas',
    description: 'Explore the EV Society™ focus areas including electric vehicles, battery technology, charging infrastructure, EV safety, standards, and sustainability.',
    alternates: {
        canonical: '/domains',
    },
};

const focusAreas = [
    {
        name: 'Electric two- and three-wheelers',
        icon: Zap,
    },
    {
        name: 'Electric passenger and commercial vehicles',
        icon: Car,
    },
    {
        name: 'Electric public transport and fleet electrification',
        icon: Users,
    },
    {
        name: 'Charging infrastructure and smart grids',
        icon: Settings,
    },
    {
        name: 'Battery technology and energy storage',
        icon: Battery,
    },
    {
        name: 'EV safety, standards, testing, and compliance',
        icon: ShieldCheck,
    },
    {
        name: 'Digitalization, AI, and data analytics for EVs',
        icon: Cpu,
    },
    {
        name: 'Recycling, circular economy, and sustainability',
        icon: Recycle,
    }
];

export default function DomainsPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Our Focus Areas"
                description="We prioritize sectors that drive the maximum impact for sustainable mobility transition."
                breadcrumb="Focus Areas"
            />

            <section className="border-b border-gray-200 bg-surface py-16 lg:py-20" aria-labelledby="framework-heading">
                <div className="container-custom">
                    <SectionHeading
                        id="framework-heading"
                        eyebrow="Organisational framework"
                        title="Four research domains"
                        intro="EV Society’s organisational descriptor groups its work into four umbrella domains. This is a high-level classification; the technical focus areas published below belong to the Electric Vehicles domain."
                    />
                    <ResearchDomainGrid tone="light" columns={4} analyticsSection="domains_framework" />
                </div>
            </section>

            <section className="py-20 lg:py-24" aria-labelledby="focus-areas-heading">
                <div className="container-custom">
                    <SectionHeading
                        id="focus-areas-heading"
                        eyebrow="Electric Vehicles domain"
                        title="Published focus areas"
                    />
                    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {focusAreas.map((area) => (
                            <li key={area.name} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7">
                                <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
                                    <area.icon className="h-6 w-6" aria-hidden="true" />
                                </span>
                                <h3 className="mb-4 text-lg font-bold leading-snug text-gray-900">{area.name}</h3>
                                <p className="mt-auto text-sm font-medium text-gray-500">
                                    Technical Working Group
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Featured Block: EV Industry Skill Matrix */}
            <FeatureHighlightCard
                pill={SKILL_MATRIX_DATA.featuredBlock.pill}
                title={SKILL_MATRIX_DATA.featuredBlock.title}
                description={SKILL_MATRIX_DATA.featuredBlock.description}
                highlightsHeading="Key Highlights"
                highlights={SKILL_MATRIX_DATA.featuredBlock.highlights}
                ctaText={SKILL_MATRIX_DATA.featuredBlock.ctaText}
                ctaRoute={SKILL_MATRIX_DATA.featuredBlock.ctaRoute}
            />

            <section className="py-20 lg:py-24">
                <div className="container-custom text-center">
                    <h2 className="mx-auto mb-6 max-w-2xl text-3xl font-bold leading-tight text-gray-900">
                        Advancing Electric Mobility—Innovation, Sustainability, Mobility.
                    </h2>
                    <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-600">
                        Join our focused technical committees and contribute to the evolution of zero-emission transportation.
                    </p>
                    <Link href="/join" className="btn-primary">
                        Become a Contributor
                    </Link>
                </div>
            </section>
        </div>
    );
}
