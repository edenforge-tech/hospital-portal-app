'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PhotoCapture from '@/components/shared/PhotoCapture';
import { Activity as Upload, X, FileText, Activity as Camera, CheckCircle, AlertCircle, Activity as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getApi } from '@/lib/api';

interface DocumentUploadModalProps {
  sessionId: string;
  requiredDocuments?: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;  // Changed from onClose
  onComplete?: () => void;
}

interface UploadedDocument {
  name: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

/**
 * DocumentUploadModal - Optional document upload after payment mode selection
 * Supports camera capture, file upload, and mobile photo upload
 * Auto-approves documents (no manual verification required)
 */
export function DocumentUploadModal({
  sessionId,
  requiredDocuments = [],
  isOpen,
  setIsOpen,
  onComplete,
}: DocumentUploadModalProps) {
  // Render counter for debugging
  const renderCount = useRef(0);
  renderCount.current++;
  console.log('📄 DocumentUploadModal render #', renderCount.current, 'isOpen:', isOpen);
  
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<string | null>(null);
  
  // Use ref to track latest uploaded documents without causing re-renders
  const uploadedDocumentsRef = useRef<UploadedDocument[]>([]);
  uploadedDocumentsRef.current = uploadedDocuments;

  // Handle file selection (drag & drop or click to browse)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, documentType?: string) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValid = 
        file.type.startsWith('image/') || 
        file.type === 'application/pdf' ||
        file.type.includes('word');
      
      if (!isValid) {
        toast.error(`${file.name}: Invalid file type`);
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 10MB)`);
        return false;
      }
      
      return isValid;
    });

    const newDocuments: UploadedDocument[] = validFiles.map(file => ({
      name: documentType || file.name,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending',
    }));

    setUploadedDocuments(prev => [...prev, ...newDocuments]);
  };

  // Handle camera capture
  const handleCameraCapture = (documentType: string) => {
    setCurrentDocumentType(documentType);
    setShowCamera(true);
  };

  const handlePhotoCapture = (file: File, preview: string) => {
    const newDocument: UploadedDocument = {
      name: currentDocumentType || 'Captured Photo',
      file,
      preview,
      status: 'pending',
    };

    setUploadedDocuments(prev => [...prev, newDocument]);
    setShowCamera(false);
    setCurrentDocumentType(null);
    toast.success('Photo captured successfully');
  };

  // Remove document from list
  const handleRemoveDocument = (index: number) => {
    setUploadedDocuments(prev => {
      const doc = prev[index];
      if (doc.preview && doc.preview.startsWith('blob:')) {
        URL.revokeObjectURL(doc.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload all documents to backend
  const handleUploadAll = async () => {
    if (uploadedDocuments.length === 0) {
      toast.error('No documents to upload');
      return;
    }

    setUploading(true);

    try {
      const api = getApi();
      const uploadPromises = uploadedDocuments.map(async (doc, index) => {
        // Update status to uploading
        setUploadedDocuments(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], status: 'uploading' };
          return updated;
        });

        try {
          const formData = new FormData();
          formData.append('file', doc.file);
          formData.append('sessionId', sessionId);
          formData.append('documentType', doc.name);
          formData.append('documentName', doc.file.name);
          formData.append('isVerified', 'true'); // Auto-approve
          formData.append('verificationMethod', 'auto');

          await api.post('/counseling/documents', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          // Update status to success
          setUploadedDocuments(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: 'success' };
            return updated;
          });
        } catch (error) {
          console.error('Upload error:', error);
          
          // Update status to error
          setUploadedDocuments(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], status: 'error' };
            return updated;
          });
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      
      toast.success(`${uploadedDocuments.length} document(s) uploaded successfully`);
      
      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        onComplete?.();
      }, 1500);
    } catch (error) {
      toast.error('Some documents failed to upload');
    } finally {
      setUploading(false);
    }
  };

  //  Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Cleanup blob URLs when modal closes
      const docs = uploadedDocumentsRef.current;
      docs.forEach(doc => {
        if (doc.preview && doc.preview.startsWith('blob:')) {
          URL.revokeObjectURL(doc.preview);
        }
      });
      setUploadedDocuments([]);
      setShowCamera(false);
      setCurrentDocumentType(null);
    }
  }, [isOpen]);

  // Skip and close modal
  const handleSkip = () => {
    const docs = uploadedDocumentsRef.current;
    if (docs.length > 0) {
      const hasUnsaved = docs.some(doc => doc.status === 'pending');
      if (hasUnsaved) {
        toast.info('Documents not uploaded will be lost');
      }
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents (Optional)</DialogTitle>
          <DialogDescription>
            {requiredDocuments.length > 0 ? (
              <>Upload the following documents for this patient type. You can skip this step and upload later.</>
            ) : (
              <>Upload any relevant documents for this session. This step is optional.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Required Documents List */}
          {requiredDocuments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Required Documents:</h4>
              <ul className="space-y-1">
                {requiredDocuments.map((doc, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Camera Capture */}
          {showCamera ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <PhotoCapture
                onPhotoCapture={handlePhotoCapture}
                onCancel={() => {
                  setShowCamera(false);
                  setCurrentDocumentType(null);
                }}
              />
            </div>
          ) : (
            <>
              {/* Upload Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Camera Capture Button */}
                <button
                  onClick={() => handleCameraCapture('Camera Capture')}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Use Camera</span>
                </button>

                {/* File Upload Button */}
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e)}
                    className="hidden"
                  />
                </label>

                {/* Mobile Camera Upload */}
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors cursor-pointer">
                  <ImageIcon className="h-8 w-8 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Mobile Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e, 'Mobile Photo')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Documents to Upload:</h4>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        {/* Preview or Icon */}
                        {doc.preview ? (
                          <img
                            src={doc.preview}
                            alt={doc.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-500" />
                          </div>
                        )}

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-600">
                            {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {/* Status Indicator */}
                        {doc.status === 'uploading' && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs">Uploading...</span>
                          </div>
                        )}
                        {doc.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {doc.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}

                        {/* Remove Button */}
                        {doc.status === 'pending' && (
                          <button
                            onClick={() => handleRemoveDocument(index)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSkip}
              disabled={uploading}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Skip for Now
            </button>
            {uploadedDocuments.length > 0 && (
              <button
                onClick={handleUploadAll}
                disabled={uploading || uploadedDocuments.every(doc => doc.status === 'success')}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : uploadedDocuments.every(doc => doc.status === 'success') ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Uploaded
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload {uploadedDocuments.length} Document{uploadedDocuments.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
