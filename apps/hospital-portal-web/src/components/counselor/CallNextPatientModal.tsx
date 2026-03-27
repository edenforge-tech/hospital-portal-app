'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Play, 
  X, 
  Clock, 
  User, 
  AlertTriangle,
  Stethoscope,
  Eye,
  Calendar,
  UserPlus,
  Activity,
  FileText,
  DollarSign,
  Shield,
  TrendingUp
} from 'lucide-react';
import { CounselingQueueItem } from '@/lib/api/counseling-queue.api';

interface CallNextPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextPatient: CounselingQueueItem | null;
  onCallAndStart: (queueItem: CounselingQueueItem) => Promise<void>;
  onCallOnly: (queueItem: CounselingQueueItem) => Promise<void>;
  isLoading?: boolean;
}

export function CallNextPatientModal({
  isOpen,
  onClose,
  nextPatient,
  onCallAndStart,
  onCallOnly,
  isLoading = false
}: CallNextPatientModalProps) {
  const [action, setAction] = useState<'call' | 'call-and-start' | null>(null);

  if (!nextPatient) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Patients in Queue</DialogTitle>
            <DialogDescription>
              There are currently no patients waiting in the counselor queue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleCallAndStart = async () => {
    setAction('call-and-start');
    try {
      await onCallAndStart(nextPatient);
      onClose();
    } finally {
      setAction(null);
    }
  };

  const handleCallOnly = async () => {
    setAction('call');
    try {
      await onCallOnly(nextPatient);
      onClose();
    } finally {
      setAction(null);
    }
  };

  const getReferralIcon = (source: string) => {
    switch (source) {
      case 'DoctorReferral':
        return <Stethoscope className="h-4 w-4" />;
      case 'OptometryReferral':
        return <Eye className="h-4 w-4" />;
      case 'Scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'WalkIn':
        return <UserPlus className="h-4 w-4" />;
      case 'Emergency':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getReferralLabel = (source: string) => {
    switch (source) {
      case 'DoctorReferral':
        return 'Doctor Referral';
      case 'OptometryReferral':
        return 'Optometry Referral';
      case 'Scheduled':
        return 'Scheduled';
      case 'WalkIn':
        return 'Walk-in';
      case 'Emergency':
        return 'Emergency';
      default:
        return source;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWaitTime = (addedAt: string) => {
    const added = new Date(addedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - added.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Phone className="h-6 w-6 text-blue-600" />
            Call Next Patient
          </DialogTitle>
          <DialogDescription>
            Review patient details and choose an action
          </DialogDescription>
        </DialogHeader>

        {/* Patient Details */}
        <div className="space-y-4 py-4">
          {/* Token & Name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {nextPatient.tokenNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 truncate">
                {nextPatient.patientName}
              </h3>
              <p className="text-sm text-gray-500">MRN: {nextPatient.mrn}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={`${getUrgencyColor(nextPatient.urgencyLevel)} text-xs font-semibold border`}>
                {nextPatient.urgencyLevel}
              </Badge>
              {nextPatient.priorityScore > 0 && (
                <div className={`text-xs font-semibold ${getPriorityColor(nextPatient.priorityScore)} flex items-center gap-1`}>
                  <TrendingUp className="h-3 w-3" />
                  Priority: {nextPatient.priorityScore}
                </div>
              )}
            </div>
          </div>

          {/* Key Info Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
            {/* Wait Time */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Wait Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {getWaitTime(nextPatient.addedToQueueAt)}
                </p>
              </div>
            </div>

            {/* Referral Source */}
            <div className="flex items-center gap-2">
              {getReferralIcon(nextPatient.referralSource)}
              <div>
                <p className="text-xs text-gray-500">Referral Source</p>
                <p className="text-sm font-medium text-gray-900">
                  {getReferralLabel(nextPatient.referralSource)}
                </p>
              </div>
            </div>

            {/* Session Type */}
            {nextPatient.sessionType && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Session Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {nextPatient.sessionType}
                  </p>
                </div>
              </div>
            )}

            {/* Patient Type */}
            {nextPatient.patientType && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Patient Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {nextPatient.patientType}
                  </p>
                </div>
              </div>
            )}

            {/* Referring User */}
            {nextPatient.referredByUserName && (
              <div className="flex items-center gap-2 md:col-span-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Referred By</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {nextPatient.referredByUserName}
                  </p>
                </div>
              </div>
            )}

            {/* Department */}
            {nextPatient.referralDepartment && (
              <div className="flex items-center gap-2 md:col-span-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {nextPatient.referralDepartment}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Special Requirements */}
          {(nextPatient.requiresFinancialCounseling || nextPatient.requiresSurgicalConsent) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-medium text-yellow-800 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Special Requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {nextPatient.requiresFinancialCounseling && (
                  <Badge variant="outline" className="bg-white text-yellow-700 border-yellow-300">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Financial Counseling
                  </Badge>
                )}
                {nextPatient.requiresSurgicalConsent && (
                  <Badge variant="outline" className="bg-white text-yellow-700 border-yellow-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Surgical Consent
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Referral Notes */}
          {nextPatient.referralNotes && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-800 mb-1">Referral Notes:</p>
              <p className="text-sm text-blue-900">{nextPatient.referralNotes}</p>
            </div>
          )}

          {/* Chief Complaint */}
          {nextPatient.chiefComplaint && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-medium text-purple-800 mb-1">Chief Complaint:</p>
              <p className="text-sm text-purple-900">{nextPatient.chiefComplaint}</p>
            </div>
          )}

          {/* Previous Sessions */}
          {nextPatient.previousSessionCount && nextPatient.previousSessionCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>
                Previous sessions: <strong>{nextPatient.previousSessionCount}</strong>
              </span>
              {nextPatient.lastSessionDate && (
                <span className="text-gray-500">
                  (Last: {new Date(nextPatient.lastSessionDate).toLocaleDateString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Responsive */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleCallOnly}
            disabled={isLoading}
            className="w-full sm:w-auto sm:flex-1 order-2"
          >
            <Phone className="h-4 w-4 mr-2" />
            {action === 'call' && isLoading ? 'Calling...' : 'Call Only'}
          </Button>
          <Button
            onClick={handleCallAndStart}
            disabled={isLoading}
            className="w-full sm:w-auto sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 order-1 sm:order-3"
          >
            <Play className="h-4 w-4 mr-2" />
            {action === 'call-and-start' && isLoading ? 'Starting...' : 'Call & Start Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
