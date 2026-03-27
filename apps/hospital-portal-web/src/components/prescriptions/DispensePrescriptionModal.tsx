'use client';

import { useState } from 'react';
import { Calendar, Building, User, CheckCircle, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrescriptionMedication {
  id: string;
  medicationName: string;
  dosage: string;
  quantity: number;
}

interface Prescription {
  id: string;
  patientName: string;
  medications: PrescriptionMedication[];
}

interface Props {
  prescription: Prescription;
  onClose: () => void;
  onDispense: (data: DispenseData) => void;
}

interface DispenseData {
  pharmacyId: string;
  pharmacyName: string;
  pharmacyContact: string;
  dispensedByUserId: string;
  dispensedDate: Date;
  dispensedMedications: string[];
  counselingNotes: string;
}

// Mock pharmacies
const mockPharmacies = [
  { id: '1', name: 'Vision Care Pharmacy', contact: '+1-555-0101' },
  { id: '2', name: 'Eyecare Plus Pharmacy', contact: '+1-555-0102' },
  { id: '3', name: 'Optical Health Pharmacy', contact: '+1-555-0103' },
  { id: '4', name: 'Patient Preferred Pharmacy', contact: '' }, // Custom pharmacy option
];

export function DispensePrescriptionModal({ prescription, onClose, onDispense }: Props) {
  const [pharmacyId, setPharmacyId] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyContact, setPharmacyContact] = useState('');
  const [dispensedDate, setDispensedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispensedMedications, setDispensedMedications] = useState<string[]>(
    prescription.medications.map((m) => m.id)
  );
  const [counselingNotes, setCounselingNotes] = useState('');
  const [isCustomPharmacy, setIsCustomPharmacy] = useState(false);

  const handlePharmacyChange = (value: string) => {
    setPharmacyId(value);
    if (value === 'custom') {
      setIsCustomPharmacy(true);
      setPharmacyName('');
      setPharmacyContact('');
    } else {
      setIsCustomPharmacy(false);
      const pharmacy = mockPharmacies.find((p) => p.id === value);
      if (pharmacy) {
        setPharmacyName(pharmacy.name);
        setPharmacyContact(pharmacy.contact);
      }
    }
  };

  const toggleMedication = (medicationId: string) => {
    setDispensedMedications((prev) =>
      prev.includes(medicationId)
        ? prev.filter((id) => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pharmacyName.trim()) {
      alert('Please select or enter a pharmacy name');
      return;
    }

    if (dispensedMedications.length === 0) {
      alert('Please select at least one medication to dispense');
      return;
    }

    onDispense({
      pharmacyId: isCustomPharmacy ? '' : pharmacyId,
      pharmacyName: pharmacyName.trim(),
      pharmacyContact: pharmacyContact.trim(),
      dispensedByUserId: 'current-user-id', // TODO: Get from auth context
      dispensedDate: new Date(dispensedDate),
      dispensedMedications,
      counselingNotes: counselingNotes.trim(),
    });

    onClose();
  };

  const allMedicationsSelected = dispensedMedications.length === prescription.medications.length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispense Prescription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info Alert */}
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              Dispensing prescription for: <strong>{prescription.patientName}</strong>
            </AlertDescription>
          </Alert>

          {/* Pharmacy Selection */}
          <div>
            <Label htmlFor="pharmacy">Pharmacy *</Label>
            <Select value={pharmacyId} onValueChange={handlePharmacyChange}>
              <SelectTrigger id="pharmacy" className="mt-2">
                <SelectValue placeholder="Select pharmacy..." />
              </SelectTrigger>
              <SelectContent>
                {mockPharmacies.slice(0, -1).map((pharmacy) => (
                  <SelectItem key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other / Custom Pharmacy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Pharmacy Fields */}
          {isCustomPharmacy && (
            <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                <div className="relative mt-2">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pharmacyName"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="Enter pharmacy name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pharmacyContact">Pharmacy Contact</Label>
                <Input
                  id="pharmacyContact"
                  value={pharmacyContact}
                  onChange={(e) => setPharmacyContact(e.target.value)}
                  placeholder="Phone number or email"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Dispense Date */}
          <div>
            <Label htmlFor="dispensedDate">Dispensed Date *</Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="dispensedDate"
                type="date"
                value={dispensedDate}
                onChange={(e) => setDispensedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="pl-10"
              />
            </div>
          </div>

          {/* Medications Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Medications Dispensed *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDispensedMedications(
                    allMedicationsSelected ? [] : prescription.medications.map((m) => m.id)
                  )
                }
              >
                {allMedicationsSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              {prescription.medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition-colors"
                >
                  <Checkbox
                    id={`med-${med.id}`}
                    checked={dispensedMedications.includes(med.id)}
                    onCheckedChange={() => toggleMedication(med.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`med-${med.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{med.medicationName}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Dosage: {med.dosage} • Quantity: {med.quantity}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {dispensedMedications.length} of {prescription.medications.length} medications
              selected
            </p>
          </div>

          {/* Counseling Notes */}
          <div>
            <Label htmlFor="counselingNotes">Patient Counseling Notes</Label>
            <Textarea
              id="counselingNotes"
              value={counselingNotes}
              onChange={(e) => setCounselingNotes(e.target.value)}
              placeholder="Document any counseling provided to the patient (e.g., instructions given, questions answered, warnings)"
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Record any important information discussed with the patient
            </p>
          </div>

          {/* Confirmation Alert */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              By dispensing this prescription, you confirm that:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>All selected medications have been verified</li>
                <li>Patient has been counseled appropriately</li>
                <li>Patient identity has been confirmed</li>
                <li>Prescription is valid and not expired</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!pharmacyName.trim() || dispensedMedications.length === 0}
            >
              Confirm Dispense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
