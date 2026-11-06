import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    Atom,
    CalendarCheck,
    Crosshair,
    Gauge,
    Handshake,
    Info,
    Mail,
    Phone,
    RadioTower,
    TriangleAlert,
} from 'lucide-react';
import TrackedLink from '@/components/analytics/TrackedLink';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InPageNav from '@/components/ui/InPageNav';
import KeepCanSatTogether from '@/components/programs/KeepCanSatTogether';
import CompetitionJourneys from '@/components/competitions/CompetitionJourneys';
import { INSPACE_COMPETITION } from '@/config/competitions/inspace';
import { SPACE_PROGRAM } from '@/data/programs/space-innovation/program.config';
import { OG_IMAGE } from '@/config/site';

const PAGE_PATH = SPACE_PROGRAM.href;
const pageDescription = `${SPACE_PROGRAM.initiativeTitle} (proposed): ${SPACE_PROGRAM.awardAmount} and ${SPACE_PROGRAM.supportDuration} of engineering development support for each of the CAN-7USAT and Model Rocketry winning teams of the ${SPACE_PROGRAM.competitionTitle}.`;

export const metadata: Metadata = {
    title: SPACE_PROGRAM.competitionTitle,
    description: pageDescription,
    alternates: {
        canonical: PAGE_PATH,
    },
    openGraph: {
        type: 'website',
        siteName: 'EV Society™',
        title: `${SPACE_PROGRAM.competitionTitle} | ${SPACE_PROGRAM.initiativeTitle}`,
        description: pageDescription,
        url: PAGE_PATH,
        images: [OG_IMAGE],
    },
};


const scopeIcons = [Atom, TriangleAlert, RadioTower, Gauge];

const pageSections = [
    { id: 'about', label: 'About' },
    { id: 'teams', label: 'Teams & winners' },
    { id: 'awards', label: 'Awards' },
    { id: 'development', label: 'Engineering development' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'demonstration', label: 'Final demonstration' },
    { id: 'contact', label: 'Collaboration & contact' },
    { id: 'disclaimer', label: 'Disclaimer' },
];

function ProposedBadge({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone === 'dark'
                ? 'bg-white/10 text-primary-300 ring-1 ring-white/15'
                : 'bg-primary-50 text-primary ring-1 ring-primary-200'
                }`}
        >
            Proposed
        </span>
    );
}

function Eyebrow({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
    return (
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone === 'dark' ? 'text-primary-300' : 'text-primary'}`}>
            {children}
        </p>
    );
}

function OfficialCompetitionLink({ linkId, className, children }: { linkId: string; className: string; children: React.ReactNode }) {
    return (
        <TrackedLink
            href={SPACE_PROGRAM.officialUrl}
            linkId={linkId}
            useNextLink={false}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {children}
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only"> (IN-SPACe website, opens in a new tab)</span>
        </TrackedLink>
    );
}

