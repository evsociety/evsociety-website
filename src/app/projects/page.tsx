import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { getAllProjects } from '@/lib/projects-dal';
import StatusBadge from '@/components/programs/StatusBadge';

export const metadata = {
    title: 'EV Projects | EV Society™',
    description: 'Real-world EV engineering projects built by student teams and professionals. Each project tracks milestones, artifacts, reviews, approvals, and certificate eligibility.',
};

export default async function ProjectsPage() {
    const projectsData = await getAllProjects();

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-16">
                <div className="container-custom">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl md:text-4xl font-black mb-4 text-white">
                            {projectsData.label}
                        </h1>
                        <p className="text-xl text-blue-50 leading-relaxed">
                            {projectsData.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-12">
                <div className="container-custom">
                    {projectsData.projects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No projects available at this time.</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                            {projectsData.projects.map((project) => (
                                <div
                                    key={project.projectId}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    {project.heroBadge.map((badge, idx) => (
                                                        <span key={idx} className="inline-block px-3 py-1 bg-blue-50 text-primary text-xs font-semibold rounded-full">
                                                            {badge}
                                                        </span>
                                                    ))}
                                                    {project.additionalBadges?.map((badge, idx) => (
                                                        <span key={idx} className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                    {project.title}
                                                </h2>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="font-medium">{project.teamId}</span>
                                                    <span className="text-gray-400">•</span>
                                                    <span>{project.typeLabel}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            {project.shortDescription}
                                        </p>

                                        {/* Highlights */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Highlights</h3>
                                            <ul className="space-y-2">
                                                {project.highlights.map((highlight, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Status & Progress */}
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                                <StatusBadge status={project.status} />
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${project.overallPercentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{project.overallPercentage}% Complete</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/projects/${project.projectId}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                View Project
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/projects/${project.projectId}/candidates`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                Candidates
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
