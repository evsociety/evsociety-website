export type Status =
    | 'not-started'
    | 'draft'
    | 'submitted'
    | 'in-review'
    | 'waiting-for-input'
    | 'need-more-details'
    | 'rejected'
    | 'approved'
    | 'certificate-approved';

export interface Eligibility {
    architecturalDesignExperience: boolean;
    managerialLeadershipExperience: boolean;
    notes: string;
}

export interface Candidate {
    candidateId: string;
    fullName: string;
    designation: string;
    location: string;
    resumeUrl?: string; // Optional
    linkedinUrl?: string; // Optional
    profileImageUrl?: string; // Optional
    enrolledProgramIds: string[];
    eligibility: Eligibility;
}

export interface Document {
    docId: string;
    name: string;
    description: string;
    required: boolean;
    status: Status;
    submittedOn: string; // ISO Date string YYYY-MM-DD
    reviewNotes: string;
    fileUrl: string;
    // Internal Tracking
    reviewerName?: string;
    reviewerComment?: string;
    reviewDate?: string;
    approverName?: string;
    approverComment?: string;
    approvedDate?: string;
}

export interface PillarSubmission {
    pillarId: string;
    title: string;
    description?: string; // Optional description for the pillar
    percentage?: number; // Optional manual override for progress
    capstoneTopicSelected?: string; // Only for capstone
    documents: Document[];
}

export interface Submission {
    candidateId: string;
    programId: string;
    overallStatus: Status;
    overallPercentage?: number; // Optional manual override for overall progress
    certificateIssued: boolean;
    lastUpdated: string; // ISO Date string YYYY-MM-DD
    pillars: PillarSubmission[];
    // Internal Tracking for Final Approval
    approverName?: string;
    approverComment?: string;
    approvedDate?: string;
}


// Program Config Types
export interface ProgramDocumentStub {
    id: string; // e.g. "p0-01" - used to match with submission docs if needed, or just display
    name: string;
    description?: string;
}

export interface ProgramPillar {
    id: string; // "pillar0", "pillar1"
    title: string;
    themeQuestion?: string;
    keyOutcomes: string[];
    requiredArtifacts: string[];
    estimatedDuration: string;
}

export interface ProgramCapstone {
    mandatoryNote: string;
    topics: string[];
    deliverables: string[];
    evaluationCriteria: string[];
}

export interface ProgramTrack {
    name: string;
    duration: string;
    targetAudience: string;
}

export interface ProgramConfig {
    id: string;
    title: string;
    tagline: string;
    description: string; // Why EVTO
    roleDefinition: string[];
    responsibilities: string[];
    pillars: ProgramPillar[];
    capstone: ProgramCapstone;
    eligibility: {
        requirements: string[];
        note: string;
    };
    certificationCriteria: string[];
    tracks: ProgramTrack[];
    pdfUrl: string;
    pdfName: string;
    pdfLastUpdated: string;
}
