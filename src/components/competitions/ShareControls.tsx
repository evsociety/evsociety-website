'use client';

import { useEffect, useState } from 'react';
import { Check, ClipboardCopy, Download, Link2, Linkedin, MessageCircle, Share2 } from 'lucide-react';
import { GA4_EVENTS, type CompetitionEventParams } from '@/data/analytics/events';
import { trackEvent } from '@/utils/analytics/ga4';

interface Props {
    /** Absolute canonical URL of the profile being shared */
    url: string;
    title: string;
    caption: string;
    cardUrl?: string;
    cardFileName?: string;
    analytics: CompetitionEventParams;
    tone?: 'light' | 'dark';
}

// Share actions for a published team. LinkedIn builds the post from the page's Open Graph tags
// (it cannot pre-fill text), so the suggested caption is offered separately to copy.
export default function ShareControls({ url, title, caption, cardUrl, cardFileName, analytics, tone = 'light' }: Props) {
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [copied, setCopied] = useState<'' | 'link' | 'caption'>('');
    useEffect(() => { setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'); }, []);
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(''), 2500);
        return () => clearTimeout(t);
    }, [copied]);

    const track = (event: string, extra: Partial<CompetitionEventParams>) => trackEvent(event, { ...analytics, ...extra });

    const copy = async (text: string, kind: 'link' | 'caption') => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
        }
        setCopied(kind);
        if (kind === 'link') track(GA4_EVENTS.SHARE_LINK_COPY, { share_platform: 'copy_link' });
        else track(GA4_EVENTS.TEAM_SHARE_CLICK, { share_platform: 'copy_caption' });
    };

    const nativeShare = async () => {
        track(GA4_EVENTS.TEAM_SHARE_CLICK, { share_platform: 'native' });
        try {
            await navigator.share({ title, text: caption, url });
        } catch {
            // The visitor closed the share sheet
        }
    };

    const dark = tone === 'dark';
    const btn = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors motion-reduce:transition-none ${dark ? 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15' : 'bg-white text-gray-800 ring-1 ring-gray-300 hover:ring-primary hover:text-primary'}`;
    return (
        <div>
            <ul className="flex flex-wrap gap-2.5" aria-label="Share this team profile">
                <li>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track(GA4_EVENTS.TEAM_SHARE_CLICK, { share_platform: 'linkedin' })}
                        className={btn}
                    >
                        <Linkedin className="h-4 w-4" aria-hidden="true" />
                        Share on LinkedIn
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </li>
                <li>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(caption)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track(GA4_EVENTS.TEAM_SHARE_CLICK, { share_platform: 'whatsapp' })}
                        className={btn}
                    >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        Share on WhatsApp
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </li>
                {canNativeShare && (
                    <li>
                        <button type="button" onClick={nativeShare} className={btn}>
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                            More options
                        </button>
                    </li>
                )}
                <li>
                    <button type="button" onClick={() => copy(url, 'link')} className={btn}>
                        {copied === 'link' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
                        {copied === 'link' ? 'Link copied' : 'Copy profile link'}
                    </button>
                </li>
                <li>
                    <button type="button" onClick={() => copy(caption, 'caption')} className={btn}>
                        {copied === 'caption' ? <Check className="h-4 w-4" aria-hidden="true" /> : <ClipboardCopy className="h-4 w-4" aria-hidden="true" />}
                        {copied === 'caption' ? 'Caption copied' : 'Copy caption'}
                    </button>
                </li>
                {cardUrl && (
                    <li>
                        <a
                            href={cardUrl}
                            download={cardFileName}
                            onClick={() => trackEvent(GA4_EVENTS.RECOGNITION_CARD_DOWNLOAD, { ...analytics, content_type: 'recognition_card' })}
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors motion-reduce:transition-none ${dark ? 'bg-gold-300 text-navy hover:bg-gold-200' : 'bg-navy text-white hover:bg-navy-raised'}`}
                        >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Download recognition card
                        </a>
                    </li>
                )}
            </ul>
            <p className="sr-only" aria-live="polite">{copied === 'link' ? 'Profile link copied' : copied === 'caption' ? 'Caption copied' : ''}</p>
        </div>
    );
}
