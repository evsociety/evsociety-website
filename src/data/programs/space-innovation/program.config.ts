// Single source of facts for the EV Society Space Innovation Awards 2026–27, used by the
// program page, the home page feature and the Programs listing card.
// Awards, engineering support, collaborators and dates are EV Society proposals until
// formally confirmed. The competition itself is organized independently by IN-SPACe.

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
        },
        {
            id: 'model-rocketry',
            category: 'Model Rocketry',
            name: 'EV Society Model Rocketry Innovation Award 2026',
            recipient: 'Model Rocketry winning team',
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
