import partners from '../data/partners.json';
import registrations from '../data/registrations.json';
import resources from '../data/resources.json';
import { Partner, EVEvent, Resource } from '../types';

export function getPartners(): Partner[] {
    return partners as Partner[];
}

export function getPartnerBySlug(slug: string): Partner | undefined {
    return (partners as Partner[]).find(p => p.slug === slug);
}

export function getEvents(): EVEvent[] {
    const mapMode = (options: string[]): 'Online' | 'In-person' | 'Hybrid' => {
        if (!options || options.length === 0) return 'Online';
        if (options.includes('hybrid')) return 'Hybrid';
        if (options.includes('offline')) return 'In-person';
        return 'Online';
    };

    const events: EVEvent[] = (registrations.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time, // Added time
        mode: mapMode(e.modeOptions),
        city: e.location ? e.location.split(',')[0].trim() : 'TBA',
        summary: e.sessionTracks ? `Topics: ${e.sessionTracks.slice(0, 3).join(', ')}` : '',
        registrationUrl: '/register',
        tags: e.categoryTags || []
    }));

    const webinars: EVEvent[] = (registrations.webinars || []).map((w: any) => ({
        id: w.id,
        title: w.title,
        date: w.date,
        time: w.time, // Added time
        speaker: w.speaker, // Added speaker
        speakerTitle: w.speakerTitle, // Added speakerTitle
        speakerOrganization: w.speakerOrganization, // Added speakerOrganization
        mode: mapMode(w.modeOptions),
        city: 'Online',
        summary: w.description || (w.sessionTracks ? `Topics: ${w.sessionTracks.slice(0, 3).join(', ')}` : ''),
        registrationUrl: '/register',
        tags: w.categoryTags || [],
        posterLinkURL: w.posterLinkURL,
        youtubeURL: w.youtubeURL,
        presentationURL: w.presentationURL,
        reference: w.reference
    }));

    const allEvents = [...events, ...webinars];
    // Sort by date ascending (oldest first is default for sort, but for "upcoming" we usually want nearest future date first)
    // However, the original code sorted simply by time difference.
    // For generic displaying, sorting by date is fine.
    // When I filter in the page, I might want to sort differently:
    // Upcoming: Ascending (Soonest first)
    // Completed: Descending (Most recent first)
    return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getResources(): Resource[] {
    return resources as Resource[];
}

export function searchDirectory(query: string) {
    const lowerQuery = query.toLowerCase();

    const filteredPartners = (partners as Partner[]).filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.shortDescription.toLowerCase().includes(lowerQuery) ||
        p.domains.some(d => d.toLowerCase().includes(lowerQuery)) ||
        p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );

    const allEvents = getEvents();
    const filteredEvents = allEvents.filter(e =>
        e.title.toLowerCase().includes(lowerQuery) ||
        e.summary.toLowerCase().includes(lowerQuery)
    );

    return { partners: filteredPartners, events: filteredEvents };
}
