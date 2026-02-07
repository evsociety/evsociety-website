'use client';

import { Mail, Phone, Clock } from 'lucide-react';

export default function HelpCard() {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Need Help?</h3>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Email Support
                        </div>
                        <a
                            href="mailto:evsociety.org@gmail.com"
                            className="text-sm font-bold text-gray-900 hover:text-primary break-all"
                        >
                            evsociety.org@gmail.com
                        </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Call Us
                        </div>
                        <a
                            href="tel:+918904528357"
                            className="text-sm font-bold text-gray-900 hover:text-primary"
                        >
                            +91 8904528357
                        </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Support Hours
                        </div>
                        <div className="text-sm font-bold text-gray-900">Mon–Fri, 9am–6pm IST</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
