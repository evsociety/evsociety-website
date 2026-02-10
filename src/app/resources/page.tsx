import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import { getResources } from '@/utils/data';
import ResourcesClient from '@/components/resources/ResourcesClient';

export const metadata: Metadata = {
    title: 'Resources',
    description: 'Access EV Society™ safety playbooks, technical whitepapers, standardized guidelines, and knowledge resources for the electric mobility ecosystem.',
    alternates: {
        canonical: '/resources',
    },
};

export default function ResourcesPage() {
    const resources = getResources();

    return (
        <div className="bg-white">
            <PageHeader
                title="Knowledge Repository"
                description="Access safety playbooks, technical whitepapers, and standardized guidelines for the EV ecosystem."
                breadcrumb="Resources"
            />

            <ResourcesClient resources={resources} />
        </div>
    );
}
