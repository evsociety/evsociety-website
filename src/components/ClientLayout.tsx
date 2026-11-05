'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            {/* First focusable element: lets keyboard users jump past the header */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
            >
                Skip to main content
            </a>
            <Navbar onSearchClick={() => setIsSearchOpen(true)} />
            <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
                {children}
            </main>
            <Footer />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
