import type { Metadata } from 'next';

import { Zap, Gavel, GraduationCap, Building2, Globe, Users2, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import ProgramCTALink from '@/components/programs/ProgramCTALink';
import FeaturedSpaceProgram from '@/components/home/FeaturedSpaceProgram';

export const metadata: Metadata = {
    title: 'Programs',
    description: 'Comprehensive EV Society™ programs for technology innovation, policy advocacy, skill development, industry collaboration, sustainability, and public awareness.',
    alternates: {
        canonical: '/programs',
    },
};

// Flagship certifications, in the order they appear after the Space Innovation program
const certifications = [
    {
        id: 'evto',
        acronym: 'EVTO™',
        name: 'Certified EV Technology Officer (EVTO™)',
        description: 'The gold standard for engineering leaders, architects, and founders mastering the end-to-end EV ecosystem.',
        href: '/programs/evto',
        ctaId: 'view_evto_details',
        highlights: [
            'Architectural Design & Green Leadership',
            'EV System Ownership & Safety',
            'AI, Digital Twins & Connected Tech',
            'Battery Chemistry & Management',
            'CTO-Grade Systems Engineering',
            'Business Strategy & Market Dominance'
        ],
    },
    {
        id: 'evlbs',
        acronym: 'EVLBS™',
        name: 'Certified EV Legal & Business Strategist (EVLBS™)',
        description: 'The gold standard for legal, regulatory, and business leaders mastering the legal, contractual, and intellectual property frameworks of the EV ecosystem.',
        // No page exists at this route yet (it returns 404); kept as published
        href: '/programs/evlbs',
        ctaId: 'view_evlbs_details',
        highlights: [
            'EV Regulatory Frameworks & Compliance',
            'EV Contracts & Supplier Negotiations',
            'Intellectual Property Strategy for EV',
            'Insurance, Risk & Liability Management',
            'EV Taxation & Global Trade',
            'Dispute Resolution & Arbitration'
        ],
    },
];

const programs = [
    {
        title: 'Technology & Innovation',
        icon: Zap,
        bullets: [
            'Encourage R&D in batteries, power electronics, motors, charging systems, BMS, diagnostics, and recycling',
            'Support startups, MSMEs, and academic institutions building EV technologies',
            'Promote indigenous solutions aligned with manufacturing and innovation priorities'
        ],
        cta: { label: 'Learn More', href: '#' }
    },
    {
        title: 'Policy & Advocacy',
        icon: Gavel,
        bullets: [
            'Provide technical inputs to relevant bodies on policies, standards, and safety guidelines',
            'Advocate harmonized regulations, safety compliance, and enabling incentives',
            'Support state and city-level electric mobility roadmaps and implementation playbooks'
        ],
        cta: { label: 'Learn More', href: '#' }
    },
    {
        title: 'Skill Development & Education',
        icon: GraduationCap,
        bullets: [
            'Develop EV-focused curricula, certifications, and practical training programs',
            'Conduct workshops, seminars, and faculty development programs',
            'Enable reskilling and upskilling from conventional automotive roles to EV domains'
        ],
        cta: {
            label: 'View EV Skill Matrix',
            href: '/domains/ev-industry-skill-matrix-india'
        }
    },
    {
        title: 'Industry & Ecosystem Development',
        icon: Building2,
        bullets: [
            'Connect industry, academia, government, startups, and users through working groups',
            'Facilitate collaborations, pilot projects, and technology transfer',
            'Support ecosystem readiness across charging, diagnostics, service, and recycling supply chains'
        ],
        cta: { label: 'Learn More', href: '#' }
    },
    {
        title: 'Sustainability & Environment',
        icon: Globe,
        bullets: [
            'Promote life-cycle thinking for EV adoption',
            'Encourage battery reuse, second-life applications, and responsible recycling',
            'Support renewable energy integration with charging and smart energy management'
        ],
        cta: { label: 'Learn More', href: '#' }
    },
    {
        title: 'Public Awareness & Outreach',
        icon: Users2,
        bullets: [
            'Build awareness around benefits, myths, safety, and responsible usage',
            'Promote adoption across rural, semi-urban, and urban communities',
            'Engage students and youth through EV clubs, challenges, and competitions'
        ],
        cta: { label: 'Learn More', href: '#' }
    }
];

export default function ProgramsPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="EV Programs"
                description="Comprehensive initiatives designed to enable every aspect of the electric mobility ecosystem."
                breadcrumb="Programs"
            />

            {/* 1. Featured: Space Innovation program */}
            <FeaturedSpaceProgram page="/programs" section="featured_program" className="bg-white pt-16 pb-10 lg:pt-20" priority />

            {/* 2. Flagship certifications */}
            <section className="bg-white pb-20 pt-10 lg:pb-24" aria-labelledby="certifications-heading">
                <div className="container-custom">
                    <SectionHeading id="certifications-heading" eyebrow="Executive Program" title="Flagship Certifications" />
                    <div className="grid gap-6 lg:grid-cols-2">
                        {certifications.map((cert) => (
                            <article key={cert.id} id={cert.id} className="flex scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                                <div className="bg-navy p-8 text-white sm:p-10">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300 ring-1 ring-white/15">
                                            Flagship Certification
                                        </span>
                                        <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/15">
                                            Executive Program
                                        </span>
                                    </div>
                                    <h3 className="mt-6 text-4xl font-black tracking-tight text-white">{cert.acronym}</h3>
                                    <p className="mt-2 text-lg font-bold text-white">{cert.name}</p>
                                    <p className="mt-4 leading-relaxed text-slate-300">{cert.description}</p>
                                </div>
                                <div className="flex flex-1 flex-col p-8 sm:p-10">
                                    <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">Program Highlights</h4>
                                    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                                        {cert.highlights.map((item) => (
                                            <li key={item} className="flex items-start gap-3">
                                                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                <span className="text-sm text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto pt-8">
                                        <ProgramCTALink
                                            href={cert.href}
                                            ctaId={cert.ctaId}
                                            page="/programs"
                                            section="featured_program"
                                            className="btn-primary"
                                        >
                                            View Program Details
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </ProgramCTALink>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Program areas */}
            <section className="bg-surface py-20 lg:py-24" aria-labelledby="program-areas-heading">
                <div className="container-custom">
                    <SectionHeading id="program-areas-heading" eyebrow="Programs" title="Program Areas" />
                    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => (
                            <li key={program.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8">
                                <span className="mb-7 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
                                    <program.icon className="h-6 w-6" aria-hidden="true" />
                                </span>
                                <h3 className="mb-5 text-2xl font-bold text-gray-900">{program.title}</h3>
                                <ul className="flex-1 space-y-3">
                                    {program.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                                            <span className="text-sm font-medium leading-relaxed text-gray-600">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                                {'cta' in program && program.cta && (
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <a
                                            href={program.cta.href}
                                            className="inline-flex items-center gap-2 rounded font-semibold text-primary hover:text-primary-hover"
                                        >
                                            {program.cta.label}
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                            <span className="sr-only">: {program.title}</span>
                                        </a>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
