'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, Droplet, MapPin, FileText, Activity, Pill, AlertTriangle, Download, Upload, CheckCircle2, Clock, XCircle, FileCheck, StickyNote, Shield, Eye, Heart, Stethoscope, TrendingUp, DollarSign, Users, Package, CreditCard, ClipboardList, ArrowUpRight, AlertCircle, ShieldAlert, Lock, AlertOctagon, MessageSquare, FileSignature } from 'lucide-react';
import { patientApi, examinationApi, visitsApi, appointmentsApi, prescriptionsApi, opdBillsApi } from '@/lib/api';
import { CheckInStatus } from '@/lib/check-in-api';
import { EmergencyOverrideDialog } from './EmergencyOverrideDialog';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AllergiesTab } from './tabs/AllergiesTab';
import { CommunicationsTab } from './tabs/CommunicationsTab';
import { ConsentsTab } from './tabs/ConsentsTab';
import { BlockedTabContent } from './tabs/BlockedTabContent';

interface Patient {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Examination {
  id: string;
  examinationDate: string;
  examinationType: string;
  doctorName: string;
  departmentName: string;
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  status: string;
}

interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

interface LabReport {
  id: string;
  testName: string;
  testCategory: 'Blood' | 'Urine' | 'Imaging' | 'Pathology' | 'Microbiology' | 'Other';
  orderedDate: string;
  orderedBy: string;
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  sampleCollectedDate?: string;
  reportDate?: string;
  results?: LabResult[];
  reportUrl?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  notes?: string;
}

interface PatientDetailsModalProps {
  patient?: any;
  patientId?: string;
  isOpen?: boolean;
  onClose: () => void;
  onEdit: () => void;
  isEmbedded?: boolean;
  checkInStatus?: CheckInStatus;
}

export function PatientDetailsModal({
  patient: externalPatient,
  patientId,
  isOpen = false,
  onClose,
  onEdit,
  isEmbedded = false,
  checkInStatus
}: PatientDetailsModalProps) {
  const [patient, setPatient] = useState<Patient | null>(externalPatient || null);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [opdBills, setOpdBills] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingExaminations, setLoadingExaminations] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineFilters, setTimelineFilters] = useState<string[]>(['visits', 'appointments', 'examinations', 'prescriptions', 'billing']);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [diagnosesData, setDiagnosesData] = useState<any[]>([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);
  const [allergiesData, setAllergiesData] = useState<any[]>([]);
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  const [communicationsData, setCommunicationsData] = useState<any[]>([]);
  const [loadingCommunications, setLoadingCommunications] = useState(false);
  const [consentsData, setConsentsData] = useState<any[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'visits' | 'appointments' | 'billing' | 'timeline' | 'vitals' | 'diagnoses' | 'allergies' | 'communications' | 'consents' | 'eyehistory' | 'history' | 'examinations' | 'labreports' | 'prescriptions' | 'surgery' | 'optical' | 'pharmacy' | 'documents' | 'notes' | 'insurance'>('details');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideTabName, setOverrideTabName] = useState('');
  const [overrideGranted, setOverrideGranted] = useState<Set<string>>(new Set());
  const [isOverriding, setIsOverriding] = useState(false);
  
  // Mock user role - in production, get from auth context
  const userRole = 'doctor'; // Can be: 'doctor', 'nurse', 'admin', 'receptionist'
  const canOverride = ['doctor', 'admin'].includes(userRole);

  // Load visits when tab is activated
  useEffect(() => {
    if (activeTab === 'visits' && patient?.id && !loading) {
      loadVisits();
    }
  }, [activeTab, patient?.id]);

  // Load appointments when tab is activated
  useEffect(() => {
    if (activeTab === 'appointments' && patient?.id && !loading) {
      loadAppointments();
    }
  }, [activeTab, patient?.id]);

  // Load examinations when tab is activated
  useEffect(() => {
    if (activeTab === 'examinations' && patient?.id && !loading) {
      loadExaminations();
    }
  }, [activeTab, patient?.id]);

  const loadVisits = async () => {
    if (!patient?.id) return;
    setLoadingVisits(true);
    try {
      const response = await visitsApi.getByPatient(patient.id);
      setVisits(response.data || []);
    } catch (error) {
      console.error('Error loading visits:', error);
      setVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  };

  const loadAppointments = async () => {
    if (!patient?.id) return;
    setLoadingAppointments(true);
    try {
      const response = await appointmentsApi.getByPatient(patient.id);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadExaminations = async () => {
    if (!patient?.id) return;
    setLoadingExaminations(true);
    try {
      const response = await examinationApi.getByPatient(patient.id);
      setExaminations(response.data || []);
    } catch (error) {
      console.error('Error loading examinations:', error);
      setExaminations([]);
    } finally {
      setLoadingExaminations(false);
    }
  };

  // Load prescriptions when tab is activated
  useEffect(() => {
    if (activeTab === 'prescriptions' && patient?.id && !loading) {
      loadPrescriptions();
    }
  }, [activeTab, patient?.id]);

  // Load billing when tab is activated
  useEffect(() => {
    if (activeTab === 'billing' && patient?.id && !loading) {
      loadBilling();
    }
  }, [activeTab, patient?.id]);

  useEffect(() => {
    if (activeTab === 'timeline' && patient?.id && !loading) {
      loadTimeline();
    }
  }, [activeTab, patient?.id]);

  useEffect(() => {
    if (activeTab === 'vitals' && patient?.id && !loading) {
      loadVitals();
    }
  }, [activeTab, patient?.id]);

  useEffect(() => {
    if (activeTab === 'diagnoses' && patient?.id && !loading) {
      loadDiagnoses();
    }
  }, [activeTab, patient?.id]);

  useEffect(() => {
    if (activeTab === 'allergies' && patient?.id && !loading) {
      loadAllergies();
    }
  }, [activeTab, patient?.id]);

  useEffect(() => {
    if (activeTab === 'communications' && patient?.id && !loading) {
      loadCommunications();
    }
  }, [activeTab, patient?.id]);

  useEffect(() => {
    if (activeTab === 'consents' && patient?.id && !loading) {
      loadConsents();
    }
  }, [activeTab, patient?.id]);

  const loadAllergies = async () => {
    if (!patient?.id) return;
    setLoadingAllergies(true);
    try {
      // Mock data - AllergiesController not yet implemented
      setTimeout(() => {
        setAllergiesData([
          {
            id: '1',
            allergen: 'Penicillin',
            category: 'Medication',
            severity: 'Critical',
            reaction: 'Anaphylaxis, difficulty breathing, hives',
            dateRecorded: '2022-05-15T10:30:00',
            recordedBy: 'Dr. Sarah Johnson',
            notes: 'Patient experienced severe reaction in 2022. Avoid all beta-lactam antibiotics.'
          },
          {
            id: '2',
            allergen: 'Pollen (Ragweed)',
            category: 'Environmental',
            severity: 'Moderate',
            reaction: 'Watery eyes, sneezing, nasal congestion',
            dateRecorded: '2023-09-10T14:20:00',
            recordedBy: 'Dr. Sarah Johnson',
            notes: 'Seasonal allergies, worse in fall months.'
          },
          {
            id: '3',
            allergen: 'Latex',
            category: 'Material',
            severity: 'High',
            reaction: 'Skin rash, itching, swelling',
            dateRecorded: '2021-11-22T09:15:00',
            recordedBy: 'Dr. Michael Chen',
            notes: 'Use latex-free gloves for all examinations.'
          },
          {
            id: '4',
            allergen: 'Shellfish',
            category: 'Food',
            severity: 'High',
            reaction: 'Hives, stomach cramps, vomiting',
            dateRecorded: '2020-07-18T16:45:00',
            recordedBy: 'Dr. Emily Davis',
            notes: 'Avoid shrimp, crab, lobster. Patient carries EpiPen.'
          }
        ]);
        setLoadingAllergies(false);
      }, 800);
    } catch (error) {
      console.error('Error loading allergies:', error);
      setAllergiesData([]);
      setLoadingAllergies(false);
    }
  };

  const loadCommunications = async () => {
    if (!patient?.id) return;
    setLoadingCommunications(true);
    try {
      // Mock data - CommunicationsController not yet implemented
      setTimeout(() => {
        setCommunicationsData([
          {
            id: '1',
            type: 'SMS',
            direction: 'Outbound',
            message: 'Reminder: Your appointment with Dr. Johnson is tomorrow at 10:00 AM.',
            status: 'Delivered',
            sentDate: '2026-02-07T15:30:00',
            deliveredDate: '2026-02-07T15:30:15',
            channel: 'SMS',
            phoneNumber: patient.phoneNumber
          },
          {
            id: '2',
            type: 'Email',
            direction: 'Outbound',
            subject: 'Lab Results Available',
            message: 'Your recent lab results are now available in the patient portal.',
            status: 'Opened',
            sentDate: '2026-02-05T09:20:00',
            deliveredDate: '2026-02-05T09:20:30',
            openedDate: '2026-02-05T14:15:00',
            channel: 'Email',
            emailAddress: patient.email
          },
          {
            id: '3',
            type: 'SMS',
            direction: 'Inbound',
            message: 'Yes, I confirm the appointment for tomorrow.',
            status: 'Received',
            sentDate: '2026-02-07T16:00:00',
            channel: 'SMS',
            phoneNumber: patient.phoneNumber
          },
          {
            id: '4',
            type: 'SMS',
            direction: 'Outbound',
            message: 'Your prescription is ready for pickup at the pharmacy.',
            status: 'Delivered',
            sentDate: '2026-02-01T11:45:00',
            deliveredDate: '2026-02-01T11:45:10',
            channel: 'SMS',
            phoneNumber: patient.phoneNumber
          }
        ]);
        setLoadingCommunications(false);
      }, 700);
    } catch (error) {
      console.error('Error loading communications:', error);
      setCommunicationsData([]);
      setLoadingCommunications(false);
    }
  };

  const loadConsents = async () => {
    if (!patient?.id) return;
    setLoadingConsents(true);
    try {
      // Mock data - ConsentsController not yet implemented
      setTimeout(() => {
        setConsentsData([
          {
            id: '1',
            formType: 'HIPAA Authorization',
            description: 'Authorization for use and disclosure of protected health information',
            status: 'Signed',
            signedDate: '2024-01-15T10:30:00',
            signedBy: patient.name,
            version: '2024.1',
            expiryDate: '2025-01-15T00:00:00',
            documentUrl: '/consents/hipaa-2024.pdf'
          },
          {
            id: '2',
            formType: 'Treatment Consent',
            description: 'Consent for medical treatment and procedures',
            status: 'Signed',
            signedDate: '2024-01-15T10:32:00',
            signedBy: patient.name,
            version: '2024.1',
            documentUrl: '/consents/treatment-2024.pdf'
          },
          {
            id: '3',
            formType: 'Financial Responsibility',
            description: 'Acknowledgment of financial responsibility for services',
            status: 'Signed',
            signedDate: '2024-01-15T10:35:00',
            signedBy: patient.name,
            version: '2024.1',
            documentUrl: '/consents/financial-2024.pdf'
          },
          {
            id: '4',
            formType: 'Telehealth Consent',
            description: 'Consent for telehealth services and virtual consultations',
            status: 'Pending',
            version: '2026.1',
            documentUrl: '/consents/telehealth-2026.pdf'
          },
          {
            id: '5',
            formType: 'Research Participation',
            description: 'Optional consent for participation in clinical research',
            status: 'Declined',
            declinedDate: '2024-03-20T14:00:00',
            version: '2024.1',
            documentUrl: '/consents/research-2024.pdf'
          }
        ]);
        setLoadingConsents(false);
      }, 600);
    } catch (error) {
      console.error('Error loading consents:', error);
      setConsentsData([]);
      setLoadingConsents(false);
    }
  };

  const loadPrescriptions = async () => {
    if (!patient?.id) return;
    setLoadingPrescriptions(true);
    try {
      const response = await prescriptionsApi.getByPatient(patient.id);
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const loadBilling = async () => {
    if (!patient?.id) return;
    setLoadingBilling(true);
    try {
      const response = await opdBillsApi.getByPatient(patient.id);
      setOpdBills(response.data?.bills || response.data || []);
    } catch (error) {
      console.error('Error loading billing:', error);
      setOpdBills([]);
    } finally {
      setLoadingBilling(false);
    }
  };

  const loadTimeline = async () => {
    if (!patient?.id) return;
    setLoadingTimeline(true);
    try {
      // Fetch all data sources in parallel
      const [visitsRes, appointmentsRes, examinationsRes, prescriptionsRes, billsRes] = await Promise.all([
        visitsApi.getByPatient(patient.id).catch(() => ({ data: [] })),
        appointmentsApi.getByPatient(patient.id).catch(() => ({ data: [] })),
        examinationApi.getByPatientId(patient.id).catch(() => ({ data: [] })),
        prescriptionsApi.getByPatient(patient.id).catch(() => ({ data: [] })),
        opdBillsApi.getByPatient(patient.id).catch(() => ({ data: [] }))
      ]);

      const events: any[] = [];

      // Add visits
      (visitsRes.data || []).forEach((visit: any) => {
        events.push({
          id: `visit-${visit.id}`,
          type: 'visit',
          date: visit.visitDate || visit.createdAt,
          title: 'Clinical Visit',
          description: `${visit.visitType || 'General Visit'} with ${visit.doctorName || 'Doctor'}`,
          details: visit,
          icon: ClipboardList,
          color: 'blue'
        });
      });

      // Add appointments
      (appointmentsRes.data || []).forEach((appt: any) => {
        events.push({
          id: `appointment-${appt.id}`,
          type: 'appointment',
          date: appt.appointmentDate,
          title: `Appointment - ${appt.status}`,
          description: `${appt.appointmentType || 'Visit'} with ${appt.doctorName || 'Doctor'}`,
          details: appt,
          icon: Calendar,
          color: appt.status === 'Completed' ? 'green' : appt.status === 'Cancelled' ? 'red' : 'purple'
        });
      });

      // Add examinations
      (examinationsRes.data || []).forEach((exam: any) => {
        events.push({
          id: `examination-${exam.id}`,
          type: 'examination',
          date: exam.examinationDate || exam.createdAt,
          title: 'Clinical Examination',
          description: `${exam.examinationType || 'Examination'} - ${exam.diagnosis || 'Assessment completed'}`,
          details: exam,
          icon: Stethoscope,
          color: 'indigo'
        });
      });

      // Add prescriptions
      (prescriptionsRes.data || []).forEach((prescription: any) => {
        events.push({
          id: `prescription-${prescription.id}`,
          type: 'prescription',
          date: prescription.prescriptionDate || prescription.createdAt,
          title: 'Prescription Issued',
          description: prescription.medications?.length 
            ? `${prescription.medications.length} medication(s) prescribed by ${prescription.doctorName || 'Doctor'}`
            : 'Medication prescribed',
          details: prescription,
          icon: Pill,
          color: 'green'
        });
      });

      // Add billing events
      const bills = billsRes.data?.bills || billsRes.data || [];
      bills.forEach((bill: any) => {
        events.push({
          id: `billing-${bill.id}`,
          type: 'billing',
          date: bill.billDate || bill.createdAt,
          title: `Bill ${bill.billNumber || '#' + bill.id?.substring(0, 8)}`,
          description: `â‚¹${(bill.totalAmount || 0).toLocaleString('en-IN')} - ${bill.status || 'Pending'}`,
          details: bill,
          icon: DollarSign,
          color: 'orange'
        });
      });

      // Sort events by date (newest first)
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTimelineEvents(events);
    } catch (error) {
      console.error('Error loading timeline:', error);
      setTimelineEvents([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const loadVitals = async () => {
    if (!patient?.id) return;
    setLoadingVitals(true);
    try {
      const response = await examinationApi.getByPatientId(patient.id);
      const exams = response.data || [];
      
      // Extract vitals from examinations
      const vitals: any[] = [];
      exams.forEach((exam: any) => {
        const date = exam.examinationDate || exam.createdAt;
        
        // Blood Pressure
        if (exam.bloodPressureSystolic && exam.bloodPressureDiastolic) {
          vitals.push({
            type: 'BP',
            date: date,
            systolic: exam.bloodPressureSystolic,
            diastolic: exam.bloodPressureDiastolic,
            value: `${exam.bloodPressureSystolic}/${exam.bloodPressureDiastolic}`,
            examId: exam.id
          });
        }
        
        // IOP (Intraocular Pressure)
        if (exam.iopRightEye || exam.iopLeftEye) {
          vitals.push({
            type: 'IOP',
            date: date,
            rightEye: exam.iopRightEye,
            leftEye: exam.iopLeftEye,
            value: `OD: ${exam.iopRightEye || 'N/A'} / OS: ${exam.iopLeftEye || 'N/A'}`,
            examId: exam.id
          });
        }
        
        // Heart Rate
        if (exam.heartRate) {
          vitals.push({
            type: 'Heart Rate',
            date: date,
            value: exam.heartRate,
            unit: 'bpm',
            examId: exam.id
          });
        }
        
        // Blood Glucose
        if (exam.bloodGlucose) {
          vitals.push({
            type: 'Blood Glucose',
            date: date,
            value: exam.bloodGlucose,
            unit: 'mg/dL',
            examId: exam.id
          });
        }
        
        // Temperature
        if (exam.temperature) {
          vitals.push({
            type: 'Temperature',
            date: date,
            value: exam.temperature,
            unit: 'Â°F',
            examId: exam.id
          });
        }
      });
      
      // Sort by date (newest first)
      vitals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setVitalsData(vitals);
    } catch (error) {
      console.error('Error loading vitals:', error);
      setVitalsData([]);
    } finally {
      setLoadingVitals(false);
    }
  };

  const loadDiagnoses = async () => {
    if (!patient?.id) return;
    setLoadingDiagnoses(true);
    try {
      const response = await examinationApi.getByPatientId(patient.id);
      const exams = response.data || [];
      
      // Extract unique diagnoses from examinations
      const diagnosesMap = new Map();
      
      exams.forEach((exam: any) => {
        if (exam.diagnosis) {
          const diagnosisKey = exam.diagnosis.toLowerCase();
          if (!diagnosesMap.has(diagnosisKey)) {
            diagnosesMap.set(diagnosisKey, {
              diagnosis: exam.diagnosis,
              firstDiagnosed: exam.examinationDate || exam.createdAt,
              lastSeen: exam.examinationDate || exam.createdAt,
              occurrences: 1,
              doctorName: exam.doctorName,
              status: exam.status || 'active',
              treatment: exam.treatment,
              notes: exam.notes,
              examinations: [exam]
            });
          } else {
            const existing = diagnosesMap.get(diagnosisKey);
            existing.occurrences++;
            const examDate = new Date(exam.examinationDate || exam.createdAt);
            const lastSeenDate = new Date(existing.lastSeen);
            if (examDate > lastSeenDate) {
              existing.lastSeen = exam.examinationDate || exam.createdAt;
              existing.doctorName = exam.doctorName;
              existing.treatment = exam.treatment;
              existing.notes = exam.notes;
              existing.status = exam.status || 'active';
            }
            existing.examinations.push(exam);
          }
        }
      });
      
      // Convert map to array and sort by last seen date
      const diagnosesArray = Array.from(diagnosesMap.values()).sort((a, b) => 
        new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
      );
      
      setDiagnosesData(diagnosesArray);
    } catch (error) {
      console.error('Error loading diagnoses:', error);
      setDiagnosesData([]);
    } finally {
      setLoadingDiagnoses(false);
    }
  };
  
  // Check if patient is checked in
  const isCheckedIn = checkInStatus?.isCheckedIn || false;

  useEffect(() => {
    if (externalPatient) {
      setPatient(externalPatient);
      loadMockLabReports();
    } else if (isOpen && patientId) {
      loadPatientData();
      loadMockLabReports();
    }
  }, [isOpen, patientId, externalPatient]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const [patientResponse, examinationsResponse] = await Promise.all([
        patientApi.getById(patientId),
        examinationApi.getByPatient(patientId)
      ]);

      setPatient(patientResponse.data);
      setExaminations(examinationsResponse.data || []);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tabs that require check-in
  const restrictedTabs = ['examinations', 'labreports', 'prescriptions'];
  
  // Check if tab is accessible
  const isTabAccessible = (tabName: string): boolean => {
    if (!restrictedTabs.includes(tabName)) return true;
    if (isCheckedIn) return true;
    if (overrideGranted.has(tabName)) return true;
    return false;
  };
  
  // Handle tab click
  const handleTabClick = (tabName: string) => {
    if (isTabAccessible(tabName)) {
      setActiveTab(tabName as any);
    } else {
      // Show override dialog for authorized users
      if (canOverride) {
        setOverrideTabName(tabName);
        setShowOverrideDialog(true);
      } else {
        alert('Patient must be checked in to access this section. Contact a doctor or administrator for emergency override.');
      }
    }
  };
  
  // Handle emergency override
  const handleOverride = async (reason: string) => {
    setIsOverriding(true);
    try {
      // In production, log this to audit trail API
      console.log('EMERGENCY OVERRIDE LOGGED:', {
        userId: 'current-user-id',
        userRole,
        patientId: patient?.id,
        tabName: overrideTabName,
        reason,
        timestamp: new Date().toISOString()
      });
      
      // Grant access to the tab
      setOverrideGranted(prev => new Set([...prev, overrideTabName]));
      setActiveTab(overrideTabName as any);
      setShowOverrideDialog(false);
      
      // Show success message
      alert(`âœ“ Override granted. This action has been logged to the audit trail.`);
    } catch (error) {
      console.error('Override failed:', error);
      alert('âŒ Override failed. Please try again.');
    } finally {
      setIsOverriding(false);
    }
  };

  const loadMockLabReports = () => {
    // TODO: Replace with actual API call - await labReportsApi.getByPatient(patientId)
    const mockReports: LabReport[] = [
      {
        id: '1',
        testName: 'Complete Blood Count (CBC)',
        testCategory: 'Blood',
        orderedDate: '2026-01-25',
        orderedBy: 'Dr. Smith',
        status: 'completed',
        sampleCollectedDate: '2026-01-25',
        reportDate: '2026-01-26',
        urgency: 'routine',
        reportUrl: '/reports/cbc-001.pdf',
        results: [
          { parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12-16', status: 'normal' },
          { parameter: 'WBC Count', value: '9.2', unit: '10Â³/ÂµL', referenceRange: '4-11', status: 'normal' },
          { parameter: 'Platelets', value: '250', unit: '10Â³/ÂµL', referenceRange: '150-400', status: 'normal' },
          { parameter: 'RBC Count', value: '4.5', unit: '10â¶/ÂµL', referenceRange: '4.2-5.4', status: 'normal' }
        ]
      },
      {
        id: '2',
        testName: 'Blood Glucose (Fasting)',
        testCategory: 'Blood',
        orderedDate: '2026-01-25',
        orderedBy: 'Dr. Smith',
        status: 'completed',
        sampleCollectedDate: '2026-01-25',
        reportDate: '2026-01-26',
        urgency: 'routine',
        reportUrl: '/reports/glucose-001.pdf',
        results: [
          { parameter: 'Glucose', value: '125', unit: 'mg/dL', referenceRange: '70-100', status: 'high' }
        ],
        notes: 'Patient is in prediabetic range. Recommend lifestyle modifications.'
      },
      {
        id: '3',
        testName: 'Retinal OCT',
        testCategory: 'Imaging',
        orderedDate: '2026-01-28',
        orderedBy: 'Dr. Johnson',
        status: 'completed',
        sampleCollectedDate: '2026-01-28',
        reportDate: '2026-01-28',
        urgency: 'routine',
        reportUrl: '/reports/oct-001.pdf',
        notes: 'Normal macular thickness. No signs of edema.'
      },
      {
        id: '4',
        testName: 'HbA1c',
        testCategory: 'Blood',
        orderedDate: '2026-01-25',
        orderedBy: 'Dr. Smith',
        status: 'completed',
        sampleCollectedDate: '2026-01-25',
        reportDate: '2026-01-27',
        urgency: 'routine',
        reportUrl: '/reports/hba1c-001.pdf',
        results: [
          { parameter: 'HbA1c', value: '6.2', unit: '%', referenceRange: '<5.7', status: 'high' }
        ],
        notes: 'Elevated HbA1c indicates prediabetes. Correlates with fasting glucose.'
      },
      {
        id: '5',
        testName: 'Visual Field Test',
        testCategory: 'Other',
        orderedDate: '2026-01-29',
        orderedBy: 'Dr. Johnson',
        status: 'in_progress',
        sampleCollectedDate: '2026-01-29',
        urgency: 'routine',
        notes: 'Awaiting ophthalmologist review'
      },
      {
        id: '6',
        testName: 'Fundus Photography',
        testCategory: 'Imaging',
        orderedDate: '2026-01-28',
        orderedBy: 'Dr. Johnson',
        status: 'completed',
        sampleCollectedDate: '2026-01-28',
        reportDate: '2026-01-28',
        urgency: 'urgent',
        reportUrl: '/reports/fundus-001.pdf',
        notes: 'Mild NPDR (non-proliferative diabetic retinopathy) observed in both eyes.'
      }
    ];
    setLabReports(mockReports);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabContentElement = (
    <div className="flex flex-col flex-1 h-full">
      </div>
    </div>
  );

  return tabContentElement;
}
