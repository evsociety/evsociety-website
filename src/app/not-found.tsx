import type { Metadata } from 'next';
import NotFoundView from '@/components/ui/NotFoundView';

export const metadata: Metadata = {
    title: 'Page Not Found',
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return (
        <NotFoundView
            title="Page not found"
            message="The page you're looking for doesn't exist or has been moved."
            backHref="/"
            backLabel="Back to Home"
        />
    );
}
