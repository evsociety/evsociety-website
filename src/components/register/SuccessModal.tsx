'use client';

import { CheckCircle, Download, RefreshCw } from 'lucide-react';

interface SuccessModalProps {
    registrationId: string;
    itemTitle: string;
    onClose: () => void;
    onRegisterAnother: () => void;
}

export default function SuccessModal({ registrationId, itemTitle, onClose, onRegisterAnother }: SuccessModalProps) {
    const downloadConfirmation = () => {
        const confirmationHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Registration Confirmation - EV Society™</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #004a99 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
        .registration-id { background: white; padding: 20px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; color: #004a99; margin: 20px 0; border: 2px dashed #004a99; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>EV Society™</h1>
        <h2>Registration Confirmed</h2>
    </div>
    <div class="content">
        <p><strong>Thank you for registering!</strong></p>
        <p>Your registration for <strong>${itemTitle}</strong> has been successfully confirmed.</p>
        <div class="registration-id">${registrationId}</div>
        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Save this confirmation for your records</li>
            <li>You will receive further details via email</li>
            <li>Check your spam folder if you don't see our email</li>
        </ul>
        <p><strong>Need Help?</strong></p>
        <p>Email: evsociety.org@gmail.com<br>Phone: +91 8904528357<br>Hours: Mon–Fri, 9am–6pm IST</p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} EV Society™. All rights reserved.</p>
    </div>
</body>
</html>
        `;

        const blob = new Blob([confirmationHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `EVS-Registration-${registrationId}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-slide-up">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your registration for <span className="font-bold">{itemTitle}</span> has been confirmed.
                    </p>

                    {/* Registration ID */}
                    <div className="bg-blue-50 border-2 border-dashed border-primary rounded-xl p-4 mb-6">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Registration ID
                        </div>
                        <div className="text-2xl font-black text-primary">{registrationId}</div>
                    </div>

                    {/* Info */}
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 text-left mb-6">
                        <p className="mb-2">✓ Confirmation saved to your browser</p>
                        <p className="mb-2">✓ Further details will be sent via email</p>
                        <p>✓ Keep your Registration ID for reference</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={downloadConfirmation}
                            className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Confirmation
                        </button>
                        <button
                            onClick={onRegisterAnother}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Register Another
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
