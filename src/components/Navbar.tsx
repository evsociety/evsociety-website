'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, User } from 'lucide-react';

import Image from 'next/image';

const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Domains', href: '/domains' },
    { name: 'Programs', href: '/programs' },
    { name: 'Projects', href: '/projects' },
    { name: 'Events', href: '/events' },
    { name: 'Resources', href: '/resources' },
    { name: 'Partners', href: '/partners' },
    { name: 'Join', href: '/join' },
    { name: 'Contact', href: '/contact' },
];

export default function Navbar({ onSearchClick }: { onSearchClick: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm py-2' : 'bg-white py-4'}`}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                <Image
                                    src="/logo.jpg"
                                    alt="EV Society™"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <span className="text-xl font-black text-primary leading-tight block">EV Society™</span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href ? 'text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onSearchClick}
                            className="p-2 text-gray-500 hover:text-primary transition-colors"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <User className="w-4 h-4" />
                            Member Login
                        </button>

                        <div className="lg:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-gray-500 hover:text-primary transition-colors"
                            >
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 active:bg-gray-100 transition-colors">
                            <User className="w-4 h-4" />
                            Member Login
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
