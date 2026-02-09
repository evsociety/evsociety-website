import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import { getEvents } from '@/utils/data';
import EventList from '@/components/events/EventList';
import WednesdayPlans from '@/components/WednesdayPlans';

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

            <EventList events={events} />

            <WednesdayPlans events={events} />

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
