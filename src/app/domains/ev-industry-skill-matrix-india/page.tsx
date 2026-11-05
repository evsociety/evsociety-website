import React from 'react';
import { Metadata } from 'next';
import { Download, ArrowDown, CheckCircle, FileText } from 'lucide-react';
import { SKILL_MATRIX_DATA } from '@/data/domains/skillMatrix';
import AudienceChips from '@/components/domains/AudienceChips';
import StructuredSkillTable from '@/components/domains/StructuredSkillTable';
import DocumentDownloadCard from '@/components/domains/DocumentDownloadCard';
import PathwayTimeline from '@/components/domains/PathwayTimeline';

export const metadata: Metadata = {
    // The stored title already ends with the site name, so skip the layout's title template
    title: { absolute: SKILL_MATRIX_DATA.pageMeta.title },
    description: SKILL_MATRIX_DATA.pageMeta.description,
    alternates: {
        canonical: '/domains/ev-industry-skill-matrix-india',
    },
};

// "SECTION A — Electric Vertical Manufacturing Skill Matrix" → anchor "section-a", code "A", name "Electric Vertical Manufacturing Skill Matrix"
const anchorFor = (title: string) => {
    const match = title.match(/^(?:SECTION|Subsection)\s+([A-Z]\d?)/i);
    return match ? `section-${match[1].toLowerCase()}` : title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};
const navLabel = (title: string) => {
    const [code, ...rest] = title.split(' — ');
    return { code: code.replace(/^(?:SECTION|Subsection)\s+/i, ''), name: rest.join(' — ') || title };
};

