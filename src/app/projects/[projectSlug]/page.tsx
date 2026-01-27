import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { getProject } from '@/lib/projects-dal';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectSlug: string }> }) {
    const { projectSlug } = await params;
    const project = await getProject(projectSlug);

    if (!project) {
        notFound();
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/" className="hover:text-primary">Home</Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <Link href="/projects" className="hover:text-primary">Projects</Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <span className="text-gray-900 font-medium">{project.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Project Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-primary text-xs font-semibold rounded-full mb-4">
                            {project.typeLabel}
                        </span>
                        <h1 className="text-4xl font-black text-gray-900 mb-3">
                            {project.title}
                        </h1>
                        <p className="text-lg text-gray-600 font-medium">
                            {project.teamId}
                        </p>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {project.description}
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="flex justify-center mb-12">
                    <Link
                        href={project.cta.primaryHref}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
                    >
                        {project.cta.primaryLabel}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
