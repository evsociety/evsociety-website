import type { ReactNode } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import type { CompetitionDefinition } from '@/config/competitions';

interface Props {
    competition: CompetitionDefinition;
    title: ReactNode;
    /** Plain text for the breadcrumb trail */
    crumb: string;
    subtitle?: ReactNode;
    eyebrow?: string;
    children?: ReactNode;
    extraCrumbs?: { label: string; href?: string }[];
}

export default function CompetitionHero({ competition, title, crumb, subtitle, eyebrow, children, extraCrumbs = [] }: Props) {
    return (
        <section className="relative overflow-hidden bg-navy text-white" aria-labelledby="competition-page-title">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
            <div className="container-custom py-12 lg:py-16">
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Programs', href: '/programs' },
                        { label: competition.shortName, href: competition.basePath },
                        ...extraCrumbs,
                        { label: crumb },
                    ]}
                />
                <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">{eyebrow ?? competition.copy.heroEyebrow}</p>
                <h1 id="competition-page-title" className="mt-4 max-w-4xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                    {title}
                </h1>
                {subtitle && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{subtitle}</p>}
                {children}
            </div>
        </section>
    );
}
