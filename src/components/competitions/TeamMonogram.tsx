import Image from 'next/image';
import { initialsOf } from './DefaultProfileAvatar';

// Team logo, or the team's initials when no logo was approved
export default function TeamMonogram({ name, logoUrl, size = 'md' }: { name: string; logoUrl: string | null; size?: 'md' | 'lg' }) {
    const px = size === 'lg' ? 88 : 56;
    if (logoUrl) {
        return (
            <Image src={logoUrl} alt={`${name} logo`} width={px} height={px} unoptimized loading="lazy" className="shrink-0 rounded-2xl border border-gray-200 bg-white object-contain p-1.5" style={{ width: px, height: px }} />
        );
    }
    return (
        <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-2xl bg-primary-50 font-bold text-primary ring-1 ring-primary-100 ${size === 'lg' ? 'h-[88px] w-[88px] text-2xl' : 'h-14 w-14 text-lg'}`}>
            {initialsOf(name)}
        </span>
    );
}
