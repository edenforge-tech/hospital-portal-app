'use client';

import { X, Calendar, User, Pill, AlertTriangle, CheckCircle, Printer, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  prescriptionDate: Date;
  diagnosis: string;
  instructions?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  medications: PrescriptionMedication[];
  isPrinted: boolean;
  printedAt?: Date;
  dispensedDate?: Date;
  dispensedByUserName?: string;
  pharmacyName?: string;
  pharmacyContact?: string;
}

interface PrescriptionMedication {
  id: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  isCritical: boolean;
  instructions?: string;
}

interface Props {
  prescription: Prescription;
  onClose: () => void;
  onStatusChange: (updated: Prescription) => void;
}

export function PrescriptionDetailModal({ prescription, onClose, onStatusChange }: Props) {
  const handlePrint = () => {
    // TODO: Implement print functionality
    console.log('Printing prescription:', prescription.id);
    onStatusChange({
      ...prescription,
      isPrinted: true,
      printedAt: new Date(),
    });
  };

  const handleDispense = () => {
    // TODO: Open dispense modal
    console.log('Dispensing prescription:', prescription.id);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this prescription?')) {
      onStatusChange({
        ...prescription,
        status: 'cancelled',
      });
      onClose();
    }
  };

  const getStatusIcon = () => {
    switch (prescription.status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Prescription Details</DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge variant="outline" className={getStatusColor(prescription.status)}>
                {prescription.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">PATIENT</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{prescription.patientName}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">PRESCRIBED BY</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{prescription.doctorName}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Prescription Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">DATE</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{prescription.prescriptionDate.toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">PRESCRIPTION ID</h3>
              <span className="font-mono text-sm">{prescription.id}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">DIAGNOSIS</h3>
            <p className="text-gray-900">{prescription.diagnosis}</p>
          </div>

          {prescription.instructions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">GENERAL INSTRUCTIONS</h3>
              <p className="text-gray-700">{prescription.instructions}</p>
            </div>
          )}

          <Separator />

          {/* Medications */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              MEDICATIONS ({prescription.medications.length})
            </h3>
            <div className="space-y-3">
              {prescription.medications.map((med, index) => (
                <div
                  key={med.id}
                  className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded-r-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-lg">
                          {index + 1}. {med.medicationName}
                        </span>
                        {med.isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      {med.genericName && (
                        <p className="text-sm text-gray-600 mb-2">
                          Generic: {med.genericName}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Dosage:</span>{' '}
                          <span className="font-medium">{med.dosage}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>{' '}
                          <span className="font-medium">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>{' '}
                          <span className="font-medium">{med.durationDays} days</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>{' '}
                          <span className="font-medium">{med.quantity}</span>
                        </div>
                      </div>
                      {med.instructions && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Instructions:</span>{' '}
                          <span className="text-gray-700 italic">{med.instructions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispensing Info */}
          {prescription.dispensedDate && (
            <>
              <Separator />
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>
                      <strong>Dispensed:</strong> {prescription.dispensedDate.toLocaleString()}
                    </div>
                    {prescription.pharmacyName && (
                      <div>
                        <strong>Pharmacy:</strong> {prescription.pharmacyName}
                      </div>
                    )}
                    {prescription.dispensedByUserName && (
                      <div>
                        <strong>Dispensed By:</strong> {prescription.dispensedByUserName}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Print Status */}
          {prescription.isPrinted && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Printer className="h-4 w-4" />
              <span>
                Printed{' '}
                {prescription.printedAt && `on ${prescription.printedAt.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              {prescription.status === 'active' && !prescription.dispensedDate && (
                <>
                  {!prescription.isPrinted && (
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  )}
                  <Button onClick={handleDispense}>Dispense</Button>
                  <Button variant="destructive" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
              {prescription.isPrinted && (
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Reprint
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
