import Image from 'next/image';
import DefaultProfileAvatar from './DefaultProfileAvatar';

const PX = { sm: 40, md: 64, lg: 96, xl: 128 } as const;

// Approved photographs are already resized when uploaded and served from the site's own media
// route with short cache lifetimes, so they are shown as-is (lazy-loaded, fixed dimensions).
export default function ProfilePhoto({ name, src, size = 'md', shape = 'circle' }: { name: string; src: string | null; size?: keyof typeof PX; shape?: 'circle' | 'rounded' }) {
    if (!src) return <DefaultProfileAvatar name={name} size={size} shape={shape} />;
    const px = PX[size];
    return (
        <Image
            src={src}
            alt={`Photograph of ${name}`}
            width={px}
            height={px}
            unoptimized
            loading="lazy"
            className={`shrink-0 bg-gray-100 object-cover ${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}
            style={{ width: px, height: px }}
        />
    );
}
