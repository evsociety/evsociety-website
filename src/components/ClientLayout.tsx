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
            <Navbar onSearchClick={() => setIsSearchOpen(true)} />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
