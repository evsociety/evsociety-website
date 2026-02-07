import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register',
    description: 'Register for EV Society™ events, programs, projects, and webinars. Join our community of EV professionals, researchers, and enthusiasts.',
    alternates: {
        canonical: '/register',
    },
};

export { default } from './RegisterClient';
