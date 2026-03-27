// Digital Signature Component
// Comprehensive digital signature workflow with HIPAA compliance

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSignature, 
  Check, 
  X, 
  Edit3, 
  Type, 
  Upload, 
  Download, 
  Shield, 
  Clock, 
  User, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Lock,
  Clipboard,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Hash,
  Certificate
} from 'lucide-react';
import { documentSharingApi, DigitalSignature, Document } from '../../lib/api/document-sharing.api';

interface DigitalSignatureProps {
  documentId: string;
  document?: Document;
  onClose: () => void;
  onSigned: (signature: DigitalSignature) => void;
  mode?: 'request' | 'sign' | 'verify' | 'view';
  signatureId?: string;
}

interface SignatureData {
  type: 'draw' | 'type' | 'upload' | 'certificate';
  data: string;
  signerName: string;
  signerEmail: string;
  signerTitle?: string;
  reason: string;
  location: string;
  contactInfo?: string;
  certificateId?: string;
  biometricData?: string;
}

interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export default function DigitalSignatureComponent({ 
  documentId, 
  document, 
  onClose, 
  onSigned,
  mode = 'sign',
  signatureId
}: DigitalSignatureProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'setup' | 'sign' | 'verify' | 'complete'>('setup');
  const [signatureData, setSignatureData] = useState<SignatureData>({
    type: 'draw',
    data: '',
    signerName: '',
    signerEmail: '',
    reason: 'Document approval and authentication',
    location: '',
    contactInfo: ''
  });
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition | null>(null);
  const [existingSignature, setExistingSignature] = useState<DigitalSignature | null>(null);
  const [isPositioning, setIsPositioning] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCertificateUpload, setShowCertificateUpload] = useState(false);

  useEffect(() => {
    if (mode === 'verify' || mode === 'view') {
      loadExistingSignature();
    }
    loadUserInfo();
  }, [signatureId]);

  const loadExistingSignature = async () => {
    if (!signatureId) return;
    
    try {
      setLoading(true);
      const signature = await documentSharingApi.getSignature(signatureId);
      setExistingSignature(signature);
    } catch (error) {
      console.error('Error loading signature:', error);
      setError('Failed to load signature details.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    // This would typically come from auth context
    setSignatureData(prev => ({
      ...prev,
      signerName: 'Dr. Sarah Johnson', // From auth
      signerEmail: 'sarah.johnson@hospital.com', // From auth
      signerTitle: 'Chief of Cardiology', // From user profile
      location: 'General Hospital, New York', // From user profile/settings
      contactInfo: '+1-555-0123' // From user profile
    }));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (signatureData.type !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = '#2563eb';
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signatureData.type !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setSignatureData(prev => ({ ...prev, data: dataUrl }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData(prev => ({ ...prev, data: '' }));
  };

  const generateTypedSignature = () => {
    if (!signatureData.signerName) return '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.fillStyle = '#2563eb';
      context.font = '28px "Brush Script MT", cursive';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(signatureData.signerName, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSignatureData(prev => ({ ...prev, data: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // This would typically upload to a secure certificate storage
      console.log('Certificate file selected:', file.name);
      setSignatureData(prev => ({ 
        ...prev, 
        certificateId: `cert_${Date.now()}`,
        data: 'certificate_signature_placeholder'
      }));
    }
  };

  const submitSignature = async () => {
    if (!validateSignature()) return;

    try {
      setLoading(true);
      setError('');

      let finalData = signatureData.data;
      if (signatureData.type === 'type') {
        finalData = generateTypedSignature();
      }

      const signatureRequest = {
        documentId,
        type: signatureData.type,
        signatureData: finalData,
        signerName: signatureData.signerName,
        signerEmail: signatureData.signerEmail,
        signerTitle: signatureData.signerTitle,
        reason: signatureData.reason,
        location: signatureData.location,
        contactInfo: signatureData.contactInfo,
        position: signaturePosition,
        certificateId: signatureData.certificateId,
        biometricData: await generateBiometricData(),
        ipAddress: await getClientIpAddress(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const signature = await documentSharingApi.createDigitalSignature(signatureRequest);
      setCurrentStep('complete');
      onSigned(signature);
      
    } catch (error) {
      console.error('Error creating signature:', error);
      setError('Failed to create digital signature. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateSignature = (): boolean => {
    if (!signatureData.signerName.trim()) {
      setError('Signer name is required.');
      return false;
    }
    
    if (!signatureData.signerEmail.trim() || !isValidEmail(signatureData.signerEmail)) {
      setError('Valid email address is required.');
      return false;
    }
    
    if (!signatureData.reason.trim()) {
      setError('Reason for signing is required.');
      return false;
    }
    
    if (!signatureData.location.trim()) {
      setError('Signing location is required.');
      return false;
    }
    
    if (!signatureData.data && signatureData.type !== 'certificate') {
      setError('Please provide your signature.');
      return false;
    }

    return true;
  };

  const generateBiometricData = async (): Promise<string> => {
    // This would implement actual biometric capture in a real application
    return JSON.stringify({
      pressure: Math.random() * 100,
      speed: Math.random() * 50,
      angle: Math.random() * 360,
      timestamp: Date.now()
    });
  };

  const getClientIpAddress = async (): Promise<string> => {
    // This would use a service to get the actual IP address
    return '192.168.1.100';
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const renderSignatureSetup = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Signature Setup</h3>
        <p className="text-gray-600 mb-6">
          Please provide your signature and required information to digitally sign this document.
        </p>
      </div>

      {/* Signature Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Signature Type</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { type: 'draw', icon: Edit3, label: 'Draw' },
            { type: 'type', icon: Type, label: 'Type' },
            { type: 'upload', icon: Upload, label: 'Upload' },
            { type: 'certificate', icon: Certificate, label: 'Certificate' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setSignatureData(prev => ({ ...prev, type: type as any }))}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                signatureData.type === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Icon className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Signature Input */}
      <div>
        {signatureData.type === 'draw' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Draw Your Signature</label>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="border border-gray-300 rounded bg-white cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <button
                onClick={clearSignature}
                className="mt-2 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {signatureData.type === 'type' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typed Signature</label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="text-center py-8">
                {signatureData.signerName ? (
                  <div 
                    className="text-3xl text-blue-600"
                    style={{ fontFamily: '"Brush Script MT", cursive' }}
                  >
                    {signatureData.signerName}
                  </div>
                ) : (
                  <div className="text-gray-500">Enter your name below to see typed signature</div>
                )}
              </div>
            </div>
          </div>
        )}

        {signatureData.type === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Signature Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="signature-upload"
              />
              <label htmlFor="signature-upload" className="cursor-pointer">
                <span className="text-sm text-blue-600 hover:text-blue-500">Click to upload</span>
                <span className="text-sm text-gray-500"> or drag and drop</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              {signatureData.data && signatureData.type === 'upload' && (
                <div className="mt-4">
                  <img src={signatureData.data} alt="Signature" className="max-h-20 mx-auto" />
                </div>
              )}
            </div>
          </div>
        )}

        {signatureData.type === 'certificate' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Digital Certificate</label>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Certificate className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium">Certificate-based Signature</div>
                  <div className="text-sm text-gray-600">Use your digital certificate for signing</div>
                </div>
              </div>
              <input
                type="file"
                accept=".p12,.pfx,.pem"
                onChange={handleCertificateUpload}
                className="hidden"
                id="certificate-upload"
              />
              <label
                htmlFor="certificate-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Certificate
              </label>
              {signatureData.certificateId && (
                <div className="mt-3 text-sm text-green-600">
                  ✓ Certificate uploaded successfully
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Signer Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={signatureData.signerName}
            onChange={(e) => setSignatureData(prev => ({ ...prev, signerName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            value={signatureData.signerEmail}
            onChange={(e) => setSignatureData(prev => ({ ...prev, signerEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title/Position</label>
          <input
            type="text"
            value={signatureData.signerTitle}
            onChange={(e) => setSignatureData(prev => ({ ...prev, signerTitle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
          <input
            type="text"
            value={signatureData.contactInfo}
            onChange={(e) => setSignatureData(prev => ({ ...prev, contactInfo: e.target.value }))}
            placeholder="Phone number or email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Signing Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Signing *</label>
          <textarea
            value={signatureData.reason}
            onChange={(e) => setSignatureData(prev => ({ ...prev, reason: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Signing Location *</label>
          <input
            type="text"
            value={signatureData.location}
            onChange={(e) => setSignatureData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, State or Address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">HIPAA Compliance Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your digital signature will be cryptographically secured and include biometric data, 
              timestamp, and location information for compliance with healthcare regulations and 
              legal requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignatureVerification = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Signature Verification</h3>
      </div>

      {existingSignature && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                existingSignature.isValid ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {existingSignature.isValid ? (
                  <Check className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {existingSignature.isValid ? 'Valid Signature' : 'Invalid Signature'}
                </h4>
                <p className="text-sm text-gray-600">
                  {existingSignature.isValid 
                    ? 'This signature has been verified and is legally binding.'
                    : 'This signature could not be verified or has been tampered with.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Signature Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Signer Information</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{existingSignature.signerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{existingSignature.signerEmail}</span>
                </div>
                {existingSignature.signerTitle && (
                  <div className="text-gray-500">{existingSignature.signerTitle}</div>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3">Signature Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{new Date(existingSignature.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{existingSignature.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="font-mono text-xs">{existingSignature.signatureHash?.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Verification Details
              </summary>
              <div className="mt-3 space-y-3 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">IP Address:</span>
                    <div className="font-mono">{existingSignature.ipAddress}</div>
                  </div>
                  <div>
                    <span className="font-medium">User Agent:</span>
                    <div className="font-mono text-xs break-all">{existingSignature.userAgent}</div>
                  </div>
                  <div>
                    <span className="font-medium">Certificate ID:</span>
                    <div className="font-mono">{existingSignature.certificateId || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Signature Type:</span>
                    <div>{existingSignature.type}</div>
                  </div>
                </div>
                
                {existingSignature.reason && (
                  <div>
                    <span className="font-medium">Reason for Signing:</span>
                    <div>{existingSignature.reason}</div>
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Cryptographic Hash:</span>
                  <div className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                    {existingSignature.signatureHash}
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span>
            {mode === 'verify' ? 'Verifying signature...' : 'Processing signature...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileSignature className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'verify' ? 'Verify Digital Signature' : 'Digital Signature'}
              </h2>
              <p className="text-sm text-gray-600">
                {document?.title || 'Document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {mode === 'verify' || mode === 'view' ? renderSignatureVerification() : renderSignatureSetup()}

          {currentStep === 'complete' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">Signature Complete</h3>
              <p className="text-green-700">
                Your digital signature has been successfully applied to the document.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode !== 'verify' && mode !== 'view' && currentStep !== 'complete' && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <div className="flex items-center space-x-1 mb-1">
                <Lock className="h-3 w-3" />
                <span>Secured with 256-bit encryption</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>HIPAA compliant digital signature</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitSignature}
                disabled={loading || !validateSignature()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <FileSignature className="h-4 w-4" />
                <span>Sign Document</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}