'use client';

import React from 'react';
import { X } from 'lucide-react';

/**
 * DrawerPanel
 * Slide-over drawer from the right side of the screen.
 * Used for invoice detail, GRN detail, requisition detail, etc.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DrawerPanel({
  open,
  onClose,
  title,
  subtitle,
  width = 'w-full max-w-[600px]',
  children,
  footer,
}: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 ${width} bg-white shadow-2xl z-50 flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t px-5 py-3 bg-gray-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
