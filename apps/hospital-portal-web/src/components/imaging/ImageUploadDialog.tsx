'use client';

import { useState, useRef, useCallback } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ImageUploadDialogProps {
  orderId: string;
  onUploadComplete: (images: UploadedImage[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface UploadedImage {
  id: string;
  imagingOrderId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  width?: number;
  height?: number;
  modality: string;
  uploadedAt: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  uploadedImage?: UploadedImage;
}

export default function ImageUploadDialog({ 
  orderId, 
  onUploadComplete, 
  onClose, 
  isOpen 
}: ImageUploadDialogProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [modality, setModality] = useState<string>('fundus');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modalityOptions = [
    { value: 'fundus', label: 'Fundus Photography' },
    { value: 'oct', label: 'OCT Scan' },
    { value: 'visual_field', label: 'Visual Field Test' },
    { value: 'scheimpflug', label: 'Scheimpflug Imaging' },
    { value: 'iol_calculation', label: 'IOL Calculation' },
    { value: 'ubm', label: 'UBM (Ultrasound)' },
    { value: 'angiography', label: 'Angiography' },
    { value: 'otros', label: 'Other' },
  ];

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/dicom', 'application/pdf'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return `File type ${file.type} not allowed. Allowed: JPEG, PNG, DICOM, PDF`;
    }
    if (file.size > 52428800) { // 50MB
      return `File size ${(file.size / 1048576).toFixed(2)}MB exceeds maximum of 50MB`;
    }
    return null;
  };

  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithPreview[] = [];
    const currentFileCount = files.length;

    // Validate file count
    if (currentFileCount + selectedFiles.length > 20) {
      alert(`Maximum 20 files allowed. You selected ${selectedFiles.length} files but already have ${currentFileCount}.`);
      return;
    }

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);
      
      // Create preview URL for images
      let preview = '';
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        preview = '/icons/pdf-icon.png'; // Placeholder
      } else {
        preview = '/icons/dicom-icon.png'; // Placeholder
      }

      newFiles.push({
        file,
        preview,
        status: error ? 'error' : 'pending',
        error: error || undefined
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leak
      if (newFiles[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      alert('No files to upload');
      return;
    }

    // Check if this is a demo order
    if (orderId.startsWith('demo-')) {
      alert('⚠️ Demo Mode\n\nImage upload is not available for demo orders. This feature requires a real imaging order from the database.\n\nTo test upload functionality, create a real imaging order for a patient first.');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      pendingFiles.forEach((fileWithPreview) => {
        formData.append('files', fileWithPreview.file);
      });
      formData.append('modality', modality);

      // Get auth details
      const authStore = (await import('@/lib/auth-store')).useAuthStore.getState();
      const { tenantId, token } = authStore;

      if (!tenantId || !token) {
        throw new Error('Authentication required');
      }

      // Update status to uploading
      setFiles((prev) => prev.map((f) => 
        f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
      ));

      // Upload via API
      const api = (await import('@/lib/api')).getApi();
      const response = await api.post<UploadedImage[]>(
        `/Imaging/${orderId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Tenant-ID': tenantId,
            Authorization: `Bearer ${token}`
          }
        }
      );

      const uploadedImages = response.data;

      // Update files with success status
      setFiles((prev) => {
        const updated = [...prev];
        let uploadIndex = 0;
        
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].status === 'uploading') {
            updated[i] = {
              ...updated[i],
              status: 'success',
              uploadedImage: uploadedImages[uploadIndex]
            };
            uploadIndex++;
          }
        }
        
        return updated;
      });

      // Notify parent
      onUploadComplete(uploadedImages);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Update files with error status
      setFiles((prev) => prev.map((f) => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: error.response?.data?.message || error.message || 'Upload failed' }
          : f
      ));

      alert(`Upload failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  const successCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Imaging Files</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload up to 20 files (max 50MB each). Supported: JPEG, PNG, DICOM, PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isUploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modality Selector */}
        <div className="px-6 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imaging Modality
          </label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            disabled={isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {modalityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Area */}
        {files.length === 0 && (
          <div className="px-6 py-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-6xl mb-4">⬆️</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,application/dicom,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Files ({files.length}/20)
              </h3>
              {!isUploading && pendingCount > 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add More
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,application/dicom,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              {files.map((fileWithPreview, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 border rounded-lg ${
                    fileWithPreview.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : fileWithPreview.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : fileWithPreview.status === 'uploading'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {fileWithPreview.file.type.startsWith('image/') ? (
                      <img
                        src={fileWithPreview.preview}
                        alt={fileWithPreview.file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileWithPreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileWithPreview.file.size)} • {fileWithPreview.file.type}
                    </p>
                    {fileWithPreview.error && (
                      <p className="text-xs text-red-600 mt-1">{fileWithPreview.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {fileWithPreview.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {fileWithPreview.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {fileWithPreview.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {fileWithPreview.status === 'pending' && !isUploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {successCount > 0 && (
              <span className="text-green-600 font-medium">{successCount} uploaded</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-600 font-medium ml-3">{errorCount} failed</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
            >
              {successCount > 0 ? 'Done' : 'Cancel'}
            </button>
            {pendingCount > 0 && (
              <button
                onClick={uploadFiles}
                disabled={isUploading || pendingCount === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isUploading ? 'Uploading...' : `Upload ${pendingCount} File${pendingCount > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
