import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
            <div className="container-custom relative z-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-5 text-primary bg-blue-50 mb-6">
                            Official Professional Body
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
                            Accelerating the future of electric mobility—safely and sustainably.
                        </h1>
                        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                            <span className="text-primary font-extrabold">EV Society™</span> is a non-profit educational and technical community advancing electric mobility through research, safety, standards, skills, and collaboration across industry, academia, startups, and the public.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                            <Link href="/join" className="btn-primary flex items-center gap-2 text-lg px-8">
                                Join EV Society™
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link href="/domains" className="btn-secondary text-lg px-8">
                                Explore Focus Areas
                            </Link>
                        </div>
                    </div>

                    <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6 flex justify-center">
                        <div className="relative w-full max-w-lg">
                            {/* Simple Abstract SVG Illustration */}
                            <svg viewBox="0 0 500 500" className="w-full h-auto drop-shadow-2xl animate-fade-in" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="250" cy="250" r="200" fill="#F8FAFC" />
                                <path d="M150 250H350" stroke="#004A99" strokeWidth="8" strokeLinecap="round" />
                                <path d="M250 150V350" stroke="#004A99" strokeWidth="8" strokeLinecap="round" />
                                <rect x="200" y="200" width="100" height="100" rx="20" fill="#004A99" />
                                <path d="M230 250L245 265L270 235" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="250" cy="250" r="140" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="10 10" />
                                <rect x="100" y="100" width="40" height="40" rx="8" fill="#22C55E" opacity="0.8" />
                                <rect x="360" y="360" width="40" height="40" rx="8" fill="#F59E0B" opacity="0.8" />
                                <rect x="360" y="100" width="40" height="40" rx="8" fill="#3B82F6" opacity="0.8" />
                            </svg>
                            {/* Background Decor */}
                            <div className="absolute -top-4 -right-4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
