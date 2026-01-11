import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import {
    Zap,
    Battery,
    ShieldCheck,
    Factory,
    Globe,
    Cpu,
    Recycle,
    Settings,
    Car,
    Users
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Focus Areas',
    description: 'Explore the EV Society™ focus areas including electric vehicles, battery technology, charging infrastructure, EV safety, standards, and sustainability.',
    alternates: {
        canonical: '/domains',
    },
};

const focusAreas = [
    {
        name: 'Electric two- and three-wheelers',
        icon: Zap,
    },
    {
        name: 'Electric passenger and commercial vehicles',
        icon: Car,
    },
    {
        name: 'Electric public transport and fleet electrification',
        icon: Users,
    },
    {
        name: 'Charging infrastructure and smart grids',
        icon: Settings,
    },
    {
        name: 'Battery technology and energy storage',
        icon: Battery,
    },
    {
        name: 'EV safety, standards, testing, and compliance',
        icon: ShieldCheck,
    },
    {
        name: 'Digitalization, AI, and data analytics for EVs',
        icon: Cpu,
    },
    {
        name: 'Recycling, circular economy, and sustainability',
        icon: Recycle,
    }
];

export default function DomainsPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Our Focus Areas"
                description="We prioritize sectors that drive the maximum impact for sustainable mobility transition."
                breadcrumb="Focus Areas"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {focusAreas.map((area) => (
                            <div key={area.name} className="group p-8 rounded-3xl bg-surface hover:bg-white border border-transparent hover:border-gray-200 transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <area.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug">{area.name}</h3>
                                <p className="text-gray-500 text-sm font-medium mt-auto transition-colors group-hover:text-primary">
                                    Technical Working Group
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-surface">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 max-w-2xl mx-auto leading-tight">
                        Advancing Electric Mobility—Innovation, Sustainability, Mobility.
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join our focused technical committees and contribute to the evolution of zero-emission transportation.
                    </p>
                    <a href="/join" className="btn-primary inline-flex">
                        Become a Contributor
                    </a>
                </div>
            </section>
        </div>
    );
}
