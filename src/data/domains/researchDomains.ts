import { SPACE_PROGRAM } from '@/data/programs/space-innovation/program.config';

// The four umbrella research domains in the organisation descriptor. These are identity and
// navigation tiles, not claims of facilities or formal programs: each links to content already
// published on the site, except Defence, which links to a "coming soon" placeholder page.
// `link.label` is announced to screen readers as the tile's destination; `tag` shows as a label pill.
export const RESEARCH_DOMAINS = [
    {
        id: 'ev',
        name: 'Electric Vertical',
        tag: 'eVTOL',
        link: { href: '/#electric-vertical', label: 'What is eVTOL?' },
        comingSoon: false,
    },
    {
        id: 'aerospace',
        name: 'Aerospace',
        tag: null,
        link: { href: '/projects', label: 'View projects' },
        comingSoon: false,
    },
    {
        id: 'defence',
        name: 'Defence',
        tag: null,
        link: { href: '/domains/defence', label: 'Coming soon' },
        comingSoon: true,
    },
    {
        id: 'space',
        name: 'Space',
        tag: null,
        link: { href: SPACE_PROGRAM.href, label: 'Space Innovation program' },
        comingSoon: false,
    },
] as const;
