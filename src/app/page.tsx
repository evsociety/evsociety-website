import Hero from '@/components/home/Hero';
import ImpactMetrics from '@/components/home/ImpactMetrics';
import Features from '@/components/home/Features';
import FeaturedPrograms from '@/components/home/FeaturedPrograms';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import PartnerSpotlight from '@/components/home/PartnerSpotlight';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <ImpactMetrics />

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why <span className="text-primary font-black">EV Society™</span> exists</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Electric mobility spans engineering, safety, infrastructure, policy, and public adoption.
              <span className="text-primary font-bold">EV Society™</span> brings these stakeholders together to accelerate innovation—while ensuring safety, quality, reliability, and responsible deployment.
            </p>
          </div>
        </div>
      </section>

      <Features />
      <FeaturedPrograms />
      <UpcomingEvents />
      <PartnerSpotlight />
      <Newsletter />
    </>
  );
}
