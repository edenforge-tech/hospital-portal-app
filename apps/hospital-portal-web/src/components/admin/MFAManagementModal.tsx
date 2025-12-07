'use client';

import React, { useState } from 'react';
import { usersApi } from '@/lib/api';

interface MFAManagementModalProps {
  userId: string;
  userName: string;
  currentMFAStatus: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const MFAManagementModal: React.FC<MFAManagementModalProps> = ({
  userId,
  userName,
  currentMFAStatus,
  onClose,
  onUpdate,
}) => {
  const [mfaEnabled, setMfaEnabled] = useState(currentMFAStatus);
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'email' | 'authenticator'>('authenticator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleToggleMFA = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await usersApi.updateMFA(userId, {
        enabled: !mfaEnabled,
        method: !mfaEnabled ? mfaMethod : undefined,
      });

      setMfaEnabled(!mfaEnabled);
      setSuccess(`MFA has been ${!mfaEnabled ? 'enabled' : 'disabled'} successfully`);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update MFA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMFA = async () => {
    if (!confirm('Are you sure you want to reset MFA settings for this user? They will need to set up MFA again.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await usersApi.resetMFA(userId);
      
      setSuccess('MFA has been reset successfully. User will need to set up MFA again.');
      setMfaEnabled(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableWithQR = () => {
    setShowQRCode(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Multi-Factor Authentication</h2>
              <p className="text-sm text-gray-600">Manage MFA settings for {userName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
              {success}
            </div>
          )}

          {/* Current Status */}
          <div className="mb-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Current MFA Status</p>
                <p className="text-sm text-gray-600">
                  MFA is currently {mfaEnabled ? 'enabled' : 'disabled'} for this user
                </p>
              </div>
              <div className="text-4xl">
                {mfaEnabled ? '🔒' : '🔓'}
              </div>
            </div>
          </div>

          {!mfaEnabled ? (
            /* Enable MFA Section */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Enable Multi-Factor Authentication</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select MFA Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="mfaMethod"
                      value="authenticator"
                      checked={mfaMethod === 'authenticator'}
                      onChange={(e) => setMfaMethod(e.target.value as any)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">📱 Authenticator App</p>
                      <p className="text-sm text-gray-600">
                        Use Google Authenticator, Microsoft Authenticator, or similar apps
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="mfaMethod"
                      value="sms"
                      checked={mfaMethod === 'sms'}
                      onChange={(e) => setMfaMethod(e.target.value as any)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">💬 SMS</p>
                      <p className="text-sm text-gray-600">
                        Receive verification codes via text message
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="mfaMethod"
                      value="email"
                      checked={mfaMethod === 'email'}
                      onChange={(e) => setMfaMethod(e.target.value as any)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">📧 Email</p>
                      <p className="text-sm text-gray-600">
                        Receive verification codes via email
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {mfaMethod === 'authenticator' && !showQRCode && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    📱 <strong>Setup Instructions:</strong> When you enable MFA, the user will be prompted to scan a QR code
                    with their authenticator app on their next login.
                  </p>
                </div>
              )}

              {showQRCode && mfaMethod === 'authenticator' && (
                <div className="rounded-lg border-2 border-gray-200 bg-white p-6 text-center">
                  <p className="mb-4 font-medium text-gray-900">Scan this QR Code with Authenticator App</p>
                  <div className="mx-auto h-48 w-48 rounded-lg bg-gray-100 flex items-center justify-center">
                    {/* Placeholder for QR Code */}
                    <div className="text-6xl">📱</div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    User will scan this code during their next login
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* MFA Enabled Section */
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="font-medium text-green-900">✅ MFA is Active</p>
                <p className="mt-1 text-sm text-green-700">
                  This user's account is protected with multi-factor authentication.
                </p>
              </div>

              <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                <h4 className="font-medium text-yellow-900">⚠️ Reset MFA</h4>
                <p className="mt-1 text-sm text-yellow-800">
                  If the user has lost access to their MFA device or is having trouble logging in,
                  you can reset their MFA settings. They will need to set up MFA again on their next login.
                </p>
                <button
                  onClick={handleResetMFA}
                  disabled={loading}
                  className="mt-3 rounded-lg border-2 border-yellow-600 bg-white px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-50 disabled:opacity-50"
                >
                  Reset MFA Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleToggleMFA}
              disabled={loading}
              className={`rounded-lg px-6 py-2 font-medium text-white disabled:opacity-50 ${
                mfaEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFAManagementModal;
