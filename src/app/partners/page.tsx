import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partners Directory',
    description: 'Connect with organizations, institutes, and researchers driving electric vertical (eVTOL) flight and aerospace innovation through the EV Society™ partner network.',
    alternates: {
        canonical: '/partners',
    },
};

export { default } from './PartnersClient';
