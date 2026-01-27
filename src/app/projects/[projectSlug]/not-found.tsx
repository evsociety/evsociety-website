import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Project Not Found</h2>
                    <p className="text-gray-600">
                        The project you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>
            </div>
        </div>
    );
}
