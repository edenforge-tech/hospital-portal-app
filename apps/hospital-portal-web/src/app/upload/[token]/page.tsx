'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Camera,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Loader2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';

interface LinkInfo {
  description: string;
  purpose: string;
  expiresAt: string;
  isValid: boolean;
  isExpired: boolean;
  fileCount: number;
}

export default function PatientUploadPage() {
  const params = useParams();
  const token = params?.token as string;

  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load link info on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/patient-uploads/${token}/info`);
        if (res.ok) {
          const data: LinkInfo = await res.json();
          setInfo(data);
        } else if (res.status === 404) {
          setInfoError('This link is no longer valid.');
        } else {
          setInfoError('Could not load upload information. Please try again.');
        }
      } catch {
        setInfoError('Could not connect to server. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null); // PDF — no image preview
    }
  }

  function clearFile() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadError(null);
  }

  async function handleUpload() {
    if (!selectedFile || !token) return;
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE}/patient-uploads/${token}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newCount = uploadCount + 1;
        setUploadCount(newCount);
        setUploadSuccess(true);
        clearFile();
      } else if (res.status === 410) {
        setUploadError('This upload link has expired. Please contact your hospital for a new link.');
      } else if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.message || 'Invalid file. Please upload a JPEG, PNG, or PDF file.');
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } catch {
      setUploadError('Upload failed. Please check your internet connection and try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleUploadAnother() {
    setUploadSuccess(false);
    setUploadError(null);
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / error state ──────────────────────────────────────────────────
  if (infoError || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-500 text-sm">{infoError || 'This upload link is not valid.'}</p>
        </div>
      </div>
    );
  }

  // ── Expired link ───────────────────────────────────────────────────────────
  if (info.isExpired || !info.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-500 text-sm">
            This upload link expired on{' '}
            {new Date(info.expiresAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}.
          </p>
          <p className="text-gray-400 text-xs mt-3">Please contact your hospital to get a new link.</p>
        </div>
      </div>
    );
  }

  // ── Upload success screen ──────────────────────────────────────────────────
  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Uploaded Successfully!</h1>
          <p className="text-emerald-700 text-sm mb-2">
            Your document has been received and will be reviewed by your care team.
          </p>
          {uploadCount > 0 && (
            <p className="text-emerald-600 text-xs mb-6">
              {uploadCount} file{uploadCount !== 1 ? 's' : ''} uploaded in this session.
            </p>
          )}
          <button
            type="button"
            onClick={handleUploadAnother}
            className="w-full py-3 px-6 bg-emerald-600 text-white font-semibold rounded-2xl text-base active:bg-emerald-700 transition-colors"
          >
            Upload Another Document
          </button>
        </div>
      </div>
    );
  }

  // ── Main upload screen ─────────────────────────────────────────────────────
  const expiresIn = Math.max(
    0,
    Math.ceil((new Date(info.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 shadow-sm">
        <div className="max-w-sm mx-auto">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
            Hospital Portal
          </p>
          <h1 className="text-lg font-bold text-gray-900">Document Upload</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 max-w-sm mx-auto w-full flex flex-col gap-5">
        {/* What to upload */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            Please upload
          </p>
          <p className="text-base font-semibold text-gray-900">{info.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            Link expires in ~{expiresIn}h ·{' '}
            {info.fileCount > 0 ? `${info.fileCount} file${info.fileCount !== 1 ? 's' : ''} received` : 'No files received yet'}
          </p>
        </div>

        {/* File selected preview */}
        {selectedFile ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain bg-gray-50"
              />
            ) : (
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024).toFixed(0)} KB · PDF
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 truncate flex-1 mr-3">{selectedFile.name}</p>
              <button
                type="button"
                onClick={clearFile}
                className="flex-shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload buttons */
          <div className="flex flex-col gap-3">
            {/* Camera button — opens camera on mobile */}
            <label className="flex items-center gap-4 bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 active:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Take a Photo</p>
                <p className="text-xs text-gray-400">Use your camera to capture the document</p>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>

            {/* File picker button */}
            <label className="flex items-center gap-4 bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 active:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Choose File</p>
                <p className="text-xs text-gray-400">Select a photo or PDF from your device</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}

        {/* Upload button */}
        {selectedFile && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-4 bg-emerald-600 disabled:bg-emerald-400 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 active:bg-emerald-700 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Document
              </>
            )}
          </button>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Accepted formats: JPEG, PNG, PDF · Max 20 MB
        </p>
      </div>
    </div>
  );
}
