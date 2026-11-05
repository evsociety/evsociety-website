import { Megaphone, ShieldAlert, FlaskConical, Terminal, GraduationCap, Rocket } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const features = [
    {
        title: 'Public Awareness',
        description: 'Educating citizens about the benefits and safety of electric vertical (eVTOL) flight through national campaigns.',
        icon: Megaphone,
    },
    {
        title: 'Safety & Standards',
        description: 'Working with regulatory bodies to refine battery and aircraft safety standards for diverse operational conditions.',
        icon: ShieldAlert,
    },
    {
        title: 'Research Enablement',
        description: 'Connecting academic research with industrial needs to accelerate innovation in cell chemistry and BMS.',
        icon: FlaskConical,
    },
    {
        title: 'Knowledge Platform',
        description: 'A shared repository for whitepapers, guidelines, and technical documentation for the Electric Vertical (eVTOL) ecosystem.',
        icon: Terminal,
    },
    {
        title: 'Skill Development',
        description: 'Developing competency-based certification programs for engineers and technicians in the Electric Vertical sector.',
        icon: GraduationCap,
    },
    {
        title: 'Startup & MSME Support',
        description: 'Providing mentorship and access to testing facilities for early-stage Electric Vertical startups.',
        icon: Rocket,
    },
];

export default function Features() {
    return (
        <section className="bg-surface py-20 lg:py-24" aria-labelledby="features-heading">
            <div className="container-custom">
                <SectionHeading
                    id="features-heading"
                    eyebrow="Six pillars"
                    title={<>What <span className="text-primary">EV Society™</span> Does</>}
                    intro="Our mission is implemented through six core pillars of excellence designed to support the entire Electric Vertical (eVTOL) value chain."
                />

                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <li key={feature.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7">
                            <div className="flex items-center justify-between">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary">
                                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <span aria-hidden="true" className="text-sm font-semibold tabular-nums text-gray-400">0{index + 1}</span>
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                            <p className="mt-3 leading-relaxed text-gray-600">
                                {feature.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
