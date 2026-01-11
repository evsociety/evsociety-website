import partners from '../data/partners.json';
import events from '../data/events.json';
import resources from '../data/resources.json';
import { Partner, EVEvent, Resource } from '../types';

export function getPartners(): Partner[] {
    return partners as Partner[];
}

export function getPartnerBySlug(slug: string): Partner | undefined {
    return (partners as Partner[]).find(p => p.slug === slug);
}

export function getEvents(): EVEvent[] {
    return (events as EVEvent[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

    const filteredEvents = (events as EVEvent[]).filter(e =>
        e.title.toLowerCase().includes(lowerQuery) ||
        e.summary.toLowerCase().includes(lowerQuery)
    );

    return { partners: filteredPartners, events: filteredEvents };
}
