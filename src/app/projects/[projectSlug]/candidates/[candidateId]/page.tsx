import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectCandidate, getProjectSubmission, getProject } from '@/lib/projects-dal';
import StatusBadge from '@/components/programs/StatusBadge';
import ProgressBar from '@/components/programs/ProgressBar';
import DocumentList from '@/components/programs/DocumentList';
import { FileText, Linkedin, MapPin, Calendar, Shield, AlertTriangle, CheckCircle, ArrowLeft, Award } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ projectSlug: string; candidateId: string }> }): Promise<Metadata> {
    const { projectSlug, candidateId } = await params;
    const candidate = await getProjectCandidate(projectSlug, candidateId);
    const project = await getProject(projectSlug);
    const submission = await getProjectSubmission(projectSlug, candidateId);

    if (!candidate || !project) {
        return {
            title: 'Candidate Not Found | EV Society™',
            description: 'The requested candidate profile could not be found.',
        };
    }
    const hasCertificate = submission?.certificateIssued && submission?.certificatePath;
    const metaTitle = hasCertificate
        ? `Certificate of Completion - ${candidate.fullName} | EV Society™`
        : `EV Society™ | ${project.title}`;
    const metaDescription = hasCertificate
        ? `View ${candidate.fullName}'s Certificate of Completion for ${project.title}`
        : `${candidate.fullName} - ${candidate.designation}`;

    // Title: EV Society™ | {Project Title} (matching EVTO pattern)
    // Description: Candidate Name - Designation
    return {
        title: {
            absolute: metaTitle
        },
        description: metaDescription,
        alternates: {
            canonical: `/projects/${projectSlug}/candidates/${candidateId}`,
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            images: candidate.profileImageUrl ? [candidate.profileImageUrl] : [],
        },
    };
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default async function ProjectCandidateProfilePage({ params }: { params: Promise<{ projectSlug: string; candidateId: string }> }) {
    const { projectSlug, candidateId } = await params;
    const candidate = await getProjectCandidate(projectSlug, candidateId);
    const submission = await getProjectSubmission(projectSlug, candidateId);
    const project = await getProject(projectSlug);

    if (!candidate || !project) {
        notFound();
    }

    const overallStatus = submission?.overallStatus || 'not-started';
    const progress = submission?.overallPercentage || 0;
    const stages = submission?.stages ?? [];

    // Count documents
    let approvedDocsCount = 0;
    let totalRequiredDocs = 0;

    for (const stage of stages) {
        for (const doc of stage.documents) {
            if (doc.required) {
                totalRequiredDocs++;
                if (doc.status === 'approved' || doc.status === 'certificate-approved' || (doc.status as string) === 'completed') {
                    approvedDocsCount++;
                }
            }
        }
    }

    const secondaryButton = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 motion-reduce:transition-none';

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* Header */}
            <section className="bg-navy text-white">
                <div className="container-custom py-10 lg:py-14">
                    <Breadcrumbs items={[{ label: 'Projects', href: '/projects' }, { label: project.title, href: `/projects/${projectSlug}` }, { label: 'Candidates', href: `/projects/${projectSlug}/candidates` }, { label: candidate.fullName }]} />

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        <Link href={`/projects/${projectSlug}/candidates`} className={secondaryButton}>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back to Candidates
                        </Link>
                        <Link href={`/projects/${projectSlug}`} className={secondaryButton}>
                            Back to Project
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center lg:col-span-7">
                            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-white/10">
                                {candidate.profileImageUrl ? (
                                    <Image
                                        src={candidate.profileImageUrl}
                                        alt={candidate.fullName}
                                        fill
                                        sizes="112px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-navy-raised text-3xl font-bold text-primary-300">
                                        {initials(candidate.fullName)}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="mb-2 text-3xl font-bold leading-tight text-white">{candidate.fullName}</h1>
                                <p className="mb-2 text-lg text-slate-300">{candidate.designation}</p>
                                <p className="mb-5 flex items-center gap-1 text-sm text-slate-400">
                                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    {candidate.location}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.resumeUrl && (
                                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                                            <FileText className="h-4 w-4" aria-hidden="true" />
                                            Resume
                                            <span className="sr-only"> (opens in a new tab)</span>
                                        </a>
                                    )}
                                    {candidate.linkedinUrl && (
                                        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                                            <Linkedin className="h-4 w-4" aria-hidden="true" />
                                            LinkedIn
                                            <span className="sr-only"> (opens in a new tab)</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 text-gray-900 lg:col-span-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-gray-600">Overall Status</span>
                                <StatusBadge status={overallStatus} />
                            </div>
                            <ProgressBar value={progress} className="mb-3" showPercentage={false} />
                            <div className="flex items-end justify-between gap-4">
                                <span className="text-3xl font-bold tracking-tight">{progress}%</span>
                                <div className="text-right text-xs text-gray-600">
                                    <div>{approvedDocsCount}/{totalRequiredDocs} Required Docs</div>
                                    <div className="mt-1 flex items-center justify-end gap-1 text-gray-500">
                                        <Calendar className="h-3 w-3" aria-hidden="true" />
                                        Updated {submission?.lastUpdated}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-custom grid gap-8 pt-10 lg:grid-cols-12">
                {/* Stage index */}
                {stages.length > 0 && (
                    <nav aria-label="Project stages" className="min-w-0 lg:col-span-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-28">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Project Progress</p>
                            <ol className="space-y-1">
                                {stages.map((stage) => (
                                    <li key={stage.stageId}>
                                        <a href={`#stage-${stage.stageId}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-surface hover:text-primary">
                                            <span className="truncate">{stage.title}</span>
                                            <span className={`shrink-0 text-xs font-semibold ${stage.percentage === 100 ? 'text-green-700' : 'text-gray-500'}`}>{stage.percentage}%</span>
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </nav>
                )}

                <div className={`min-w-0 space-y-6 ${stages.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
                    {/* Certificate Banner */}
                    {submission?.certificateIssued && submission?.certificatePath && (
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-start gap-3">
                                    <Award className="mt-0.5 h-6 w-6 shrink-0 text-green-700" aria-hidden="true" />
                                    <div>
                                        <h2 className="mb-1 text-xl font-bold text-green-900">Certificate of Completion</h2>
                                        <p className="text-sm text-green-900">Congratulations to <strong>{candidate.fullName}</strong> for successfully completing the {project.title} project!</p>
                                    </div>
                                </div>
                                <a
                                    href={submission.certificatePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-green-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-green-800 motion-reduce:transition-none"
                                >
                                    <FileText className="h-4 w-4" aria-hidden="true" />
                                    View/Download Certificate
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Status Legend */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <h2 className="whitespace-nowrap text-lg font-bold text-gray-900">Status Legend</h2>
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge status="not-started" size="sm" />
                                <StatusBadge status="draft" size="sm" />
                                <StatusBadge status="submitted" size="sm" />
                                <StatusBadge status="need-more-details" size="sm" />
                                <StatusBadge status="in-review" size="sm" />
                                <StatusBadge status="rejected" size="sm" />
                                <StatusBadge status="approved" size="sm" />
                                <StatusBadge status="certificate-approved" size="sm" />
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                            <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                            Eligibility & Prerequisites
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                {candidate.eligibility.architecturalDesignExperience ? (
                                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" role="img" aria-label="Met" />
                                ) : (
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" role="img" aria-label="Not yet met" />
                                )}
                                <span className="text-sm text-gray-700">Architectural Design Experience</span>
                            </li>
                            <li className="flex items-start gap-3">
                                {candidate.eligibility.managerialLeadershipExperience ? (
                                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" role="img" aria-label="Met" />
                                ) : (
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" role="img" aria-label="Not yet met" />
                                )}
                                <span className="text-sm text-gray-700">Managerial Leadership Experience</span>
                            </li>
                        </ul>
                        {candidate.eligibility.notes && (
                            <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50 p-3 text-sm text-gray-800">
                                <strong>Note:</strong> {candidate.eligibility.notes}
                            </div>
                        )}
                    </div>

                    {/* Stage Progress */}
                    <div>
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Project Progress</h2>
                        <div className="space-y-4">
                            {stages.map((stage) => (
                                <section key={stage.stageId} id={`stage-${stage.stageId}`} className="scroll-mt-32 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="mb-1 text-lg font-bold text-gray-900">{stage.title}</h3>
                                                <p className="text-sm text-gray-600">Stage Progress: {stage.percentage}%</p>
                                            </div>
                                            <div className="w-24 shrink-0 pt-2">
                                                <ProgressBar value={stage.percentage} showPercentage={false} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Full-width list below the header, matching the EVTO pillar layout */}
                                    <div className="border-t border-gray-100">
                                        <DocumentList documents={stage.documents} />
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
