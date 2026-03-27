/**
 * Insurance Pre-Auth Widget
 * Pre-authorization form, document upload, status tracking, and approval display
 * NOW with auto-fill from session package amount
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Shield, X as Upload, CheckCircle2 as Check, Clock, AlertCircle, FileText, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';
import { useCounselingSession } from '@/hooks/use-counseling-sessions';

type PreAuthStatus = 'draft' | 'submitted' | 'under-review' | 'additional-info-required' | 'approved' | 'rejected';

interface PreAuthDocument {
  id: string;
  name: string;
  type: 'policy-copy' | 'id-proof' | 'tpa-letter' | 'prescription' | 'reports' | 'other';
  uploaded: boolean;
  required: boolean;
}

interface PreAuthData {
  status: PreAuthStatus;
  insuranceCompany: string;
  policyNumber: string;
  tpaName: string;
  memberName: string;
  memberId: string;
  relationToPatient: string;
  estimatedAmount: number;
  requestedAmount: number;
  approvedAmount?: number;
  submittedAt?: Date;
  respondedAt?: Date;
  remarks?: string;
}

export default function InsurancePreAuthWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [preAuthData, setPreAuthData] = useState<PreAuthData | null>(null);
  const [documents, setDocuments] = useState<PreAuthDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch session data to auto-fill package amount
  const { data: session } = useCounselingSession(sessionId || '', {
    enabled: !!sessionId,
  });

  // Load pre-auth data from API
  useEffect(() => {
    if (patientId) loadPreAuthData();
  }, [patientId]);

  // Auto-fill estimated amount from session package amount
  useEffect(() => {
    if (session?.packageAmount && preAuthData && preAuthData.estimatedAmount === 0) {
      console.log('💡 Auto-filling estimated amount from session:', session.packageAmount);
      setPreAuthData({
        ...preAuthData,
        estimatedAmount: session.packageAmount,
        requestedAmount: session.packageAmount, // Also set requested to same amount
      });
    }
  }, [session, preAuthData]);

  const loadPreAuthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiData = await widgetsApi.getPreAuthData(patientId!);
      
      console.log('🔍 Insurance API Data:', apiData);
      
      // If no insurance data exists, force draft status
      const hasInsuranceData = apiData.companyName || apiData.policyNumber;
      const insuranceStatus = hasInsuranceData ? (apiData.status || 'draft') : 'draft';
      
      console.log('📊 Insurance Status:', insuranceStatus, 'Has Data:', hasInsuranceData);
      
      // Map API data to widget data format
      setPreAuthData({
        status: insuranceStatus,
        insuranceCompany: apiData.companyName || '',
        policyNumber: apiData.policyNumber || '',
        tpaName: '',
        memberName: '',
        memberId: '',
        relationToPatient: 'Self',
        estimatedAmount: apiData.requestedAmount || 0,
        requestedAmount: apiData.requestedAmount || 0,
        approvedAmount: apiData.approvedAmount,
      } as PreAuthData);
      
      setDocuments(apiData.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type as any,
        uploaded: true,
        required: true,
      })));
    } catch (err: any) {
      console.error('Failed to load pre-auth data:', err);
      setError(err.message || 'Failed to load pre-auth data');
      console.log('⚠️ Using fallback draft data');
      // Initialize with empty draft data and default documents
      setPreAuthData({
        status: 'draft',
        insuranceCompany: '',
        policyNumber: '',
        tpaName: '',
        memberName: '',
        memberId: '',
        relationToPatient: 'Self',
        estimatedAmount: 0,
        requestedAmount: 0,
      });
      setDocuments([
        { id: 'doc1', name: 'Insurance Policy Copy', type: 'policy-copy', uploaded: false, required: true },
        { id: 'doc2', name: 'Photo ID Proof (Aadhaar/PAN)', type: 'id-proof', uploaded: false, required: true },
        { id: 'doc3', name: 'TPA Authorization Letter', type: 'tpa-letter', uploaded: false, required: true },
        { id: 'doc4', name: 'Doctor Prescription', type: 'prescription', uploaded: false, required: true },
        { id: 'doc5', name: 'Eye Examination Reports', type: 'reports', uploaded: false, required: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading insurance data...</span>
      </div>
    );
  }

  if (error && !preAuthData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadPreAuthData}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!preAuthData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Shield className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No insurance data</p>
      </div>
    );
  }

  // Mock pre-auth data - now loaded from API
  const mockPreAuthData = preAuthData;

  const statusConfig = {
    draft: { color: 'gray', label: 'Draft', icon: FileText },
    submitted: { color: 'blue', label: 'Submitted', icon: Clock },
    'under-review': { color: 'yellow', label: 'Under Review', icon: TrendingUp },
    'additional-info-required': { color: 'orange', label: 'Info Required', icon: AlertCircle },
    approved: { color: 'green', label: 'Approved', icon: Check },
    rejected: { color: 'red', label: 'Rejected', icon: AlertCircle },
  };

  const handleDocumentUpload = (docId: string) => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        console.log('📄 Document uploaded:', file.name, 'for doc:', docId);
        // Mark document as uploaded
        setDocuments(docs =>
          docs.map(doc => (doc.id === docId ? { ...doc, uploaded: true } : doc))
        );
        // Notify parent
        onAction?.({ 
          type: 'DOCUMENT_UPLOADED', 
          payload: { docId, fileName: file.name }, 
          timestamp: new Date() 
        });
      }
    };
    input.click();
  };

  const handleSubmitPreAuth = () => {
    const requiredDocsUploaded = documents.filter(d => d.required).every(d => d.uploaded);
    if (!requiredDocsUploaded) {
      return;
    }

    const updated = {
      ...preAuthData,
      status: 'submitted' as PreAuthStatus,
      submittedAt: new Date(),
    };
    setPreAuthData(updated);
    onDataChange?.({ preAuth: updated });
    onAction?.({ type: 'PREAUTH_SUBMITTED', timestamp: new Date() });
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <Shield className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient to manage insurance</p>
      </div>
    );
  }

  if (!preAuthData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <Shield className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No insurance data available</p>
      </div>
    );
  }

  const isCompact = size === 'small';
  const currentStatus = statusConfig[preAuthData.status] || statusConfig['draft'];
  const StatusIcon = currentStatus.icon;

  if (isCompact) {
    return (
      <div className="space-y-2">
        <div className={cn(
          'rounded p-2 border',
          `bg-${currentStatus.color}-50 border-${currentStatus.color}-200`
        )}>
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={cn('h-4 w-4', `text-${currentStatus.color}-600`)} />
            <p className="text-xs font-medium text-gray-900">{currentStatus.label}</p>
          </div>
          {preAuthData.approvedAmount && (
            <p className="text-lg font-bold text-green-600">₹{preAuthData.approvedAmount.toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  }

  const requiredDocsCount = documents.filter(d => d.required).length;
  const uploadedRequiredDocsCount = documents.filter(d => d.required && d.uploaded).length;
  const allRequiredUploaded = uploadedRequiredDocsCount === requiredDocsCount;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={cn(
        'border rounded-lg p-3',
        `bg-${currentStatus.color}-50 border-${currentStatus.color}-200`
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', `text-${currentStatus.color}-600`)} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Pre-Authorization Status</p>
              <p className={cn('text-lg font-bold', `text-${currentStatus.color}-600`)}>
                {currentStatus.label}
              </p>
            </div>
          </div>
          {preAuthData.status === 'approved' && preAuthData.approvedAmount && (
            <div className="text-right">
              <p className="text-xs text-gray-600">Approved Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{preAuthData.approvedAmount.toLocaleString()}</p>
            </div>
          )}
        </div>

        {preAuthData.remarks && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">{preAuthData.remarks}</p>
          </div>
        )}
      </div>

      {/* Insurance Details */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-gray-600" />
          <p className="text-sm font-semibold text-gray-900">Insurance Details</p>
        </div>
        
        {preAuthData.status.toLowerCase() === 'draft' ? (
          // FORM MODE: Show input fields when in draft status
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Insurance Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preAuthData.insuranceCompany}
                  onChange={(e) => setPreAuthData({ ...preAuthData, insuranceCompany: e.target.value })}
                  placeholder="e.g., Star Health Insurance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Policy Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preAuthData.policyNumber}
                  onChange={(e) => setPreAuthData({ ...preAuthData, policyNumber: e.target.value })}
                  placeholder="e.g., SH/2023/12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  TPA Name
                </label>
                <input
                  type="text"
                  value={preAuthData.tpaName}
                  onChange={(e) => setPreAuthData({ ...preAuthData, tpaName: e.target.value })}
                  placeholder="e.g., Medi Assist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Member ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preAuthData.memberId}
                  onChange={(e) => setPreAuthData({ ...preAuthData, memberId: e.target.value })}
                  placeholder="e.g., MEM123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Member Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preAuthData.memberName}
                  onChange={(e) => setPreAuthData({ ...preAuthData, memberName: e.target.value })}
                  placeholder="As per insurance card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Relation <span className="text-red-500">*</span>
                </label>
                <select
                  value={preAuthData.relationToPatient}
                  onChange={(e) => setPreAuthData({ ...preAuthData, relationToPatient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Self">Self</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          // DISPLAY MODE: Show read-only data when not in draft
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Insurance Company</p>
              <p className="font-medium text-gray-900">{preAuthData.insuranceCompany}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Policy Number</p>
              <p className="font-medium text-gray-900">{preAuthData.policyNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">TPA Name</p>
              <p className="font-medium text-gray-900">{preAuthData.tpaName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Member ID</p>
              <p className="font-medium text-gray-900">{preAuthData.memberId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Member Name</p>
              <p className="font-medium text-gray-900">{preAuthData.memberName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Relation</p>
              <p className="font-medium text-gray-900">{preAuthData.relationToPatient}</p>
            </div>
          </div>
        )}
      </div>

      {/* Amount Details */}
      <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
        {preAuthData.status.toLowerCase() === 'draft' ? (
          // FORM MODE: Editable amounts in draft status
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Estimated Total <span className="text-red-500">*</span>
                  {session?.packageAmount && (
                    <span className="text-green-600 text-xs font-normal">(Auto-filled from package)</span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    className={cn(
                      "w-full pl-8 pr-3 py-2 text-sm border rounded",
                      session?.packageAmount
                        ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                        : "bg-white border-gray-300"
                    )}
                    value={preAuthData.estimatedAmount}
                    onChange={(e) => setPreAuthData({ ...preAuthData, estimatedAmount: Number(e.target.value) })}
                    placeholder="0"
                    readOnly={!!session?.packageAmount}
                    title={session?.packageAmount ? "Auto-filled from selected package" : "Enter estimated amount"}
                  />
                </div>
                {session?.packageAmount && (
                  <p className="text-xs text-gray-600 mt-1">Read-only - from package selection</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Requesting Coverage <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-blue-600 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    value={preAuthData.requestedAmount}
                    onChange={(e) => setPreAuthData({ ...preAuthData, requestedAmount: Number(e.target.value) })}
                    placeholder="Amount to claim"
                    className="w-full pl-7 pr-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">Amount requesting from insurance</p>
              </div>
            </div>
          </div>
        ) : (
          // DISPLAY MODE: Read-only amounts when not in draft
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-600">Estimated Total</p>
              <p className="text-lg font-bold text-gray-900">₹{preAuthData.estimatedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Requesting Coverage</p>
              <p className="text-lg font-bold text-blue-600">₹{preAuthData.requestedAmount.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Document Checklist */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">Required Documents</p>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {uploadedRequiredDocsCount}/{requiredDocsCount} uploaded
          </span>
        </div>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg border',
                doc.uploaded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-center gap-2">
                {doc.uploaded ? (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm text-gray-900">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.uploaded ? 'Uploaded' : 'Not uploaded'}
                  </p>
                </div>
              </div>
              {!doc.uploaded && (
                <button
                  onClick={() => handleDocumentUpload(doc.id)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline (if submitted) */}
      {preAuthData.submittedAt && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900 mb-2">Timeline</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Clock className="h-3 w-3 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">Submitted</p>
                <p className="text-gray-500">{preAuthData.submittedAt.toLocaleDateString('en-IN')} at {preAuthData.submittedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            {preAuthData.respondedAt && (
              <div className="flex items-start gap-2">
                <Check className="h-3 w-3 text-green-600 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Response Received</p>
                  <p className="text-gray-500">{preAuthData.respondedAt.toLocaleDateString('en-IN')} at {preAuthData.respondedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {preAuthData.status.toLowerCase() === 'draft' && (
        <div className="space-y-2">
          <button
            onClick={handleSubmitPreAuth}
            disabled={
              !allRequiredUploaded || 
              !preAuthData.insuranceCompany || 
              !preAuthData.policyNumber || 
              !preAuthData.memberId || 
              !preAuthData.memberName ||
              !preAuthData.estimatedAmount ||
              !preAuthData.requestedAmount
            }
            className={cn(
              'w-full py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2',
              allRequiredUploaded && 
              preAuthData.insuranceCompany && 
              preAuthData.policyNumber && 
              preAuthData.memberId && 
              preAuthData.memberName &&
              preAuthData.estimatedAmount &&
              preAuthData.requestedAmount
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            <Check className="h-4 w-4" />
            Submit Pre-Authorization Request
          </button>
          {(!preAuthData.insuranceCompany || !preAuthData.policyNumber || !preAuthData.memberId || !preAuthData.memberName || !preAuthData.estimatedAmount || !preAuthData.requestedAmount) && (
            <p className="text-xs text-center text-red-600">Please fill all required fields (*) including amounts</p>
          )}
          {!allRequiredUploaded && (
            <p className="text-xs text-center text-orange-600">Upload all required documents to submit</p>
          )}
        </div>
      )}

      {preAuthData.status === 'submitted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center text-sm text-blue-700">
          <Clock className="h-5 w-5 mx-auto mb-1" />
          Request submitted. Typically responds within 24-48 hours.
        </div>
      )}

      {preAuthData.status === 'additional-info-required' && (
        <button
          className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          Upload Additional Information
        </button>
      )}

      {preAuthData.status === 'approved' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAction?.({ type: 'DOWNLOAD_APPROVAL_LETTER', timestamp: new Date() })}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Download Approval Letter
          </button>
          <button
            onClick={() => onAction?.({ type: 'PROCEED_TO_BILLING', timestamp: new Date() })}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Proceed to Billing
          </button>
        </div>
      )}
    </div>
  );
}
