'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Pill, AlertTriangle, Calendar, User, CheckCircle, XCircle, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { prescriptionApi, Prescription as ApiPrescription } from '@/lib/api/prescriptions.api';
import { useAuthStore } from '@/lib/auth-store';
import { PrescriptionFormModal } from './PrescriptionFormModal';
import { PrescriptionDetailModal } from './PrescriptionDetailModal';
import { DispensePrescriptionModal } from './DispensePrescriptionModal';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  prescriptionDate: Date;
  diagnosis: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  medications: PrescriptionMedication[];
  isPrinted: boolean;
  dispensedDate?: Date;
  pharmacyName?: string;
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
}

interface Patient {
  id: string;
  name: string;
  mrn: string;
  dateOfBirth: Date;
  allergies?: string;
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    mrn: 'MRN-001',
    dateOfBirth: new Date(1980, 5, 15),
    allergies: 'Penicillin, Sulfa drugs',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    mrn: 'MRN-002',
    dateOfBirth: new Date(1992, 8, 22),
    allergies: 'None',
  },
];

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Michael Chen',
    prescriptionDate: new Date(2026, 0, 20),
    diagnosis: 'Acute Bacterial Conjunctivitis',
    status: 'active',
    isPrinted: true,
    medications: [
      {
        id: 'MED-1',
        medicationName: 'Moxifloxacin',
        genericName: 'Moxifloxacin HCl',
        dosage: '0.5%',
        frequency: '3 times daily',
        durationDays: 7,
        quantity: 1,
        isCritical: false,
      },
      {
        id: 'MED-2',
        medicationName: 'Prednisolone Acetate',
        dosage: '1%',
        frequency: '4 times daily',
        durationDays: 5,
        quantity: 1,
        isCritical: true,
      },
    ],
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sarah Johnson',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Sarah Lee',
    prescriptionDate: new Date(2026, 0, 25),
    diagnosis: 'Open-Angle Glaucoma',
    status: 'completed',
    isPrinted: true,
    dispensedDate: new Date(2026, 0, 25),
    pharmacyName: 'Central Pharmacy',
    medications: [
      {
        id: 'MED-3',
        medicationName: 'Latanoprost',
        dosage: '0.005%',
        frequency: 'Once daily at bedtime',
        durationDays: 30,
        quantity: 1,
        isCritical: true,
      },
      {
        id: 'MED-4',
        medicationName: 'Timolol',
        dosage: '0.5%',
        frequency: 'Twice daily',
        durationDays: 30,
        quantity: 1,
        isCritical: true,
      },
    ],
  },
];

