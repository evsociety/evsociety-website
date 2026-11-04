import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCandidatesWithSubmissions, getProject } from '@/lib/projects-dal';
import CandidatesList from '@/components/programs/CandidatesList';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ projectSlug: string }> }): Promise<Metadata> {
    const { projectSlug } = await params;
    const project = await getProject(projectSlug);
    if (!project) return { title: 'Project Not Found' };
    return {
        title: `${project.title} - Candidates`,
        description: 'Student engineers working on this project',
        alternates: { canonical: `/projects/${projectSlug}/candidates` },
    };
}

export default async function ProjectCandidatesPage({ params }: { params: Promise<{ projectSlug: string }> }) {
    const { projectSlug } = await params;
    const project = await getProject(projectSlug);

    if (!project) {
        notFound();
    }

    const candidatesWithSubmissions = await getAllCandidatesWithSubmissions(projectSlug);

    return (
        <div className="min-h-screen bg-surface pb-20">
            <section className="bg-navy text-white">
                <div className="container-custom py-12 lg:py-16">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: project.title, href: `/projects/${projectSlug}` }, { label: 'Candidates' }]} />
                    <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{`${project.title} - Candidates`}</h1>
                    <p className="mt-3 text-lg text-slate-300">Student engineers working on this project</p>
                </div>
            </section>

            <div className="container-custom pt-10">
                <CandidatesList
                    candidates={candidatesWithSubmissions.map(c => c.candidate)}
                    submissions={candidatesWithSubmissions.map(c => c.submission).filter(Boolean) as any[]}
                    baseUrl={`/projects/${projectSlug}/candidates`}
                />
            </div>
        </div>
    );
}
