export interface ConsentViewData {
    competitionId: string;
    competitionName: string;
    teamName: string;
    year: number | null;
    memberName: string;
    available: { photo: boolean; linkedin: boolean; email: boolean; phone: boolean };
    preview: { linkedin: string; email: string; phone: string };
    permissions: { hidden: boolean; photo: boolean; linkedin: boolean; email: boolean; phone: boolean };
    under18: boolean;
    consentStatus: string;
}