export function PrescriptionsManagement() {
  const { user } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Load prescriptions from API
  useEffect(() => {
    loadPrescriptions();
  }, [user?.id]);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      
      // Get current user ID from auth store
      const doctorId = user?.id;
      if (!doctorId) {
        console.warn('No user ID available, using mock data');
        setPrescriptions(mockPrescriptions);
        return;
      }
      
      const response = await prescriptionApi.getByDoctor(doctorId);
      
      // Convert API response to component format
      const prescriptionsData = response.data.map((p: ApiPrescription) => ({
        ...p,
        prescriptionDate: new Date(p.prescriptionDate),
        dispensedDate: p.dispensedDate ? new Date(p.dispensedDate) : undefined,
        printedAt: p.printedAt ? new Date(p.printedAt) : undefined,
      }));
      
      setPrescriptions(prescriptionsData);
    } catch (error: any) {
      console.error('Failed to load prescriptions:', error);
      toast.error('Failed to load prescriptions. Using sample data.');
      // Fallback to mock data for development
      setPrescriptions(mockPrescriptions);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter prescriptions
  useEffect(() => {
    let filtered = prescriptions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.patientName.toLowerCase().includes(query) ||
          p.doctorName.toLowerCase().includes(query) ||
          p.diagnosis.toLowerCase().includes(query) ||
          p.medications.some((m) => m.medicationName.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPrescriptions(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, prescriptions]);

  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handlePrint = async (prescription: Prescription) => {
    try {
      setIsSubmitting(true);
      await prescriptionApi.print(prescription.id);
      
      // Update local state
      setPrescriptions(prev => prev.map(p =>
        p.id === prescription.id
          ? { ...p, isPrinted: true, printedAt: new Date() }
          : p
      ));
      
      toast.success('Prescription marked as printed');
    } catch (error) {
      console.error('Failed to print prescription:', error);
      toast.error('Failed to mark prescription as printed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispense = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDispenseModal(true);
  };

  const handleDispenseSubmit = async (dispenseData: any) => {
    if (!selectedPrescription) return;
    
    try {
      setIsSubmitting(true);
      const response = await prescriptionApi.dispense(selectedPrescription.id, dispenseData);
      
      // Update local state with server response
      setPrescriptions(prev => prev.map(p =>
        p.id === selectedPrescription.id
          ? {
              ...p,
              status: 'completed' as const,
              dispensedDate: new Date(response.data.dispensedDate!),
              pharmacyName: response.data.pharmacyName,
              dispensedByUserName: response.data.dispensedByUserName,
            }
          : p
      ));
      
      toast.success('Prescription dispensed successfully');
      setShowDispenseModal(false);
      setSelectedPrescription(null);
    } catch (error) {
      console.error('Failed to dispense prescription:', error);
      toast.error('Failed to dispense prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (prescription: Prescription) => {
    if (!confirm('Are you sure you want to cancel this prescription?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await prescriptionApi.cancel(prescription.id);
      
      setPrescriptions(prev => prev.map(p =>
        p.id === prescription.id ? { ...p, status: 'cancelled' as const } : p
      ));
      
      toast.success('Prescription cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel prescription:', error);
      toast.error('Failed to cancel prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrescriptionUpdate = (updated: Prescription) => {
    setPrescriptions(prev => prev.map(p =>
      p.id === updated.id ? updated : p
    ));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 mt-1">Manage patient prescriptions and medications</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold">
                {prescriptions.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">
                {prescriptions.filter((p) => p.status === 'completed').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold">
                {prescriptions.reduce((sum, p) => sum + p.medications.length, 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold">
                {prescriptions.filter((p) => p.status === 'cancelled').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient, doctor, diagnosis, or medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedPrescriptions.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-12 w-12 text-gray-300" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">No prescriptions found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first prescription to get started'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'all' && (
                        <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Prescription
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {prescription.prescriptionDate.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{prescription.patientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{prescription.doctorName}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={prescription.diagnosis}>
                        {prescription.diagnosis}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {prescription.medications.slice(0, 2).map((med) => (
                          <div key={med.id} className="flex items-center gap-1 text-sm">
                            <Pill className="h-3 w-3 text-gray-400" />
                            {med.medicationName}
                            {med.isCritical && (
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        ))}
                        {prescription.medications.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{prescription.medications.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                      {prescription.isPrinted && (
                        <Printer className="h-4 w-4 text-gray-400 inline-block ml-2" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(prescription)}
                        >
                          View
                        </Button>
                        {prescription.status === 'active' && !prescription.dispensedDate && (
                          <>
                            {!prescription.isPrinted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePrint(prescription)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDispense(prescription)}
                            >
                              Dispense
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredPrescriptions.length)} of{' '}
                {filteredPrescriptions.length} prescriptions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <PrescriptionFormModal
          patients={mockPatients}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newPrescription) => {
            setPrescriptions([newPrescription, ...prescriptions]);
            setShowCreateModal(false);
          }}
        />
      )}

      {showDetailModal && selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPrescription(null);
          }}
          onStatusChange={handlePrescriptionUpdate}
        />
      )}

      {showDispenseModal && selectedPrescription && (
        <DispensePrescriptionModal
          prescription={selectedPrescription}
          onClose={() => {
            setShowDispenseModal(false);
            setSelectedPrescription(null);
          }}
          onDispense={handleDispenseSubmit}
        />
      )}
    </div>
  );
}