export default function SpaceInnovationProgramPage() {
    const { image } = SPACE_PROGRAM;

    return (
        <div className="bg-white">

            {/* 1. Hero */}
            <section className="bg-navy text-white" aria-labelledby="program-title">
                <div className="container-custom py-12 lg:py-20">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Programs', href: '/programs' }, { label: 'IN-SPACe Model Rocketry/CAN-7USAT' }]} />

                    <div className="mt-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
                        <div className="lg:col-span-7">
                            <Eyebrow tone="dark">Featured Space Innovation Program</Eyebrow>
                            <h1 id="program-title" className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                                <KeepCanSatTogether text={SPACE_PROGRAM.competitionTitle} />
                            </h1>
                            <p className="mt-6 text-xl font-semibold text-primary-300 sm:text-2xl">
                                {SPACE_PROGRAM.initiativeTitle}
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-300">
                                Proposed by EV Society · {SPACE_PROGRAM.location}
                            </p>
                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
                                Two equal award-and-support pathways for the winning <span className="whitespace-nowrap">CAN-7USAT</span> and Model Rocketry
                                teams: an innovation award of {SPACE_PROGRAM.awardAmount} each, followed by{' '}
                                {SPACE_PROGRAM.supportDuration} of focused engineering development.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#awards"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 motion-reduce:transition-none"
                                >
                                    Explore Awards
                                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                                </a>
                                <OfficialCompetitionLink
                                    linkId="space_program_hero_official"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 motion-reduce:transition-none"
                                >
                                    Official Competition
                                </OfficialCompetitionLink>
                            </div>
                        </div>

                        <figure className="lg:col-span-5">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-raised ring-1 ring-white/10 lg:aspect-[4/5]">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    priority
                                    quality={90}
                                    sizes="(min-width: 1200px) 460px, (min-width: 1024px) 40vw, 100vw"
                                    className="object-cover object-[50%_72%] lg:object-[50%_65%]"
                                />
                            </div>
                            <figcaption className="mt-3 text-xs leading-relaxed text-slate-400">{image.credit}</figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            {/* Status strip */}
            <div className="border-b border-primary-100 bg-primary-50/60">
                <div className="container-custom flex items-start gap-3 py-4 text-sm text-primary">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <p>
                        <strong className="font-semibold">Status: proposed.</strong> The awards, engineering support and dates on this
                        page are EV Society proposals, subject to formal confirmation. The competition is organized independently by IN-SPACe.
                    </p>
                </div>
            </div>

            <InPageNav items={pageSections} />

            {/* 2. About */}
            <section id="about" className="scroll-mt-32 bg-off-white py-20 lg:py-24" aria-labelledby="about-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Eyebrow>About</Eyebrow>
                        <h2 id="about-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            A national competition, and a separate EV Society initiative
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8">
                            <p className="text-sm font-semibold text-gray-500">The competition</p>
                            <h3 className="mt-2 text-xl font-bold">Organized by IN-SPACe</h3>
                            <p className="mt-4 flex-1 leading-relaxed text-gray-600">{SPACE_PROGRAM.competitionSummary}</p>
                            <OfficialCompetitionLink
                                linkId="space_program_about_official"
                                className="mt-6 inline-flex w-fit items-center gap-1.5 rounded font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                Official IN-SPACe program page
                            </OfficialCompetitionLink>
                        </article>

                        <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-500">The EV Society initiative</p>
                                <ProposedBadge />
                            </div>
                            <h3 className="mt-2 text-xl font-bold">{SPACE_PROGRAM.initiativeTitle}</h3>
                            <p className="mt-4 leading-relaxed text-gray-600">{SPACE_PROGRAM.initiativeSummary}</p>
                            <p className="mt-4 leading-relaxed text-gray-600">
                                These awards and the engineering support are EV Society&apos;s own proposed initiative. They are separate
                                from the IN-SPACe competition, its rules and its judging.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* Team platform: register, participants, winners, award documents */}
            <section id="teams" className="scroll-mt-32 border-b border-gray-200 py-20 lg:py-24" aria-labelledby="teams-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Eyebrow>EV Society team platform</Eyebrow>
                        <h2 id="teams-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Team profiles, participants and winners
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-gray-600">
                            Showcase your team&apos;s engineering talent, mentors and achievements. Profiles are reviewed by EV Society before they are published.
                        </p>
                    </div>
                    <div className="mt-12">
                        <CompetitionJourneys competition={INSPACE_COMPETITION} />
                    </div>
                </div>
            </section>

            {/* 3. Awards */}
            <section id="awards" className="scroll-mt-32 py-20 lg:py-24" aria-labelledby="awards-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Eyebrow>Awards &amp; support</Eyebrow>
                        <h2 id="awards-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Two equal award-and-support pathways
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-gray-600">
                            Each winning team receives the same proposed innovation award and the same post-competition
                            engineering development support.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        {SPACE_PROGRAM.awards.map((award) => (
                            <article key={award.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex items-center rounded-full bg-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                                        {award.category}
                                    </span>
                                    <ProposedBadge />
                                </div>
                                <h3 className="mt-6 text-xl font-bold sm:text-2xl">{award.name}</h3>
                                <p className="mt-1 text-sm text-gray-500">For the {award.recipient}</p>
                                <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Innovation award</dt>
                                        <dd className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{SPACE_PROGRAM.awardAmount}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Engineering support</dt>
                                        <dd className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{SPACE_PROGRAM.supportDuration}</dd>
                                        <dd className="mt-1 text-sm text-gray-500">post-competition</dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 rounded-2xl bg-navy p-6 text-white sm:p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
                        <div>
                            <p className="text-sm font-medium text-slate-300">Total proposed awards</p>
                            <p className="mt-1 text-3xl font-bold tracking-tight">{SPACE_PROGRAM.totalAwards}</p>
                        </div>
                        <p className="leading-relaxed text-slate-200 md:border-l md:border-white/15 md:pl-10">
                            Both winning teams receive three months of focused engineering development support.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. Engineering development */}
            <section id="development" className="scroll-mt-32 bg-off-white py-20 lg:py-24" aria-labelledby="development-heading">
                <div className="container-custom">
                    <div className="grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <Eyebrow>Engineering development</Eyebrow>
                            <h2 id="development-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                One problem. Three months. A working demonstrator.
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed text-gray-600">
                                After the competition, each winning team selects <strong className="font-semibold text-gray-900">one defined engineering
                                    problem or subsystem</strong> from its own project and develops it over three months.
                            </p>
                            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
                                <div className="flex items-center gap-3">
                                    <Crosshair className="h-5 w-5 text-primary" aria-hidden="true" />
                                    <h3 className="text-base font-bold">Objective</h3>
                                </div>
                                <p className="mt-3 leading-relaxed text-gray-700">{SPACE_PROGRAM.objective}</p>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <h3 className="text-lg font-bold">Proposed technical scope</h3>
                            <p className="mt-1 text-sm text-gray-500">Shared by both teams, applied as relevant to each team&apos;s project.</p>
                            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                                {SPACE_PROGRAM.scope.map((item, index) => {
                                    const Icon = scopeIcons[index];
                                    return (
                                        <li key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                                            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                                            <p className="mt-4 font-semibold text-gray-900">{item.title}</p>
                                            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Timeline */}
            <section id="timeline" className="scroll-mt-32 py-20 lg:py-24" aria-labelledby="timeline-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Eyebrow>Timeline</Eyebrow>
                        <h2 id="timeline-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Three-month development timeline
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-gray-600">The same proposed sequence applies to both winning teams.</p>
                    </div>

                    <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                        {SPACE_PROGRAM.timeline.map((step, index) => (
                            <li key={step.month} className="relative pl-16 md:pl-0 md:pt-16">
                                {index < SPACE_PROGRAM.timeline.length - 1 && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute -bottom-10 left-6 top-12 w-px bg-gray-300 md:-right-8 md:bottom-auto md:left-12 md:top-6 md:h-px md:w-auto"
                                    />
                                )}
                                <span
                                    aria-hidden="true"
                                    className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full bg-navy text-lg font-bold text-white"
                                >
                                    {index + 1}
                                </span>
                                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{step.month}</p>
                                <h3 className="mt-1 text-xl font-bold">{step.phase}</h3>
                                <p className="mt-2 leading-relaxed text-gray-600">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* 6. Final demonstration */}
            <section id="demonstration" className="scroll-mt-32 bg-navy py-16 text-white lg:py-20" aria-labelledby="demonstration-heading">
                <div className="container-custom grid items-center gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <Eyebrow tone="dark">Final demonstration</Eyebrow>
                        <h2 id="demonstration-heading" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Final submission &amp; demonstration
                        </h2>
                        <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-200">
                            The proposed milestone by which both winning teams submit and demonstrate their engineering demonstrators.
                        </p>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl bg-navy-raised p-8 ring-1 ring-white/10">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <CalendarCheck className="h-6 w-6 text-primary-300" aria-hidden="true" />
                                <ProposedBadge tone="dark" />
                            </div>
                            <p className="mt-6 text-sm font-medium text-slate-300">Proposed deadline</p>
                            <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                                <time dateTime={SPACE_PROGRAM.finalDeadline.iso}>{SPACE_PROGRAM.finalDeadline.label}</time>
                            </p>
                            <p className="mt-3 text-sm text-slate-300">Subject to confirmation for both teams.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Collaboration and contact */}
            <section id="contact" className="scroll-mt-32 bg-off-white py-20 lg:py-24" aria-labelledby="collaboration-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <Eyebrow>Collaboration &amp; contact</Eyebrow>
                        <h2 id="collaboration-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Collaboration and program contact
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        <article className="rounded-2xl border border-gray-200 bg-white p-8">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <Handshake className="h-5 w-5 text-primary" aria-hidden="true" />
                                    <h3 className="text-lg font-bold">Proposed industry collaboration</h3>
                                </div>
                                <ProposedBadge />
                            </div>
                            <p className="mt-4 leading-relaxed text-gray-600">
                                EV Society&apos;s proposal names the following organizations as prospective industry collaborators.
                                Their involvement is pending verification and partnership confirmation.
                            </p>
                            <ul className="mt-6 divide-y divide-gray-100 border-y border-gray-100">
                                {SPACE_PROGRAM.collaborators.map((collaborator) => (
                                    <li key={collaborator.name} className="py-4">
                                        <p className="font-medium text-gray-900">{collaborator.name}</p>
                                        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                                            {collaborator.links.map((link) => (
                                                <TrackedLink
                                                    key={link.href}
                                                    href={link.href}
                                                    linkId={`space_program_collaborator_${link.label}`}
                                                    useNextLink={false}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-8 items-center gap-1 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                                >
                                                    {link.label}
                                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                    <span className="sr-only"> for {collaborator.name} (opens in a new tab)</span>
                                                </TrackedLink>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article className="rounded-2xl border border-gray-200 bg-white p-8">
                            <h3 className="text-lg font-bold">Program contact</h3>
                            <p className="mt-4 leading-relaxed text-gray-600">
                                For questions about the {SPACE_PROGRAM.initiativeTitle}. For competition rules, registration and
                                results, please refer to IN-SPACe.
                            </p>
                            <p className="mt-6 text-xl font-bold text-gray-900">{SPACE_PROGRAM.contact.name}</p>
                            <p className="text-sm text-gray-500">For EV Society, {SPACE_PROGRAM.location}</p>
                            <ul className="mt-6 space-y-3">
                                <li>
                                    <a
                                        href={SPACE_PROGRAM.contact.phoneHref}
                                        className="inline-flex min-h-11 items-center gap-3 rounded font-medium text-gray-900 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                    >
                                        <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                                        {SPACE_PROGRAM.contact.phone}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={`mailto:${SPACE_PROGRAM.contact.email}`}
                                        className="inline-flex min-h-11 items-center gap-3 break-all rounded font-medium text-gray-900 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                    >
                                        <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                        {SPACE_PROGRAM.contact.email}
                                    </a>
                                </li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>

            {/* 8. Official reference and disclaimer */}
            <section id="disclaimer" className="scroll-mt-32 border-t border-gray-200 py-16 lg:py-20" aria-labelledby="disclaimer-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h2 id="disclaimer-heading" className="text-2xl font-bold tracking-tight">Official reference &amp; disclaimer</h2>
                        <div className="mt-6 space-y-4 leading-relaxed text-gray-600">
                            <p>
                                The {SPACE_PROGRAM.competitionTitle} is organized independently by {SPACE_PROGRAM.organizer}.
                                EV Society is not its organizer, and nothing on this page represents approval, sponsorship or
                                endorsement by IN-SPACe.
                            </p>
                            <p>
                                The {SPACE_PROGRAM.initiativeTitle}, including the award amounts, the three months of engineering
                                development support for both winning teams, the collaborators named and the{' '}
                                {SPACE_PROGRAM.finalDeadline.label} deadline, is EV Society&apos;s own proposed initiative and remains
                                subject to formal confirmation.
                            </p>
                            <p>For official competition information, eligibility, rules and announcements, please refer to IN-SPACe.</p>
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <OfficialCompetitionLink
                                linkId="space_program_disclaimer_official"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-navy px-6 font-semibold text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
                            >
                                Official IN-SPACe information
                            </OfficialCompetitionLink>
                            <Link
                                href="/programs"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gray-300 px-6 font-semibold text-gray-800 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
                            >
                                All programs
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                        <p className="mt-10 border-t border-gray-100 pt-6 text-xs leading-relaxed text-gray-500">
                            {image.credit}. Use of this photograph does not indicate association with, or endorsement by, its source.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
