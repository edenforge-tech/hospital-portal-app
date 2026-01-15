'use client';

import { useState } from 'react';
import { X, Shield, AlertTriangle, Copy, Check, Download, Key, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

interface AdminMfaResetModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminMfaResetModal({
  userId,
  userName,
  userEmail,
  onClose,
  onSuccess
}: AdminMfaResetModalProps) {
  const { user, token, tenantId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'confirm' | 'verify-admin' | 'success'>('confirm');
  const [adminMfaCode, setAdminMfaCode] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const handleConfirmReset = () => {
    // Check if admin has MFA enabled
    // In production, this should check admin's MFA status
    setStep('verify-admin');
  };

  const handleVerifyAdminMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

      const response = await fetch(`${apiUrl}/admin/users/${userId}/mfa/regenerate-backup-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        },
        body: JSON.stringify({
          adminUserId: user?.id,
          adminMfaCode: adminMfaCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset MFA');
      }

      const data = await response.json();
      setNewBackupCodes(data.backupCodes || []);
      setStep('success');
    } catch (err: any) {
      console.error('MFA reset error:', err);
      setError(err.message || 'Failed to reset MFA. Please verify your admin MFA code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = `Hospital Portal - MFA Backup Codes (Admin Reset)
Reset by: ${user?.email}
Reset at: ${new Date().toLocaleString()}
User: ${userEmail}

IMPORTANT: These codes replace all previous backup codes. Each code can only be used once.

${newBackupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Deliver these codes securely to the user.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa-reset-${userId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reset User MFA</h2>
              <p className="text-sm text-gray-600">{userName} ({userEmail})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-900">
                    <p className="font-medium mb-2">⚠️ Warning: This is a security-sensitive operation</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>This will invalidate all of the user's existing backup codes</li>
                      <li>The user will receive new backup codes</li>
                      <li>Their authenticator app will continue to work</li>
                      <li>You must verify your identity with your admin MFA code</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>When to use this:</strong> Use this function when a user has lost access to their 
                  backup codes but still has their authenticator app working, or when backup codes are 
                  compromised and need to be regenerated for security.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Proceed to Verify
                </button>
              </div>
            </div>
          )}

          {step === 'verify-admin' && (
            <form onSubmit={handleVerifyAdminMfa} className="space-y-6">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verify Your Identity
                </h3>
                <p className="text-gray-600">
                  Enter your admin MFA code to authorize this reset
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Admin MFA Code
                </label>
                <input
                  type="text"
                  value={adminMfaCode}
                  onChange={(e) => setAdminMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || adminMfaCode.length !== 6}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Reset MFA'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  MFA Reset Successful
                </h3>
                <p className="text-gray-600">
                  New backup codes have been generated
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-medium mb-2">
                  ⚠️ Important: Securely Deliver These Codes
                </p>
                <p className="text-sm text-yellow-800">
                  These codes must be delivered securely to the user. DO NOT send via unencrypted email 
                  or messaging. Consider using encrypted communication or delivering in person.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-3">
                  {newBackupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <code className="font-mono text-sm">{code}</code>
                      <button
                        onClick={() => handleCopyBackupCode(code, index)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Copy code"
                      >
                        {copiedCode === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Codes
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Complete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
