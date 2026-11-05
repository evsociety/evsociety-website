import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { getEvents } from '@/utils/data';
import SectionHeading from '@/components/ui/SectionHeading';
import { todayInIndia } from '@/lib/eventsJsonLd';

const dateParts = (date: string) => {
    const d = new Date(`${date}T00:00:00`);
    return {
        day: d.toLocaleDateString('en-IN', { day: '2-digit' }),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        year: d.getFullYear(),
        full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
};

export default function UpcomingEvents() {
    // Only events dated today or later count as upcoming; getEvents() returns them oldest first
    const today = todayInIndia();
    const events = getEvents().filter((event) => event.date >= today).slice(0, 3);

    return (
        <section className="bg-surface py-20 lg:py-24" aria-labelledby="upcoming-events-heading">
            <div className="container-custom">
                <SectionHeading
                    id="upcoming-events-heading"
                    title="Upcoming Events"
                    intro="Join the dialogue and stay updated with the latest in EV technology."
                    action={
                        <Link href="/events" className="inline-flex items-center gap-2 rounded font-semibold text-primary hover:text-primary-hover">
                            See all events <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    }
                />

                {events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                        <p className="font-semibold text-gray-900">No upcoming events are scheduled right now.</p>
                        <p className="mt-2 text-gray-600">
                            Recordings and materials from past sessions are on the <Link href="/events" className="font-semibold text-primary underline-offset-4 hover:underline">events page</Link>.
                        </p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {events.map((event) => {
                            const date = dateParts(event.date);
                            return (
                                <li key={event.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
                                    <div className="flex items-start gap-4">
                                        <time dateTime={event.date} className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-navy py-2.5 text-white">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">{date.month}</span>
                                            <span className="text-2xl font-bold leading-tight">{date.day}</span>
                                            <span className="text-xs text-slate-300">{date.year}</span>
                                        </time>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Upcoming</p>
                                            <h3 className="mt-1 text-lg font-bold leading-snug text-gray-900">{event.title}</h3>
                                        </div>
                                    </div>

                                    {event.tags.length > 0 && (
                                        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Topics">
                                            {event.tags.map((tag) => (
                                                <li key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600">{tag}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {event.summary && (
                                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-600">{event.summary}</p>
                                    )}

                                    <div className="mt-auto pt-6" />
                                    <dl className="space-y-2 border-t border-gray-100 pt-5 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <dt className="sr-only">Date and time</dt>
                                            <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                            <dd>{date.full}{event.time ? `, ${event.time}` : ''}</dd>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <dt className="sr-only">Format and location</dt>
                                            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                            <dd>{event.mode} • {event.city}</dd>
                                        </div>
                                    </dl>
                                    <Link href={event.registrationUrl} className="btn-secondary mt-6 w-full py-2.5 text-sm">
                                        Register Now
                                        <span className="sr-only"> for {event.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
