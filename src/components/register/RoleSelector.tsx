'use client';

import type { RegistrationRole } from '@/types/registration';

interface RoleSelectorProps {
    selectedRole: RegistrationRole;
    onRoleChange: (role: RegistrationRole) => void;
}

const roles: { value: RegistrationRole; label: string; description: string }[] = [
    { value: 'attendee', label: 'Attendee', description: 'Standard participant' },
    { value: 'guest', label: 'Guest', description: 'Speaker / Partner / Invitee' },
];

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Registration Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map((role) => (
                    <button
                        key={role.value}
                        type="button"
                        onClick={() => onRoleChange(role.value)}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${selectedRole === role.value
                                ? 'border-primary bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-primary/30'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === role.value
                                        ? 'border-primary bg-primary'
                                        : 'border-gray-300'
                                    }`}
                            >
                                {selectedRole === role.value && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{role.label}</div>
                                <div className="text-sm text-gray-500">{role.description}</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
