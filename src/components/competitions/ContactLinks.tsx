import { Linkedin, Mail, Phone } from 'lucide-react';

// Renders only links that exist and were approved for publication; nothing for missing ones
export default function ContactLinks({ name, linkedin, email, phone, tone = 'light' }: { name: string; linkedin?: string | null; email?: string | null; phone?: string | null; tone?: 'light' | 'dark' }) {
    if (!linkedin && !email && !phone) return null;
    const cls = `inline-grid h-9 w-9 place-items-center rounded-full transition-colors motion-reduce:transition-none ${tone === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary'}`;
    return (
        <ul className="flex flex-wrap items-center gap-2" aria-label={`Contact links for ${name}`}>
            {linkedin && (
                <li>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer nofollow" className={cls} aria-label={`${name} on LinkedIn (opens in a new tab)`}>
                        <Linkedin className="h-4 w-4" aria-hidden="true" />
                    </a>
                </li>
            )}
            {email && (
                <li>
                    <a href={`mailto:${email}`} className={cls} aria-label={`Email ${name}`}>
                        <Mail className="h-4 w-4" aria-hidden="true" />
                    </a>
                </li>
            )}
            {phone && (
                <li>
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={cls} aria-label={`Call ${name}`}>
                        <Phone className="h-4 w-4" aria-hidden="true" />
                    </a>
                </li>
            )}
        </ul>
    );
}
