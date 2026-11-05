import NotFoundView from '@/components/ui/NotFoundView';

export default function NotFound() {
    return (
        <NotFoundView
            title="Project Not Found"
            message="The project you're looking for doesn't exist or has been moved."
            backHref="/projects"
            backLabel="Back to Projects"
        />
    );
}
