import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/ui/SectionHeading';
import { Target, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Vision, Mission & Objectives',
    description: 'Discover the EV Society™ roadmap for a safe and sustainable transition to electric mobility through innovation, skill development, and policy engagement.',
    alternates: {
        canonical: '/vision-mission',
    },
};

// Not currently rendered on the page; kept as authored
const objectives = [
    "Promote electric mobility awareness across all strata of society",
    "Support EV research, design, testing, validation & safety protocols",
    "Act as a neutral knowledge-sharing platform for industry, academia, and startups",
    "Strengthen national standards, compliance, and certification readiness (AIS, ISO)",
    "Enable skills, training, and competency-based certifications for the workforce",
    "Support startups and MSMEs via mentorship, expert access, and industry pathways",
    "Promote sustainability, circular economy, and responsible battery lifecycle practices"
];

const mission = [
    "Promote electric mobility adoption across all transport segments",
    "Enable research, innovation, and indigenization of EV technologies",
    "Build skilled manpower for the EV ecosystem",
    "Act as a knowledge, policy, and industry interface",
    "Encourage sustainable and ethical mobility practices"
];

const coreObjectives = [
    "Promote electric mobility awareness",
    "Support EV research, design, testing, and safety",
    "Act as a knowledge-sharing platform (industry–academia–startups)",
    "Enable skill development and certification programs",
    "Provide technical inputs to policy and standards initiatives",
    "Support startups, MSMEs, and innovators",
    "Drive a strong focus on standards, reliability, and quality—critical for EV safety"
];

export default function VisionMissionPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Vision, Mission & Objectives"
                description="The EV Society™ roadmap for a safe and sustainable transition to electric mobility."
                breadcrumb="Vision & Mission"
            />

            <section className="py-20 lg:py-24">
                <div className="container-custom">
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="rounded-3xl bg-navy p-8 text-white sm:p-10 lg:col-span-7">
                            <span className="mb-8 grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-primary-300 ring-1 ring-white/15">
                                <Target className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">Our Vision</h2>
                            <p className="text-2xl font-medium leading-relaxed text-white sm:text-[1.7rem]">
                                “To accelerate the transition to sustainable, affordable, and indigenous electric mobility by fostering innovation, skill development, public awareness, and policy engagement—supporting energy security, environmental stewardship, and inclusive economic growth.”
                            </p>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 lg:col-span-5">
                            <span className="mb-8 grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary">
                                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Our Mission</h2>
                            <ul className="divide-y divide-gray-100">
                                {mission.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                        <span className="font-semibold text-gray-800">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-surface py-20 lg:py-24" aria-labelledby="objectives-heading">
                <div className="container-custom">
                    <div className="grid gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <SectionHeading id="objectives-heading" title="Core Objectives" />
                        </div>
                        <ol className="grid gap-3 lg:col-span-8">
                            {coreObjectives.map((obj, i) => (
                                <li key={i} className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                                        {i + 1}
                                    </span>
                                    <p className="text-lg font-medium text-gray-800">{obj}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            <section className="py-20 lg:py-24">
                <div className="container-custom text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Aligned with National Priorities</h2>
                    <ul className="mt-8 flex flex-wrap justify-center gap-3">
                        {["FAME-II", "PLI Schemes", "Niti Aayog", "AIS Standards"].map(tag => (
                            <li key={tag} className="rounded-full border border-gray-200 bg-surface px-5 py-2 text-xs font-bold uppercase tracking-widest text-gray-700">
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
