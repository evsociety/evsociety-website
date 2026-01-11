import PageHeader from '@/components/PageHeader';
import { FileText, Download, ExternalLink, Search, Filter } from 'lucide-react';
import { getResources } from '@/utils/data';

export default function ResourcesPage() {
    const resources = getResources();

    return (
        <div className="bg-white">
            <PageHeader
                title="Knowledge Repository"
                description="Access safety playbooks, technical whitepapers, and standardized guidelines for the EV ecosystem."
                breadcrumb="Resources"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1 space-y-10">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Search</h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Keywords..." className="w-full pl-10 pr-4 py-3 bg-surface border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-primary/20 transition-all" />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Resource Type</h4>
                                <div className="space-y-3">
                                    {['Guideline', 'Whitepaper', 'Toolkit', 'Report'].map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Popular Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Battery', 'Safety', 'Charging', 'AIS-156', 'Cybersecurity', 'Standards'].map(tag => (
                                        <button key={tag} className="px-3 py-1 bg-surface text-gray-600 text-xs font-medium rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {resources.map((res) => (
                                    <div key={res.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col h-full border-t-4 border-t-primary/20">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-surface rounded-xl text-primary">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="badge bg-blue-50 text-blue-700 uppercase">{res.type}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex-grow leading-tight">
                                            {res.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-8 line-clamp-3">
                                            {res.summary}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {res.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded italic">#{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
                                                Download PDF <Download className="w-4 h-4" />
                                            </a>
                                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 p-8 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Request Custom Research</h4>
                                <p className="text-sm text-gray-600 mb-6">Can't find the data you're looking for? Our research wing can help.</p>
                                <a href="/contact" className="text-primary font-bold text-sm">Submit a Request →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
