import Link from 'next/link';
import { getPartners } from '@/utils/data';

export default function PartnerSpotlight() {
    const partners = getPartners();

    return (
        <section className="py-24 bg-surface/50 border-y border-gray-100">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Our Ecosystem Partners</h2>
                    <p className="text-3xl font-extrabold text-gray-900 mb-4">Strength in Collaboration</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 grayscale opacity-70 hover:grayscale-0 transition-all duration-500">
                    {partners.map((partner) => (
                        <div key={partner.id} className="flex items-center justify-center p-6 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all h-24">
                            {/* Using text logos for now as placeholders for actual images */}
                            <span className="text-xs font-bold text-gray-400 text-center leading-tight uppercase tracking-widest">{partner.name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/partners" className="btn-secondary">
                        View Partner Directory
                    </Link>
                </div>
            </div>
        </section>
    );
}
