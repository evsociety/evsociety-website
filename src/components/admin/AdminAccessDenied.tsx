'use client';

export default function AdminAccessDenied() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Access Denied
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    This page is restricted to authorized administrators only.
                    Please sign in with your admin Google account.
                </p>

                {/* Google Sign-In Button Container */}
                <div id="google-signin-button" className="flex justify-center"></div>

                {/* Note */}
                <p className="text-xs text-gray-500 mt-6">
                    Only <strong>evsociety.org@gmail.com</strong> can access this page.
                </p>
            </div>
        </div>
    );
}
