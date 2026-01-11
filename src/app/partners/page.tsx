'use client';

import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { Search, Building2, School, UserCircle2, Globe, Linkedin, ArrowRight } from 'lucide-react';
import { getPartners } from '@/utils/data';
import Link from 'next/link';
import Image from 'next/image';
import { PartnerType } from '@/types';

export default function PartnersPage() {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | PartnerType>('All');
    const [selectedDomain, setSelectedDomain] = useState('All');

    const partners = getPartners();

    const domains = useMemo(() => {
        const allDomains = partners.flatMap(p => p.domains);
        return ['All', ...Array.from(new Set(allDomains))];
    }, [partners]);

    const filteredPartners = useMemo(() => {
        return partners.filter(p => {
            const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
                p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));

            const matchesTab = activeTab === 'All' || p.type === activeTab;
            const matchesDomain = selectedDomain === 'All' || p.domains.includes(selectedDomain);

            return matchesQuery && matchesTab && matchesDomain;
        });
    }, [partners, query, activeTab, selectedDomain]);

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Partner Directory"
                description="Connect with the organizations and researchers driving the EV revolution."
                breadcrumb="Partners"
            />

            <section className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
                <div className="container-custom">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, tags, or focus..."
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-primary/20 transition-all font-medium"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex p-1 bg-surface rounded-xl overflow-x-auto w-full lg:w-auto">
                            {['All', 'company', 'institute', 'researcher'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {tab === 'company' ? 'Companies' : tab === 'institute' ? 'Institutes' : tab === 'researcher' ? 'Researchers' : tab}
                                </button>
                            ))}
                        </div>

                        {/* Domain Select */}
                        <div className="w-full lg:w-64">
                            <select
                                className="w-full bg-surface border-none rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                                value={selectedDomain}
                                onChange={(e) => setSelectedDomain(e.target.value)}
                            >
                                <option disabled>Filter by Domain</option>
                                {domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container-custom">
                    {filteredPartners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPartners.map((partner) => (
                                <div key={partner.id} className="group flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300">
                                    <div className="p-8 pb-4 flex items-center justify-between">
                                        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center border border-gray-50 overflow-hidden relative">
                                            {/* Logo with next/image or fallback */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-[8px] font-bold text-primary/40 text-center uppercase p-1 -z-10">
                                                {partner.name}
                                            </div>
                                            <div className="w-full h-full relative">
                                                <Image
                                                    src={partner.logo}
                                                    alt={partner.name}
                                                    fill
                                                    className="object-contain p-2 relative z-10"
                                                />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center -z-20">
                                                {partner.type === 'company' && <Building2 className="w-8 h-8 text-gray-200" />}
                                                {partner.type === 'institute' && <School className="w-8 h-8 text-gray-200" />}
                                                {partner.type === 'researcher' && <UserCircle2 className="w-8 h-8 text-gray-200" />}
                                            </div>
                                        </div>
                                        <span className={`badge ${partner.type === 'company' ? 'bg-blue-50 text-blue-700' : partner.type === 'institute' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'} uppercase`}>
                                            {partner.type}
                                        </span>
                                    </div>

                                    <div className="p-8 pt-4 flex-grow">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{partner.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> {partner.location.city}, {partner.location.state}
                                        </p>
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {partner.shortDescription}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {partner.domains.slice(0, 2).map(d => (
                                                <span key={d} className="px-2 py-1 bg-surface text-gray-500 text-[10px] font-bold uppercase rounded leading-none">{d}</span>
                                            ))}
                                            {partner.domains.length > 2 && <span className="text-[10px] font-bold text-gray-400">+{partner.domains.length - 2} more</span>}
                                        </div>
                                    </div>

                                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex gap-3">
                                            {partner.links.website && (
                                                <a href={partner.links.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-primary transition-colors shadow-sm">
                                                    <Globe className="w-4 h-4" />
                                                </a>
                                            )}
                                            {partner.links.linkedin && (
                                                <a href={partner.links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-primary transition-colors shadow-sm">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <Link href={`/partners/${partner.slug}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
                                            View Profile <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No partners found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                            <button onClick={() => { setQuery(''); setActiveTab('All'); setSelectedDomain('All'); }} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-24 bg-surface/30">
                <div className="container-custom text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Not on the directory yet?</h2>
                    <Link href="/join" className="btn-primary">Apply for Partnership</Link>
                </div>
            </section>
        </div>
    );
}
