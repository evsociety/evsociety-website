import Link from 'next/link';
import { ArrowRight, Battery, Zap, Shield } from 'lucide-react';

const programs = [
    {
        title: 'Battery Safety & Fire Prevention',
        description: 'A dedicated initiative focusing on cell testing, thermal runaway mitigation, and standardizing pack design for safety.',
        icon: Battery,
        link: '/programs',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
    },
    {
        title: 'Charging & Interoperability',
        description: 'Promoting universal charging standards (CCS2, CHAdeMO) and software interoperability for a seamless nationwide network.',
        icon: Zap,
        link: '/programs',
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
    },
    {
        title: 'EV Software & Cybersecurity',
        description: 'Setting benchmarks for OTA updates, data privacy, and embedded security in connected vehicle architectures.',
        icon: Shield,
        link: '/programs',
        bgColor: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
    },
];

export default function FeaturedPrograms() {
    return (
        <section className="py-24 bg-surface">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Featured Programs</h2>
                        <p className="text-xl text-gray-600 max-w-xl">
                            High-priority technical programs driving immediate impact in the automotive industry.
                        </p>
                    </div>
                    <Link href="/programs" className="text-primary font-bold inline-flex items-center hover:translate-x-1 transition-transform">
                        View all programs <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {programs.map((program) => (
                        <div key={program.title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col h-full">
                            <div className={`w-14 h-14 ${program.bgColor} ${program.iconColor} rounded-2xl flex items-center justify-center mb-8`}>
                                <program.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{program.title}</h3>
                            <p className="text-gray-600 mb-8 flex-grow">
                                {program.description}
                            </p>
                            <Link href={program.link} className="flex items-center text-primary font-semibold hover:gap-2 transition-all">
                                Learn more <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
