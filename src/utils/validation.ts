// Form Validation Utilities

export const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
};

export const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return 'Please enter a valid 10-digit phone number';
    }
    return null;
};

export const validateURL = (url: string): string | null => {
    if (!url) return null; // URL is optional
    try {
        new URL(url);
        return null;
    } catch {
        return 'Please enter a valid URL';
    }
};

export const validateRequired = (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} is required`;
    }
    return null;
};

export const validateLinkedIn = (url: string): string | null => {
    if (!url) return null; // LinkedIn is optional
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+$/;
    if (!linkedinRegex.test(url)) {
        return 'Please enter a valid LinkedIn URL';
    }
    return null;
};

export const validateConsent = (consent: boolean): string | null => {
    if (!consent) {
        return 'You must agree to the Terms & Conditions and Privacy Policy';
    }
    return null;
};
