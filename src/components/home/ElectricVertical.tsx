import Link from 'next/link';
import { ArrowRight, BatteryCharging, Building2, Cpu, Fan, ShieldCheck } from 'lucide-react';
import { EV_MEANING, ORGANISATION_DESCRIPTOR } from '@/config/site';

const focusAreas = [
    {
        title: 'Battery & energy systems',
        description: 'High-energy battery packs, battery management systems and thermal-runaway protection for flight-critical power.',
        icon: BatteryCharging,
    },
    {
        title: 'Electric propulsion',
        description: 'Electric motors, power electronics and distributed propulsion for vertical lift and efficient cruise.',
        icon: Fan,
    },
    {
        title: 'Flight control & autonomy',
        description: 'Flight control, AI-assisted operations and digital twins for performance and predictive maintenance.',
        icon: Cpu,
    },
    {
        title: 'Safety & certification',
        description: 'Safety analysis, standards and certification-ready engineering evidence.',
        icon: ShieldCheck,
    },
    {
        title: 'Infrastructure & operations',
        description: 'Vertiports, charging and airspace integration for urban and regional air mobility.',
        icon: Building2,
    },
];

const whatIsEvtol = [
    'eVTOL stands for electric vertical take-off and landing. eVTOL aircraft use electric propulsion to take off, hover and land vertically like a helicopter, then fly efficiently like an aeroplane, without needing a runway.',
    'They are being developed for air taxis, cargo and medical delivery, emergency response and regional travel, an area known as advanced air mobility.',
];

// FAQ structured data for search and AI assistants; answers repeat the visible text below
const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What does EV stand for in EV Society?',
            acceptedAnswer: { '@type': 'Answer', text: `At EV Society, "EV" stands for ${EV_MEANING}. EV Society is an ${ORGANISATION_DESCRIPTOR}.` },
        },
        {
            '@type': 'Question',
            name: 'What is eVTOL?',
            acceptedAnswer: { '@type': 'Answer', text: whatIsEvtol.join(' ') },
        },
    ],
};

// Home page explainer for Electric Vertical (eVTOL); the research-domain tile links here
export default function ElectricVertical() {
    return (
        <section id="electric-vertical" className="scroll-mt-28 bg-surface py-20 lg:py-24" aria-labelledby="electric-vertical-heading">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <div className="container-custom grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                    <p className="eyebrow mb-3">Electric Vertical</p>
                    <h2 id="electric-vertical-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What is eVTOL?</h2>
                    {whatIsEvtol.map((paragraph, i) => (
                        <p key={i} className={`${i === 0 ? 'mt-5' : 'mt-4'} text-lg leading-relaxed text-gray-600`}>{paragraph}</p>
                    ))}
                    <p className="mt-6 rounded-2xl bg-navy px-5 py-4 font-semibold text-white">
                        At <span className="text-primary-300">EV Society</span>, &ldquo;EV&rdquo; stands for {EV_MEANING}.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href="/projects" className="btn-primary">
                            Explore projects
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link href="/domains" className="btn-secondary">
                            Research domains
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Technologies we focus on</h3>
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {focusAreas.map((area) => (
                            <li key={area.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary">
                                    <area.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <p className="mt-4 font-semibold text-gray-900">{area.title}</p>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">{area.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
