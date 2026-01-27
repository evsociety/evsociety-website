import fs from 'fs';
import path from 'path';
import { Candidate } from '@/types/evto';
import { ProjectsIndex, ProjectConfig, ProjectCandidate, ProjectSubmission } from '@/types/projects';

const PROJECTS_DATA_DIR = path.join(process.cwd(), 'src/data/projects');

/**
 * Get all projects from the projects index
 */
export async function getAllProjects(): Promise<ProjectsIndex> {
    const indexPath = path.join(PROJECTS_DATA_DIR, 'projects.json');

    if (!fs.existsSync(indexPath)) {
        return {
            label: 'EV Projects',
            description: '',
            projects: []
        };
    }

    try {
        const fileContent = fs.readFileSync(indexPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error('Error reading projects index', e);
        return {
            label: 'EV Projects',
            description: '',
            projects: []
        };
    }
}

/**
 * Get a specific project configuration by slug
 */
export async function getProject(projectSlug: string): Promise<ProjectConfig | null> {
    const projectPath = path.join(PROJECTS_DATA_DIR, projectSlug, 'project.json');

    if (!fs.existsSync(projectPath)) {
        return null;
    }

    try {
        const fileContent = fs.readFileSync(projectPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error(`Error reading project ${projectSlug}`, e);
        return null;
    }
}

/**
 * Get all candidates for a specific project
 */
export async function getAllCandidatesForProject(projectSlug: string): Promise<ProjectCandidate[]> {
    const candidatesPath = path.join(PROJECTS_DATA_DIR, projectSlug, 'candidates.json');

    if (!fs.existsSync(candidatesPath)) {
        return [];
    }

    try {
        const fileContent = fs.readFileSync(candidatesPath, 'utf-8');
        const data = JSON.parse(fileContent);
        return data.candidates || [];
    } catch (e) {
        console.error(`Error reading candidates for project ${projectSlug}`, e);
        return [];
    }
}

/**
 * Get detailed candidate information for a project
 */
export async function getProjectCandidate(projectSlug: string, candidateId: string): Promise<Candidate | null> {
    const candidatePath = path.join(PROJECTS_DATA_DIR, projectSlug, candidateId, 'candidate.json');

    if (!fs.existsSync(candidatePath)) {
        return null;
    }

    try {
        const fileContent = fs.readFileSync(candidatePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error(`Error reading candidate ${candidateId} for project ${projectSlug}`, e);
        return null;
    }
}

/**
 * Get submission data for a candidate in a project
 */
export async function getProjectSubmission(projectSlug: string, candidateId: string): Promise<ProjectSubmission | null> {
    const submissionPath = path.join(PROJECTS_DATA_DIR, projectSlug, candidateId, 'submission.json');

    if (!fs.existsSync(submissionPath)) {
        return null;
    }

    try {
        const fileContent = fs.readFileSync(submissionPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error(`Error reading submission for candidate ${candidateId} in project ${projectSlug}`, e);
        return null;
    }
}

/**
 * Get all candidates with their submissions for a project
 */
export async function getAllCandidatesWithSubmissions(projectSlug: string): Promise<Array<{ candidate: Candidate; submission: ProjectSubmission | null }>> {
    const candidatesList = await getAllCandidatesForProject(projectSlug);
    const results = [];

    for (const candidateSummary of candidatesList) {
        const candidate = await getProjectCandidate(projectSlug, candidateSummary.candidateId);
        const submission = await getProjectSubmission(projectSlug, candidateSummary.candidateId);

        if (candidate) {
            results.push({ candidate, submission });
        }
    }

    return results;
}
