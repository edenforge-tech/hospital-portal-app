'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function ActivatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'otp' | 'password'>('otp');

  const validatePassword = (password: string): string | null => {
    if (password.length < 12) {
      return 'Password must be at least 12 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

      const response = await fetch(`${apiUrl}/activation/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid or expired OTP');
      }

      // OTP verified, proceed to password setup
      setStep('password');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

      const response = await fetch(`${apiUrl}/auth/login-with-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set password');
      }

      const result = await response.json();
      
      // Store auth data
      localStorage.setItem('token', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('tenantId', result.tenantId);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Password setup error:', err);
      setError(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'otp' ? 'Activate Your Account' : 'Set Your Password'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'otp' 
              ? 'Enter the OTP sent to your email or phone'
              : 'Create a strong password for your account'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password (OTP)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-2">
                Check your email or SMS for the 6-digit code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  autoFocus
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 12 ? 'bg-green-500' : 'bg-gray-400'}`} />
                  At least 12 characters
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`} />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`} />
                  One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`} />
                  One number
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`} />
                  One special character
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Set Password & Login
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-700">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
      <ActivatePageContent />
    </Suspense>
  );
}
