import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectCandidate, getProjectSubmission, getProject } from '@/lib/projects-dal';
import { Document } from '@/types/evto';
import StatusBadge from '@/components/programs/StatusBadge';
import ProgressBar from '@/components/programs/ProgressBar';
import DocumentList from '@/components/programs/DocumentList';
import { FileText, Linkedin, MapPin, Calendar, Shield, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ projectSlug: string; candidateId: string }> }): Promise<Metadata> {
    const { projectSlug, candidateId } = await params;
    const candidate = await getProjectCandidate(projectSlug, candidateId);
    const project = await getProject(projectSlug);

    if (!candidate || !project) {
        return {
            title: 'Candidate Not Found | EV Society™',
            description: 'The requested candidate profile could not be found.',
        };
    }

    // Title: EV Society™ | {Project Title} (matching EVTO pattern)
    // Description: Candidate Name - Designation
    return {
        title: {
            absolute: `EV Society™ | ${project.title}`
        },
        description: `${candidate.fullName} - ${candidate.designation}`,
        openGraph: {
            title: `EV Society™ | ${project.title}`,
            description: `${candidate.fullName} - ${candidate.designation}`,
            images: candidate.profileImageUrl ? [candidate.profileImageUrl] : [],
        },
    };
}

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

    // Count documents
    let approvedDocsCount = 0;
    let totalRequiredDocs = 0;

    if (submission?.stages) {
        for (const stage of submission.stages) {
            for (const doc of stage.documents) {
                if (doc.required) {
                    totalRequiredDocs++;
                    if (doc.status === 'approved' || doc.status === 'certificate-approved') {
                        approvedDocsCount++;
                    }
                }
            }
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-custom py-8">
                    <nav className="flex mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/projects" className="hover:text-primary">Projects</Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <Link href={`/projects/${projectSlug}`} className="hover:text-primary">{project.title}</Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <Link href={`/projects/${projectSlug}/candidates`} className="hover:text-primary">Candidates</Link>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-xs">{candidate.fullName}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-6">
                        <Link
                            href={`/projects/${projectSlug}/candidates`}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Candidates
                        </Link>
                        <Link
                            href={`/projects/${projectSlug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Back to Project
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                                {candidate.profileImageUrl ? (
                                    <Image
                                        src={candidate.profileImageUrl}
                                        alt={candidate.fullName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400">
                                        {candidate.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{candidate.fullName}</h1>
                                    <p className="text-lg text-gray-600 mb-2">{candidate.designation}</p>
                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {candidate.location}
                                    </div>
                                    <div className="flex space-x-3">
                                        {candidate.resumeUrl && (
                                            <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                <FileText className="w-4 h-4 mr-2 text-red-500" />
                                                Resume
                                            </a>
                                        )}
                                        {candidate.linkedinUrl && (
                                            <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                <Linkedin className="w-4 h-4 mr-2 text-[#0077b5]" />
                                                LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[300px]">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-500">Overall Status</span>
                                        <StatusBadge status={overallStatus} />
                                    </div>
                                    <ProgressBar value={progress} className="mb-2" showPercentage={false} />
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                                        </div>
                                        <div className="text-xs text-gray-500 text-right">
                                            <div>{approvedDocsCount}/{totalRequiredDocs} Required Docs</div>
                                            <div className="flex items-center mt-1 text-gray-400">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Updated {submission?.lastUpdated}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Status Legend */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900 whitespace-nowrap">Status Legend</h3>
                        <div className="flex flex-wrap gap-3">
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

                <div className="space-y-6">
                    {/* Eligibility Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-600" />
                            Eligibility & Prerequisites
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                {candidate.eligibility.architecturalDesignExperience ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                                )}
                                <span className="text-sm text-gray-700">Architectural Design Experience</span>
                            </div>
                            <div className="flex items-start">
                                {candidate.eligibility.managerialLeadershipExperience ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                                )}
                                <span className="text-sm text-gray-700">Managerial Leadership Experience</span>
                            </div>
                            {candidate.eligibility.notes && (
                                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                                    <strong>Note:</strong> {candidate.eligibility.notes}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stage Progress */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Project Progress</h2>
                        <div className="space-y-4">
                            {submission?.stages.map((stage) => (
                                <div key={stage.stageId} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{stage.title}</h3>
                                                <p className="text-sm text-gray-500">Stage Progress: {stage.percentage}%</p>
                                            </div>
                                            <div className="w-24">
                                                <ProgressBar value={stage.percentage} showPercentage={false} />
                                            </div>
                                        </div>
                                        <DocumentList documents={stage.documents} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
