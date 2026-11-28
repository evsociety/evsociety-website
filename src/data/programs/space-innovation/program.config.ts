// Single source of facts for the EV Society Space Innovation Awards 2026–27, used by the
// program page, the home page feature and the Programs listing card.
// Awards, engineering support, collaborators and dates are EV Society proposals until
// formally confirmed. The competition itself is organized independently by IN-SPACe.

/**
 * A winning team named by EV Society for one of the awards. Shown on the program page and
 * published on the competition's winners and team pages (src/config/competitions/inspace.ts).
 * Leave a field empty when it has not been supplied; it is then left out, never filled in.
 */
export interface AwardRecipient {
    /** Public team page address, /programs/…/teams/<slug>; keep it stable once published */
    slug: string;
    year: number;
    teamName: string;
    teamCode: string;
    institution: string;
    /** Date (YYYY-MM-DD) EV Society confirmed the result */
    confirmedOn: string;
    members: string[];
    link: { label: string; href: string } | null;
    /** The first photograph is the group photograph used on the winners and team pages */
    photos: { src: string; width: number; height: number; alt: string }[];
}

// Details, photographs and link supplied by the EV Society project owner on 28 Nov 2026
const CAN_7USAT_RECIPIENT: AwardRecipient = {
    slug: 'dr-mgr-educational-and-research-institute-can-7usat-2026',
    year: 2026,
    teamName: '',
    teamCode: '',
    institution: 'Dr. M.G.R. Educational and Research Institute, Chennai',
    confirmedOn: '2026-11-28',
    members: [],
    // Canonical form of the supplied https://lnkd.in/p/dvYNtn99 short link
    link: {
        label: 'Read on LinkedIn',
        href: 'https://www.linkedin.com/posts/saishanmugaraja-v-672966220_cansat-can7u-inspace-activity-7524448857238163456-zGig',
    },
    photos: [
        {
            src: '/programs/space-innovation/can-7usat-award-presentation.jpg',
            width: 1600,
            height: 1065,
            alt: 'The CAN-7USAT winning students from Dr. M.G.R. Educational and Research Institute, Chennai, on stage at the IN-SPACe competition receiving a trophy, one of them holding a red cylinder overhead.',
        },
    ],
};

const MODEL_ROCKETRY_RECIPIENT: AwardRecipient = {
    slug: 'team-dyaus-rocketry-014',
    year: 2026,
    teamName: 'Team Dyaus',
    teamCode: 'Rocketry-014',
    institution: '',
    confirmedOn: '2026-11-28',
    members: [
        'Meet Chaklasiya',
        'Daivik Jajiya',
        'Arya Patel',
        'Nikhil Rathod',
        'Aahna Patel',
        'Yagna Patel',
        'Sai Gaikwad',
        'Meet Kacha',
    ],
    // Canonical form of the supplied https://lnkd.in/p/dpw4EvyC short link
    link: {
        label: 'Team Dyaus on LinkedIn',
        href: 'https://www.linkedin.com/posts/team-dyaus-itnu_teamdyaus-nirmauniversity-inspace-activity-7524847331611979776-F2n7',
    },
    photos: [
        {
            src: '/programs/space-innovation/team-dyaus-award-presentation.jpg',
            width: 1132,
            height: 754,
            alt: 'Team Dyaus on stage at the IN-SPACe competition receiving a trophy, standing and seated in front of an IN-SPACe backdrop beside a model rocket.',
        },
        {
            src: '/programs/space-innovation/team-dyaus-rocket-launch-rail.webp',
            width: 960,
            height: 1600,
            alt: 'A Team Dyaus member stands beside the team’s black model rocket, marked “Team Dyaus”, on a steel launch rail at the competition launch site.',
        },
    ],
};

/** The recipient's public name: the team name, or the institution when no team name was given */
export const recipientName = (recipient: AwardRecipient) => recipient.teamName || recipient.institution;

