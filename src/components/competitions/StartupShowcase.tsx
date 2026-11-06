import { Rocket } from 'lucide-react';

// Reserved section for teams that go on to build a startup. Nothing collects this yet; the
// component renders only when an administrator has supplied the details.
export interface StartupProfile {
    startupName: string;
    technologyFocus?: string;
    prototype?: string;
    milestones?: string[];
    publications?: { title: string; href?: string }[];
    videos?: { title: string; href: string }[];
    partnerships?: string[];
}

export default function StartupShowcase({ startup }: { startup?: StartupProfile | null }) {
    if (!startup?.startupName) return null;
    return (
        <section aria-labelledby="startup-heading" className="rounded-2xl border border-gray-200 bg-off-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 id="startup-heading" className="text-lg font-bold">From Competition to Space Startup</h3>
            </div>
            <p className="mt-4 text-xl font-semibold text-gray-900">{startup.startupName}</p>
            {startup.technologyFocus && <p className="mt-1 text-gray-600">{startup.technologyFocus}</p>}
            {startup.prototype && <p className="mt-4 leading-relaxed text-gray-700">{startup.prototype}</p>}
            {!!startup.milestones?.length && (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-gray-700">
                    {startup.milestones.map((m) => <li key={m}>{m}</li>)}
                </ul>
            )}
        </section>
    );
}
