import { Users, Layout, Zap, ShieldCheck } from 'lucide-react';

const metrics = [
    {
        label: 'Members',
        value: '5,000+',
        description: 'Growing community of engineers, researchers & practitioners',
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        label: 'Working Groups',
        value: '12+',
        description: 'Domain-focused technical working groups collaborating on standards',
        icon: Layout,
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    {
        label: 'Programs',
        value: '6 Wings',
        description: 'Awareness • Safety • Skills • Policy • Research • Startup',
        icon: Zap,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
    {
        label: 'Partnerships',
        value: '100+',
        description: 'Collaborations across Industry, Academia & Government',
        icon: ShieldCheck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
];

export default function ImpactMetrics() {
    return (
        <section className="py-20 bg-surface">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 ${metric.bg} rounded-xl flex items-center justify-center mb-6`}>
                                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{metric.label}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {metric.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
