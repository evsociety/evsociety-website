import { SPACE_PROGRAM } from './space-innovation/program.config';

// Entries under the header's Programs menu, in display order. The overview page
// (/programs) is linked separately at the end of the menu.
export const PROGRAMS_MENU = [
    {
        name: SPACE_PROGRAM.competitionTitle,
        description: SPACE_PROGRAM.initiativeTitle,
        href: SPACE_PROGRAM.href,
    },
    {
        name: 'Certified Electric Vertical Technology Officer (EVTO™)',
        description: 'Flagship certification · Executive program',
        href: '/programs/evto',
    },
    {
        name: 'Certified Electric Vertical Legal & Business Strategist (EVLBS™)',
        description: 'Flagship certification · Executive program',
        href: '/programs#evlbs',
    },
];