function ListSection({ title, items, descriptionInline }: { title: string; items: { name: string; desc?: string }[]; descriptionInline: boolean }) {
    const id = anchorFor(title);
    return (
        <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-36 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 id={`${id}-heading`} className="mb-4 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                {title}
            </h2>
            <ul className="space-y-3">
                {items.map((item, j) => (
                    <li key={j} className="text-sm">
                        <span className="font-semibold text-gray-900">{item.name}</span>
                        {item.desc && (descriptionInline
                            ? <span className="ml-1 text-gray-600">— {item.desc}</span>
                            : <span className="mt-0.5 block text-gray-600">{item.desc}</span>)}
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function SkillMatrixPage() {
    const D = SKILL_MATRIX_DATA;
    const downloadReady = D.overview.documentCard.downloadUrl !== '#';
    const sectionTitles = [
        ...D.tables.map((t) => t.title),
        ...D.simpleLists.map((l) => l.title),
        D.technicianFramework.title,
        ...D.competencySections.map((l) => l.title),
        ...D.checklists.map((l) => l.title),
        D.pathway.title,
    ];

    return (
        <div className="bg-white">
            {/* 1. HERO SECTION */}
            <section className="relative bg-navy text-white">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary-300/30" />
                <div className="container-custom py-16 lg:py-24">
                    <div className="max-w-3xl">
                        <span className="mb-6 inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-primary-300">
                            {D.hero.pill}
                        </span>
                        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                            {D.hero.title}
                        </h1>
                        <p className="mb-9 text-xl leading-relaxed text-slate-300">
                            {D.hero.subtitle}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {downloadReady ? (
                                <a
                                    href={D.overview.documentCard.downloadUrl}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                                >
                                    <Download className="h-5 w-5" aria-hidden="true" />
                                    {D.hero.primaryCta}
                                </a>
                            ) : (
                                <p className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 font-semibold text-slate-300">
                                    <Download className="h-5 w-5" aria-hidden="true" />
                                    {D.hero.primaryCta}
                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-primary-300">Coming soon</span>
                                </p>
                            )}
                            <a
                                href="#framework-details"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10 motion-reduce:transition-none"
                            >
                                {D.hero.secondaryCta} <ArrowDown className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. WHO IS THIS FOR? ROW */}
            <AudienceChips
                heading={D.whoIsThisFor.heading}
                description={D.whoIsThisFor.description}
                audiences={D.whoIsThisFor.audiences}
            />

            {/* 3. OVERVIEW SECTION */}
            <section className="py-16">
                <div className="container-custom grid items-center gap-12 md:grid-cols-2">
                    <div>
                        <h2 className="mb-6 text-3xl font-bold leading-tight text-gray-900">
                            {D.overview.heading}
                        </h2>
                        <div className="space-y-4">
                            {D.overview.paragraphs.map((p, idx) => (
                                <p key={idx} className="text-lg leading-relaxed text-gray-600">
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>
                    <DocumentDownloadCard
                        title={D.overview.documentCard.title}
                        statusLabel={D.overview.documentCard.statusLabel}
                        buttonText={D.overview.documentCard.buttonText}
                        downloadUrl={D.overview.documentCard.downloadUrl}
                    />
                </div>
            </section>

            <div id="framework-details" className="scroll-mt-20 border-t border-gray-200 bg-surface">
                {/* Section index for small screens: a sticky, horizontally scrolling row */}
                <nav aria-label="Skill matrix sections" className="sticky top-[72px] z-20 border-b border-gray-200 bg-surface/95 backdrop-blur-sm lg:hidden">
                    <ol className="container-custom flex gap-2 overflow-x-auto py-3">
                        {sectionTitles.map((title) => (
                            <li key={title} className="shrink-0">
                                <a
                                    href={`#${anchorFor(title)}`}
                                    className="block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                                >
                                    {navLabel(title).code}<span className="sr-only"> — {navLabel(title).name}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="container-custom grid gap-10 py-16 lg:grid-cols-12">
                    {/* Section index for wide screens */}
                    <nav aria-label="Skill matrix sections" className="hidden lg:col-span-3 lg:block">
                        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Sections</p>
                            <ol className="space-y-0.5 border-l border-gray-200">
                                {sectionTitles.map((title) => {
                                    const { code, name } = navLabel(title);
                                    return (
                                        <li key={title}>
                                            <a
                                                href={`#${anchorFor(title)}`}
                                                className="-ml-px flex gap-2 border-l-2 border-transparent py-1.5 pl-3 text-sm text-gray-600 hover:border-primary hover:text-primary"
                                            >
                                                <span className="w-4 shrink-0 font-semibold text-gray-900">{code}</span>
                                                <span>{name}</span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </nav>

                    <div className="min-w-0 space-y-16 lg:col-span-9">
                        {/* 4. TABLES A–H */}
                        {D.tables.map((tableData, i) => (
                            <StructuredSkillTable
                                key={i}
                                id={anchorFor(tableData.title)}
                                headingLevel="h2"
                                title={tableData.title}
                                columns={tableData.columns}
                                rows={tableData.rows}
                            />
                        ))}

                        {/* 5. LISTS I–L */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {D.simpleLists.map((list, i) => (
                                <ListSection key={i} title={list.title} items={list.items} descriptionInline />
                            ))}
                        </div>

                        {/* 6. SECTION M: Technician Competency Framework */}
                        <section id={anchorFor(D.technicianFramework.title)} aria-labelledby="section-m-heading" className="scroll-mt-36 rounded-3xl bg-navy p-6 text-white sm:p-10">
                            <span className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300">
                                NSQF Aligned
                            </span>
                            <h2 id="section-m-heading" className="mb-10 text-2xl font-bold text-white sm:text-3xl">
                                {D.technicianFramework.title}
                            </h2>

                            <div className="mb-10">
                                <StructuredSkillTable
                                    id={anchorFor(D.technicianFramework.overviewTable.title)}
                                    tone="dark"
                                    title={D.technicianFramework.overviewTable.title}
                                    columns={D.technicianFramework.overviewTable.columns}
                                    rows={D.technicianFramework.overviewTable.rows}
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {D.technicianFramework.levels.map((level) => (
                                    <section key={level.id} id={`section-${level.id.toLowerCase()}`} aria-labelledby={`section-${level.id.toLowerCase()}-heading`} className="scroll-mt-36 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                                        <h3 id={`section-${level.id.toLowerCase()}-heading`} className="mb-2 text-lg font-bold text-primary-300">{level.title}</h3>
                                        <p className="mb-6 text-sm text-slate-300">{level.role}</p>

                                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Key Competencies</h4>
                                        <ul className="mb-6 space-y-2">
                                            {level.competencies.map((comp, j) => (
                                                <li key={j} className="flex items-start text-sm">
                                                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                                                    <span><span className="font-semibold text-white">{comp.name}:</span> <span className="text-slate-300">{comp.desc}</span></span>
                                                </li>
                                            ))}
                                        </ul>

                                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Typical Tasks</h4>
                                        <ul className="space-y-2">
                                            {level.tasks.map((task, j) => (
                                                <li key={j} className="flex items-start text-sm text-slate-300">
                                                    <span aria-hidden="true" className="mr-2 mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </section>

                        {/* 7. COMPETENCIES N–S */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {D.competencySections.map((list, i) => (
                                <ListSection key={i} title={list.title} items={list.items} descriptionInline={false} />
                            ))}
                        </div>

                        {/* 8. CHECKLISTS T–U */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {D.checklists.map((list, i) => {
                                const id = anchorFor(list.title);
                                return (
                                    <section key={i} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-36 rounded-2xl border border-gray-200 bg-white p-6">
                                        <h2 id={`${id}-heading`} className="mb-5 flex items-center gap-3 text-lg font-bold text-gray-900">
                                            {i === 0 ? <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" /> : <FileText className="h-5 w-5 text-primary" aria-hidden="true" />}
                                            {list.title}
                                        </h2>
                                        <ul className="space-y-3">
                                            {list.items.map((item, j) => (
                                                <li key={j} className="flex items-start gap-3">
                                                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                    <span className="font-medium text-gray-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                );
                            })}
                        </div>

                        {/* 9. SECTION V: Pathway */}
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10">
                            <PathwayTimeline
                                id={anchorFor(D.pathway.title)}
                                title={D.pathway.title}
                                steps={D.pathway.steps}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
