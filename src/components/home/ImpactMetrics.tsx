import { Users, Layout, Zap, ShieldCheck } from 'lucide-react';

const metrics = [
    {
        label: 'Members',
        value: '5,000+',
        description: 'Growing community of engineers, researchers & practitioners',
        icon: Users,
    },
    {
        label: 'Working Groups',
        value: '12+',
        description: 'Domain-focused technical working groups collaborating on standards',
        icon: Layout,
    },
    {
        label: 'Programs',
        value: '6 Wings',
        description: 'Awareness • Safety • Skills • Policy • Research • Startup',
        icon: Zap,
    },
    {
        label: 'Partnerships',
        value: '100+',
        description: 'Collaborations across Industry, Academia & Government',
        icon: ShieldCheck,
    },
];

export default function ImpactMetrics() {
    return (
        <section className="bg-surface pb-16" aria-label="EV Society™ at a glance">
            <div className="container-custom">
                {/* Overlaps the bottom of the hero */}
                <div className="relative -mt-16 grid gap-px overflow-hidden rounded-2xl bg-gray-200 shadow-xl shadow-navy/10 ring-1 ring-gray-200 md:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="bg-white p-7 lg:p-8">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-primary">
                                    <metric.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{metric.label}</h3>
                            </div>
                            <p className="mt-5 text-4xl font-bold tracking-tight text-gray-900">{metric.value}</p>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                {metric.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
