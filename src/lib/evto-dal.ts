
import fs from 'fs';
import path from 'path';
import { Candidate, Submission } from '@/types/evto';

const DATA_DIR = path.join(process.cwd(), 'src/data/programs/evto');

export async function getAllCandidates(): Promise<Candidate[]> {
    const candidates: Candidate[] = [];

    // Read all directories in the data folder
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const candidatePath = path.join(DATA_DIR, entry.name, 'candidate.json');
            if (fs.existsSync(candidatePath)) {
                const fileContent = fs.readFileSync(candidatePath, 'utf-8');
                try {
                    const candidate = JSON.parse(fileContent);
                    candidates.push(candidate);
                } catch (e) {
                    console.error(`Error parsing candidate.json for ${entry.name}`, e);
                }
            }
        }
    }

    return candidates;
}

export async function getAllSubmissions(): Promise<Submission[]> {
    const submissions: Submission[] = [];

    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const submissionPath = path.join(DATA_DIR, entry.name, 'submission.json');
            if (fs.existsSync(submissionPath)) {
                const fileContent = fs.readFileSync(submissionPath, 'utf-8');
                try {
                    const submission = JSON.parse(fileContent);
                    submissions.push(submission);
                } catch (e) {
                    console.error(`Error parsing submission.json for ${entry.name}`, e);
                }
            }
        }
    }

    return submissions;
}

export async function getCandidate(candidateId: string): Promise<Candidate | null> {
    const candidatePath = path.join(DATA_DIR, candidateId, 'candidate.json');
    if (!fs.existsSync(candidatePath)) {
        return null;
    }

    try {
        const fileContent = fs.readFileSync(candidatePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error(`Error reading candidate ${candidateId}`, e);
        return null;
    }
}

export async function getSubmission(candidateId: string): Promise<Submission | null> {
    const submissionPath = path.join(DATA_DIR, candidateId, 'submission.json');
    if (!fs.existsSync(submissionPath)) {
        return null;
    }

    try {
        const fileContent = fs.readFileSync(submissionPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (e) {
        console.error(`Error reading submission for ${candidateId}`, e);
        return null;
    }
}
