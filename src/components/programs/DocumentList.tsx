import { Document } from '../../types/evto';
import StatusBadge from './StatusBadge';
import { FileText, Download, AlertCircle, Calendar } from 'lucide-react';

interface DocumentListProps {
    documents: Document[];
}

function RequiredTag({ required }: { required: boolean }) {
    return required ? (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Required</span>
    ) : (
        <span className="text-xs text-gray-500">Optional</span>
    );
}

function ReviewNote({ note }: { note: string }) {
    return (
        <div className="mt-2 flex w-fit items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{note}</span>
        </div>
    );
}

function FileLink({ doc, label }: { doc: Document; label: string }) {
    return doc.fileUrl ? (
        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 rounded font-semibold text-primary hover:text-primary-hover">
            <Download className="h-4 w-4" aria-hidden="true" />
            {label}
            <span className="sr-only">: {doc.name} (opens in a new tab)</span>
        </a>
    ) : (
        <span className="text-xs text-gray-500">No file</span>
    );
}

export default function DocumentList({ documents }: DocumentListProps) {
    if (!documents || documents.length === 0) {
        return <div className="px-5 py-4 text-sm italic text-gray-500">No documents required for this section.</div>;
    }

    return (
        <div>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-surface">
                        <tr>
                            {['Document', 'Required', 'Status', 'Submitted', 'File'].map((col) => (
                                <th key={col} scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {documents.map((doc, index) => (
                            <tr key={`${doc.docId}-${index}`} className="align-top">
                                <td className="px-5 py-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                                            <div className="mt-1 text-xs leading-relaxed text-gray-600">{doc.description}</div>
                                            {doc.reviewNotes && <ReviewNote note={doc.reviewNotes} />}
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4"><RequiredTag required={doc.required} /></td>
                                <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={doc.status} size="sm" /></td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                    {doc.submittedOn ? (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                                            {doc.submittedOn}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm"><FileLink doc={doc} label="View" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Cards */}
            <ul className="space-y-3 p-4 md:hidden">
                {documents.map((doc, index) => (
                    <li key={`${doc.docId}-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">{doc.name}</h4>
                                <p className="mt-1 text-xs leading-relaxed text-gray-600">{doc.description}</p>
                            </div>
                            <RequiredTag required={doc.required} />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <StatusBadge status={doc.status} size="sm" />
                            {doc.submittedOn && (
                                <span className="flex items-center gap-1 text-xs text-gray-600">
                                    <Calendar className="h-3 w-3" aria-hidden="true" />
                                    {doc.submittedOn}
                                </span>
                            )}
                        </div>

                        {doc.reviewNotes && <ReviewNote note={doc.reviewNotes} />}

                        <div className="mt-3 flex justify-end border-t border-gray-100 pt-3 text-sm">
                            {doc.fileUrl ? <FileLink doc={doc} label="View / Download" /> : <span className="w-full text-center text-xs text-gray-500">No file uploaded</span>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
