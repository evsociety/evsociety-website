import { MetadataRoute } from 'next';
import partnersData from '@/data/partners.json';
import { getAllProjects, getProject } from '@/lib/projects-dal';
import { SITE_URL } from '@/config/site';
import { COMPETITIONS, competitionPaths } from '@/config/competitions';
import { getCompetitionDataSafe } from '@/lib/competitions/server/publicData';

// Rebuilt hourly so newly published team profiles are listed
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;
    const currentDate = new Date();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/vision-mission`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/domains`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/programs`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/programs/inspace-model-rocketry-cansat`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/programs/evto`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/programs/evto/candidates`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/domains/ev-industry-skill-matrix-india`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/events`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/resources`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/partners`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/join`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/policies`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Dynamic partner routes
    const partnerRoutes: MetadataRoute.Sitemap = partnersData.map((partner) => ({
        url: `${baseUrl}/partners/${partner.slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // Project routes, built from the projects index; only projects with a page are listed
    const projectsIndex = await getAllProjects();
    const publishedProjects = (await Promise.all(
        projectsIndex.projects.map(async (p) => ((await getProject(p.projectId)) ? p.projectId : null))
    )).filter((id): id is string => id !== null);

    const projectRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/projects`,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        ...publishedProjects.flatMap((id) => [
            {
                url: `${baseUrl}/projects/${id}`,
                lastModified: currentDate,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            },
            {
                url: `${baseUrl}/projects/${id}/candidates`,
                lastModified: currentDate,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            },
        ]),
    ];

    // Competition team platform: register, directories, and every published team profile
    const competitionRoutes: MetadataRoute.Sitemap = [];
    for (const competition of COMPETITIONS) {
        const paths = competitionPaths(competition);
        competitionRoutes.push(
            { url: `${baseUrl}${paths.register}`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
            { url: `${baseUrl}${paths.participants}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
            { url: `${baseUrl}${paths.winners}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
            ...competition.categories.map((c) => ({ url: `${baseUrl}${paths.categoryWinners(c.slug)}`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.7 })),
        );
        const published = await getCompetitionDataSafe(competition);
        for (const team of published?.data.teams ?? []) {
            competitionRoutes.push({ url: `${baseUrl}${paths.team(team.slug)}`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 });
        }
    }

    return [...staticRoutes, ...competitionRoutes, ...partnerRoutes, ...projectRoutes];
}
