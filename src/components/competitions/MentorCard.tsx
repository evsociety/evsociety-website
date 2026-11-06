import type { PublicMentor } from '@/lib/competitions/model';
import ContactLinks from './ContactLinks';
import ProfilePhoto from './ProfilePhoto';

export default function MentorCard({ mentor }: { mentor: PublicMentor }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5">
            <ProfilePhoto name={mentor.name} src={mentor.photoUrl} size="sm" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900" title={mentor.name}>{mentor.name}</p>
                <p className="truncate text-xs text-gray-500" title={mentor.institution || undefined}>{mentor.institution || 'Mentor'}</p>
            </div>
            <ContactLinks name={mentor.name} linkedin={mentor.linkedin} />
        </div>
    );
}
