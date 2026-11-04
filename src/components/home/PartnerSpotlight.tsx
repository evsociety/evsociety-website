import Link from 'next/link';
import { getPartners } from '@/utils/data';

const typeLabels: Record<string, string> = {
    company: 'Company',
    institute: 'Institute',
    researcher: 'Researcher',
};

export default function PartnerSpotlight() {
    const partners = getPartners();

    return (
        <section className="bg-white py-20 lg:py-24" aria-labelledby="partners-heading">
            <div className="container-custom">
                <div className="mb-12 text-center">
                    <p className="eyebrow mb-3">Our Ecosystem Partners</p>
                    <h2 id="partners-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Strength in Collaboration</h2>
                </div>

                <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {partners.map((partner) => (
                        <li key={partner.id} className="flex">
                            <Link
                                href={`/partners/${partner.slug}`}
                                className="flex min-h-24 w-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-5 text-center transition-colors hover:border-primary motion-reduce:transition-none"
                            >
                                <span className="text-sm font-semibold leading-snug text-gray-900">{partner.name}</span>
                                <span className="mt-1 text-xs text-gray-500">{typeLabels[partner.type] ?? partner.type}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-12 text-center">
                    <Link href="/partners" className="btn-secondary">
                        View Partner Directory
                    </Link>
                </div>
            </div>
        </section>
    );
}
