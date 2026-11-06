import Image from './opengraph-image';
import { CARD_SIZE } from '@/lib/competitions/server/recognitionCard';

// X (Twitter) uses the same card as Open Graph; declared separately so the site-wide default
// X image does not override it
export const size = CARD_SIZE;
export const contentType = 'image/png';
export const alt = 'EV Society competition recognition card';
export const revalidate = 300;
export default Image;
