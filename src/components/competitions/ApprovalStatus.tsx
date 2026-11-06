import { Award, BadgeCheck, CheckCircle2, CircleDashed, Clock, FileEdit, Lock, XCircle } from 'lucide-react';
import type { PublicStage, TeamStatus } from '@/lib/competitions/model';
import { STAGE_LABEL } from '@/lib/competitions/model';

// Public stage labels: registration, verified participation and verified winners are distinct
export function StageBadge({ stage, achievement }: { stage: PublicStage; achievement?: string }) {
    const styles: Record<PublicStage, string> = {
        registered: 'bg-gray-100 text-gray-700 ring-gray-200',
        participant: 'bg-primary-50 text-primary ring-primary-200',
        winner: 'bg-amber-50 text-amber-900 ring-amber-300',
    };
    const Icon = stage === 'winner' ? Award : stage === 'participant' ? BadgeCheck : CircleDashed;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[stage]}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {STAGE_LABEL[stage]}
            {stage === 'winner' && achievement ? <span className="font-medium">· {achievement}</span> : null}
        </span>
    );
}

const TEAM_STATUS: Record<TeamStatus, { label: string; cls: string; Icon: typeof Clock; help: string }> = {
    'Draft': { label: 'Draft', cls: 'bg-gray-100 text-gray-700 ring-gray-200', Icon: FileEdit, help: 'Not yet submitted. Complete the form and submit it for review.' },
    'Pending Review': { label: 'Pending review', cls: 'bg-primary-50 text-primary ring-primary-200', Icon: Clock, help: 'EV Society is reviewing this registration.' },
    'Changes Requested': { label: 'Changes requested', cls: 'bg-amber-50 text-amber-900 ring-amber-300', Icon: FileEdit, help: 'EV Society asked for changes. Update the profile and submit it again.' },
    'Approved': { label: 'Approved', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', Icon: CheckCircle2, help: 'The registration is approved. Changes to the profile are reviewed before they are published.' },
    'Rejected': { label: 'Not accepted', cls: 'bg-red-50 text-red-800 ring-red-200', Icon: XCircle, help: 'This registration was not accepted. Contact EV Society with any questions.' },
};

export function ApprovalStatus({ status, size = 'md' }: { status: TeamStatus; size?: 'sm' | 'md' }) {
    const s = TEAM_STATUS[status] ?? TEAM_STATUS['Draft'];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${s.cls} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
            <s.Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
            {s.label}
        </span>
    );
}

export function statusHelp(status: TeamStatus) {
    return (TEAM_STATUS[status] ?? TEAM_STATUS['Draft']).help;
}

export function LockedBadge({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            <Lock className="h-3 w-3" aria-hidden="true" />
            {children}
        </span>
    );
}
