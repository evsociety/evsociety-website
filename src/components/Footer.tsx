'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';
import { PROGRAMS_MENU } from '@/data/programs/menu';
import { ORGANISATION_DESCRIPTOR } from '@/config/site';

const quickLinks = [
    { label: 'About Us', href: '/about', id: 'about' },
    { label: 'Vision & Mission', href: '/vision-mission', id: 'vision_mission' },
    { label: 'Technical Domains', href: '/domains', id: 'domains' },
    { label: 'Programs', href: '/programs', id: 'programs' },
    { label: 'Upcoming Events', href: '/events', id: 'events' },
];

const resourceLinks = [
    { label: 'Publications', href: '/resources', id: 'publications' },
    { label: 'Safety Guidelines', href: '/resources', id: 'safety_guidelines' },
    { label: 'Partner Directory', href: '/partners', id: 'partners' },
    { label: 'Join EV Society™', href: '/join', id: 'join' },
    { label: 'Logo Usage', href: '/policies', id: 'logo_usage' },
];

const programLinks = [
    ...PROGRAMS_MENU.map((program) => ({ label: program.name, href: program.href, id: program.href })),
    { label: 'All programs', href: '/programs', id: 'all_programs' },
];

// Profile URLs have not been configured yet; these icons currently link to "#"
const socialLinks = [
    { label: 'LinkedIn', icon: Linkedin },
    { label: 'X (Twitter)', icon: Twitter },
    { label: 'GitHub', icon: Github },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string; id: string }[] }) {
    return (
        <div>
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">{title}</h2>
            <ul className="space-y-1.5">
                {links.map((link) => (
                    <li key={link.id}>
                        <Link
                            href={link.href}
                            onClick={() => trackEvent('nav_click', { nav_item: link.id, nav_location: 'footer', destination_path: link.href })}
                            className="inline-block rounded py-1 text-sm leading-snug text-slate-300 transition-colors hover:text-white motion-reduce:transition-none"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-navy pt-16 pb-8 text-slate-300">
            <div className="container-custom">
                <div className="mb-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-3">
                        <Link href="/" className="mb-5 inline-flex items-center gap-3 rounded-lg">
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg ring-1 ring-white/10">
                                <Image
                                    src="/logo.jpg"
                                    alt=""
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-xl font-black leading-tight text-white">EV Society™</span>
                        </Link>
                        <p className="mb-4 text-sm font-semibold text-primary-300">{ORGANISATION_DESCRIPTOR}</p>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-300">
                            Uniting government, industry, academia, and startups to advance EV safety, standards, research, and skills.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map(({ label, icon: Icon }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-slate-300 ring-1 ring-white/10 transition-colors hover:text-white motion-reduce:transition-none"
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <FooterColumn title="Quick Links" links={quickLinks} />
                    </div>
                    <div className="lg:col-span-2">
                        <FooterColumn title="Programs" links={programLinks} />
                    </div>
                    <div className="lg:col-span-2">
                        <FooterColumn title="Resources" links={resourceLinks} />
                    </div>

                    <div className="lg:col-span-3">
                        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">Contact</h2>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                                <a href="mailto:evsociety.org@gmail.com" className="inline-block rounded py-0.5 [overflow-wrap:anywhere] hover:text-white">evsociety.org@gmail.com</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                                <span>Bengaluru, Karnataka</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />
                                <a href="tel:+918904528357" className="inline-block rounded py-0.5 hover:text-white">+91 8904528357</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
                    <p className="text-sm text-slate-400">
                        © {currentYear} EV Society™. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/policies" onClick={() => trackEvent('nav_click', { nav_item: 'privacy_policy', nav_location: 'footer', destination_path: '/policies' })} className="inline-block rounded py-1 text-slate-400 transition-colors hover:text-white motion-reduce:transition-none">Privacy Policy</Link>
                        <Link href="/policies" onClick={() => trackEvent('nav_click', { nav_item: 'terms_of_service', nav_location: 'footer', destination_path: '/policies' })} className="inline-block rounded py-1 text-slate-400 transition-colors hover:text-white motion-reduce:transition-none">Terms of Service</Link>
                    </div>
                </div>
                <div className="mt-6 space-y-2 text-center">
                    <p className="text-xs text-slate-400">
                        EV Society™ is an independent, non-profit professional organisation and is not a government body.
                    </p>
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                        Logos are displayed for informational purposes only. No endorsement is implied.
                    </p>
                </div>
            </div>
        </footer>
    );
}
