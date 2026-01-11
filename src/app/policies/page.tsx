import PageHeader from '@/components/PageHeader';

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
            content: 'Logos displayed on this website are for informational purposes to showcase the EV ecosystem. No endorsement of specific commercial products or services is implied by EV Society™ unless explicitly stated in a technical certification report.'
        }
    ];

    return (
        <div className="bg-white">
            <PageHeader
                title="Legal & Policies"
                description="Guidelines for data usage, brand identity, and ecosystem participation."
                breadcrumb="Policies"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="max-w-4xl space-y-16">
                        {sections.map(section => (
                            <div key={section.title}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                                <div className="prose prose-gray">
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {section.content}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-4 italic">
                                        Last updated: January 2026
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
