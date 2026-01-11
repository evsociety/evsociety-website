import PageHeader from '@/components/PageHeader';
import { Target, ShieldCheck, Zap, Users } from 'lucide-react';

const objectives = [
    "Promote electric mobility awareness across all strata of society",
    "Support EV research, design, testing, validation & safety protocols",
    "Act as a neutral knowledge-sharing platform for industry, academia, and startups",
    "Strengthen national standards, compliance, and certification readiness (AIS, ISO)",
    "Enable skills, training, and competency-based certifications for the workforce",
    "Support startups and MSMEs via mentorship, expert access, and industry pathways",
    "Promote sustainability, circular economy, and responsible battery lifecycle practices"
];

export default function VisionMissionPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Vision, Mission & Objectives"
                description="The EV Society™ roadmap for a safe and sustainable transition to electric mobility."
                breadcrumb="Vision & Mission"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="bg-blue-50/50 p-10 rounded-3xl border border-blue-100">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20">
                                <Target className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 uppercase tracking-tight">Our Vision</h2>
                            <p className="text-2xl text-gray-700 font-medium leading-relaxed italic">
                                “To accelerate the transition to sustainable, affordable, and indigenous electric mobility by fostering innovation, skill development, public awareness, and policy engagement—supporting energy security, environmental stewardship, and inclusive economic growth.”
                            </p>
                        </div>

                        <div className="bg-green-50/50 p-10 rounded-3xl border border-green-100">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white mb-8 shadow-lg shadow-green-600/20">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 uppercase tracking-tight">Our Mission</h2>
                            <ul className="space-y-4">
                                {[
                                    "Promote electric mobility adoption across all transport segments",
                                    "Enable research, innovation, and indigenization of EV technologies",
                                    "Build skilled manpower for the EV ecosystem",
                                    "Act as a knowledge, policy, and industry interface",
                                    "Encourage sustainable and ethical mobility practices"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                                        <span className="text-gray-700 font-semibold">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-surface">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Core Objectives</h2>
                        <div className="grid gap-6">
                            {[
                                "Promote electric mobility awareness",
                                "Support EV research, design, testing, and safety",
                                "Act as a knowledge-sharing platform (industry–academia–startups)",
                                "Enable skill development and certification programs",
                                "Provide technical inputs to policy and standards initiatives",
                                "Support startups, MSMEs, and innovators",
                                "Drive a strong focus on standards, reliability, and quality—critical for EV safety"
                            ].map((obj, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary font-bold shrink-0 border border-gray-100">
                                        {i + 1}
                                    </div>
                                    <p className="text-lg text-gray-700 font-medium">{obj}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container-custom text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 underline decoration-primary decoration-4 underline-offset-8">Aligned with National Priorities</h3>
                    <div className="flex flex-wrap justify-center gap-6 mt-12 opacity-50">
                        {["FAME-II", "PLI Schemes", "Niti Aayog", "AIS Standards"].map(tag => (
                            <span key={tag} className="px-6 py-2 bg-gray-100 rounded-full font-bold text-gray-600 grayscale uppercase tracking-widest text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
