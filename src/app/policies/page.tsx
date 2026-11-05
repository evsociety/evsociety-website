import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
    title: 'Legal & Policies',
    description: 'EV Society™ privacy policy, terms of service, logo usage guidelines, and non-endorsement policy for data usage and ecosystem participation.',
    alternates: {
        canonical: '/policies',
    },
};

const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function PoliciesPage() {
    const sections = [
        {
            title: 'Privacy Policy',
            content: <><span className="text-primary font-bold">EV Society™</span> is committed to protecting the privacy of its members and partners. We collect only necessary information for membership processing and event registration. Your data is never sold to third parties.</>
        },
        {
            title: 'Terms of Service',
            content: 'By using this website and joining EV Society™, you agree to abide by our technical code of conduct and democratic governance principles. Membership is subject to approval by the executive board.'
        },
        {
            title: 'Logo Usage Guidelines',
            content: 'The EV Society™ logo is a trademark of the society. Partners may use the "In Partnership with EV Society™" variant of the logo on their websites and marketing materials, provided they follow the official brand book spacing and color requirements.'
        },
        {
            title: 'Non-Endorsement Policy',
            content: 'Logos displayed on this website are for informational purposes to showcase the Electric Vertical (eVTOL), aerospace, defence and space ecosystem. No endorsement of specific commercial products or services is implied by EV Society™ unless explicitly stated in a technical certification report.'
        }
    ];

    return (
        <div className="bg-white">
            <PageHeader
                title="Legal & Policies"
                description="Guidelines for data usage, brand identity, and ecosystem participation."
                breadcrumb="Policies"
            />

            <section className="py-16 lg:py-24">
                <div className="container-custom grid gap-12 lg:grid-cols-12">
                    <nav aria-label="On this page" className="lg:col-span-3">
                        <div className="lg:sticky lg:top-28">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">On this page</p>
                            <ol className="space-y-1 border-l border-gray-200">
                                {sections.map((section) => (
                                    <li key={section.title}>
                                        <a
                                            href={`#${slugify(section.title)}`}
                                            className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary"
                                        >
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </nav>

                    <div className="max-w-3xl divide-y divide-gray-200 lg:col-span-9">
                        {sections.map(section => (
                            <article key={section.title} id={slugify(section.title)} className="scroll-mt-28 py-10 first:pt-0">
                                <h2 className="mb-5 text-2xl font-bold text-gray-900">{section.title}</h2>
                                <p className="text-lg leading-relaxed text-gray-700">
                                    {section.content}
                                </p>
                                <p className="mt-5 text-sm text-gray-500">
                                    Last updated: January 2026
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
