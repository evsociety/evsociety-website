'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';

interface ProjectActionsProps {
    projectId: string;
}

export default function ProjectActions({ projectId }: ProjectActionsProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
                href={`/projects/${projectId}`}
                onClick={() => trackEvent('project_open', {
                    project_id: projectId,
                    page: '/projects'
                })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
            >
                View Project
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
                href={`/projects/${projectId}/candidates`}
                onClick={() => trackEvent('nav_click', {
                    nav_item: 'project_candidates',
                    nav_location: 'project_card',
                    destination_path: `/projects/${projectId}/candidates`
                })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-300 px-6 font-semibold text-gray-800 transition-colors hover:border-primary hover:text-primary motion-reduce:transition-none"
            >
                Candidates
            </Link>
            <Link
                href="https://autonomous.ev.engineer/workshop-gallery"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('nav_click', {
                    nav_item: 'project_gallery',
                    nav_location: 'project_card',
                    destination_path: 'https://autonomous.ev.engineer/workshop-gallery'
                })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-300 px-6 font-semibold text-gray-800 transition-colors hover:border-primary hover:text-primary motion-reduce:transition-none"
            >
                Gallery
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
            </Link>
        </div>
    );
}
