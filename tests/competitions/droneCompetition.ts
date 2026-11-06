import type { CompetitionDefinition } from '@/config/competitions';

// An example second competition used by the tests to show that the platform is configuration-
// driven. It is not registered on the website. To launch it for real, add it to COMPETITIONS
// in src/config/competitions/index.ts and add its row to the Competitions tab.
export const DRONE_COMPETITION: CompetitionDefinition = {
    id: 'drone-challenge',
    slug: 'drone-challenge',
    basePath: '/programs/drone-challenge',
    name: 'EV Society Student Drone Challenge',
    shortName: 'Student Drone Challenge',
    organiser: 'EV Society',
    participantType: 'team',
    landing: 'generic',
    categories: [
        { id: 'autonomy', label: 'Autonomous Navigation', winnersLabel: 'Autonomous Navigation Winners', slug: 'autonomous-navigation', winnersTitle: 'Autonomous Navigation Winners', winnersIntro: 'Verified winners in autonomous navigation.' },
        { id: 'payload', label: 'Payload Delivery', winnersLabel: 'Payload Delivery Winners', slug: 'payload-delivery', winnersTitle: 'Payload Delivery Winners', winnersIntro: 'Verified winners in payload delivery.' },
    ],
    registrationOptions: [
        { id: 'autonomy', label: 'Autonomous Navigation', categoryIds: ['autonomy'] },
        { id: 'payload', label: 'Payload Delivery', categoryIds: ['payload'] },
    ],
    defaults: { availableYears: [2027], registrationYears: [2027], defaultRegistrationYear: 2027, registrationOpen: true, showRegisteredTeams: false },
    rules: { maxMentors: 2, maxMembers: 4, minMembers: 2 },
    fields: { institutionLogo: true, teamLogo: true, teamPhoto: false, memberPhoto: true, memberResume: false, memberEmail: true, memberPhone: false, mentorPhoto: false, mentorInstitution: true },
    directories: { participants: true, winners: true },
    awards: null,
    copy: {
        heroEyebrow: 'EV Society team platform',
        registerSubtitle: 'Register your drone team for recognition on EV Society.',
        registerIntro: 'Register your team and maintain your profile. Submitted information is reviewed before being published on EV Society.',
        registrationNotice: 'Registration creates an EV Society team profile for review.',
        participantsTitle: 'Participating Teams',
        participantsSubtitle: 'Student drone teams verified by EV Society.',
        winnersTitle: 'Student Drone Challenge Winners',
        winnersSubtitle: 'Verified winners of the EV Society Student Drone Challenge.',
        shareName: 'EV Society Student Drone Challenge',
        organiserShort: 'EV Society',
    },
};
