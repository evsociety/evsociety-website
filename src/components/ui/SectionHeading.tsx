import type { ReactNode } from 'react';

interface SectionHeadingProps {
    title: ReactNode;
    eyebrow?: string;
    intro?: ReactNode;
    id?: string;
    align?: 'left' | 'center';
    // Rendered beside the heading on wide screens, e.g. a "View all" link
    action?: ReactNode;
    as?: 'h1' | 'h2';
}

// Shared eyebrow + heading + intro block used to open page sections
export default function SectionHeading({ title, eyebrow, intro, id, align = 'left', action, as: Heading = 'h2' }: SectionHeadingProps) {
    const centered = align === 'center';
    return (
        <div className={`mb-12 flex flex-col gap-6 ${action ? 'md:flex-row md:items-end md:justify-between' : ''} ${centered ? 'items-center text-center' : ''}`}>
            <div className={`max-w-3xl ${centered ? 'mx-auto' : ''}`}>
                {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
                <Heading id={id} className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                    {title}
                </Heading>
                {intro && <p className="mt-4 text-lg leading-relaxed text-gray-600">{intro}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
