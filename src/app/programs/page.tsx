import type { Metadata } from 'next';

import { Zap, Gavel, GraduationCap, Building2, Globe, Users2, ArrowRight } from 'lucide-react';
import ProgramCTALink from '@/components/programs/ProgramCTALink';

export const metadata: Metadata = {
    title: 'Programs',
    description: 'Comprehensive EV Society™ programs for technology innovation, policy advocacy, skill development, industry collaboration, sustainability, and public awareness.',
    alternates: {
        canonical: '/programs',
    },
};

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
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-16">
                <div className="container-custom">
                    <div className="max-w-4xl">
                        <nav className="text-sm font-medium text-blue-100 mb-6 uppercase tracking-widest">
                            Programs
                        </nav>
                        <h1 className="text-3xl md:text-4xl font-black mb-4 text-white">
                            EV Programs
                        </h1>
                        <p className="text-xl text-blue-50 leading-relaxed">
                            Comprehensive initiatives designed to enable every aspect of the electric mobility ecosystem.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Program */}
            <section className="py-12 bg-gray-50 border-b border-gray-100">
                <div className="container-custom">
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
                        <div className="absolute top-0 right-0 bg-primary/10 text-primary px-4 py-1.5 rounded-bl-xl font-bold text-xs uppercase tracking-wider">
                            Flagship Certification
                        </div>
                        <div className="grid md:grid-cols-12 gap-0">
                            <div className="md:col-span-5 bg-gray-900 text-white p-10 flex flex-col justify-center">
                                <div className="mb-6">
                                    <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-xs font-semibold border border-blue-800 mb-4">
                                        Executive Program
                                    </span>
                                    <h2 className="text-3xl font-black mb-4">EVTO™</h2>
                                    <p className="text-white font-bold text-lg">
                                        Certified EV Technology Officer (EVTO™)
                                    </p>
                                </div>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    The gold standard for engineering leaders, architects, and founders mastering the end-to-end EV ecosystem.
                                </p>
                                <ProgramCTALink
                                    href="/programs/evto"
                                    ctaId="view_evto_details"
                                    page="/programs"
                                    section="featured_program"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors w-fit"
                                >
                                    View Program Details
                                </ProgramCTALink>
                            </div>
                            <div className="md:col-span-7 p-10 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Highlights</h3>
                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {[
                                        'Architectural Design & Green Leadership',
                                        'EV System Ownership & Safety',
                                        'AI, Digital Twins & Connected Tech',
                                        'Battery Chemistry & Management',
                                        'CTO-Grade Systems Engineering',
                                        'Business Strategy & Market Dominance'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 mr-3" />
                                            <span className="text-gray-600 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative mt-8">
                        <div className="grid md:grid-cols-12 gap-0">
                            <div className="md:col-span-5 bg-gray-900 text-white p-10 flex flex-col justify-center">
                                <div className="mb-6">
                                    <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-xs font-semibold border border-blue-800 mb-4">
                                        Executive Program
                                    </span>
                                    <h2 className="text-3xl font-black mb-4">EVLBS™</h2>
                                    <p className="text-white font-bold text-lg">
                                        Certified EV Legal & Business Strategist (EVLBS™)
                                    </p>
                                </div>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    The gold standard for legal, regulatory, and business leaders mastering the legal, contractual, and intellectual property frameworks of the EV ecosystem.
                                </p>
                                <ProgramCTALink
                                    href="/programs/evlbs"
                                    ctaId="view_evlbs_details"
                                    page="/programs"
                                    section="featured_program"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors w-fit"
                                >
                                    View Program Details
                                </ProgramCTALink>
                            </div>
                            <div className="md:col-span-7 p-10 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Highlights</h3>
                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {[
                                        'EV Regulatory Frameworks & Compliance',
                                        'EV Contracts & Supplier Negotiations',
                                        'Intellectual Property Strategy for EV',
                                        'Insurance, Risk & Liability Management',
                                        'EV Taxation & Global Trade',
                                        'Dispute Resolution & Arbitration'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 mr-3" />
                                            <span className="text-gray-600 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program) => (
                            <div key={program.title} className="bg-surface p-8 rounded-3xl border border-gray-200 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors border border-gray-100">
                                    <program.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">{program.title}</h3>
                                <ul className="space-y-4 flex-1">
                                    {program.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                            <span className="text-gray-600 leading-relaxed text-sm font-medium">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                                {'cta' in program && program.cta && (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <a
                                            href={program.cta.href}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            {program.cta.label}
                                            <ArrowRight className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
