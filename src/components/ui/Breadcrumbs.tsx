import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/config/site';

interface Crumb {
    label: string;
    href?: string;
}

// The last crumb is the current page and is not linked
// Also emits BreadcrumbList structured data for search engines
export default function Breadcrumbs({ items, tone = 'dark' }: { items: Crumb[]; tone?: 'dark' | 'light' }) {
    const dark = tone === 'dark';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href === '/' ? '' : item.href}` } : {}),
        })),
    };
    return (
        <nav aria-label="Breadcrumb">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ol className={`flex flex-wrap items-center gap-1.5 text-sm ${dark ? 'text-slate-300' : 'text-gray-500'}`}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                            {isLast || !item.href ? (
                                <span aria-current={isLast ? 'page' : undefined} className={`truncate ${dark ? 'text-white' : 'font-medium text-gray-900'}`}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link href={item.href} className={`inline-block rounded py-0.5 ${dark ? 'hover:text-white' : 'hover:text-primary'}`}>
                                    {item.label}
                                </Link>
                            )}
                            {!isLast && <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
