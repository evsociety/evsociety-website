import type { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { getAllProjects } from '@/lib/projects-dal';
import StatusBadge from '@/components/programs/StatusBadge';
import ProgressBar from '@/components/programs/ProgressBar';
import ProjectActions from '@/components/projects/ProjectActions';
import { getStatusLabel } from '@/utils/evtoStatus';

export const metadata: Metadata = {
    // The title already names the site, so skip the layout's "| EV Society™" template
    title: { absolute: 'EV Projects | EV Society™' },
    description: 'Real-world EV engineering projects built by student teams and professionals. Each project tracks milestones, artifacts, reviews, approvals, and certificate eligibility.',
    alternates: {
        canonical: '/projects',
    },
};

export default async function ProjectsPage() {
    const projectsData = await getAllProjects();
    const projects = projectsData.projects;

    // Portfolio summary computed from the project records
    const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-surface">
            {/* Hero Section */}
            <section className="relative bg-navy text-white">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
                <div className="container-custom py-14 lg:py-20">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
                        Projects
                    </p>
                    <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
                        {projectsData.label}
                    </h1>
                    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
                        {projectsData.description}
                    </p>
                    {projects.length > 0 && (
                        <dl className="mt-10 flex flex-wrap gap-3">
                            <div className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/15">
                                <dt className="sr-only">Projects</dt>
                                <dd className="text-sm font-semibold text-white">{projects.length} projects</dd>
                            </div>
                            {Object.entries(statusCounts).map(([status, count]) => (
                                <div key={status} className="rounded-full px-4 py-2 ring-1 ring-white/15">
                                    <dt className="sr-only">Status</dt>
                                    <dd className="text-sm text-slate-300">{count} {getStatusLabel(status as Parameters<typeof getStatusLabel>[0])}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </section>

            {/* Projects */}
            <section className="py-12 lg:py-16" aria-label="Research portfolio">
                <div className="container-custom">
                    {projects.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                            <p className="text-gray-600">No projects available at this time.</p>
                        </div>
                    ) : (
                        <ul className="space-y-6">
                            {projects.map((project) => (
                                <li key={project.projectId}>
                                    <article className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white lg:grid-cols-12">
                                        <div className="flex flex-col p-6 sm:p-8 lg:col-span-7 lg:p-10">
                                            <ul className="mb-4 flex flex-wrap gap-2" aria-label="Tags">
                                                {project.heroBadge.map((badge, idx) => (
                                                    <li key={idx} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                                                        {badge}
                                                    </li>
                                                ))}
                                                {project.additionalBadges?.map((badge, idx) => (
                                                    <li key={`extra-${idx}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                        {badge}
                                                    </li>
                                                ))}
                                            </ul>
                                            <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                                                {project.title}
                                            </h2>
                                            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">{project.teamId}</span>
                                                <span aria-hidden="true" className="text-gray-300">•</span>
                                                <span>{project.typeLabel}</span>
                                            </p>
                                            <p className="mt-5 leading-relaxed text-gray-600">
                                                {project.shortDescription}
                                            </p>

                                            {/* Status & Progress */}
                                            <div className="mt-6 rounded-2xl bg-surface p-5">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                                                    <StatusBadge status={project.status} />
                                                </div>
                                                <ProgressBar value={project.overallPercentage} showPercentage={false} />
                                                <p className="mt-2 text-xs text-gray-600">{project.overallPercentage}% Complete</p>
                                            </div>

                                            <div className="mt-auto pt-8">
                                                <ProjectActions projectId={project.projectId} />
                                            </div>
                                        </div>

                                        {/* Highlights */}
                                        <div className="border-t border-gray-100 bg-surface/60 p-6 sm:p-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:p-10">
                                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Key Highlights</h3>
                                            <ul className="space-y-3">
                                                {project.highlights.map((highlight, idx) => (
                                                    <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
                                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                                        <span>{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
