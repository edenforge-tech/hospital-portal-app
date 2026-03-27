'use client';

import { useState } from 'react';
import { X, Mail, CheckCircle, XCircle, Loader } from 'lucide-react';

interface TestSmtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  smtpSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableTLS: boolean;
  };
}

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  timestamp?: string;
}

export default function TestSmtpModal({ isOpen, onClose, smtpSettings }: TestSmtpModalProps) {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!testEmail) {
      setResult({
        success: false,
        message: 'Please enter a test recipient email address'
      });
      return;
    }

    try {
      setTesting(true);
      setResult(null);

      const response = await fetch('/api/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...smtpSettings,
          testRecipient: testEmail
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        message: 'Failed to test SMTP configuration',
        error: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Test SMTP Configuration</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Configuration Summary */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <div className="font-medium text-gray-700 mb-2">Current Configuration:</div>
            <div className="space-y-1 text-gray-600">
              <div>Host: <span className="font-mono">{smtpSettings.smtpHost || '(not set)'}</span></div>
              <div>Port: <span className="font-mono">{smtpSettings.smtpPort}</span></div>
              <div>From: <span className="font-mono">{smtpSettings.fromEmail || '(not set)'}</span></div>
              <div>TLS: <span className="font-mono">{smtpSettings.enableTLS ? 'Enabled' : 'Disabled'}</span></div>
            </div>
          </div>

          {/* Test Recipient Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Recipient Email
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              A test email will be sent to this address
            </p>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start space-x-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.message}
                  </div>
                  {result.error && (
                    <div className="mt-1 text-sm text-red-700">{result.error}</div>
                  )}
                  {result.timestamp && (
                    <div className="mt-1 text-xs text-gray-500">
                      Tested at: {new Date(result.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !testEmail}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {testing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <span>Send Test Email</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
