'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import RegistrationTypeSelector from '@/components/register/RegistrationTypeSelector';
import RoleSelector from '@/components/register/RoleSelector';
import ItemSelector from '@/components/register/ItemSelector';
import DynamicFormFields from '@/components/register/DynamicFormFields';
import RegistrationSummaryCard from '@/components/register/RegistrationSummaryCard';
import HelpCard from '@/components/register/HelpCard';
import SuccessModal from '@/components/register/SuccessModal';
import type { RegistrationType, RegistrationRole, RegistrationItem, RegistrationFormData } from '@/types/registration';
import { getRegistrationItems, submitRegistration } from '@/lib/registrationService';
import { validateEmail, validatePhone, validateRequired, validateLinkedIn, validateConsent } from '@/utils/validation';
import { trackEvent } from '@/utils/analytics/ga4';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const initialFormData: RegistrationFormData = {
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    city: '',
    state: '',
    organization: '',
    designation: '',
    linkedinUrl: '',
    participationMode: '',
    consent: false,
    newsletter: false,
};

export default function RegisterClient() {
    const [selectedType, setSelectedType] = useState<RegistrationType>('events');
    const [selectedRole, setSelectedRole] = useState<RegistrationRole>('attendee');
    const [selectedItem, setSelectedItem] = useState<RegistrationItem | null>(null);
    const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [registrationId, setRegistrationId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const items = getRegistrationItems(selectedType);

    // Check if user is admin
    useEffect(() => {
        setIsAdmin(isAdminAuthenticated());
    }, []);

    // Track page view on mount
    useEffect(() => {
        trackEvent('register_page_view', {
            page_path: '/register',
        });
    }, []);

    // Handle type change
    const handleTypeChange = (type: RegistrationType) => {
        setSelectedType(type);
        setSelectedItem(null);
        setFormData({ ...initialFormData, countryCode: '+91' });
        setErrors({});
        trackEvent('register_type_selected', { registration_type: type });
    };

    // Handle role change
    const handleRoleChange = (role: RegistrationRole) => {
        setSelectedRole(role);
        setErrors({});
        trackEvent('register_role_selected', { registration_role: role });
    };

    // Handle item selection
    const handleItemSelect = (item: RegistrationItem) => {
        setSelectedItem(item);
        setFormData(prev => ({ ...prev, participationMode: '' }));
        trackEvent('register_item_selected', {
            registration_type: selectedType,
            item_id: item.id,
            item_title: item.title,
        });
    };

    // Handle form field changes
    const handleFieldChange = (field: keyof RegistrationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Common validations
        const nameError = validateRequired(formData.fullName, 'Full Name');
        if (nameError) newErrors.fullName = nameError;

        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        const phoneError = validatePhone(formData.phone);
        if (phoneError) newErrors.phone = phoneError;

        const cityError = validateRequired(formData.city, 'City');
        if (cityError) newErrors.city = cityError;

        const stateError = validateRequired(formData.state, 'State');
        if (stateError) newErrors.state = stateError;

        const orgError = validateRequired(formData.organization, 'Organization');
        if (orgError) newErrors.organization = orgError;

        const designationError = validateRequired(formData.designation, 'Designation');
        if (designationError) newErrors.designation = designationError;

        const linkedinError = validateLinkedIn(formData.linkedinUrl || '');
        if (linkedinError) newErrors.linkedinUrl = linkedinError;

        const modeError = validateRequired(formData.participationMode, 'Participation Mode');
        if (modeError) newErrors.participationMode = modeError;

        const consentError = validateConsent(formData.consent);
        if (consentError) newErrors.consent = consentError;

        // Guest-specific validations
        if (selectedRole === 'guest') {
            const guestCategoryError = validateRequired(formData.guestCategory, 'Guest Category');
            if (guestCategoryError) newErrors.guestCategory = guestCategoryError;

            const topicError = validateRequired(formData.topic, 'Topic/Reason');
            if (topicError) newErrors.topic = topicError;
        }

        // Project-specific validations
        if (selectedType === 'projects') {
            if (!formData.skillAreas || formData.skillAreas.length === 0) {
                newErrors.skillAreas = 'Please select at least one skill area';
            }
            const interestError = validateRequired(formData.interestLevel, 'Interest Level');
            if (interestError) newErrors.interestLevel = interestError;
        }

        // Program-specific validations
        if (selectedType === 'programs') {
            const participantTypeError = validateRequired(formData.participantType, 'Participant Type');
            if (participantTypeError) newErrors.participantType = participantTypeError;

            const experienceError = validateRequired(formData.experienceLevel, 'Experience Level');
            if (experienceError) newErrors.experienceLevel = experienceError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItem) {
            alert('Please select an item to register for');
            return;
        }

        trackEvent('register_submit_clicked', {
            registration_type: selectedType,
            registration_role: selectedRole,
            item_id: selectedItem.id,
        });

        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = document.querySelector('[class*="ring-red-500"]');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitRegistration(
                selectedType,
                selectedRole,
                selectedItem.id,
                selectedItem.title,
                formData
            );

            if (result.success && result.registrationId) {
                setRegistrationId(result.registrationId);
                setShowSuccess(true);

                // Track different events based on sync status
                if (result.error) {
                    // Saved locally but API failed
                    trackEvent('register_submit_partial_success', {
                        registration_type: selectedType,
                        registration_role: selectedRole,
                        registration_id: result.registrationId,
                        saved_locally: true,
                        api_synced: false,
                    });
                } else {
                    // Full success
                    trackEvent('register_submit_success', {
                        registration_type: selectedType,
                        registration_role: selectedRole,
                        registration_id: result.registrationId,
                        saved_locally: true,
                        api_synced: true,
                    });
                }

                // Show warning if only saved locally
                if (result.error && result.savedLocally) {
                    console.warn('[Registration]', result.error);
                    // You could show a warning banner here if needed
                }
            } else {
                throw new Error(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            trackEvent('register_submit_failed', {
                registration_type: selectedType,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            alert('Failed to submit registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle register another
    const handleRegisterAnother = () => {
        setShowSuccess(false);
        setSelectedItem(null);
        setFormData({ ...initialFormData, countryCode: '+91' });
        setErrors({});
        setRegistrationId('');
        // Keep the same type and role selected
    };

    return (
        <div className="bg-white">
            <PageHeader
                title="Register"
                description="Register for events, programs, projects, and webinars in one place."
                breadcrumb="REGISTER"
            />

            <section className="py-24">
                <div className="container-custom">
                    {/* Admin Button - Only visible to admins */}
                    {isAdmin && (
                        <div className="mb-8 flex justify-end">
                            <Link
                                href="/admin/registrations"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                View Registrations (Admin)
                            </Link>
                        </div>
                    )}

                    {/* Registration Type Selector */}
                    <div className="mb-12">
                        <RegistrationTypeSelector
                            selectedType={selectedType}
                            onTypeChange={handleTypeChange}
                        />
                    </div>

                    {/* Main Content - Two Column Layout */}
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Left Column - Registration Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-surface p-10 rounded-3xl border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                    Registration Form
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Role Selector */}
                                    <RoleSelector
                                        selectedRole={selectedRole}
                                        onRoleChange={handleRoleChange}
                                    />

                                    {/* Item Selector */}
                                    <ItemSelector
                                        type={selectedType}
                                        items={items}
                                        selectedItem={selectedItem}
                                        onItemSelect={handleItemSelect}
                                    />

                                    {/* Dynamic Form Fields */}
                                    {selectedItem && (
                                        <DynamicFormFields
                                            type={selectedType}
                                            role={selectedRole}
                                            item={selectedItem}
                                            formData={formData}
                                            errors={errors}
                                            onChange={handleFieldChange}
                                        />
                                    )}

                                    {/* Submit Button */}
                                    {selectedItem && (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Registration'
                                            )}
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Right Column - Summary & Help */}
                        <div className="lg:col-span-5 space-y-8">
                            <RegistrationSummaryCard
                                type={selectedType}
                                role={selectedRole}
                                item={selectedItem}
                                participationMode={formData.participationMode}
                            />
                            <HelpCard />
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {showSuccess && (
                <SuccessModal
                    registrationId={registrationId}
                    itemTitle={selectedItem?.title || ''}
                    onClose={() => {
                        setShowSuccess(false);
                        window.location.reload(); // Refresh to start new registration
                    }}
                    onRegisterAnother={handleRegisterAnother}
                />
            )}
        </div>
    );
}
