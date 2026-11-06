import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, children, action, tone = 'default' }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode; tone?: 'default' | 'warning' }) {
    return (
        <div className={`rounded-2xl border border-dashed px-6 py-12 text-center sm:px-10 sm:py-16 ${tone === 'warning' ? 'border-amber-300 bg-amber-50/60' : 'border-gray-300 bg-off-white'}`}>
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${tone === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-white text-primary ring-1 ring-gray-200'}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mx-auto mt-5 max-w-xl text-lg font-semibold text-gray-900">{title}</p>
            {children && <div className="mx-auto mt-2 max-w-xl leading-relaxed text-gray-600">{children}</div>}
            {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
        </div>
    );
}
