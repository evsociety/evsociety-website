import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6">
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
                        <p className="text-gray-600 mb-6 max-w-sm">
                            Uniting government, industry, academia, and startups to advance EV safety, standards, research, and skills.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/vision-mission" className="text-gray-600 hover:text-primary transition-colors">Vision & Mission</Link></li>
                            <li><Link href="/domains" className="text-gray-600 hover:text-primary transition-colors">Technical Domains</Link></li>
                            <li><Link href="/programs" className="text-gray-600 hover:text-primary transition-colors">Programs</Link></li>
                            <li><Link href="/events" className="text-gray-600 hover:text-primary transition-colors">Upcoming Events</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="/resources" className="text-gray-600 hover:text-primary transition-colors">Publications</Link></li>
                            <li><Link href="/resources" className="text-gray-600 hover:text-primary transition-colors">Safety Guidelines</Link></li>
                            <li><Link href="/partners" className="text-gray-600 hover:text-primary transition-colors">Partner Directory</Link></li>
                            <li><Link href="/join" className="text-gray-600 hover:text-primary transition-colors">Join EV Society™</Link></li>
                            <li><Link href="/policies" className="text-gray-600 hover:text-primary transition-colors">Logo Usage</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-gray-600 break-all">evsociety.org@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-gray-600">Bengaluru, Karnataka</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-gray-600">+91 8904528357</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} EV Society™. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/policies" className="text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <Link href="/policies" className="text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Logos are displayed for informational purposes only. No endorsement is implied.
                    </p>
                </div>
            </div>
        </footer>
    );
}
