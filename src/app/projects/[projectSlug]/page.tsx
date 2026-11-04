import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle, Users } from 'lucide-react';
import { getAllCandidatesWithSubmissions, getAllProjects, getProject } from '@/lib/projects-dal';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InPageNav from '@/components/ui/InPageNav';
import SectionHeading from '@/components/ui/SectionHeading';
import StatusBadge from '@/components/programs/StatusBadge';
import ProgressBar from '@/components/programs/ProgressBar';
import CandidateTable from '@/components/programs/CandidateTable';
import CandidateCard from '@/components/programs/CandidateCard';

export const dynamic = 'force-dynamic';

const PEOPLE_PREVIEW = 6;

export async function generateMetadata({ params }: { params: Promise<{ projectSlug: string }> }): Promise<Metadata> {
    const { projectSlug } = await params;
    const project = await getProject(projectSlug);
    if (!project) return { title: 'Project Not Found' };
    const summary = (await getAllProjects()).projects.find((p) => p.projectId === projectSlug);
    return {
        title: project.title,
        description: summary?.shortDescription ?? project.description.split('\n')[0],
        alternates: { canonical: `/projects/${projectSlug}` },
    };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectSlug: string }> }) {
    const { projectSlug } = await params;
    const project = await getProject(projectSlug);

    if (!project) {
        notFound();
    }

    // The projects index holds status, progress, tags and highlights; the project file holds the description
    const summary = (await getAllProjects()).projects.find((p) => p.projectId === projectSlug);
    const people = await getAllCandidatesWithSubmissions(projectSlug);
    const sortedPeople = [...people].sort((a, b) => (b.submission?.lastUpdated ?? '').localeCompare(a.submission?.lastUpdated ?? ''));
    const preview = sortedPeople.slice(0, PEOPLE_PREVIEW);
    const paragraphs = project.description.split(/\n\s*\n/).filter(Boolean);
    const tags = summary ? [...summary.heroBadge, ...(summary.additionalBadges ?? [])] : [project.typeLabel];

    const sections = [
        { id: 'overview', label: 'Overview' },
        ...(summary?.highlights.length ? [{ id: 'scope', label: 'Engineering scope' }] : []),
        ...(people.length ? [{ id: 'people', label: 'People' }] : []),
    ];

    return (
        <div className="bg-white">
            {/* Project Header */}
            <section className="relative bg-navy text-white">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
                <div className="container-custom py-12 lg:py-16">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: project.title }]} />

                    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-8">
                            <ul className="mb-5 flex flex-wrap gap-2" aria-label="Tags">
                                {tags.map((tag, idx) => (
                                    <li key={idx} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-300 ring-1 ring-white/15">{tag}</li>
                                ))}
                            </ul>
                            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                                {project.title}
                            </h1>
                            <p className="mt-4 flex flex-wrap items-center gap-x-3 text-lg text-slate-300">
                                <span className="font-semibold text-white">{project.teamId}</span>
                                <span aria-hidden="true" className="text-slate-500">•</span>
                                <span>{project.typeLabel}</span>
                            </p>
                            <div className="mt-8">
                                <Link
                                    href={project.cta.primaryHref}
                                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                                >
                                    {project.cta.primaryLabel}
                                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        {summary && (
                            <div className="rounded-2xl bg-white p-6 text-gray-900 lg:col-span-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                                    <StatusBadge status={summary.status} />
                                </div>
                                <ProgressBar value={summary.overallPercentage} showPercentage={false} />
                                <p className="mt-3 text-3xl font-bold tracking-tight">{summary.overallPercentage}%<span className="ml-2 text-sm font-normal text-gray-500">Complete</span></p>
                                {people.length > 0 && (
                                    <p className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                        <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                                        {people.length} candidates
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {sections.length > 1 && <InPageNav items={sections} />}

            {/* Overview */}
            <section id="overview" className="scroll-mt-32 py-16 lg:py-20" aria-labelledby="overview-heading">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <SectionHeading id="overview-heading" eyebrow="Overview" title="About this project" />
                        <div className="space-y-5">
                            {paragraphs.map((paragraph, idx) => (
                                <p key={idx} className="text-lg leading-relaxed text-gray-700">{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Engineering scope, from the project's highlights */}
            {summary && summary.highlights.length > 0 && (
                <section id="scope" className="scroll-mt-32 bg-surface py-16 lg:py-20" aria-labelledby="scope-heading">
                    <div className="container-custom">
                        <SectionHeading id="scope-heading" eyebrow="Engineering scope" title="Key Highlights" />
                        <ol className="grid gap-4 md:grid-cols-2">
                            {summary.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{idx + 1}</span>
                                    <span className="leading-relaxed text-gray-700">{highlight}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* People */}
            {people.length > 0 && (
                <section id="people" className="scroll-mt-32 py-16 lg:py-20" aria-labelledby="people-heading">
                    <div className="container-custom">
                        <SectionHeading
                            id="people-heading"
                            eyebrow="People"
                            title="Candidates"
                            intro={people.length > PEOPLE_PREVIEW ? `Most recently updated ${PEOPLE_PREVIEW} of ${people.length} candidates.` : undefined}
                            action={
                                <Link href={`/projects/${projectSlug}/candidates`} className="inline-flex items-center gap-1 rounded font-semibold text-primary hover:text-primary-hover">
                                    View all candidates <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            }
                        />
                        <CandidateTable
                            candidates={preview.map((p) => p.candidate)}
                            submissions={preview.map((p) => p.submission).filter(Boolean) as any[]}
                            baseUrl={`/projects/${projectSlug}/candidates`}
                        />
                        <CandidateCard
                            candidates={preview.map((p) => p.candidate)}
                            submissions={preview.map((p) => p.submission).filter(Boolean) as any[]}
                            baseUrl={`/projects/${projectSlug}/candidates`}
                        />
                    </div>
                </section>
            )}

            {!people.length && (
                <section className="pb-16">
                    <div className="container-custom">
                        <p className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                            No candidate profiles are published for this project yet.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
