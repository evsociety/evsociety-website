import type { EVEvent } from '@/types';
import { SITE_URL } from '@/config/site';

// Today's date in India as YYYY-MM-DD, comparable with the event date strings
export const todayInIndia = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

// "10:00 AM IST" on 2027-02-15 → "2027-02-15T10:00:00+05:30"; without a parsable time, the date alone
const startDate = (date: string, time?: string) => {
    const match = time?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return date;
    const hour = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    return `${date}T${String(hour).padStart(2, '0')}:${match[2]}:00+05:30`;
};

const attendanceMode = {
    Online: 'https://schema.org/OnlineEventAttendanceMode',
    'In-person': 'https://schema.org/OfflineEventAttendanceMode',
    Hybrid: 'https://schema.org/MixedEventAttendanceMode',
} as const;

const location = (event: EVEvent) => {
    const online = { '@type': 'VirtualLocation', url: `${SITE_URL}/events` };
    const place = { '@type': 'Place', name: event.city, address: { '@type': 'PostalAddress', addressLocality: event.city } };
    if (event.mode === 'Online') return online;
    if (event.mode === 'Hybrid') return [place, online];
    return place;
};

// schema.org Event entries for events dated today or later, using only fields present in the data
export function upcomingEventsJsonLd(events: EVEvent[]) {
    const today = todayInIndia();
    return {
        '@context': 'https://schema.org',
        '@graph': events
            .filter((event) => event.date >= today)
            .map((event) => ({
                '@type': 'Event',
                name: event.title,
                startDate: startDate(event.date, event.time),
                eventStatus: 'https://schema.org/EventScheduled',
                eventAttendanceMode: attendanceMode[event.mode],
                location: location(event),
                ...(event.summary ? { description: event.summary } : {}),
                ...(event.speaker ? { performer: { '@type': 'Person', name: event.speaker } } : {}),
                organizer: { '@id': `${SITE_URL}/#organization` },
                url: `${SITE_URL}/events`,
            })),
    };
}
