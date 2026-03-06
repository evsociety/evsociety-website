import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Download, ArrowRight, CheckCircle, FileText } from 'lucide-react';
import { SKILL_MATRIX_DATA } from '@/data/domains/skillMatrix';
import AudienceChips from '@/components/domains/AudienceChips';
import StructuredSkillTable from '@/components/domains/StructuredSkillTable';
import DocumentDownloadCard from '@/components/domains/DocumentDownloadCard';
import PathwayTimeline from '@/components/domains/PathwayTimeline';

export const metadata: Metadata = {
    title: SKILL_MATRIX_DATA.pageMeta.title,
    description: SKILL_MATRIX_DATA.pageMeta.description,
};

export default function SkillMatrixPage() {
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* 1. HERO SECTION */}
            <section className="relative bg-black text-white py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="w-full h-full bg-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 text-sm font-semibold border border-blue-800 mb-6">
                            {SKILL_MATRIX_DATA.hero.pill}
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight text-white">
                            {SKILL_MATRIX_DATA.hero.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed font-light">
                            {SKILL_MATRIX_DATA.hero.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href={SKILL_MATRIX_DATA.overview.documentCard.downloadUrl}
                                className={`px-8 py-3 font-bold rounded-full transition-colors flex items-center justify-center ${SKILL_MATRIX_DATA.overview.documentCard.downloadUrl === '#'
                                    ? 'bg-primary/50 text-white cursor-not-allowed border border-primary/20'
                                    : 'bg-primary text-white hover:bg-blue-700'
                                    }`}
                            >
                                <Download className="mr-2 w-5 h-5" />
                                {SKILL_MATRIX_DATA.hero.primaryCta}
                            </a>
                            <a
                                href="#framework-details"
                                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            >
                                {SKILL_MATRIX_DATA.hero.secondaryCta} <ArrowRight className="ml-2 w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. WHO IS THIS FOR? ROW */}
            <AudienceChips
                heading={SKILL_MATRIX_DATA.whoIsThisFor.heading}
                description={SKILL_MATRIX_DATA.whoIsThisFor.description}
                audiences={SKILL_MATRIX_DATA.whoIsThisFor.audiences}
            />

            {/* 3. OVERVIEW SECTION */}
            <section className="py-16 border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                                {SKILL_MATRIX_DATA.overview.heading}
                            </h2>
                            <div className="space-y-4">
                                {SKILL_MATRIX_DATA.overview.paragraphs.map((p, idx) => (
                                    <p key={idx} className="text-gray-600 text-lg leading-relaxed">
                                        {p}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <DocumentDownloadCard
                                title={SKILL_MATRIX_DATA.overview.documentCard.title}
                                statusLabel={SKILL_MATRIX_DATA.overview.documentCard.statusLabel}
                                buttonText={SKILL_MATRIX_DATA.overview.documentCard.buttonText}
                                downloadUrl={SKILL_MATRIX_DATA.overview.documentCard.downloadUrl}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div id="framework-details" className="bg-gray-50 pt-16 border-b border-gray-100">
                <div className="container-custom">
                    {/* 4. MAIN CONTENT SECTIONS (TABLES A-H) */}
                    <div className="space-y-16">
                        {SKILL_MATRIX_DATA.tables.map((tableData, i) => (
                            <StructuredSkillTable
                                key={i}
                                title={tableData.title}
                                columns={tableData.columns}
                                rows={tableData.rows}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <section className="py-16 bg-white border-b border-gray-100">
                <div className="container-custom">
                    {/* 5. SIMPLE LISTS (I-L, N-S) */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {SKILL_MATRIX_DATA.simpleLists.map((list, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                    {list.title}
                                </h3>
                                <ul className="space-y-3">
                                    {list.items.map((item, j) => (
                                        <li key={j} className="text-sm">
                                            <span className="font-semibold text-gray-800">{item.name}</span>
                                            {item.desc && <span className="text-gray-600 ml-1">— {item.desc}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Additional Competency Sections mapped directly to fit same layout style */}
                        {SKILL_MATRIX_DATA.competencySections.map((list, i) => (
                            <div key={`comp-${i}`} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 text-primary">
                                    {list.title}
                                </h3>
                                <ul className="space-y-3">
                                    {list.items.map((item, j) => (
                                        <li key={j} className="text-sm">
                                            <span className="font-semibold text-gray-800">{item.name}</span>
                                            {item.desc && <span className="text-gray-600 block text-xs mt-0.5">{item.desc}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. SECTION M: Technician Competency Framework */}
            <section className="py-20 bg-gray-900 text-white relative">
                <div className="container-custom relative z-10">
                    <div className="mb-12 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-4 tracking-wider uppercase">
                            NSQF Aligned
                        </span>
                        <h2 className="text-3xl font-bold mb-4">
                            {SKILL_MATRIX_DATA.technicianFramework.title}
                        </h2>
                    </div>

                    <div className="mb-16">
                        <StructuredSkillTable
                            title={SKILL_MATRIX_DATA.technicianFramework.overviewTable.title}
                            columns={SKILL_MATRIX_DATA.technicianFramework.overviewTable.columns}
                            rows={SKILL_MATRIX_DATA.technicianFramework.overviewTable.rows}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {SKILL_MATRIX_DATA.technicianFramework.levels.map((level, i) => (
                            <div key={level.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-colors">
                                <h3 className="text-xl font-bold text-blue-300 mb-2">{level.title}</h3>
                                <p className="text-sm text-gray-300 mb-6 italic">{level.role}</p>

                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Key Competencies</h4>
                                    <ul className="space-y-2">
                                        {level.competencies.map((comp, j) => (
                                            <li key={j} className="flex items-start text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-400 mr-2 shrink-0 mt-0.5" />
                                                <span><span className="font-semibold text-gray-200">{comp.name}:</span> <span className="text-gray-400">{comp.desc}</span></span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Typical Tasks</h4>
                                    <ul className="space-y-2">
                                        {level.tasks.map((task, j) => (
                                            <li key={j} className="flex items-center text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 shrink-0" />
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Checklists & Pathway */}
            <section className="py-20 bg-surface">
                <div className="container-custom">

                    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {SKILL_MATRIX_DATA.checklists.map((list, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        {i === 0 ? <CheckCircle className="w-6 h-6 mr-3 text-primary" /> : <FileText className="w-6 h-6 mr-3 text-primary" />}
                                        {list.title}
                                    </h3>
                                    <ul className="space-y-4">
                                        {list.items.map((item, j) => (
                                            <li key={j} className="flex items-start">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 mr-3" />
                                                <span className="text-gray-700 font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* SECTION V: Pathway Timeline */}
                        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-md">
                            <PathwayTimeline
                                title={SKILL_MATRIX_DATA.pathway.title}
                                steps={SKILL_MATRIX_DATA.pathway.steps}
                            />
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}
