import PageHeader from '@/components/PageHeader';
import { Target, Users2, ShieldCheck, Globe } from 'lucide-react';

const values = [
    {
        title: 'Technical Excellence',
        description: 'We prioritize engineering rigor and data-driven standards in every initiative.',
        icon: Target,
    },
    {
        title: 'Inclusive Neutrality',
        description: 'Serving as a neutral platform for industry competitors and government bodies to collaborate.',
        icon: Globe,
    },
    {
        title: 'Safety First',
        description: 'Human safety and asset protection are at the core of our technical agenda.',
        icon: ShieldCheck,
    },
    {
        title: 'Skill Sovereignty',
        description: 'Empowering the workforce with the competencies needed for a global EV market.',
        icon: Users2,
    },
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="EV Society™"
                description="EV Society™ is a non-profit, charitable educational and technical organization dedicated to strengthening the understanding and responsible adoption of electric vehicle technology across all stakeholders."
                breadcrumb="About Us"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">What we do</h2>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Build a trusted platform connecting industry, academia, startups, and practitioners',
                                    'Promote research, indigenization, and quality engineering',
                                    'Support standards, testing readiness, and safety-first adoption',
                                    'Enable workforce skill development and certifications',
                                    'Provide technical inputs for policies and public awareness'
                                ].map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <span className="text-gray-700 font-medium">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                As a professional technical body, <span className="text-primary font-bold">EV Society™</span> supports the advancement of EV engineering, safety, testing, standards, and ecosystem development—enabling reliable electric mobility across transport segments.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-4xl font-extrabold text-primary mb-2">2024</h4>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Year of Inception</p>
                                </div>
                                <div>
                                    <h4 className="text-4xl font-extrabold text-primary mb-2">12+</h4>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Focus Areas</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface rounded-3xl p-8 lg:p-12 relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <blockquote className="relative italic text-2xl text-gray-700 font-medium leading-relaxed">
                                &ldquo;Our goal is not just to replace internal combustion engines, but to build a mobility ecosystem that is fundamentally safer, cleaner, and smarter for everyone.&rdquo;
                            </blockquote>
                            <p className="mt-8 font-bold text-gray-900">— Executive Board, EV Society™</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-surface">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map(value => (
                            <div key={value.title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-6">
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to be part of the movement?</h2>
                    <div className="flex justify-center gap-4">
                        <a href="/join" className="btn-primary">Become a Member</a>
                        <a href="/contact" className="btn-secondary">Contact Us</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
