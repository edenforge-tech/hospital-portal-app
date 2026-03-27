'use client';

import { useState } from 'react';
import { X, Webhook, CheckCircle, XCircle, Loader } from 'lucide-react';

interface TestWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
}

interface TestResult {
  success: boolean;
  statusCode?: number;
  message: string;
  response?: string;
  timestamp?: string;
}

export default function TestWebhookModal({ isOpen, onClose, webhookUrl }: TestWebhookModalProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!webhookUrl) {
      setResult({
        success: false,
        message: 'Webhook URL is not configured'
      });
      return;
    }

    try {
      setTesting(true);
      setResult(null);

      const response = await fetch('/api/settings/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl })
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        message: 'Failed to test webhook',
        response: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Webhook className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Test Webhook</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Webhook URL Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-700 break-all">
              {webhookUrl || '(not configured)'}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              A test payload will be sent to this URL with event type "test"
            </p>
          </div>

          {/* Test Payload Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Payload
            </label>
            <pre className="px-4 py-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
{`{
  "event": "test",
  "tenantId": "...",
  "message": "This is a test webhook from Hospital Portal",
  "timestamp": "${new Date().toISOString()}"
}`}
            </pre>
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
                  {result.statusCode && (
                    <div className="mt-1 text-sm">
                      Status Code: <span className="font-mono">{result.statusCode}</span>
                    </div>
                  )}
                  {result.response && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Response:</div>
                      <pre className="text-xs bg-white bg-opacity-50 rounded p-2 overflow-x-auto max-h-40">
                        {result.response}
                      </pre>
                    </div>
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
            disabled={testing || !webhookUrl}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {testing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <span>Send Test Webhook</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
