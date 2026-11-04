import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCandidate, getSubmission } from '../../../../../lib/evto-dal';
import StatusBadge from '../../../../../components/programs/StatusBadge';
import ProgressBar from '../../../../../components/programs/ProgressBar';
import PillarAccordion from '../../../../../components/programs/PillarAccordion';
import { computeProgress } from '../../../../../utils/evtoStatus';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { FileText, Linkedin, MapPin, Calendar, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ candidateId: string }> }): Promise<Metadata> {
    const { candidateId } = await params;
    const candidate = await getCandidate(candidateId);

    if (!candidate) {
        return {
            title: 'Candidate Not Found | EV Society™',
            description: 'The requested candidate profile could not be found.',
        };
    }

    // Title: EV Society™ | EVTO™ Program (as requested)
    // Description: Candidate Name - Designation
    return {
        title: {
            absolute: 'EV Society™ | EVTO™ Program'
        },
        description: `${candidate.fullName} - ${candidate.designation}`,
        alternates: {
            canonical: `/programs/evto/candidates/${candidateId}`,
        },
        openGraph: {
            title: 'EV Society™ | EVTO™ Program',
            description: `${candidate.fullName} - ${candidate.designation}`,
            images: candidate.profileImageUrl ? [candidate.profileImageUrl] : [],
        },
    };
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default async function CandidateProfilePage({ params }: { params: Promise<{ candidateId: string }> }) {
    // Unwrap params
    const { candidateId } = await params;

    const candidate = await getCandidate(candidateId);
    const submission = await getSubmission(candidateId);

    if (!candidate) {
        notFound();
    }

    const overallStatus = submission?.overallStatus || 'not-started';
    // Calculate overall progress across all pillars
    const allDocs = submission?.pillars.flatMap(p => p.documents) || [];
    const progress = submission?.overallPercentage !== undefined ? submission.overallPercentage : computeProgress(allDocs);
    const approvedDocsCount = allDocs.filter(d => d.required && (d.status === 'approved' || d.status === 'certificate-approved')).length;
    const totalRequiredDocs = allDocs.filter(d => d.required).length;
    const pillars = submission?.pillars ?? [];

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* Header */}
            <section className="bg-navy text-white">
                <div className="container-custom py-10 lg:py-14">
                    <Breadcrumbs items={[{ label: 'EVTO™ Program', href: '/programs/evto' }, { label: 'Candidates', href: '/programs/evto/candidates' }, { label: candidate.fullName }]} />

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
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                    {candidate.location}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.resumeUrl && (
                                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10">
                                            <FileText className="h-4 w-4" aria-hidden="true" />
                                            Resume
                                            <span className="sr-only"> (opens in a new tab)</span>
                                        </a>
                                    )}
                                    {candidate.linkedinUrl && (
                                        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10">
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
                {/* Pillar index */}
                {pillars.length > 0 && (
                    <nav aria-label="Pillars" className="min-w-0 lg:col-span-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-28">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Pillars</p>
                            <ol className="space-y-1">
                                {pillars.map((pillar) => {
                                    const pillarProgress = pillar.percentage !== undefined ? pillar.percentage : computeProgress(pillar.documents);
                                    return (
                                        <li key={pillar.pillarId}>
                                            <a href={`#pillar-${pillar.pillarId}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-surface hover:text-primary">
                                                <span className="truncate">{pillar.pillarId === 'pillar0' ? 'Eligibility & Prerequisites' : pillar.title}</span>
                                                <span className={`shrink-0 text-xs font-semibold ${pillarProgress === 100 ? 'text-green-700' : 'text-gray-500'}`}>{pillarProgress}%</span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </nav>
                )}

                <div className={`min-w-0 space-y-6 ${pillars.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
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

                    {/* Submission Tracker */}
                    <div>
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Submission Tracker</h2>
                        <div className="space-y-4">
                            {pillars.map((pillar) => (
                                <PillarAccordion key={pillar.pillarId} pillar={pillar} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
