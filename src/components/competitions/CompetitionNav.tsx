import Link from 'next/link';
import type { CompetitionDefinition } from '@/config/competitions';
import { competitionPaths } from '@/config/competitions';

export type CompetitionSection = 'overview' | 'register' | 'participants' | 'winners' | 'manage' | 'team';

// Route navigation shared by every competition page
export default function CompetitionNav({ competition, active }: { competition: CompetitionDefinition; active: CompetitionSection }) {
    const paths = competitionPaths(competition);
    const items: { id: CompetitionSection | 'awards'; label: string; href: string }[] = [
        { id: 'overview', label: 'Overview', href: paths.overview },
        { id: 'register', label: 'Register Team', href: paths.register },
        ...(competition.directories.participants ? [{ id: 'participants' as const, label: 'Participating Teams', href: paths.participants }] : []),
        ...(competition.directories.winners ? [{ id: 'winners' as const, label: 'Competition Winners', href: paths.winners }] : []),
        ...(competition.awards ? [{ id: 'awards' as const, label: 'Innovation Awards', href: paths.awards }] : []),
    ];
    const link = (isActive: boolean) =>
        `block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${isActive ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`;
    return (
        <nav aria-label={`${competition.shortName} pages`} className="sticky top-[72px] z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="container-custom flex items-center gap-2 overflow-x-auto py-2">
                <ol className="flex gap-1">
                    {items.map((item) => (
                        <li key={item.id} className="shrink-0">
                            <Link href={item.href} aria-current={item.id === active ? 'page' : undefined} className={link(item.id === active)}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ol>
                <Link href={paths.manage} aria-current={active === 'manage' ? 'page' : undefined} className={`ml-auto shrink-0 ${link(active === 'manage')}`}>
                    Manage Team Profile
                </Link>
            </div>
        </nav>
    );
}
