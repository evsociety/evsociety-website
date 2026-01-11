'use client';

import PageHeader from '@/components/PageHeader';
import { Mail, Phone, MapPin, Linkedin, Twitter, MessageSquare } from 'lucide-react';

export default function ContactClient() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Contact EV Society™"
                description="Have questions about membership, programs, or partnerships? Reach out to our national secretariat."
                breadcrumb="Contact"
            />

            <section className="py-24">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-12 gap-16">
                        {/* Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-surface p-10 rounded-3xl border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h2>
                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                                            <input type="text" className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                                            <input type="email" className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all" placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Subject</label>
                                        <select className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all bg-white">
                                            <option>General Inquiry</option>
                                            <option>Membership Question</option>
                                            <option>Partner Onboarding</option>
                                            <option>Technical Domain / WG</option>
                                            <option>Event Registration</option>
                                            <option>Press & Media</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Message</label>
                                        <textarea rows={5} className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all" placeholder="How can we help you today?"></textarea>
                                    </div>
                                    <button type="submit" className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="lg:col-span-5 space-y-12">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-8">Get in Touch</h3>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</div>
                                            <div className="text-lg font-bold text-gray-900 break-all">evsociety.org@gmail.com</div>
                                            <div className="text-sm text-gray-500">Response within 24 hours</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Call Us</div>
                                            <div className="text-lg font-bold text-gray-900">+91 8904528357</div>
                                            <div className="text-sm text-gray-500">Mon–Fri, 9am–6pm IST</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Visit Headquarters</div>
                                            <div className="text-lg font-bold text-gray-900 leading-tight">National Secretariat, <span className="text-primary font-bold">EV Society™</span></div>
                                            <div className="text-sm text-gray-500 mt-1">HSR Layout, Bengaluru,<br />Karnataka 560102</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-8">Follow Our Updates</h3>
                                <div className="flex gap-4">
                                    {[
                                        { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-700' },
                                        { icon: Twitter, label: 'Twitter', color: 'hover:text-sky-500' },
                                        { icon: MessageSquare, label: 'Community', color: 'hover:text-green-500' }
                                    ].map(social => (
                                        <a key={social.label} href="#" className={`p-4 bg-surface rounded-2xl text-gray-500 ${social.color} transition-all border border-transparent hover:border-gray-200 hover:bg-white`}>
                                            <social.icon className="w-6 h-6" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
