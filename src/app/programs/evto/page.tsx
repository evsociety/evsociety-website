import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, Download, Flag } from 'lucide-react';
import { EVTO_PROGRAM_CONFIG } from '../../../data/programs/evto/program.config';
import { getAllCandidates, getAllSubmissions } from '../../../lib/evto-dal'; // Updated import
import PillarCard from '../../../components/programs/PillarCard';
import CandidateTable from '../../../components/programs/CandidateTable';
import CandidateCard from '../../../components/programs/CandidateCard';
import SectionHeading from '@/components/ui/SectionHeading';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InPageNav from '@/components/ui/InPageNav';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    // The title already names the site, so skip the layout's "| EV Society™" template
    title: { absolute: 'EVTO™ – Certified Electric Vertical Technology Officer | EV Society™' },
    description: 'Executive certification program for Electric Vertical (eVTOL) technology leadership across architecture, AI, battery, and business strategy.',
    alternates: {
        canonical: '/programs/evto',
    },
};

const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility & tracks' },
    { id: 'pathway', label: 'Learning pathway' },
    { id: 'structure', label: 'Program structure' },
    { id: 'capstone', label: 'Capstone' },
    { id: 'candidates', label: 'Candidates' },
];

const pillarName = (title: string) => title.replace(/^Pillar \d+ – /, '');

