'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Mail, XCircle } from 'lucide-react';
import { getApi } from '@/lib/api';

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid verification link. Token is missing.');
        setVerifying(false);
        return;
      }

      try {
        const api = getApi();
        
        // Step 1: Validate token with notification service
        const notificationResponse = await api.post('/activation/verify-email', {
          token,
        });

        if (notificationResponse.data.success) {
          const { email: userEmail, userId } = notificationResponse.data;
          setEmail(userEmail);

          // Step 2: Mark email as verified in auth service
          const authApi = getApi();
          authApi.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
          
          const authResponse = await authApi.post(`/users/${userId}/verify-email`);

          if (authResponse.data.success) {
            setVerified(true);
          } else {
            setError('Failed to update verification status. Please contact administrator.');
          }
        } else {
          setError(notificationResponse.data.error || 'Email verification failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Email verification failed. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h1>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">
              Your email address <strong>{email}</strong> has been successfully verified.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Check your email for the activation link</li>
              <li>Click "Activate Now" to complete account setup</li>
              <li>Enter your activation code</li>
              <li>Set your password and configure MFA</li>
            </ol>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-red-600 mb-6">{error}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">What to do:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Request a new verification email</li>
            <li>Make sure you're using the latest email</li>
            <li>Verification links expire after 24 hours</li>
            <li>Contact administrator if issue persists</li>
          </ul>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
