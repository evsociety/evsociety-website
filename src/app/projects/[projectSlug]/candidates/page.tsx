import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCandidatesWithSubmissions, getProject } from '@/lib/projects-dal';
import SectionHeader from '@/components/programs/SectionHeader';
import CandidatesList from '@/components/programs/CandidatesList';

export const dynamic = 'force-dynamic';

export default async function ProjectCandidatesPage({ params }: { params: Promise<{ projectSlug: string }> }) {
    const { projectSlug } = await params;
    const project = await getProject(projectSlug);

    if (!project) {
        notFound();
    }

    const candidatesWithSubmissions = await getAllCandidatesWithSubmissions(projectSlug);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="flex mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
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
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <Link href={`/projects/${projectSlug}`} className="hover:text-primary">
                                    {project.title}
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <span className="text-gray-900 font-medium">Candidates</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <SectionHeader
                    title={`${project.title} - Candidates`}
                    subtitle="Student engineers working on this project"
                />

                <CandidatesList
                    candidates={candidatesWithSubmissions.map(c => c.candidate)}
                    submissions={candidatesWithSubmissions.map(c => c.submission).filter(Boolean) as any[]}
                    baseUrl={`/projects/${projectSlug}/candidates`}
                />
            </div>
        </div>
    );
}
