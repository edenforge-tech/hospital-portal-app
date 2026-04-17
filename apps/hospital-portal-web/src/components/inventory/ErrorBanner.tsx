'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * ErrorBanner
 * Dismissible error banner for displaying API errors in inventory pages.
 */
interface Props {
  message: string | null;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, className = '' }: Props) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700 ${className}`}
      role="alert"
    >
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-red-400 hover:text-red-600">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
