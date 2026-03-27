'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SignatureData) => void;
  title: string;
  signerLabel?: string;
  requiresRelation?: boolean;
  isSubmitting?: boolean;
}

export interface SignatureData {
  signatureBase64: string;
  signerName: string;
  signerRelation?: string;
}

/**
 * SignatureModal Component
 * 
 * Modal dialog for capturing digital signatures with signer name and optional relation.
 * Used in consent signing workflow (Patient → Witness → Guardian → Counselor).
 * 
 * @example
 * ```tsx
 * <SignatureModal 
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSubmit={(data) => handlePatientSign(data)}
 *   title="Patient Signature"
 *   signerLabel="Patient Name"
 * />
 * ```
 */
export function SignatureModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  signerLabel = 'Signer Name',
  requiresRelation = false,
  isSubmitting = false,
}: SignatureModalProps) {
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerRelation, setSignerRelation] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSignatureBase64(null);
      setSignerName('');
      setSignerRelation('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!signatureBase64) {
      alert('Please provide a signature');
      return;
    }

    if (!signerName.trim()) {
      alert(`Please enter ${signerLabel.toLowerCase()}`);
      return;
    }

    if (requiresRelation && !signerRelation.trim()) {
      alert('Please enter relation to patient');
      return;
    }

    const data: SignatureData = {
      signatureBase64,
      signerName: signerName.trim(),
    };

    if (requiresRelation) {
      data.signerRelation = signerRelation.trim();
    }

    onSubmit(data);
  };

  const canSubmit = signatureBase64 && signerName.trim() && (!requiresRelation || signerRelation.trim());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please sign below and provide your name{requiresRelation ? ' and relation to patient' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Signature Pad */}
          <div>
            <SignaturePad
              onSignatureChange={(base64) => setSignatureBase64(base64)}
              label="Signature"
              required
              width={500}
              height={200}
            />
          </div>

          {/* Signer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {signerLabel}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder={`Enter ${signerLabel.toLowerCase()}`}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Relation (if required) */}
          {requiresRelation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relation to Patient
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="text"
                value={signerRelation}
                onChange={(e) => setSignerRelation(e.target.value)}
                placeholder="e.g., Father, Mother, Spouse, Guardian"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          )}

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <CheckCircle className="inline w-4 h-4 mr-2" />
              By signing this document, you acknowledge that you have read and understood the consent form.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Signature'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
