import { notFound } from 'next/navigation';
import { getPartnerBySlug, getPartners } from '@/utils/data';
import { Globe, Linkedin, MapPin, Building2, School, UserCircle2, ArrowLeft, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mandatory for static exports or to pre-render these routes
export async function generateStaticParams() {
    const partners = getPartners();
    return partners.map((partner) => ({
        slug: partner.slug,
    }));
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const partner = getPartnerBySlug(slug);

    if (!partner) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Dynamic Header */}
            <div className="bg-surface border-b border-gray-100 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                <div className="container-custom relative z-10">
                    <Link href="/partners" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-12 group">
                        <div className="p-1.5 bg-white rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Directory
                    </Link>

                    <div className="flex flex-col lg:flex-row items-start gap-12">
                        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center border border-gray-100 shadow-xl shrink-0 overflow-hidden relative">
                            {/* Fallback Icon */}
                            <div className="absolute inset-0 flex items-center justify-center -z-10 group">
                                {partner.type === 'company' && <Building2 className="w-16 h-16 text-gray-100" />}
                                {partner.type === 'institute' && <School className="w-16 h-16 text-gray-100" />}
                                {partner.type === 'researcher' && <UserCircle2 className="w-16 h-16 text-gray-100" />}
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <span className="text-[10px] font-black text-gray-300 text-center uppercase leading-tight scale-110 opacity-30 select-none">{partner.name}</span>
                                </div>
                            </div>
                            {/* Actual Logo */}
                            <div className="w-full h-full relative z-10">
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>
                        </div>

                        <div className="flex-grow">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className={`badge ${partner.type === 'company' ? 'bg-blue-600' : partner.type === 'institute' ? 'bg-green-600' : 'bg-purple-600'} text-white px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]`}>
                                    {partner.type}
                                </span>
                                {partner.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-500">{tag}</span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                                {partner.name}
                            </h1>
                            <div className="flex flex-wrap gap-8 text-gray-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{partner.location.city}, {partner.location.state}, {partner.location.country}</span>
                                </div>
                                {partner.links.website && (
                                    <a href={partner.links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <Globe className="w-5 h-5 text-primary" />
                                        <span>{new URL(partner.links.website).hostname}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full lg:w-64">
                            <a href={partner.links.website} target="_blank" rel="noopener noreferrer" className="btn-primary w-full shadow-lg shadow-primary/20">
                                Visit Website
                            </a>
                            {partner.links.linkedin && (
                                <a href={partner.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full gap-2 font-bold">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <section className="py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8">
                            <div className="prose prose-lg max-w-none">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Professional Profile</h2>
                                <p className="text-xl text-gray-600 leading-relaxed mb-12">
                                    {partner.about}
                                </p>

                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Strategic Focus Areas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                                    {partner.domains.map(domain => (
                                        <div key={domain} className="p-6 bg-surface rounded-2xl border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-50 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900">{domain}</span>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Collaborations</h3>
                                <p className="text-gray-500 italic bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                                    No recent collaborations listed yet for this partner. Check back later for updates on projects and whitepapers.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-[120px] space-y-8">
                                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Quick Actions</h4>
                                    <div className="space-y-4">
                                        <button className="w-full flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-primary hover:text-white transition-all group font-bold text-gray-700">
                                            Request Intro
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                        <button className="w-full flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-primary hover:text-white transition-all group font-bold text-gray-700">
                                            Join Working Group
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                    <h4 className="text-lg font-bold mb-4 relative z-10">Institutional Support</h4>
                                    <p className="text-sm text-blue-100 mb-6 relative z-10 leading-relaxed">
                                        This partner is a verified member of the <span className="text-white font-extrabold">EV Society™</span> ecosystem.
                                    </p>
                                    <Link href="/join" className="inline-block px-6 py-2 bg-white text-primary rounded-lg text-sm font-bold relative z-10">
                                        Verify Partnership
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
