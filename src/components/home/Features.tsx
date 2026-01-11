import { Megaphone, ShieldAlert, FlaskConical, Terminal, GraduationCap, Rocket } from 'lucide-react';

const features = [
    {
        title: 'Public Awareness',
        description: 'Educating citizens about EV benefits, safety, and recharging practices through national campaigns.',
        icon: Megaphone,
    },
    {
        title: 'Safety & Standards',
        description: 'Working with regulatory bodies to refine battery and vehicle safety standards for diverse operational conditions.',
        icon: ShieldAlert,
    },
    {
        title: 'Research Enablement',
        description: 'Connecting academic research with industrial needs to accelerate innovation in cell chemistry and BMS.',
        icon: FlaskConical,
    },
    {
        title: 'Knowledge Platform',
        description: 'A shared repository for whitepapers, guidelines, and technical documentation for the EV ecosystem.',
        icon: Terminal,
    },
    {
        title: 'Skill Development',
        description: 'Developing competency-based certification programs for engineers and technicians in the EV sector.',
        icon: GraduationCap,
    },
    {
        title: 'Startup & MSME Support',
        description: 'Providing mentorship and access to testing facilities for early-stage EV startups.',
        icon: Rocket,
    },
];

export default function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">What <span className="text-primary font-black">EV Society™</span> Does</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Our mission is implemented through six core pillars of excellence designed to support the entire EV value chain.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature) => (
                        <div key={feature.title} className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:bg-blue-50/30 transition-all duration-300">
                            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
