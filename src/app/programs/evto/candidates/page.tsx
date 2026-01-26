import Link from 'next/link';
import SectionHeader from '../../../../components/programs/SectionHeader';
import CandidatesList from '../../../../components/programs/CandidatesList';
import { getAllCandidates, getAllSubmissions } from '../../../../lib/evto-dal';

export const dynamic = 'force-dynamic';

export default async function CandidatesPage() {
    const allCandidates = await getAllCandidates();
    const allSubmissions = await getAllSubmissions();

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container-custom">
                <div className="mb-8">
                    <nav className="flex mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/" className="hover:text-primary">Home</Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <Link href="/programs/evto" className="hover:text-primary">EVTO™ Program</Link>
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
                    <SectionHeader title="EVTO™ Candidates" subtitle="Engineering Leaders Enrolled in Certification" />
                </div>

                <CandidatesList candidates={allCandidates} submissions={allSubmissions} />
            </div>
        </div>
    );
}
