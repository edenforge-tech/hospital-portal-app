'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, Download, Copy, Check, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import Image from 'next/image';

interface MfaSettings {
  isEnabled: boolean;
  method: 'authenticator' | 'sms' | 'email' | null;
}

export default function SecuritySettingsPage() {
  const { user, token, tenantId } = useAuthStore();
  const [mfaSettings, setMfaSettings] = useState<MfaSettings>({ isEnabled: false, method: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Enrollment wizard states
  const [enrollmentStep, setEnrollmentStep] = useState<'idle' | 'qr' | 'verify' | 'backup-codes'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    loadMfaSettings();
  }, []);

  const loadMfaSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
      
      const response = await fetch(`${apiUrl}/users/${user?.id}/mfa-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMfaSettings(data);
      }
    } catch (err) {
      console.error('Error loading MFA settings:', err);
    }
  };

  const handleStartEnrollment = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

      const response = await fetch(`${apiUrl}/mfa/enroll/totp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        },
        body: JSON.stringify({
          userId: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start MFA enrollment');
      }

      const data = await response.json();
      setQrCodeUrl(data.qrCodeUrl);
      setTotpSecret(data.secret);
      setEnrollmentStep('qr');
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(err.message || 'Failed to start enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

      const response = await fetch(`${apiUrl}/mfa/enroll/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        },
        body: JSON.stringify({
          userId: user?.id,
          totpCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid TOTP code');
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes || []);
      setEnrollmentStep('backup-codes');
      setSuccess('MFA enabled successfully!');
      setMfaSettings({ isEnabled: true, method: 'authenticator' });
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Invalid TOTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

      const response = await fetch(`${apiUrl}/mfa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        },
        body: JSON.stringify({
          userId: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disable MFA');
      }

      setMfaSettings({ isEnabled: false, method: null });
      setEnrollmentStep('idle');
      setSuccess('MFA has been disabled');
    } catch (err: any) {
      console.error('Disable error:', err);
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = `Hospital Portal - MFA Backup Codes
Generated: ${new Date().toLocaleString()}
User: ${user?.email}

IMPORTANT: Store these codes securely. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Keep these codes in a safe place. You'll need them to access your account if you lose your authenticator device.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-portal-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCompleteEnrollment = () => {
    setEnrollmentStep('idle');
    setTotpCode('');
    setQrCodeUrl('');
    setTotpSecret('');
    setBackupCodes([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Security Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account security and multi-factor authentication
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-indigo-600" />
                Multi-Factor Authentication (MFA)
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                mfaSettings.isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {mfaSettings.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {enrollmentStep === 'idle' && (
            <div>
              {!mfaSettings.isEnabled ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>What is MFA?</strong> Multi-factor authentication adds an extra layer of security 
                      by requiring a code from your authenticator app in addition to your password.
                    </p>
                  </div>
                  <button
                    onClick={handleStartEnrollment}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Enable MFA
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>MFA is active.</strong> Your account is protected with {mfaSettings.method} authentication.
                    </p>
                  </div>
                  <button
                    onClick={handleDisableMfa}
                    disabled={loading}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      'Disable MFA'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {enrollmentStep === 'qr' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 1: Scan QR Code
                </h3>
                <p className="text-gray-600 mb-6">
                  Use an authenticator app (Google Authenticator, Authy, etc.) to scan this QR code
                </p>
                
                {qrCodeUrl && (
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <Image 
                      src={qrCodeUrl} 
                      alt="MFA QR Code" 
                      width={256}
                      height={256}
                      className="mx-auto"
                    />
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className={`px-4 py-2 bg-white border border-gray-300 rounded font-mono text-sm ${
                      showSecret ? '' : 'blur-sm'
                    }`}>
                      {totpSecret}
                    </code>
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleCopySecret}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Copy secret"
                    >
                      {copiedSecret ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyTotp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 2: Enter the 6-digit code from your app
                  </label>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEnrollmentStep('idle')}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || totpCode.length !== 6}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable MFA'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {enrollmentStep === 'backup-codes' && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  MFA Enabled Successfully!
                </h3>
                <p className="text-gray-600">
                  Save these backup codes in a secure location
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-medium mb-2">
                  ⚠️ Important: Save Your Backup Codes
                </p>
                <p className="text-sm text-yellow-800">
                  Each code can only be used once. You'll need these if you lose access to your authenticator app.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
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
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Codes
                </button>
                <button
                  onClick={handleCompleteEnrollment}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  I've Saved My Codes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