export default async function ProgramPage() {
    const candidates = await getAllCandidates();
    const submissions = await getAllSubmissions();
    const C = EVTO_PROGRAM_CONFIG;

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-navy text-white">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
                <div className="container-custom py-12 lg:py-20">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: 'EVTO™' }]} />

                    <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:items-center">
                        <div className="min-w-0 lg:col-span-7">
                            <span className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-primary-300">
                                Flagship Certification
                            </span>
                            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                                Certified Electric Vertical Technology Officer <span className="font-normal">(EVTO™)</span>
                            </h1>
                            <p className="mt-6 text-xl leading-relaxed text-slate-300 md:text-2xl">
                                {C.tagline}
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/programs/evto/candidates"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                                >
                                    View Candidates <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                </Link>
                                <a
                                    href={C.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10 motion-reduce:transition-none"
                                >
                                    <Download className="h-5 w-5" aria-hidden="true" />
                                    Download Program PDF
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </div>
                        </div>

                        <aside aria-labelledby="glance-heading" className="rounded-2xl bg-navy-raised p-7 ring-1 ring-white/10 lg:col-span-5">
                            <h2 id="glance-heading" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">Program at a glance</h2>
                            <dl className="mt-5 divide-y divide-white/10">
                                {C.tracks.map((track) => (
                                    <div key={track.name} className="flex items-baseline justify-between gap-4 py-3">
                                        <dt className="font-semibold text-white">{track.name}</dt>
                                        <dd className="text-sm text-slate-300">{track.duration}</dd>
                                    </div>
                                ))}
                                <div className="flex items-baseline justify-between gap-4 py-3">
                                    <dt className="font-semibold text-white">Program Structure</dt>
                                    <dd className="text-right text-sm text-slate-300">5 Pillars of Excellence + Capstone Project</dd>
                                </div>
                            </dl>
                        </aside>
                    </div>
                </div>
            </section>

            <InPageNav items={sections} />

            {/* Why EVTO */}
            <section id="overview" className="scroll-mt-32 py-20 lg:py-24">
                <div className="container-custom grid items-start gap-12 lg:grid-cols-12">
                    <div className="min-w-0 lg:col-span-7">
                        <SectionHeading title="Why EVTO™?" intro="Shaping the Future CTOs of Electric Mobility" />
                        <p className="mb-8 text-lg leading-relaxed text-gray-600">
                            {C.description}
                        </p>
                        <ul className="divide-y divide-gray-100 border-y border-gray-100">
                            {C.roleDefinition.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3 py-4">
                                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <p className="text-gray-700">{point}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-7 lg:col-span-5">
                        <div className="mb-5 flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                            <h3 className="text-lg font-bold">Program Document</h3>
                        </div>
                        <div className="mb-5 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
                                <FileText className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900" title={C.pdfName}>
                                    {C.pdfName}
                                </p>
                                <p className="text-sm text-gray-500">Updated: {C.pdfLastUpdated}</p>
                            </div>
                        </div>
                        <a
                            href={C.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 w-full items-center justify-center rounded-full bg-navy font-semibold text-white transition-colors hover:bg-navy-raised motion-reduce:transition-none"
                        >
                            View / Download
                            <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Overview Cards */}
            <section id="eligibility" className="scroll-mt-32 bg-surface py-20 lg:py-24" aria-label="Eligibility, tracks and certification">
                <div className="container-custom grid gap-6 md:grid-cols-3">
                    {/* Eligibility */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-7">
                        <h3 className="mb-5 flex items-center gap-3 text-lg font-bold">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white">01</span>
                            Eligibility
                        </h3>
                        <ul className="mb-5 space-y-3">
                            {C.eligibility.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs italic text-gray-500">{C.eligibility.note}</p>
                    </div>

                    {/* Tracks */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-7">
                        <h3 className="mb-5 flex items-center gap-3 text-lg font-bold">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white">02</span>
                            Tracks
                        </h3>
                        <div className="space-y-4">
                            {C.tracks.map((track, i) => (
                                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="mb-1 flex items-baseline justify-between gap-3">
                                        <span className="text-sm font-semibold text-gray-900">{track.name}</span>
                                        <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">{track.duration}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-gray-600">{track.targetAudience}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certification */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-7">
                        <h3 className="mb-5 flex items-center gap-3 text-lg font-bold">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white">03</span>
                            Certification
                        </h3>
                        <ul className="space-y-3">
                            {C.certificationCriteria.map((crit, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                    {crit}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Learning pathway: the pillars in order with their stated durations */}
            <section id="pathway" className="scroll-mt-32 py-20 lg:py-24" aria-labelledby="pathway-heading">
                <div className="container-custom">
                    <SectionHeading id="pathway-heading" eyebrow="Learning pathway" title="From eligibility to capstone" />
                    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                        {C.pillars.map((pillar, idx) => (
                            <li key={pillar.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                                    {idx === 0 ? 'Start' : `Pillar ${idx}`}
                                </span>
                                <span className="mt-2 font-semibold leading-snug text-gray-900">{idx === 0 ? pillar.title : pillarName(pillar.title)}</span>
                                <span className="mt-auto pt-4 text-sm text-gray-500">{pillar.estimatedDuration}</span>
                            </li>
                        ))}
                        <li className="flex flex-col rounded-2xl bg-navy p-5 text-white">
                            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-300">
                                <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Final Gate
                            </span>
                            <span className="mt-2 font-semibold leading-snug">Capstone Project</span>
                        </li>
                    </ol>
                </div>
            </section>

            {/* Pillars Grid */}
            <section id="structure" className="scroll-mt-32 bg-surface py-20 lg:py-24" aria-labelledby="structure-heading">
                <div className="container-custom">
                    <SectionHeading id="structure-heading" title="Program Structure" intro="5 Pillars of Excellence" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {C.pillars.map((pillar, idx) => (
                            <PillarCard key={pillar.id} pillar={pillar} index={idx} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Capstone */}
            <section id="capstone" className="scroll-mt-32 bg-navy py-20 text-white lg:py-24" aria-labelledby="capstone-heading">
                <div className="container-custom">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12 text-center">
                            <span className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-primary-300">
                                Final Gate
                            </span>
                            <h2 id="capstone-heading" className="mb-4 text-3xl font-bold text-white">Capstone Project</h2>
                            <p className="text-slate-300">{C.capstone.mandatoryNote}</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                                <h3 className="mb-4 text-lg font-semibold text-primary-300">Deliverables</h3>
                                <ul className="space-y-3">
                                    {C.capstone.deliverables.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                                            <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                                <h3 className="mb-4 text-lg font-semibold text-primary-300">Evaluation Criteria</h3>
                                <ul className="space-y-3">
                                    {C.capstone.evaluationCriteria.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                                            <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-10 text-center">
                            <p className="mb-3 text-sm text-slate-400">Example Topics:</p>
                            <ul className="flex flex-wrap justify-center gap-2">
                                {C.capstone.topics.map((topic, i) => (
                                    <li key={i} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
                                        {topic}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Candidate Preview */}
            <section id="candidates" className="scroll-mt-32 bg-surface py-20 lg:py-24" aria-labelledby="candidates-heading">
                <div className="container-custom">
                    <SectionHeading
                        id="candidates-heading"
                        title="Current Candidates"
                        intro="Leaders currently enrolled in the program"
                        action={
                            <Link href="/programs/evto/candidates" className="inline-flex items-center gap-1 rounded font-semibold text-primary hover:text-primary-hover">
                                View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        }
                    />

                    <CandidateTable candidates={candidates} submissions={submissions} />
                    <CandidateCard candidates={candidates} submissions={submissions} />
                </div>
            </section>
        </div>
    );
}
