/**
 * Clinical Data Status Banner
 * Shows status of clinical data (from doctor/optometrist)
 * Counselor sees read-only data or pending message
 */

'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';

export type ClinicalDataStatus = 'complete' | 'pending' | 'not-started';

interface ClinicalDataBannerProps {
  status: ClinicalDataStatus;
  hasDiagnosis?: boolean;
  hasVisualAcuity?: boolean;
  onRequestDoctorInput?: () => void;
  className?: string;
}

export function ClinicalDataBanner({
  status,
  hasDiagnosis = false,
  hasVisualAcuity = false,
  onRequestDoctorInput,
  className = '',
}: ClinicalDataBannerProps) {
  // Don't show banner if clinical data is complete
  if (status === 'complete' && hasDiagnosis && hasVisualAcuity) {
    return null;
  }

  const getBannerStyle = () => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'not-started':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'not-started':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMessage = () => {
    if (status === 'complete') {
      const missing = [];
      if (!hasDiagnosis) missing.push('diagnosis');
      if (!hasVisualAcuity) missing.push('visual acuity');
      
      if (missing.length > 0) {
        return `Clinical data incomplete: ${missing.join(', ')} pending`;
      }
      return 'Clinical data complete';
    }
    
    if (status === 'pending') {
      return 'Clinical data pending doctor review';
    }
    
    return 'Clinical examination not started';
  };

  const getDescription = () => {
    if (status === 'complete') {
      return 'You can proceed with financial counseling or wait for complete data.';
    }
    
    if (status === 'pending') {
      return 'You can proceed with payment/package selection or ask doctor to complete examination first.';
    }
    
    return 'Patient needs clinical examination before counseling. Contact doctor or optometrist.';
  };

  return (
    <div
      className={`border rounded-lg p-4 ${getBannerStyle()} ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{getMessage()}</h3>
          <p className="text-sm mt-1 opacity-90">{getDescription()}</p>

          {/* Action button for requesting doctor input */}
          {(status === 'pending' || status === 'not-started') && onRequestDoctorInput && (
            <button
              onClick={onRequestDoctorInput}
              className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              Request Doctor Input
            </button>
          )}

          {/* Details about what's pending */}
          {status !== 'complete' && (
            <div className="mt-2 text-xs opacity-75">
              <div className="flex items-center space-x-4">
                <span>
                  {hasDiagnosis ? '✓' : '○'} Diagnosis
                </span>
                <span>
                  {hasVisualAcuity ? '✓' : '○'} Visual Acuity
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
