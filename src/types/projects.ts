// Reuse existing types from evto.ts
import type { Status, Candidate, Document } from './evto';
export type { Status, Candidate, Document };

// Project-specific types
export interface ProjectCandidate {
    candidateId: string;
    fullName: string;
}

export interface ProjectStage {
    stageId: string;
    title: string;
    percentage: number;
    documents: Document[];
}

export interface ProjectSubmission {
    projectId: string;
    teamId: string;
    overallStatus: Status;
    overallPercentage: number;
    certificateIssued: boolean;
    lastUpdated: string;
    stages: ProjectStage[];
    approverName?: string;
    approverComment?: string;
    approvedDate?: string;
}

export interface ProjectConfig {
    projectId: string;
    title: string;
    teamId: string;
    typeLabel: string;
    description: string;
    cta: {
        primaryLabel: string;
        primaryHref: string;
    };
}

export interface ProjectSummary {
    projectId: string;
    title: string;
    teamId: string;
    typeLabel: string;
    status: Status;
    overallPercentage: number;
    heroBadge: string[];
    shortDescription: string;
    highlights: string[];
}

export interface ProjectsIndex {
    label: string;
    description: string;
    projects: ProjectSummary[];
}
