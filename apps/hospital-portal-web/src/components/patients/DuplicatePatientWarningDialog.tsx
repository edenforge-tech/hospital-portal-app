import React from 'react';
import { X, AlertTriangle, User, Phone, Mail, Calendar, FileText } from 'lucide-react';

interface DuplicateMatch {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string | null;
  email: string | null;
  matchType: string;
  matchConfidence: number;
  differenceReason: string;
}

interface DuplicatePatientWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedAnyway: () => void;
  onSelectExisting: (patientId: string) => void;
  duplicates: DuplicateMatch[];
  newPatientData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    contactNumber?: string;
    email?: string;
  };
}

export default function DuplicatePatientWarningDialog({
  isOpen,
  onClose,
  onProceedAnyway,
  onSelectExisting,
  duplicates,
  newPatientData
}: DuplicatePatientWarningDialogProps) {
  if (!isOpen) return null;

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'ExactNameDOB': return '🔴 Exact Match (Name + DOB)';
      case 'PhoneMatch': return '🟠 Phone Number Match';
      case 'EmailMatch': return '🟡 Email Match';
      case 'FuzzyNameDOB': return '🟢 Similar Name + Same DOB';
      default: return type;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'bg-red-100 text-red-800 border-red-300';
    if (confidence >= 0.85) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (confidence >= 0.75) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.95) return 'bg-red-600';
    if (confidence >= 0.85) return 'bg-orange-600';
    if (confidence >= 0.75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Potential Duplicate Patient Detected</h2>
              <p className="text-sm text-gray-600">
                Found {duplicates.length} existing patient{duplicates.length > 1 ? 's' : ''} with similar details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-900 font-medium">
            ⚠️ Creating duplicate patients can lead to:
          </p>
          <ul className="mt-2 text-sm text-amber-800 list-disc list-inside space-y-1">
            <li>Fragmented medical history and billing errors</li>
            <li>HIPAA compliance violations</li>
            <li>Incorrect treatment decisions due to incomplete data</li>
            <li>Insurance claim rejections</li>
          </ul>
        </div>

        {/* New Patient Data */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            New Patient Data (to be created)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Full Name:</span>
              <span className="ml-2 font-medium text-gray-900">
                {newPatientData.firstName} {newPatientData.lastName}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatDate(newPatientData.dateOfBirth)}
              </span>
            </div>
            {newPatientData.contactNumber && (
              <div>
                <span className="text-gray-600">Contact:</span>
                <span className="ml-2 font-medium text-gray-900">{newPatientData.contactNumber}</span>
              </div>
            )}
            {newPatientData.email && (
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-900">{newPatientData.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Existing Duplicates */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Existing Patients with Similar Details
          </h3>
          <div className="space-y-4">
            {duplicates.map((duplicate) => (
              <div
                key={duplicate.id}
                className={`border-2 rounded-lg p-4 ${getConfidenceColor(duplicate.matchConfidence)}`}
              >
                {/* Match Type and Confidence */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {getMatchTypeLabel(duplicate.matchType)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getConfidenceBadgeColor(duplicate.matchConfidence)}`}>
                      {(duplicate.matchConfidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectExisting(duplicate.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Use This Patient
                  </button>
                </div>

                {/* Patient Details */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">MRN:</span>
                    <span className="font-mono font-medium text-gray-900">{duplicate.medicalRecordNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">
                      {duplicate.firstName} {duplicate.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">DOB:</span>
                    <span className="font-medium text-gray-900">{formatDate(duplicate.dateOfBirth)}</span>
                  </div>
                  {duplicate.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{duplicate.contactNumber}</span>
                    </div>
                  )}
                  {duplicate.email && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{duplicate.email}</span>
                    </div>
                  )}
                </div>

                {/* Differences */}
                {duplicate.differenceReason && duplicate.differenceReason !== 'Same details (possible exact duplicate)' && (
                  <div className="bg-white bg-opacity-50 rounded p-2 text-xs">
                    <span className="font-semibold text-gray-700">Differences: </span>
                    <span className="text-gray-600">{duplicate.differenceReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel Registration
          </button>
          <button
            onClick={onProceedAnyway}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Create New Patient Anyway
          </button>
        </div>

        {/* Additional Warning for High Confidence Matches */}
        {duplicates.some(d => d.matchConfidence >= 0.95) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ <strong>High confidence match detected ({(duplicates[0].matchConfidence * 100).toFixed(0)}%).</strong> 
              {' '}Please verify this is not the same patient before proceeding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
