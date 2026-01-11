import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import { Calendar, MapPin, Search as SearchIcon, Filter } from 'lucide-react';
import { getEvents } from '@/utils/data';

export const metadata: Metadata = {
    title: 'Events',
    description: 'Participate in EV Society™ roundtables, workshops, technical summits, and webinars focused on electric mobility innovation and safety.',
    alternates: {
        canonical: '/events',
    },
};

export default function EventsPage() {
    const events = getEvents();

    return (
        <div className="bg-white">
            <PageHeader
                title="Events & Conferences"
                description="Participate in our roundtables, workshops, and national summits."
                breadcrumb="Events"
            />

            <section className="py-12 bg-surface/50 border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Find an event..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {['All', 'Roundtable', 'Workshop', 'Summit', 'Webinar'].map(cat => (
                                <button key={cat} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${cat === 'All' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/20'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container-custom">
                    <div className="space-y-8">
                        {events.map((event) => (
                            <div key={event.id} className="group bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                <div className="w-full lg:w-48 shrink-0">
                                    <div className="bg-surface rounded-2xl p-6 text-center border border-gray-50 group-hover:bg-primary/5 transition-colors">
                                        <span suppressHydrationWarning className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                        <span suppressHydrationWarning className="block text-4xl font-black text-gray-900">{new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit' })}</span>
                                        <span className="block text-xs font-bold text-primary mt-2">{new Date(event.date).getFullYear()}</span>
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] uppercase font-bold tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">{event.title}</h3>
                                    <p className="text-gray-600 leading-relaxed max-w-2xl">
                                        {event.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span>{event.mode} • {event.city}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span>Starts at 10:00 AM IST</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-auto shrink-0">
                                    <a href={event.registrationUrl} className="btn-primary w-full lg:px-8 py-3 rounded-xl whitespace-nowrap">
                                        Register Details
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-surface/30">
                <div className="container-custom text-center">
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interested in hosting?</h2>
                        <p className="text-gray-600 mb-8">
                            <span className="text-primary font-bold">EV Society™</span> partners with corporate and academic institutes to host regional roundtables and technical workshops.
                        </p>
                        <a href="/contact" className="text-primary font-bold hover:underline">
                            Submit a Proposal →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
