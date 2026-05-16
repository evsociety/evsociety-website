'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';

interface ProjectActionsProps {
    projectId: string;
}

export default function ProjectActions({ projectId }: ProjectActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <Link
                href={`/projects/${projectId}`}
                onClick={() => trackEvent('project_open', {
                    project_id: projectId,
                    page: '/projects'
                })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                View Project
                <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
                href={`/projects/${projectId}/candidates`}
                onClick={() => trackEvent('nav_click', {
                    nav_item: 'project_candidates',
                    nav_location: 'project_card',
                    destination_path: `/projects/${projectId}/candidates`
                })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
                Gallery
            </Link>
        </div>
    );
}
