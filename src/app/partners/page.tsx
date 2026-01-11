import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partners Directory',
    description: 'Connect with organizations, institutes, and researchers driving the electric mobility revolution through the EV Society™ partner network.',
    alternates: {
        canonical: '/partners',
    },
};

export { default } from './PartnersClient';
