'use client';

import { useState } from 'react';
import { X, Mail, Key, CheckCircle2, AlertCircle, Copy, Check, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

interface UserActivationModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UserActivationModal({
  userId,
  userName,
  userEmail,
  userPhone,
  onClose,
  onSuccess
}: UserActivationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'initial' | 'sent'>('initial');
  
  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'sms'>('email');
  
  // Editable contact info
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone || '');

  const handleGenerateCredential = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
      const { token, tenantId } = useAuthStore.getState();

      if (!tenantId || !token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Validate contact info
      const recipient = deliveryMethod === 'email' ? email : phone;
      if (!recipient) {
        throw new Error(`Please provide a valid ${deliveryMethod === 'email' ? 'email address' : 'phone number'}`);
      }

      const requestPayload = {
        deliveryMethod: deliveryMethod,
        recipient: recipient
      };

      const response = await fetch(`${apiUrl}/users/${userId}/send-activation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send activation code');
      }

      const result = await response.json();
      setSuccess(`Activation code sent successfully to ${recipient}`);
      setStep('sent');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (err: any) {
      console.error('[UserActivationModal] Error:', err);
      setError(err.message || 'Failed to send activation code');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async () => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');

      const response = await fetch(`${apiUrl}/users/${userId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to activate user');
      }

      const result = await response.json();
      setSuccess(result.message || 'User activated successfully');
      setStep('activated');

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error activating user:', err);
      setError(err.message || 'Failed to activate user');
    } finally {
      setLoading(false);
    }
  };

  const copyCredential = () => {
    if (credential) {
      navigator.clipboard.writeText(credential);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Activation</h2>
              <p className="text-sm text-gray-600">{userName} ({userEmail})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          )}

          {/* Step 1: Initial State - Edit contact info and send */}
          {step === 'initial' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Send Activation Code</h3>
                <p className="text-sm text-blue-800">
                  A 6-digit OTP will be sent to the user's contact. The user must use this code to activate their account and set a password.
                </p>
              </div>

              {/* Delivery Method Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('email')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      deliveryMethod === 'email'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-5 w-5" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('sms')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      deliveryMethod === 'sms'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      <span className="text-sm font-medium">SMS</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Editable Email Field */}
              {deliveryMethod === 'email' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">The OTP will be sent to this email address</p>
                </div>
              )}

              {/* Editable Phone Field */}
              {deliveryMethod === 'sms' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">The OTP will be sent via SMS to this number</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Security Note:</strong> The activation code will expire in 48 hours. For security reasons, the code is not displayed to administrators.
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateCredential}
                disabled={loading || (deliveryMethod === 'email' && !email) || (deliveryMethod === 'sms' && !phone)}
                className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                {deliveryMethod === 'email' ? <Mail className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                Send Activation Code
              </button>
            </div>
          )}

          {/* Step 2: OTP Sent Successfully */}
          {step === 'sent' && (
            <div className="space-y-4 text-center py-6">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activation Code Sent!</h3>
                <p className="text-sm text-gray-600">
                  A 6-digit activation code has been sent to:<br />
                  <strong>{deliveryMethod === 'email' ? email : phone}</strong>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900">
                  <strong>Next Steps:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>User will receive the code via {deliveryMethod === 'email' ? 'email' : 'SMS'}</li>
                  <li>Code is valid for 48 hours</li>
                  <li>User must login with the code and set a new password</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
