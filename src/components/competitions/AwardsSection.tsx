import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import type { CompetitionDefinition } from '@/config/competitions';
import { categoryLabel } from '@/config/competitions';
import type { PublicAward } from '@/lib/competitions/model';
import AwardPDFCard from './AwardPDFCard';

export default function AwardsSection({ competition, awards, heading, sectionId = 'awards' }: { competition: CompetitionDefinition; awards: PublicAward[]; heading?: string; sectionId?: string }) {
    const config = competition.awards;
    if (!config || !awards.length) return null;
    return (
        <section id={sectionId} aria-labelledby={`${sectionId}-heading`} className="scroll-mt-32 border-t border-gray-200 bg-off-white py-16 lg:py-20">
            <div className="container-custom">
                <div className="max-w-3xl">
                    <p className="eyebrow">Innovation awards</p>
                    <h2 id={`${sectionId}-heading`} className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{heading ?? config.heading}</h2>
                    {config.intro && <p className="mt-4 text-lg leading-relaxed text-gray-600">{config.intro}</p>}
                </div>

                <ul className={`mt-10 grid gap-6 ${awards.length > 1 ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
                    {awards.map((award) => (
                        <li key={award.awardId}>
                            <AwardPDFCard award={award} categoryLabel={categoryLabel(competition, award.categoryId)} competitionId={competition.id} orientation={awards.length === 1 ? 'horizontal' : 'vertical'} />
                        </li>
                    ))}
                </ul>

                {!!config.facts?.length && (
                    <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-navy-raised text-white sm:grid-cols-3">
                        {config.facts.map((fact) => (
                            <div key={fact.label} className="bg-navy p-6">
                                <dt className="text-sm font-medium text-slate-300">{fact.label}</dt>
                                <dd className="mt-1 text-2xl font-bold tracking-tight">{fact.value}</dd>
                                {fact.note && <dd className="mt-1 text-sm text-slate-300">{fact.note}</dd>}
                            </div>
                        ))}
                    </dl>
                )}

                {(config.disclaimer || config.links?.length) && (
                    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-start">
                        <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                            {config.disclaimer && <p className="text-sm leading-relaxed text-gray-600">{config.disclaimer}</p>}
                            {!!config.links?.length && (
                                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                                    {config.links.map((link) => (
                                        <li key={link.href}>
                                            <Link href={link.href} className="inline-flex min-h-8 items-center gap-1 rounded text-sm font-semibold text-primary hover:underline">
                                                {link.label}
                                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
