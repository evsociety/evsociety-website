'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, User, LogOut, ChevronDown, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics/ga4';
import { isAdminAuthenticated, signOutAdmin } from '@/lib/adminAuth';
import { PROGRAMS_MENU } from '@/data/programs/menu';
import { ORGANISATION_DESCRIPTOR } from '@/config/site';

import Image from 'next/image';

interface NavChild {
    name: string;
    href: string;
    description?: string;
}

interface NavItem {
    name: string;
    href: string;
    children?: NavChild[];
    // Adds an "All …" link to the parent page at the end of the dropdown
    overviewLabel?: string;
}

const navItems: NavItem[] = [
    {
        name: 'About',
        href: '/about',
        children: [
            { name: 'About EV Society™', href: '/about' },
            { name: 'Vision & Mission', href: '/vision-mission' },
            { name: 'Legal & Policies', href: '/policies' },
            { name: 'Contact', href: '/contact' },
        ],
    },
    {
        name: 'Research Domains',
        href: '/domains',
        children: [
            { name: 'Focus Areas', href: '/domains' },
            { name: 'EV Industry Skill Matrix (India)', href: '/domains/ev-industry-skill-matrix-india' },
        ],
    },
    { name: 'Programs', href: '/programs', children: PROGRAMS_MENU, overviewLabel: 'All programs' },
    { name: 'Projects', href: '/projects' },
    { name: 'Events', href: '/events' },
    { name: 'Resources', href: '/resources' },
    { name: 'Partners', href: '/partners' },
    { name: 'Membership', href: '/join' },
];

const isWithin = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const isItemActive = (pathname: string, item: NavItem) =>
    isWithin(pathname, item.href) || !!item.children?.some((child) => isWithin(pathname, child.href.split('#')[0]));

const menuId = (name: string) => `nav-menu-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`;

