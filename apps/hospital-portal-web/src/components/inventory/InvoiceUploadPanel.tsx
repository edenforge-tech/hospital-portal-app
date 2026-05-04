'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, Image, X, AlertCircle } from 'lucide-react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;

function inferMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return map[ext] ?? '';
}

interface Props {
  onFileSelected: (file: File) => void;
  onCancel: () => void;
  isProcessing: boolean;
  extractionError?: string | null;
  onRetry?: () => void;
}

export function InvoiceUploadPanel({ onFileSelected, onCancel, isProcessing, extractionError, onRetry }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [preview,  setPreview]  = useState<{ name: string; size: string; type: string } | null>(null);

  const validate = (file: File): string | null => {
    // file.type can be empty on Windows for uppercase extensions like .PDF
    const resolvedType = file.type || inferMime(file.name);
    if (!ACCEPTED_TYPES.includes(resolvedType))
      return `Unsupported file type. Accepted: PDF, JPEG, PNG, WebP.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const handle = (file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    const resolvedType = file.type || inferMime(file.name);
    setPreview({
      name: file.name,
      size: file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`,
      type: resolvedType,
    });
    onFileSelected(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  };

  const FileIcon = preview?.type === 'application/pdf' ? FileText : Image;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Upload Invoice</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload vendor invoice PDF or image — fields will be auto-filled for your review
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors disabled:opacity-40"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !isProcessing && inputRef.current?.click()}
          className={[
            'border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all',
            dragging        ? 'border-teal-400 bg-teal-50/60'     : '',
            !dragging && !isProcessing ? 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30' : '',
            isProcessing    ? 'border-teal-300 bg-teal-50/40 cursor-default animate-pulse' : '',
          ].join(' ')}
        >
          {isProcessing ? (
            <>
              <div className="w-10 h-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-semibold text-teal-700">Extracting invoice data…</p>
              <p className="text-xs text-teal-500 mt-1">This usually takes 5–15 seconds</p>
            </>
          ) : preview ? (
            <>
              <FileIcon size={32} className="text-teal-600 mb-2" />
              <p className="text-sm font-semibold text-gray-800 text-center max-w-xs truncate">{preview.name}</p>
              <p className="text-xs text-gray-400 mt-1">{preview.size}</p>
              <p className="text-xs text-teal-600 mt-2">Click to change file</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-600">Drop invoice here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, WebP — max {MAX_SIZE_MB} MB</p>
            </>
          )}
        </div>

        {/* Validation error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Extraction API error (e.g. scanned PDF failed, provider error) */}
        {extractionError && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1">
              <p className="font-medium">{extractionError}</p>
              <p className="text-amber-600">
                <button onClick={onRetry} className="underline hover:no-underline font-medium mr-2">Try a different file</button>
                or{' '}
                <button onClick={onCancel} className="underline hover:no-underline font-medium">fill in manually instead</button>
              </p>
            </div>
          </div>
        )}

        {/* Skip link */}
        {!isProcessing && (
          <p className="text-center text-xs text-gray-400">
            or{' '}
            <button
              onClick={onCancel}
              className="text-teal-600 hover:underline font-medium"
            >
              skip and fill manually
            </button>
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}
