import { Metadata } from 'next';
import AdminRegistrationsClient from './AdminRegistrationsClient';

export const metadata: Metadata = {
    title: 'Admin – Registrations | EV Society™',
    description: 'View and export registrations by date, type, and role.',
    robots: 'noindex, nofollow',
};

export default function AdminRegistrationsPage() {
    return <AdminRegistrationsClient />;
}
