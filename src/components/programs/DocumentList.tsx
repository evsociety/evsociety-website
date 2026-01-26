import { Document } from '../../types/evto';
import StatusBadge from './StatusBadge';
import { FileText, Download, Upload, AlertCircle, Calendar } from 'lucide-react';

interface DocumentListProps {
    documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
    if (!documents || documents.length === 0) {
        return <div className="text-gray-500 text-sm italic py-4">No documents required for this section.</div>;
    }

    return (
        <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Document
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Required
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Submitted On
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                File
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <tr key={doc.docId}>
                                <td className="px-6 py-4">
                                    <div className="flex items-start">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{doc.description}</div>
                                            {doc.reviewNotes && (
                                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 flex items-start">
                                                    <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                                    <span>{doc.reviewNotes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {doc.required ? (
                                        <span className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded-full">Required</span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Optional</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={doc.status} size="sm" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {doc.submittedOn ? (
                                        <div className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                                            {doc.submittedOn}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {doc.fileUrl ? (
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-700 flex items-center font-medium">
                                            <Download className="w-4 h-4 mr-1" />
                                            View
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-xs flex items-center">
                                            No file
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden space-y-4">
                {documents.map((doc) => (
                    <div key={doc.docId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                            </div>
                            {doc.required && (
                                <span className="text-red-600 text-[10px] font-semibold bg-red-50 px-2 py-0.5 rounded-full ml-2">Required</span>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-3 mb-3">
                            <StatusBadge status={doc.status} size="sm" />
                            {doc.submittedOn && (
                                <div className="text-xs text-gray-500 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {doc.submittedOn}
                                </div>
                            )}
                        </div>

                        {doc.reviewNotes && (
                            <div className="mb-3 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 flex items-start">
                                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{doc.reviewNotes}</span>
                            </div>
                        )}

                        <div className="pt-3 border-t border-gray-100 flex justify-end">
                            {doc.fileUrl ? (
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:text-blue-700 flex items-center font-medium">
                                    <Download className="w-4 h-4 mr-1" />
                                    View / Download
                                </a>
                            ) : (
                                <span className="text-gray-400 text-xs text-center w-full">No file uploaded</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
