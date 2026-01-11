import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { getEvents } from '@/utils/data';

export default function UpcomingEvents() {
    const events = getEvents().slice(0, 3);

    return (
        <section className="py-24 bg-white">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Upcoming Events</h2>
                        <p className="text-xl text-gray-600">
                            Join the dialogue and stay updated with the latest in EV technology.
                        </p>
                    </div>
                    <Link href="/events" className="text-primary font-bold inline-flex items-center hover:translate-x-1 transition-transform">
                        See all events <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event.id} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
                            <div className="flex items-center gap-2 mb-4">
                                {event.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] uppercase font-bold tracking-wider">{tag}</span>
                                ))}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {event.title}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm line-clamp-3">
                                {event.summary}
                            </p>
                            <div className="space-y-3 pt-6 border-t border-gray-50 mt-auto text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span suppressHydrationWarning>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{event.mode} • {event.city}</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full py-2 text-sm">
                                    Register Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
