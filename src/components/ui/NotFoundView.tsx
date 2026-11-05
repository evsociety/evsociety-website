import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface NotFoundViewProps {
    title: string;
    message: string;
    backHref: string;
    backLabel: string;
}

const helpfulLinks = [
    { href: '/', label: 'Home' },
    { href: '/programs', label: 'Programs' },
    { href: '/projects', label: 'Projects' },
    { href: '/contact', label: 'Contact' },
];

// Shared 404 layout so every "not found" state looks and reads the same
export default function NotFoundView({ title, message, backHref, backLabel }: NotFoundViewProps) {
    return (
        <section className="bg-surface">
            <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Error 404</p>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">{title}</h1>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-600">{message}</p>
                <Link
                    href={backHref}
                    className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {backLabel}
                </Link>
                <nav aria-label="Helpful links" className="mt-10">
                    <ul className="flex flex-wrap justify-center gap-2">
                        {helpfulLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="inline-flex min-h-10 items-center rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </section>
    );
}
