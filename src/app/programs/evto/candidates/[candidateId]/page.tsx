import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCandidate, getSubmission } from '../../../../../lib/evto-dal';
import StatusBadge from '../../../../../components/programs/StatusBadge';
import ProgressBar from '../../../../../components/programs/ProgressBar';
import PillarAccordion from '../../../../../components/programs/PillarAccordion';
import { computeProgress } from '../../../../../utils/evtoStatus';
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
        openGraph: {
            title: 'EV Society™ | EVTO™ Program',
            description: `${candidate.fullName} - ${candidate.designation}`,
            images: candidate.profileImageUrl ? [candidate.profileImageUrl] : [],
        },
    };
}

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
    const progress = computeProgress(allDocs);
    const approvedDocsCount = allDocs.filter(d => d.required && (d.status === 'approved' || d.status === 'certificate-approved')).length;
    const totalRequiredDocs = allDocs.filter(d => d.required).length;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container-custom py-8">
                    <nav className="flex mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/programs/evto" className="hover:text-primary">EVTO™ Program</Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <Link href="/programs/evto/candidates" className="hover:text-primary">Candidates</Link>
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
                                            <span className="text-3xl font-bold text-gray-900">{progress}%</span>
                                            <span className="text-sm text-gray-500 ml-1">Complete</span>
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
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
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

                        {/* Submission Tracker */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Tracker</h2>
                            <div className="space-y-4">
                                {submission?.pillars.map((pillar) => (
                                    <PillarAccordion key={pillar.pillarId} pillar={pillar} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {/* Status Legend */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Status Legend</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Document Approved</span>
                                    <StatusBadge status="approved" size="sm" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Pending Review</span>
                                    <StatusBadge status="submitted" size="sm" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Revision Needed</span>
                                    <StatusBadge status="need-more-details" size="sm" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Not Started</span>
                                    <StatusBadge status="not-started" size="sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
