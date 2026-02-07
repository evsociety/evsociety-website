// Registration Service Layer
// Phase 1: localStorage implementation
// Phase 2: Replace with API calls

import type { RegistrationType, RegistrationItem, StoredRegistration, RegistrationFormData, RegistrationRole } from '@/types/registration';
import registrationData from '@/data/registrations.json';

const STORAGE_KEY = 'evsociety_registrations';

/**
 * Get registration items by type
 */
export const getRegistrationItems = (type: RegistrationType): RegistrationItem[] => {
    return registrationData[type] as RegistrationItem[];
};

/**
 * Generate unique registration ID
 * Format: EVS-YYYYMMDD-XXXXX
 */
export const generateRegistrationId = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number

    return `EVS-${year}${month}${day}-${random}`;
};

/**
 * Get stored registrations from localStorage
 */
export const getStoredRegistrations = (): StoredRegistration[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading registrations from localStorage:', error);
        return [];
    }
};

/**
 * Submit registration
 * Phase 1: Save to localStorage as backup
 * Phase 2: POST to Google Apps Script Web App
 */
export const submitRegistration = async (
    type: RegistrationType,
    role: RegistrationRole,
    itemId: string,
    itemTitle: string,
    formData: RegistrationFormData
): Promise<{ success: boolean; registrationId?: string; error?: string; savedLocally?: boolean }> => {
    const registrationId = generateRegistrationId();
    const timestamp = new Date().toISOString();

    const registration: StoredRegistration = {
        registrationId,
        type,
        role,
        itemId,
        itemTitle,
        formData,
        timestamp,
    };

    let savedLocally = false;
    let apiSuccess = false;

    try {
        // Step 1: Save to localStorage as backup
        const existingRegistrations = getStoredRegistrations();
        existingRegistrations.push(registration);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRegistrations));
        savedLocally = true;

        // Step 2: Send to Google Sheets via Apps Script
        const { REGISTRATION_CONFIG } = await import('@/config/registerConfig');

        if (REGISTRATION_CONFIG.APPS_SCRIPT_URL) {
            // Prepare payload for Google Sheets
            const payload = {
                registrationId,
                type,
                role,
                itemTitle,
                fullName: formData.fullName,
                email: formData.email,
                phone: `${formData.countryCode} ${formData.phone}`,
                city: formData.city,
                state: formData.state,
                organization: formData.organization,
                designation: formData.designation,
                linkedinUrl: formData.linkedinUrl || '',
                participationMode: formData.participationMode,
                consent: formData.consent,
                newsletter: formData.newsletter,
                // Role-specific fields
                guestCategory: formData.guestCategory || '',
                topic: formData.topic || '',
                reference: formData.reference || '',
                specialRequirements: formData.specialRequirements || '',
                // Type-specific fields
                skillAreas: formData.skillAreas?.join(', ') || '',
                interestLevel: formData.interestLevel || '',
                participantType: formData.participantType || '',
                experienceLevel: formData.experienceLevel || '',
                sessionTrack: formData.sessionTrack || '',
                questions: formData.questions || '',
                timestamp,
            };

            const response = await fetch(REGISTRATION_CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Apps Script requires no-cors mode
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Note: With no-cors mode, we can't read response status
            // We assume success if no error was thrown
            apiSuccess = true;

            if (REGISTRATION_CONFIG.DEBUG) {
                console.log('[Registration] Sent to Google Sheets:', payload);
            }
        } else {
            console.warn('[Registration] No Apps Script URL configured. Data saved locally only.');
        }

        return {
            success: true,
            registrationId,
            savedLocally
        };

    } catch (error) {
        console.error('Error submitting registration:', error);

        // If we saved locally but API failed
        if (savedLocally) {
            return {
                success: true, // Still consider it success since data is saved locally
                registrationId,
                savedLocally: true,
                error: 'Saved locally, but failed to sync to server. Your registration is stored and will be synced later.'
            };
        }

        // Complete failure
        return {
            success: false,
            error: 'Failed to submit registration. Please try again.'
        };
    }
};

/**
 * Get item by ID and type
 */
export const getItemById = (type: RegistrationType, itemId: string): RegistrationItem | null => {
    const items = getRegistrationItems(type);
    return items.find(item => item.id === itemId) || null;
};
