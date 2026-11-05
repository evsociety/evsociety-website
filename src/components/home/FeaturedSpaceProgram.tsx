import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import ProgramCTALink from '@/components/programs/ProgramCTALink';
import KeepCanSatTogether from '@/components/programs/KeepCanSatTogether';
import { SPACE_PROGRAM } from '@/data/programs/space-innovation/program.config';

// Used on the home page and first on /programs; `page` and `section` label the CTA in analytics
// `priority` loads the photo eagerly where the section is near the top of the page (it is the LCP image on /programs)
export default function FeaturedSpaceProgram({ page = '/', section = 'featured_space_program', className = 'bg-white py-20 lg:py-24', priority = false }: { page?: string; section?: string; className?: string; priority?: boolean }) {
    const { image } = SPACE_PROGRAM;
    const headingId = `${section}-heading`;

    return (
        <section id="inspace-model-rocketry-cansat" className={`scroll-mt-28 ${className}`} aria-labelledby={headingId}>
            <div className="container-custom">
                <div className="grid overflow-hidden rounded-3xl bg-navy text-white shadow-xl shadow-navy/10 lg:grid-cols-12">
                    <div className="p-8 sm:p-10 lg:col-span-7 lg:p-14">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
                            Featured Space Innovation Program
                        </p>
                        <h2 id={headingId} className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                            <KeepCanSatTogether text={SPACE_PROGRAM.competitionTitle} />
                        </h2>
                        <p className="mt-4 text-lg font-semibold text-primary-300">
                            {SPACE_PROGRAM.initiativeTitle}
                        </p>
                        <p className="mt-5 max-w-2xl leading-relaxed text-slate-200">
                            EV Society proposes equal awards for the winning <span className="whitespace-nowrap">CAN-7USAT</span> and Model Rocketry teams, each followed by
                            three months of focused engineering development to turn a promising concept into a working,
                            validated demonstrator.
                        </p>

                        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                            {SPACE_PROGRAM.awards.map((award) => (
                                <li key={award.id} className="rounded-2xl bg-navy-raised p-5 ring-1 ring-white/10">
                                    <p className="text-sm font-semibold text-slate-300">{award.category} winner</p>
                                    <p className="mt-2 text-2xl font-bold tracking-tight">{SPACE_PROGRAM.awardAmount}</p>
                                    <p className="mt-1 text-sm text-slate-300">+ {SPACE_PROGRAM.supportDuration} engineering support</p>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <ProgramCTALink
                                href={SPACE_PROGRAM.href}
                                ctaId="explore_space_innovation_program"
                                page={page}
                                section={section}
                                className="inline-flex min-h-12 w-fit shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-7 font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 motion-reduce:transition-none"
                            >
                                Explore Program
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </ProgramCTALink>
                            <p className="text-sm text-slate-300">
                                Proposed by EV Society, subject to confirmation. Competition organized independently by IN-SPACe.
                            </p>
                        </div>
                    </div>

                    <figure className="relative order-first min-h-64 sm:min-h-80 lg:order-last lg:col-span-5 lg:min-h-full">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            quality={90}
                            priority={priority}
                            sizes="(min-width: 1200px) 480px, (min-width: 1024px) 40vw, 100vw"
                            className="object-cover object-[50%_72%] lg:object-[50%_60%]"
                        />
                        <figcaption className="absolute bottom-3 right-3 rounded bg-navy/80 px-2 py-1 text-xs text-slate-200">
                            {image.credit}
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    );
}
