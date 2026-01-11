import PageHeader from '@/components/PageHeader';
import { Zap, Gavel, GraduationCap, Building2, Globe, Users2 } from 'lucide-react';

const programs = [
    {
        title: 'Technology & Innovation',
        icon: Zap,
        bullets: [
            'Encourage R&D in batteries, power electronics, motors, charging systems, BMS, diagnostics, and recycling',
            'Support startups, MSMEs, and academic institutions building EV technologies',
            'Promote indigenous solutions aligned with manufacturing and innovation priorities'
        ]
    },
    {
        title: 'Policy & Advocacy',
        icon: Gavel,
        bullets: [
            'Provide technical inputs to relevant bodies on policies, standards, and safety guidelines',
            'Advocate harmonized regulations, safety compliance, and enabling incentives',
            'Support state and city-level electric mobility roadmaps and implementation playbooks'
        ]
    },
    {
        title: 'Skill Development & Education',
        icon: GraduationCap,
        bullets: [
            'Develop EV-focused curricula, certifications, and practical training programs',
            'Conduct workshops, seminars, and faculty development programs',
            'Enable reskilling and upskilling from conventional automotive roles to EV domains'
        ]
    },
    {
        title: 'Industry & Ecosystem Development',
        icon: Building2,
        bullets: [
            'Connect industry, academia, government, startups, and users through working groups',
            'Facilitate collaborations, pilot projects, and technology transfer',
            'Support ecosystem readiness across charging, diagnostics, service, and recycling supply chains'
        ]
    },
    {
        title: 'Sustainability & Environment',
        icon: Globe,
        bullets: [
            'Promote life-cycle thinking for EV adoption',
            'Encourage battery reuse, second-life applications, and responsible recycling',
            'Support renewable energy integration with charging and smart energy management'
        ]
    },
    {
        title: 'Public Awareness & Outreach',
        icon: Users2,
        bullets: [
            'Build awareness around benefits, myths, safety, and responsible usage',
            'Promote adoption across rural, semi-urban, and urban communities',
            'Engage students and youth through EV clubs, challenges, and competitions'
        ]
    }
];

export default function ProgramsPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Our Programs"
                description="Comprehensive initiatives designed to enable every aspect of the electric mobility ecosystem."
                breadcrumb="Programs"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program) => (
                            <div key={program.title} className="bg-surface p-8 rounded-3xl border border-gray-200 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors border border-gray-100">
                                    <program.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">{program.title}</h3>
                                <ul className="space-y-4">
                                    {program.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                            <span className="text-gray-600 leading-relaxed text-sm font-medium">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
