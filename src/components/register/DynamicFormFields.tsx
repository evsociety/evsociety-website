'use client';

import type { RegistrationType, RegistrationRole, RegistrationFormData, RegistrationItem } from '@/types/registration';

interface DynamicFormFieldsProps {
    type: RegistrationType;
    role: RegistrationRole;
    item: RegistrationItem | null;
    formData: RegistrationFormData;
    errors: Record<string, string>;
    onChange: (field: keyof RegistrationFormData, value: any) => void;
}

const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+971', country: 'UAE' },
    { code: '+65', country: 'Singapore' },
];

export default function DynamicFormFields({ type, role, item, formData, errors, onChange }: DynamicFormFieldsProps) {
    const handleMultiSelectChange = (field: 'skillAreas', value: string) => {
        const currentValues = formData[field] || [];
        const newValues = currentValues.includes(value as any)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value as any];
        onChange(field, newValues);
    };

    return (
        <div className="space-y-6">
            {/* Common Fields - Always shown */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => onChange('fullName', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.fullName ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-sm text-red-500 pl-1">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.email ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-500 pl-1">{errors.email}</p>}
                </div>
            </div>

            {/* Phone with Country Code */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Country Code <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.countryCode}
                        onChange={(e) => onChange('countryCode', e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all bg-white"
                    >
                        {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code} {c.country}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.phone ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-sm text-red-500 pl-1">{errors.phone}</p>}
                </div>
            </div>

            {/* City and State */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        City <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => onChange('city', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.city ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="Bengaluru"
                    />
                    {errors.city && <p className="text-sm text-red-500 pl-1">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        State <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => onChange('state', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.state ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="Karnataka"
                    />
                    {errors.state && <p className="text-sm text-red-500 pl-1">{errors.state}</p>}
                </div>
            </div>

            {/* Organization and Designation */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Organization/Company <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => onChange('organization', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.organization ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="EV Company Inc."
                    />
                    {errors.organization && <p className="text-sm text-red-500 pl-1">{errors.organization}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Designation/Role <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => onChange('designation', e.target.value)}
                        className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.designation ? 'ring-red-500' : 'ring-gray-200'
                            } focus:ring-2 focus:ring-primary transition-all`}
                        placeholder="Software Engineer"
                    />
                    {errors.designation && <p className="text-sm text-red-500 pl-1">{errors.designation}</p>}
                </div>
            </div>

            {/* LinkedIn URL (optional) */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    LinkedIn Profile URL
                </label>
                <input
                    type="url"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => onChange('linkedinUrl', e.target.value)}
                    className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.linkedinUrl ? 'ring-red-500' : 'ring-gray-200'
                        } focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="https://linkedin.com/in/your-profile"
                />
                {errors.linkedinUrl && <p className="text-sm text-red-500 pl-1">{errors.linkedinUrl}</p>}
            </div>

            {/* Participation Mode */}
            {item && item.modeOptions.length > 0 && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Choose Participation Mode <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {item.modeOptions.map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => onChange('participationMode', mode)}
                                className={`p-3 rounded-xl text-center font-bold capitalize transition-all border-2 ${formData.participationMode === mode
                                        ? 'border-primary bg-blue-50 text-primary'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary/30'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    {errors.participationMode && <p className="text-sm text-red-500 pl-1">{errors.participationMode}</p>}
                </div>
            )}

            {/* Guest-specific fields */}
            {role === 'guest' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">Guest Information</h4>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Guest Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.guestCategory || ''}
                            onChange={(e) => onChange('guestCategory', e.target.value)}
                            className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.guestCategory ? 'ring-red-500' : 'ring-gray-200'
                                } focus:ring-2 focus:ring-primary transition-all bg-white`}
                        >
                            <option value="">Select category...</option>
                            <option value="speaker">Speaker</option>
                            <option value="partner">Partner</option>
                            <option value="sponsor">Sponsor</option>
                            <option value="media">Media</option>
                            <option value="vip">VIP</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.guestCategory && <p className="text-sm text-red-500 pl-1">{errors.guestCategory}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Topic/Reason <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.topic || ''}
                            onChange={(e) => onChange('topic', e.target.value)}
                            className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.topic ? 'ring-red-500' : 'ring-gray-200'
                                } focus:ring-2 focus:ring-primary transition-all`}
                            placeholder="What will you speak about or your purpose?"
                        />
                        {errors.topic && <p className="text-sm text-red-500 pl-1">{errors.topic}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Reference/Invited By
                        </label>
                        <input
                            type="text"
                            value={formData.reference || ''}
                            onChange={(e) => onChange('reference', e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Who invited you or how did you hear about this?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Special Requirements
                        </label>
                        <textarea
                            rows={3}
                            value={formData.specialRequirements || ''}
                            onChange={(e) => onChange('specialRequirements', e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Any special requirements or requests?"
                        />
                    </div>
                </div>
            )}

            {/* Project-specific fields */}
            {type === 'projects' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">Project Details</h4>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Skill Areas <span className="text-red-500">*</span> <span className="text-xs text-gray-400 normal-case">(Select all that apply)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['ev-software', 'battery', 'charging', 'cybersecurity', 'ai-ml', 'embedded', 'research', 'other'].map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleMultiSelectChange('skillAreas', skill)}
                                    className={`p-3 rounded-xl text-sm font-bold capitalize transition-all border-2 ${formData.skillAreas?.includes(skill as any)
                                            ? 'border-primary bg-blue-50 text-primary'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-primary/30'
                                        }`}
                                >
                                    {skill.replace('-', ' / ')}
                                </button>
                            ))}
                        </div>
                        {errors.skillAreas && <p className="text-sm text-red-500 pl-1">{errors.skillAreas}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Interest Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.interestLevel || ''}
                            onChange={(e) => onChange('interestLevel', e.target.value)}
                            className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.interestLevel ? 'ring-red-500' : 'ring-gray-200'
                                } focus:ring-2 focus:ring-primary transition-all bg-white`}
                        >
                            <option value="">Select interest level...</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="internship">Internship</option>
                            <option value="mentorship">Mentorship</option>
                            <option value="collaboration">Collaboration</option>
                        </select>
                        {errors.interestLevel && <p className="text-sm text-red-500 pl-1">{errors.interestLevel}</p>}
                    </div>
                </div>
            )}

            {/* Program-specific fields */}
            {type === 'programs' && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">Program Details</h4>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Participant Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.participantType || ''}
                            onChange={(e) => onChange('participantType', e.target.value)}
                            className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.participantType ? 'ring-red-500' : 'ring-gray-200'
                                } focus:ring-2 focus:ring-primary transition-all bg-white`}
                        >
                            <option value="">Select participant type...</option>
                            <option value="student">Student</option>
                            <option value="professional">Professional</option>
                            <option value="faculty">Faculty</option>
                            <option value="startup">Startup</option>
                            <option value="govt">Government</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.participantType && <p className="text-sm text-red-500 pl-1">{errors.participantType}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Experience Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.experienceLevel || ''}
                            onChange={(e) => onChange('experienceLevel', e.target.value)}
                            className={`w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ${errors.experienceLevel ? 'ring-red-500' : 'ring-gray-200'
                                } focus:ring-2 focus:ring-primary transition-all bg-white`}
                        >
                            <option value="">Select experience level...</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        {errors.experienceLevel && <p className="text-sm text-red-500 pl-1">{errors.experienceLevel}</p>}
                    </div>
                </div>
            )}

            {/* Event/Webinar-specific fields */}
            {(type === 'events' || type === 'webinars') && (
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900">{type === 'events' ? 'Event' : 'Webinar'} Details</h4>

                    {item?.sessionTracks && item.sessionTracks.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                Session Track (Optional)
                            </label>
                            <select
                                value={formData.sessionTrack || ''}
                                onChange={(e) => onChange('sessionTrack', e.target.value)}
                                className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all bg-white"
                            >
                                <option value="">Select a track...</option>
                                {item.sessionTracks.map((track) => (
                                    <option key={track} value={track}>{track}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Questions for Organizer (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.questions || ''}
                            onChange={(e) => onChange('questions', e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border-none outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Any questions or topics you'd like to discuss?"
                        />
                    </div>
                </div>
            )}

            {/* Consent and Newsletter */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consent}
                        onChange={(e) => onChange('consent', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                        <span className="text-red-500">*</span> I agree to{' '}
                        <a href="/policies" className="text-primary font-bold hover:underline">
                            EV Society™ Terms & Conditions and Privacy Policy
                        </a>
                    </label>
                </div>
                {errors.consent && <p className="text-sm text-red-500 pl-1">{errors.consent}</p>}

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="newsletter"
                        checked={formData.newsletter}
                        onChange={(e) => onChange('newsletter', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-600">
                        I want to receive updates and newsletters from EV Society™
                    </label>
                </div>
            </div>
        </div>
    );
}