export default function Navbar({ onSearchClick }: { onSearchClick: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const desktopNavRef = useRef<HTMLDivElement>(null);
    const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const pathname = usePathname();

    // Check if user is admin
    useEffect(() => {
        setIsAdmin(isAdminAuthenticated());
    }, []);

    // Close menus after navigating
    useEffect(() => {
        setOpenMenu(null);
        setIsOpen(false);
    }, [pathname]);

    // Close an open dropdown on an outside click, or on Escape (returning focus to its button)
    useEffect(() => {
        if (!openMenu) return;

        const handlePointerDown = (e: PointerEvent) => {
            if (!desktopNavRef.current?.contains(e.target as Node)) setOpenMenu(null);
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            menuButtonRefs.current[openMenu]?.focus();
            setOpenMenu(null);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openMenu]);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const shouldBeScrolled = window.scrollY > 20;
                    setScrolled(prev => {
                        // Only update if state actually changes
                        if (prev !== shouldBeScrolled) {
                            return shouldBeScrolled;
                        }
                        return prev;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Set initial scroll state
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const trackNav = (name: string, location: string, href: string) => trackEvent('nav_click', {
        nav_item: name.toLowerCase(),
        nav_location: location,
        destination_path: href
    });

    const loginControl = (location: 'header' | 'mobile_drawer', className: string) => isAdmin ? (
        <button
            type="button"
            onClick={() => {
                trackEvent('cta_click', {
                    cta_id: 'admin_logout',
                    location
                });
                signOutAdmin();
            }}
            className={className}
        >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Logout
        </button>
    ) : (
        <Link
            href="/admin/registrations"
            onClick={() => {
                trackEvent('cta_click', {
                    cta_id: 'member_login',
                    location,
                    destination_path: '/admin/registrations'
                });
                setIsOpen(false);
            }}
            className={className}
        >
            <User className="w-4 h-4" aria-hidden="true" />
            Login
        </Link>
    );

    return (
        <>
            {/* Identity bar */}
            <div className="bg-navy text-slate-300">
                <div className="container-custom flex h-9 items-center justify-between gap-4 text-xs">
                    <p className="truncate">
                        <span className="font-semibold text-white">EV Society</span>
                        <span aria-hidden="true" className="mx-2 text-slate-500">|</span>
                        {ORGANISATION_DESCRIPTOR}
                    </p>
                    <div className="hidden shrink-0 items-center gap-5 sm:flex">
                        <Link
                            href="/contact"
                            onClick={() => trackNav('Contact', 'utility_bar', '/contact')}
                            className="rounded hover:text-white"
                        >
                            Contact
                        </Link>
                        {loginControl('header', 'inline-flex items-center gap-1.5 rounded hover:text-white')}
                    </div>
                </div>
            </div>

            <nav
                aria-label="Main"
                className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm transition-shadow duration-200 motion-reduce:transition-none ${scrolled ? 'border-gray-200 shadow-sm' : 'border-gray-100'}`}
            >
                <div className="container-custom">
                    <div className="flex h-[72px] items-center justify-between gap-4">
                        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-lg" aria-label="EV Society™ home">
                            <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                                <Image
                                    src="/logo.jpg"
                                    alt=""
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-xl font-black leading-tight tracking-tight text-gray-900">EV Society™</span>
                        </Link>

                        <div ref={desktopNavRef} className="hidden xl:flex items-center gap-0.5">
                            {navItems.map((item) => {
                                const active = isItemActive(pathname, item);
                                const linkClass = `relative flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${active ? 'text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`;

                                if (!item.children) {
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            aria-current={pathname === item.href ? 'page' : undefined}
                                            onClick={() => trackNav(item.name, 'header', item.href)}
                                            className={linkClass}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                }

                                const isMenuOpen = openMenu === item.name;
                                return (
                                    <div
                                        key={item.name}
                                        className="relative"
                                        onBlur={(e) => {
                                            // Close when keyboard focus moves past the menu; outside clicks are handled above
                                            if (isMenuOpen && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpenMenu(null);
                                        }}
                                    >
                                        <button
                                            ref={(el) => { menuButtonRefs.current[item.name] = el; }}
                                            type="button"
                                            aria-expanded={isMenuOpen}
                                            aria-controls={menuId(item.name)}
                                            onClick={() => setOpenMenu(isMenuOpen ? null : item.name)}
                                            className={linkClass}
                                        >
                                            {item.name}
                                            <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                        </button>

                                        {isMenuOpen && (
                                            <div
                                                id={menuId(item.name)}
                                                className={`absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl ${item.children.some((child) => child.description) ? 'w-[24rem]' : 'w-64'}`}
                                            >
                                                <ul>
                                                    {item.children.map((child) => (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                aria-current={pathname === child.href ? 'page' : undefined}
                                                                onClick={() => {
                                                                    trackNav(child.name, 'header_menu', child.href);
                                                                    setOpenMenu(null);
                                                                }}
                                                                className="block rounded-xl px-4 py-2.5 hover:bg-gray-50 focus-visible:bg-gray-50"
                                                            >
                                                                <span className={`block text-sm font-semibold ${pathname === child.href ? 'text-primary' : 'text-gray-900'}`}>{child.name}</span>
                                                                {child.description && <span className="mt-0.5 block text-xs text-gray-500">{child.description}</span>}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {item.overviewLabel && (
                                                    <div className="mt-1 border-t border-gray-100 pt-1">
                                                        <Link
                                                            href={item.href}
                                                            aria-current={pathname === item.href ? 'page' : undefined}
                                                            onClick={() => {
                                                                trackNav(item.overviewLabel!, 'header_menu', item.href);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold text-primary hover:bg-gray-50 focus-visible:bg-gray-50"
                                                        >
                                                            {item.overviewLabel}
                                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    trackEvent('search_open', { location: 'header' });
                                    onSearchClick();
                                }}
                                className="grid h-10 w-10 place-items-center rounded-full text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary motion-reduce:transition-none"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" aria-hidden="true" />
                            </button>

                            <Link
                                href="/register"
                                aria-current={pathname === '/register' ? 'page' : undefined}
                                onClick={() => trackNav('Register', 'header', '/register')}
                                className="hidden sm:inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none"
                            >
                                Register
                            </Link>

                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isOpen}
                                aria-controls="mobile-menu"
                                className="xl:hidden grid h-10 w-10 place-items-center rounded-full text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary motion-reduce:transition-none"
                            >
                                {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div id="mobile-menu" className="xl:hidden max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-gray-100 bg-white animate-fade-in motion-reduce:animate-none">
                        <div className="container-custom py-4">
                            <ul className="space-y-1">
                                {[{ name: 'Home', href: '/' } as NavItem, ...navItems].map((item) => {
                                    const children = item.children?.filter((child) => child.href !== item.href) ?? [];
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                aria-current={pathname === item.href ? 'page' : undefined}
                                                className={`block rounded-lg px-3 py-2.5 text-base font-semibold ${pathname === item.href ? 'bg-primary-50 text-primary' : 'text-gray-900 hover:bg-gray-50 hover:text-primary'}`}
                                                onClick={() => {
                                                    trackNav(item.name, 'mobile_drawer', item.href);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                {item.name}
                                            </Link>
                                            {children.length > 0 && (
                                                <ul aria-label={item.name} className="mb-2 ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                                                    {children.map((child) => (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                aria-current={pathname === child.href ? 'page' : undefined}
                                                                className={`block rounded-lg px-3 py-2 text-sm font-medium leading-snug ${pathname === child.href ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                                                onClick={() => {
                                                                    trackNav(child.name, 'mobile_drawer', child.href);
                                                                    setIsOpen(false);
                                                                }}
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
                                <Link
                                    href="/register"
                                    onClick={() => {
                                        trackNav('Register', 'mobile_drawer', '/register');
                                        setIsOpen(false);
                                    }}
                                    className="flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                                >
                                    Register
                                </Link>
                                {loginControl('mobile_drawer', 'flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50')}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