export const SPACE_PROGRAM = {
    href: '/programs/inspace-model-rocketry-cansat',
    competitionTitle: 'IN-SPACe Model Rocketry/CAN-7USAT India Student Competition',
    initiativeTitle: 'EV Society Space Innovation Awards 2026–27',
    location: 'Bengaluru, India',

    organizer: 'IN-SPACe (Indian National Space Promotion and Authorization Centre)',
    officialUrl: 'https://www.inspace.gov.in/inspace?id=antariksh_employment_mela_2026',
    // Paraphrased from the official IN-SPACe program page linked above
    competitionSummary: 'According to IN-SPACe, the 2026 competition gives undergraduate engineering and science student teams in India a realistic experience of designing and launching a model rocket that carries a 1 kg CAN-7USAT, provided by the organizers, to an altitude of 1,000 metres, with safe ejection of the CAN-7USAT and safe landing of the rocket.',

    initiativeSummary: 'EV Society, Bengaluru, has proposed the EV Society Space Innovation Awards 2026–27 to recognise student innovation in space and rocketry, and to support the winning teams beyond the competition through focused engineering development.',

    awards: [
        {
            id: 'can-7usat',
            category: 'CAN-7USAT',
            name: 'EV Society CAN-7USAT Innovation Award 2026',
            recipient: 'CAN-7USAT winning team',
            winner: CAN_7USAT_RECIPIENT as AwardRecipient | null,
        },
        {
            id: 'model-rocketry',
            category: 'Model Rocketry',
            name: 'EV Society Model Rocketry Innovation Award 2026',
            recipient: 'Model Rocketry winning team',
            winner: MODEL_ROCKETRY_RECIPIENT as AwardRecipient | null,
        },
    ],
    // Identical for both winning teams by design
    awardAmount: '₹10,000',
    supportDuration: '3 months',
    totalAwards: '₹20,000',

    objective: 'Turn a promising concept into a working, validated engineering demonstrator.',
    scope: [
        {
            title: 'Physics-based modeling & simulation',
            description: 'Build a physics-based model of the selected problem or subsystem and simulate its behaviour.',
        },
        {
            title: 'Nominal & fault scenarios',
            description: 'Examine how the system behaves under expected conditions and under faults.',
        },
        {
            title: 'Telemetry, test & simulated-data comparison',
            description: 'Compare simulated results against telemetry, test or other simulated data.',
        },
        {
            title: 'Health & performance estimation',
            description: 'Estimate the health and performance of the selected problem or subsystem.',
        },
    ],
    timeline: [
        { month: 'Month 1', phase: 'Define & Model', description: 'Define the selected problem or subsystem and model it.' },
        { month: 'Month 2', phase: 'Build & Simulate', description: 'Build the solution and simulate it.' },
        { month: 'Month 3', phase: 'Validate & Demonstrate', description: 'Validate the results and demonstrate the working system.' },
    ],
    finalDeadline: { label: '15 February 2027', iso: '2027-02-15' },

    collaborators: [
        {
            name: 'Gamyaa AeroSystems',
            links: [{ label: 'aerosystems.gamyaa.in', href: 'https://aerosystems.gamyaa.in/' }],
        },
        {
            name: 'iTelematics Software Private Limited',
            links: [{ label: 'itelematics.com', href: 'https://itelematics.com/' }],
        },
        {
            name: 'APEX Rocket Systems',
            links: [
                { label: 'apexrocketsystems.com', href: 'https://www.apexrocketsystems.com/' },
                { label: 'aerospace.ev.engineer profile', href: 'https://aerospace.ev.engineer/space/partners/apexrocketsystems' },
            ],
        },
    ],

    contact: {
        name: 'Sudarshana Karkala',
        phone: '+91 9845561518',
        phoneHref: 'tel:+919845561518',
        email: 'sudarshana.karkala@gmail.com',
    },

    // Supplied by EV Society; carries the @isro.dos credit
    image: {
        src: '/programs/space-innovation/model-rockets-launch-rails.jpg',
        // 2x resample of the supplied 800x1250 photo with light sharpening; a higher-resolution
        // original would look sharper still
        width: 1600,
        height: 2500,
        alt: 'Four model rockets in orange, yellow and red stand ready on angled launch rails at an outdoor launch pad at dusk, with grassland and trees behind.',
        credit: 'Photo: @isro.dos',
    },
} as const;
