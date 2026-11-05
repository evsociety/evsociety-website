import Link from 'next/link';
import { ArrowRight, Battery, Zap, Shield } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const programs = [
    {
        title: 'Battery Safety & Fire Prevention',
        description: 'A dedicated initiative focusing on cell testing, thermal runaway mitigation, and standardizing flight-critical battery pack design for safety.',
        icon: Battery,
        link: '/programs',
    },
    {
        title: 'Charging & Interoperability',
        description: 'Promoting interoperable high-power charging standards and vertiport energy infrastructure for a seamless nationwide air mobility network.',
        icon: Zap,
        link: '/programs',
    },
    {
        title: 'Electric Vertical Software & Cybersecurity',
        description: 'Setting benchmarks for OTA updates, data privacy, and embedded security in connected eVTOL aircraft architectures.',
        icon: Shield,
        link: '/programs',
    },
];

export default function FeaturedPrograms() {
    return (
        <section className="bg-white py-20 lg:py-24" aria-labelledby="featured-programs-heading">
            <div className="container-custom">
                <SectionHeading
                    id="featured-programs-heading"
                    eyebrow="Technology programs"
                    title="Featured Programs"
                    intro="High-priority technical programs driving immediate impact in the Electric Vertical (eVTOL) and aerospace industry."
                    action={
                        <Link href="/programs" className="inline-flex items-center gap-2 rounded font-semibold text-primary hover:text-primary-hover">
                            View all programs <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    }
                />

                <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {programs.map((program) => (
                        <li key={program.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-primary-300">
                                <program.icon className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h3 className="mt-7 text-2xl font-bold text-gray-900">{program.title}</h3>
                            <p className="mt-4 flex-grow leading-relaxed text-gray-600">
                                {program.description}
                            </p>
                            <Link href={program.link} className="mt-8 inline-flex w-fit items-center gap-2 rounded font-semibold text-primary hover:text-primary-hover">
                                Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">about {program.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
