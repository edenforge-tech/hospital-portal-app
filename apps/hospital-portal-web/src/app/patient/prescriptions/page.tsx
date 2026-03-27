'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Pill,
  Clock,
  User,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Printer,
  Share2,
  Phone,
} from 'lucide-react';

interface Prescription {
  id: string;
  prescriptionNumber: string;
  doctorName: string;
  specialty: string;
  visitDate: string;
  validUntil: string;
  diagnosis: string;
  medications: Medication[];
  instructions?: string;
  followUpDate?: string;
  status: 'active' | 'expired' | 'completed';
}

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
  refillsRemaining: number;
  quantity: number;
}

// Mock data
const mockPrescriptions: Prescription[] = [
  {
    id: 'RX-001',
    prescriptionNumber: 'RX-2026-001234',
    doctorName: 'Dr. Arun Mehta',
    specialty: 'Ophthalmology',
    visitDate: '2026-01-15',
    validUntil: '2026-04-15',
    diagnosis: 'Post-cataract surgery care',
    medications: [
      {
        id: '1',
        name: 'Prednisolone Eye Drops',
        genericName: 'Prednisolone Acetate',
        dosage: '1%',
        frequency: '4 times daily',
        duration: '4 weeks',
        route: 'Topical (Eye)',
        instructions: 'Shake well before use. Apply 1 drop in the operated eye.',
        refillsRemaining: 2,
        quantity: 5,
      },
      {
        id: '2',
        name: 'Moxifloxacin Eye Drops',
        genericName: 'Moxifloxacin HCl',
        dosage: '0.5%',
        frequency: '3 times daily',
        duration: '2 weeks',
        route: 'Topical (Eye)',
        instructions: 'Apply 1 drop. Wait 5 minutes between different eye drops.',
        refillsRemaining: 1,
        quantity: 5,
      },
      {
        id: '3',
        name: 'Carboxymethylcellulose Eye Drops',
        genericName: 'CMC',
        dosage: '0.5%',
        frequency: 'As needed',
        duration: '4 weeks',
        route: 'Topical (Eye)',
        instructions: 'Use for dryness relief. Can be used frequently.',
        refillsRemaining: 3,
        quantity: 10,
      },
    ],
    instructions: 'Do not rub eyes. Wear protective glasses outdoors. Avoid swimming for 2 weeks.',
    followUpDate: '2026-01-30',
    status: 'active',
  },
  {
    id: 'RX-002',
    prescriptionNumber: 'RX-2026-001150',
    doctorName: 'Dr. Priya Nair',
    specialty: 'General Medicine',
    visitDate: '2026-01-10',
    validUntil: '2026-02-10',
    diagnosis: 'Upper respiratory tract infection',
    medications: [
      {
        id: '4',
        name: 'Azithromycin',
        genericName: 'Azithromycin',
        dosage: '500mg',
        frequency: 'Once daily',
        duration: '3 days',
        route: 'Oral',
        instructions: 'Take 1 hour before or 2 hours after meals.',
        refillsRemaining: 0,
        quantity: 3,
      },
      {
        id: '5',
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        dosage: '650mg',
        frequency: 'As needed for fever',
        duration: '5 days',
        route: 'Oral',
        instructions: 'Take if temperature exceeds 100°F. Max 4 tablets per day.',
        refillsRemaining: 0,
        quantity: 10,
      },
    ],
    instructions: 'Rest, drink plenty of fluids. Return if symptoms worsen.',
    status: 'completed',
  },
  {
    id: 'RX-003',
    prescriptionNumber: 'RX-2025-009876',
    doctorName: 'Dr. Arun Mehta',
    specialty: 'Ophthalmology',
    visitDate: '2025-12-01',
    validUntil: '2026-01-01',
    diagnosis: 'Dry eye syndrome',
    medications: [
      {
        id: '6',
        name: 'Cyclosporine Eye Drops',
        genericName: 'Cyclosporine',
        dosage: '0.05%',
        frequency: 'Twice daily',
        duration: '3 months',
        route: 'Topical (Eye)',
        instructions: 'Apply in the morning and evening.',
        refillsRemaining: 0,
        quantity: 30,
      },
    ],
    status: 'expired',
  },
];

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadge = (status: Prescription['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = 
      rx.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.medications.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
  const activeMedications = activePrescriptions.flatMap(rx => rx.medications);
  const medicationsNeedingRefill = activeMedications.filter(m => m.refillsRemaining > 0 && m.refillsRemaining <= 1);

  const handleRefillRequest = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowRefillModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-500">View and manage your prescriptions and medications</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activePrescriptions.length}</p>
              <p className="text-xs text-gray-500">Active Prescriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeMedications.length}</p>
              <p className="text-xs text-gray-500">Current Medications</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{medicationsNeedingRefill.length}</p>
              <p className="text-xs text-gray-500">Need Refill</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{prescriptions.filter(rx => rx.status === 'expired').length}</p>
              <p className="text-xs text-gray-500">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refill Alert */}
      {medicationsNeedingRefill.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">Refill Reminder</p>
              <p className="text-sm text-orange-700 mt-1">
                {medicationsNeedingRefill.length} medication(s) have only 1 refill remaining. Request a refill before it runs out.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {medicationsNeedingRefill.map(med => (
                  <span key={med.id} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    {med.name}
                  </span>
                ))}
              </div>
            </div>
            <button className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
              Request Refills
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor, diagnosis, or medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Prescription Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{rx.doctorName}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(rx.status)}`}>
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{rx.specialty}</p>
                      <p className="text-sm text-gray-400 mt-1">Rx: {rx.prescriptionNumber}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(rx.visitDate)}
                        </span>
                        <span className={`flex items-center gap-1 text-sm ${
                          rx.status === 'expired' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <Clock className="h-4 w-4" />
                          Valid until {formatDate(rx.validUntil)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Download className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Printer className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Diagnosis:</p>
                  <p className="text-sm text-blue-700">{rx.diagnosis}</p>
                </div>
              </div>

              {/* Medications */}
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Medications ({rx.medications.length})</p>
                <div className="space-y-3">
                  {rx.medications.map((med) => (
                    <div key={med.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Pill className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{med.name}</p>
                          {med.genericName && (
                            <p className="text-xs text-gray-400">({med.genericName})</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{med.dosage}</span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{med.frequency}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{med.duration}</span>
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">{med.route}</span>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-gray-500 mt-2 italic">{med.instructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {rx.status === 'active' && (
                          <>
                            <p className={`text-sm font-medium ${
                              med.refillsRemaining === 0 ? 'text-red-600' :
                              med.refillsRemaining === 1 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {med.refillsRemaining} refills
                            </p>
                            {med.refillsRemaining > 0 && (
                              <button 
                                onClick={() => handleRefillRequest(med)}
                                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                              >
                                Request Refill
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions & Follow-up */}
              {(rx.instructions || rx.followUpDate) && (
                <div className="px-4 pb-4">
                  {rx.instructions && (
                    <div className="p-3 bg-yellow-50 rounded-lg mb-2">
                      <p className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Special Instructions
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">{rx.instructions}</p>
                    </div>
                  )}
                  {rx.followUpDate && rx.status === 'active' && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Follow-up scheduled for <span className="font-medium">{formatDate(rx.followUpDate)}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Refill Modal */}
      {showRefillModal && selectedMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Refill</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-900">{selectedMedication.name}</p>
              <p className="text-sm text-gray-500">{selectedMedication.dosage} - {selectedMedication.frequency}</p>
              <p className="text-sm text-green-600 mt-2">
                {selectedMedication.refillsRemaining} refill(s) remaining
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pharmacy</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Hospital Pharmacy - Main Building</option>
                  <option>MedPlus - Banjara Hills</option>
                  <option>Apollo Pharmacy - Jubilee Hills</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any special requests..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefillModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle refill request
                  setShowRefillModal(false);
                  alert('Refill request submitted successfully!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Pharmacy */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Pharmacy</h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Need help with your medications?</p>
            <p className="text-sm text-gray-500">Our pharmacy team is here to assist you.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:+911234567891"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Call Pharmacy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
