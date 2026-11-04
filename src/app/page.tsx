import Hero from '@/components/home/Hero';
import ImpactMetrics from '@/components/home/ImpactMetrics';
import FeaturedSpaceProgram from '@/components/home/FeaturedSpaceProgram';
import Features from '@/components/home/Features';
import FeaturedPrograms from '@/components/home/FeaturedPrograms';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import PartnerSpotlight from '@/components/home/PartnerSpotlight';
import Newsletter from '@/components/home/Newsletter';
import PosterPopup from '@/components/home/PosterPopup';

// Re-render hourly so "Upcoming Events" moves past events out without a redeploy
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <ImpactMetrics />
      <FeaturedSpaceProgram />

      <section className="border-t border-gray-100 bg-white py-20 lg:py-24" aria-labelledby="why-heading">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-3">Purpose</p>
              <h2 id="why-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why <span className="text-primary font-black">EV Society™</span> exists</h2>
            </div>
            <p className="text-xl leading-relaxed text-gray-600 lg:col-span-7">
              Electric mobility spans engineering, safety, infrastructure, policy, and public adoption.{' '}
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
      <PosterPopup />
    </>
  );
}
