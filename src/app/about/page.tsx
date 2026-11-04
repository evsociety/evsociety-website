import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import { ORGANISATION_DESCRIPTOR, ORGANISATION_DOMAIN, ORGANISATION_NAME } from '@/config/site';
import { Target, Users2, ShieldCheck, Globe } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About EV Society™',
    description: 'EV Society™ is a non-profit, charitable educational and technical organization dedicated to strengthening the understanding and responsible adoption of electric vehicle technology.',
    alternates: {
        canonical: '/about',
    },
};

const values = [
    {
        title: 'Technical Excellence',
        description: 'We prioritize engineering rigor and data-driven standards in every initiative.',
        icon: Target,
    },
    {
        title: 'Inclusive Neutrality',
        description: 'Serving as a neutral platform for industry competitors and government bodies to collaborate.',
        icon: Globe,
    },
    {
        title: 'Safety First',
        description: 'Human safety and asset protection are at the core of our technical agenda.',
        icon: ShieldCheck,
    },
    {
        title: 'Skill Sovereignty',
        description: 'Empowering the workforce with the competencies needed for a global EV market.',
        icon: Users2,
    },
];

const identity = [
    { label: 'Name', value: ORGANISATION_NAME },
    { label: 'Organisation', value: ORGANISATION_DESCRIPTOR },
    { label: 'Website', value: ORGANISATION_DOMAIN },
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="EV Society™"
                description="EV Society™ is a non-profit, charitable educational and technical organization dedicated to strengthening the understanding and responsible adoption of electric vehicle technology across all stakeholders."
                breadcrumb="About Us"
            />

            <section aria-label="Organisation identity" className="border-b border-gray-200 bg-surface">
                <dl className="container-custom grid gap-6 py-8 md:grid-cols-[auto_1fr_auto] md:gap-12">
                    {identity.map((item) => (
                        <div key={item.label}>
                            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{item.label}</dt>
                            <dd className="mt-1.5 text-lg font-semibold text-gray-900">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="py-20 lg:py-24">
                <div className="container-custom">
                    <div className="grid items-start gap-14 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <h2 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">What we do</h2>
                            <ul className="mb-10 divide-y divide-gray-100 border-y border-gray-100">
                                {[
                                    'Build a trusted platform connecting industry, academia, startups, and practitioners',
                                    'Promote research, indigenization, and quality engineering',
                                    'Support standards, testing readiness, and safety-first adoption',
                                    'Enable workforce skill development and certifications',
                                    'Provide technical inputs for policies and public awareness'
                                ].map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-4 py-4">
                                        <span aria-hidden="true" className="mt-0.5 text-sm font-semibold tabular-nums text-primary">0{i + 1}</span>
                                        <span className="text-lg font-medium text-gray-800">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                As a professional technical body, <span className="text-primary font-bold">EV Society™</span> supports the advancement of EV engineering, safety, testing, standards, and ecosystem development—enabling reliable electric mobility across transport segments.
                            </p>
                            <dl className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-8">
                                <div className="flex flex-col-reverse">
                                    <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Year of Inception</dt>
                                    <dd className="text-4xl font-bold tracking-tight text-gray-900">2024</dd>
                                </div>
                                <div className="flex flex-col-reverse">
                                    <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Focus Areas</dt>
                                    <dd className="text-4xl font-bold tracking-tight text-gray-900">12+</dd>
                                </div>
                            </dl>
                        </div>
                        <figure className="rounded-3xl bg-navy p-8 text-white lg:col-span-5 lg:p-12">
                            <blockquote className="text-2xl font-medium leading-relaxed text-white">
                                &ldquo;Our goal is not just to replace internal combustion engines, but to build a mobility ecosystem that is fundamentally safer, cleaner, and smarter for everyone.&rdquo;
                            </blockquote>
                            <figcaption className="mt-8 border-t border-white/10 pt-6 font-semibold text-primary-300">— Executive Board, EV Society™</figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            <section className="bg-surface py-20 lg:py-24" aria-labelledby="values-heading">
                <div className="container-custom">
                    <SectionHeading id="values-heading" title="Our Core Values" />
                    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {values.map(value => (
                            <li key={value.title} className="rounded-2xl border border-gray-200 bg-white p-7">
                                <span className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary">
                                    <value.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="mb-3 text-xl font-bold text-gray-900">{value.title}</h3>
                                <p className="leading-relaxed text-gray-600">
                                    {value.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="py-20 lg:py-24">
                <div className="container-custom flex flex-col items-center gap-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Ready to be part of the movement?</h2>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href="/join" className="btn-primary">Become a Member</Link>
                        <Link href="/contact" className="btn-secondary">Contact Us</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
