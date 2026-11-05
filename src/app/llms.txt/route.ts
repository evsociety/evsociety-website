import { CONTACT, ORGANISATION_DESCRIPTOR, SITE_DESCRIPTION, SITE_URL } from '@/config/site';
import { SPACE_PROGRAM } from '@/data/programs/space-innovation/program.config';
import { EVTO_PROGRAM_CONFIG } from '@/data/programs/evto/program.config';
import { RESEARCH_DOMAINS } from '@/data/domains/researchDomains';
import { getAllProjects, getProject } from '@/lib/projects-dal';
import { getEvents } from '@/utils/data';
import { todayInIndia } from '@/lib/eventsJsonLd';
import { getStatusLabel } from '@/utils/evtoStatus';

// llms.txt (https://llmstxt.org): a plain-text guide to the site for AI search tools and
// assistants. Built from the same data as the pages so it stays accurate; refreshed hourly.
export const revalidate = 3600;

const url = (path: string) => `${SITE_URL}${path}`;

export async function GET() {
    const projects = (await getAllProjects()).projects;
    const published = (await Promise.all(projects.map(async (p) => ((await getProject(p.projectId)) ? p : null)))).filter((p) => p !== null);
    const today = todayInIndia();
    const upcoming = getEvents().filter((e) => e.date >= today);

    const lines = [
        '# EV Society',
        '',
        `> ${SITE_DESCRIPTION}`,
        '',
        `EV Society describes itself as an "${ORGANISATION_DESCRIPTOR}", based in ${CONTACT.locality}, ${CONTACT.region}, India. EV Society™ is an independent, non-profit professional organisation and is not a government body.`,
        '',
        `- Website: ${SITE_URL}`,
        `- Email: ${CONTACT.email}`,
        `- Phone: ${CONTACT.telephone}`,
        '',
        '## Programs',
        '',
        `- [${SPACE_PROGRAM.competitionTitle} — ${SPACE_PROGRAM.initiativeTitle}](${url(SPACE_PROGRAM.href)}): EV Society proposes an innovation award of ${SPACE_PROGRAM.awardAmount} and ${SPACE_PROGRAM.supportDuration} of engineering development support for each of the CAN-7USAT and Model Rocketry winning teams (${SPACE_PROGRAM.totalAwards} in total), with a proposed final demonstration on ${SPACE_PROGRAM.finalDeadline.label}. All of this is proposed and subject to confirmation. The competition itself is organized independently by IN-SPACe; EV Society's awards are its own initiative and are not endorsed by IN-SPACe. Official competition information: ${SPACE_PROGRAM.officialUrl}`,
        `- [${EVTO_PROGRAM_CONFIG.title}](${url('/programs/evto')}): ${EVTO_PROGRAM_CONFIG.description}`,
        `- [Certified EV Legal & Business Strategist (EVLBS™)](${url('/programs#evlbs')}): The gold standard for legal, regulatory, and business leaders mastering the legal, contractual, and intellectual property frameworks of the EV ecosystem.`,
        `- [All programs](${url('/programs')})`,
        '',
        '## Research domains',
        '',
        ...RESEARCH_DOMAINS.map((d) => `- [${d.name}](${url(d.link.href)})${d.comingSoon ? ': coming soon' : `: ${d.link.label}`}`),
        `- [EV Industry Skill Matrix (India)](${url('/domains/ev-industry-skill-matrix-india')}): a structured skills framework for India's electric vehicle ecosystem.`,
        '',
        '## Projects',
        '',
        ...published.map((p) => `- [${p.title}](${url(`/projects/${p.projectId}`)}): ${p.shortDescription} Status: ${getStatusLabel(p.status)}, ${p.overallPercentage}% complete.`),
        '',
        '## Upcoming events',
        '',
        ...(upcoming.length
            ? upcoming.map((e) => `- ${e.date}${e.time ? `, ${e.time}` : ''}: ${e.title} (${e.mode}, ${e.city})`)
            : ['- No upcoming events are scheduled.']),
        `- [All events](${url('/events')})`,
        '',
        '## Key pages',
        '',
        `- [About](${url('/about')})`,
        `- [Vision & Mission](${url('/vision-mission')})`,
        `- [Resources](${url('/resources')})`,
        `- [Partner Directory](${url('/partners')}): directory listings; no endorsement is implied.`,
        `- [Membership](${url('/join')})`,
        `- [Register](${url('/register')})`,
        `- [Contact](${url('/contact')})`,
        `- [Legal & Policies](${url('/policies')})`,
        '',
    ];

    return new Response(lines.join('\n'), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
