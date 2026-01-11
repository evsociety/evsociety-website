import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import { Check, User, Users, GraduationCap, Building2, Landmark, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Membership',
    description: 'Join EV Society™ as a student, professional, researcher, corporate, or institutional member and shape the future of electric mobility.',
    alternates: {
        canonical: '/join',
    },
};

const tiers = [
    {
        name: 'Student Member',
        price: '₹500 / year',
        icon: GraduationCap,
        benefits: [
            'Access to technical webinars',
            'Student chapter participation',
            'Resource library access',
            'Networking with industry experts'
        ],
        cta: 'Apply as Student'
    },
    {
        name: 'Professional Member',
        price: '₹2,500 / year',
        icon: User,
        popular: true,
        benefits: [
            'Join Technical Working Groups',
            'Voting rights in society',
            'Exclusive whitepapers & playbooks',
            'Discount on conferences',
            'Professional certification access'
        ],
        cta: 'Apply as Professional'
    },
    {
        name: 'Research Member',
        price: '₹3,000 / year',
        icon: Users,
        benefits: [
            'Research grant eligibility',
            'Publish in EV Society™ journals',
            'Lab network access',
            'Collaboration opportunities'
        ],
        cta: 'Apply as Researcher'
    },
    {
        name: 'Corporate Member',
        price: 'Contact for Quote',
        icon: Building2,
        benefits: [
            'Brand visibility on portal',
            'Policy advisory inclusion',
            'Hiring through EV Society™ talent pool',
            'Joint workshop hosting',
            'Standards committee participation'
        ],
        cta: 'Inquire as Corporate'
    },
    {
        name: 'Institutional Partner',
        price: 'For Universities/NGOs',
        icon: Landmark,
        benefits: [
            'Strategic MoUs',
            'Curriculum alignment',
            'Industry-Academia bridge',
            'Faculty development programs'
        ],
        cta: 'Partner with Us'
    }
];

export default function JoinPage() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Membership & Governance"
                description="Join the community shaping the future of electric mobility."
                breadcrumb="Join EV Society™"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tiers.map((tier) => (
                            <div key={tier.name} className={`relative flex flex-col p-10 rounded-3xl border ${tier.popular ? 'border-primary shadow-2xl ring-4 ring-primary/5' : 'border-gray-100 shadow-sm'} bg-white group hover:-translate-y-2 transition-all duration-500`}>
                                {tier.popular && (
                                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 ${tier.popular ? 'bg-primary text-white' : 'bg-surface text-gray-500'}`}>
                                    <tier.icon className="w-7 h-7" />
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-2">{tier.name}</h3>
                                <p className={`text-lg font-bold mb-10 ${tier.popular ? 'text-primary' : 'text-gray-500'}`}>{tier.price}</p>

                                <ul className="space-y-4 mb-12 flex-grow">
                                    {tier.benefits.map(benefit => (
                                        <li key={benefit} className="flex gap-3 text-sm text-gray-600 font-medium whitespace-pre-wrap">
                                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-xl font-bold transition-all ${tier.popular ? 'bg-primary text-white hover:bg-primary-hover shadow-lg' : 'bg-surface text-gray-900 hover:bg-gray-100'}`}>
                                    {tier.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-surface/50 border-y border-gray-100">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Democratic Governance</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                <span className="text-primary font-bold">EV Society™</span> is a non-profit society registered under the Societies Registration Act. Our governance is inclusive, transparent, and driven by technical excellence.
                            </p>
                            <Link href="/about" className="text-primary font-bold inline-flex items-center group">
                                Read our Bylaws <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { l: 'Members', v: '5K+' },
                                { l: 'States', v: '28' },
                                { l: 'Partners', v: '100+' },
                                { l: 'Events', v: '50+' }
                            ].map(i => (
                                <div key={i.l} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                                    <div className="text-2xl font-black text-primary mb-1">{i.v}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{i.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
