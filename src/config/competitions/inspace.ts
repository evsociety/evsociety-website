import { SPACE_PROGRAM } from '@/data/programs/space-innovation/program.config';
import type { CompetitionDefinition } from './types';

// First competition on the platform. Titles come from the existing program config so the
// program page, registration and directories always use the same wording.
export const INSPACE_COMPETITION: CompetitionDefinition = {
    id: 'inspace-model-rocketry-cansat',
    slug: 'inspace-model-rocketry-cansat',
    basePath: SPACE_PROGRAM.href,
    name: SPACE_PROGRAM.competitionTitle,
    shortName: 'IN-SPACe Model Rocketry/CAN-7USAT',
    organiser: SPACE_PROGRAM.organizer,
    organiserUrl: SPACE_PROGRAM.officialUrl,
    participantType: 'team',
    landing: 'custom',
    categories: [
        { id: 'model-rocketry', label: 'Model Rocketry', winnersLabel: 'Model Rocketry Winners' },
        { id: 'can-7usat', label: 'CAN-7USAT', winnersLabel: 'CAN-7USAT Winners' },
    ],
    registrationOptions: [
        { id: 'model-rocketry', label: 'Model Rocketry', categoryIds: ['model-rocketry'] },
        { id: 'can-7usat', label: 'CAN-7USAT', categoryIds: ['can-7usat'] },
        {
            id: 'both',
            label: 'Model Rocketry & CAN-7USAT',
            description: 'One team profile, recognised separately in each category.',
            categoryIds: ['model-rocketry', 'can-7usat'],
        },
    ],
    defaults: {
        availableYears: [2026],
        registrationYears: [2026],
        defaultRegistrationYear: 2026,
        registrationOpen: true,
        showRegisteredTeams: false,
    },
    rules: { maxMentors: 4, maxMembers: null, minMembers: 0 },
    fields: {
        institutionLogo: true,
        teamLogo: true,
        teamPhoto: true,
        memberPhoto: true,
        memberResume: true,
        memberEmail: true,
        memberPhone: true,
        mentorPhoto: true,
        mentorInstitution: true,
    },
    directories: { participants: true, winners: true },
    awards: {
        heading: 'EV Society Innovation Awards 2026',
        intro: 'EV Society’s proposed innovation awards for the winning CAN-7USAT and Model Rocketry teams.',
        documents: [
            {
                id: 'AWD-INSPACE-2026-CAN7USAT',
                year: 2026,
                categoryId: 'can-7usat',
                title: 'EV Society CAN-7USAT Innovation Award 2026',
                status: 'Proposed',
                // Not supplied yet; the administrator publishes it from the Awards tab
                pdf: null,
            },
            {
                id: 'AWD-INSPACE-2026-ROCKETRY',
                year: 2026,
                categoryId: 'model-rocketry',
                title: 'EV Society Model Rocketry Innovation Award 2026',
                status: 'Proposed',
                pdf: null,
            },
        ],
        facts: [
            { label: 'Proposed innovation award', value: SPACE_PROGRAM.awardAmount, note: 'For each winning team' },
            { label: 'Proposed engineering development support', value: SPACE_PROGRAM.supportDuration, note: 'For both winning teams, after the competition' },
            { label: 'Proposed final demonstration deadline', value: SPACE_PROGRAM.finalDeadline.label, note: 'Subject to confirmation' },
        ],
        disclaimer: `The ${SPACE_PROGRAM.initiativeTitle}, including the award amounts, the engineering development support, the collaborators named and the ${SPACE_PROGRAM.finalDeadline.label} deadline, is EV Society's own proposed initiative and remains subject to formal confirmation. The competition is organised independently by IN-SPACe; nothing here represents approval, sponsorship or endorsement by IN-SPACe.`,
        links: [
            { label: 'Proposed collaboration details', href: `${SPACE_PROGRAM.href}#contact` },
            { label: 'Full disclaimer', href: `${SPACE_PROGRAM.href}#disclaimer` },
        ],
    },
    copy: {
        heroEyebrow: 'EV Society team platform',
        registerSubtitle: "Showcase your team's engineering talent, mentors and achievements through the EV Society competition platform.",
        registerIntro: 'Register your team and maintain your profile. Submitted information is reviewed before being published on EV Society.',
        registrationNotice: 'This is an EV Society team-profile and recognition submission. It is not an entry to the IN-SPACe competition, which IN-SPACe organises and judges independently. To compete, register with IN-SPACe.',
        participantsTitle: 'Participating Teams',
        participantsSubtitle: "Recognising the engineering students, colleges and mentors contributing to India's space technology ecosystem.",
        winnersTitle: 'IN-SPACe Model Rocketry/CAN-7USAT India Student Competition Winners',
        winnersSubtitle: 'Celebrating the next generation of aerospace engineers, student innovators and future space entrepreneurs.',
    },
};
