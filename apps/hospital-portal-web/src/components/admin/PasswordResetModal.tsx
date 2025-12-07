'use client';

import { useState } from 'react';
import { usersApi } from '@/lib/api';

interface PasswordResetModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onPasswordReset: () => void;
}

export default function PasswordResetModal({ userId, userName, isOpen, onClose, onPasswordReset }: PasswordResetModalProps) {
  const [customPassword, setCustomPassword] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ temporaryPassword?: string } | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await usersApi.resetPassword(
        userId, 
        useCustomPassword ? customPassword : undefined
      );
      setResult(res.data);
      onPasswordReset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomPassword('');
    setUseCustomPassword(false);
    setError('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  if (result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Password Reset Successful</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Password has been reset for <strong>{userName}</strong>
            </p>
            
            {result.temporaryPassword && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Temporary Password:</strong>
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {result.temporaryPassword}
                </code>
                <p className="text-xs text-yellow-700 mt-2">
                  Please share this with the user securely. They should change it upon first login.
                </p>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reset Password</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Reset password for <strong>{userName}</strong>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useCustomPassword}
                onChange={(e) => setUseCustomPassword(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Set custom password</span>
            </label>
          </div>

          {useCustomPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter new password..."
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
          )}

          {!useCustomPassword && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                A secure temporary password will be generated automatically
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={handleClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading || (useCustomPassword && customPassword.length < 8)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}