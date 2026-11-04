import type { Metadata } from 'next';
import CandidatesList from '../../../../components/programs/CandidatesList';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getAllCandidates, getAllSubmissions } from '../../../../lib/evto-dal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'EVTO™ Candidates',
    description: 'Engineering Leaders Enrolled in Certification',
    alternates: {
        canonical: '/programs/evto/candidates',
    },
};

export default async function CandidatesPage() {
    const allCandidates = await getAllCandidates();
    const allSubmissions = await getAllSubmissions();

    return (
        <div className="min-h-screen bg-surface pb-20">
            <section className="bg-navy text-white">
                <div className="container-custom py-12 lg:py-16">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'EVTO™ Program', href: '/programs/evto' }, { label: 'Candidates' }]} />
                    <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white md:text-4xl">EVTO™ Candidates</h1>
                    <p className="mt-3 text-lg text-slate-300">Engineering Leaders Enrolled in Certification</p>
                </div>
            </section>

            <div className="container-custom pt-10">
                <CandidatesList candidates={allCandidates} submissions={allSubmissions} />
            </div>
        </div>
    );
}
