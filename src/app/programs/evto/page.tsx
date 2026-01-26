import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, FileText, Download } from 'lucide-react';
import { EVTO_PROGRAM_CONFIG } from '../../../data/programs/evto/program.config';
import { getAllCandidates, getAllSubmissions } from '../../../lib/evto-dal'; // Updated import
import PillarCard from '../../../components/programs/PillarCard';
import SectionHeader from '../../../components/programs/SectionHeader';
import CandidateTable from '../../../components/programs/CandidateTable';
import CandidateCard from '../../../components/programs/CandidateCard';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'EVTO™ – Certified EV Technology Officer | EV Society™',
    description: 'Executive certification program for EV technology leadership across architecture, AI, battery, and business strategy.',
};

export default async function ProgramPage() {
    const candidates = await getAllCandidates();
    const submissions = await getAllSubmissions();

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative bg-black text-white py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="/ev-hero.jpg" // Assuming this exists or will fallback gracefully/be replaced
                        alt="EV Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-sm font-semibold border border-blue-800 mb-6">
                            Flagship Certification
                        </span>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-6 leading-tight text-white">
                            Certified EV Technology Officer <span className="font-normal">(EVTO™)</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed font-light">
                            {EVTO_PROGRAM_CONFIG.tagline}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/programs/evto/candidates"
                                className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                View Candidates <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <a
                                href={EVTO_PROGRAM_CONFIG.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            >
                                <Download className="mr-2 w-5 h-5" />
                                Download Program PDF
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why EVTO */}
            <section className="py-16 border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <SectionHeader title="Why EVTO™?" subtitle="Shaping the Future CTOs of Electric Mobility" />
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                {EVTO_PROGRAM_CONFIG.description}
                            </p>
                            <div className="space-y-4">
                                {EVTO_PROGRAM_CONFIG.roleDefinition.map((point, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <div className="mt-1 mr-3 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                                        <p className="text-gray-700">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <FileText className="w-6 h-6 text-primary mr-3" />
                                <h3 className="text-xl font-bold">Program Document</h3>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                                <div className="flex items-center">
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mr-4">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate" title={EVTO_PROGRAM_CONFIG.pdfName}>
                                            {EVTO_PROGRAM_CONFIG.pdfName}
                                        </p>
                                        <p className="text-sm text-gray-500">Updated: {EVTO_PROGRAM_CONFIG.pdfLastUpdated}</p>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={EVTO_PROGRAM_CONFIG.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-gray-900 text-white text-center rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                            >
                                View / Download
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overview Cards */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Eligibility */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-sm">01</span>
                                Eligibility
                            </h3>
                            <ul className="space-y-2 mb-4">
                                {EVTO_PROGRAM_CONFIG.eligibility.requirements.map((req, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-gray-400 italic">{EVTO_PROGRAM_CONFIG.eligibility.note}</p>
                        </div>

                        {/* Tracks */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-2 text-sm">02</span>
                                Tracks
                            </h3>
                            <div className="space-y-4">
                                {EVTO_PROGRAM_CONFIG.tracks.map((track, i) => (
                                    <div key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-semibold text-gray-900 text-sm">{track.name}</span>
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{track.duration}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{track.targetAudience}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certification */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-2 text-sm">03</span>
                                Certification
                            </h3>
                            <ul className="space-y-2">
                                {EVTO_PROGRAM_CONFIG.certificationCriteria.map((crit, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                                        {crit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pillars Grid */}
            <section className="py-16">
                <div className="container-custom">
                    <SectionHeader title="Program Structure" subtitle="5 Pillars of Excellence" className="text-center max-w-2xl mx-auto" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {EVTO_PROGRAM_CONFIG.pillars.map((pillar, idx) => (
                            <PillarCard key={pillar.id} pillar={pillar} index={idx} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Capstone */}
            <section className="py-16 bg-gray-900 text-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/20 text-yellow-300 text-sm font-semibold border border-yellow-400/30 mb-4">
                                Final Gate
                            </span>
                            <h2 className="text-3xl font-bold mb-4">Capstone Project</h2>
                            <p className="text-gray-400">{EVTO_PROGRAM_CONFIG.capstone.mandatoryNote}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold mb-4 text-blue-300">Deliverables</h3>
                                <ul className="space-y-3">
                                    {EVTO_PROGRAM_CONFIG.capstone.deliverables.map((item, i) => (
                                        <li key={i} className="flex items-center text-sm text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold mb-4 text-green-300">Evaluation Criteria</h3>
                                <ul className="space-y-3">
                                    {EVTO_PROGRAM_CONFIG.capstone.evaluationCriteria.map((item, i) => (
                                        <li key={i} className="flex items-center text-sm text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 mb-2">Example Topics:</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {EVTO_PROGRAM_CONFIG.capstone.topics.map((topic, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/10">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Candidate Preview */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Current Candidates</h2>
                            <p className="text-gray-600 mt-1">Leaders currently enrolled in the program</p>
                        </div>
                        <Link href="/programs/evto/candidates" className="text-primary hover:text-blue-700 font-medium flex items-center">
                            View All <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <CandidateTable candidates={candidates} submissions={submissions} />
                    <CandidateCard candidates={candidates} submissions={submissions} />
                </div>
            </section>
        </div>
    );
}
