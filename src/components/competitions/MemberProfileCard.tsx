import type { PublicPerson } from '@/lib/competitions/model';
import ContactLinks from './ContactLinks';
import ProfilePhoto from './ProfilePhoto';

// Portrait card for a team leader or member. Only approved fields are passed in; missing
// photographs fall back to initials and missing links are simply not shown.
export default function MemberProfileCard({ person, variant = 'member' }: { person: PublicPerson; variant?: 'leader' | 'member' | 'compact' }) {
    const roleLabel = person.role === 'leader' ? 'Team Leader' : 'Team Member';
    if (variant === 'leader') {
        return (
            <article className="flex flex-col items-center gap-5 rounded-2xl bg-navy p-6 text-center text-white sm:flex-row sm:items-center sm:p-8 sm:text-left" aria-label={`${roleLabel}: ${person.name}`}>
                <ProfilePhoto name={person.name} src={person.photoUrl} size="xl" />
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">{roleLabel}</p>
                    <h4 className="mt-2 break-words text-2xl font-bold tracking-tight text-white">{person.name}</h4>
                    <div className="mt-4 flex justify-center sm:justify-start">
                        <ContactLinks name={person.name} linkedin={person.linkedin} email={person.email} phone={person.phone} tone="dark" />
                    </div>
                </div>
            </article>
        );
    }
    if (variant === 'compact') {
        return (
            <div className="flex min-w-0 items-center gap-3">
                <ProfilePhoto name={person.name} src={person.photoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900" title={person.name}>{person.name}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
                <ContactLinks name={person.name} linkedin={person.linkedin} email={person.email} phone={person.phone} />
            </div>
        );
    }
    return (
        <article className="flex h-full flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center" aria-label={`${roleLabel}: ${person.name}`}>
            <ProfilePhoto name={person.name} src={person.photoUrl} size="lg" />
            <h4 className="mt-4 break-words text-base font-semibold text-gray-900">{person.name}</h4>
            <p className="mt-0.5 text-sm text-gray-500">{roleLabel}</p>
            {(person.linkedin || person.email || person.phone) && (
                <div className="mt-4">
                    <ContactLinks name={person.name} linkedin={person.linkedin} email={person.email} phone={person.phone} />
                </div>
            )}
        </article>
    );
}
