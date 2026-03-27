'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, Droplet, MapPin, FileText, Activity, Pill, AlertTriangle, Download, Upload, CheckCircle2, Clock, XCircle, FileCheck, StickyNote, Shield, Eye, Heart, Stethoscope, TrendingUp, DollarSign, Users, Package, CreditCard, ClipboardList, ArrowUpRight, AlertCircle, ShieldAlert, Lock, AlertOctagon, MessageSquare, FileSignature, ChevronDown, ChevronRight, Image, Bed, Hospital, ArrowRight, MessageCircle, Star, Globe, Scan } from 'lucide-react';
import { patientApi, examinationApi, visitsApi, appointmentsApi, prescriptionsApi, opdBillsApi } from '@/lib/api';
import { CheckInStatus } from '@/lib/check-in-api';
import { EmergencyOverrideDialog } from './EmergencyOverrideDialog';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AllergiesTab } from './tabs/AllergiesTab';
import { CommunicationsTab } from './tabs/CommunicationsTab';
import { ConsentsTab } from './tabs/ConsentsTab';
import { BlockedTabContent } from './tabs/BlockedTabContent';
import { LabReportsTab } from './tabs/LabReportsTab';
import { SurgeryTab } from './tabs/SurgeryTab';
import { OpticalTab } from './tabs/OpticalTab';
import { NotesTab } from './tabs/NotesTab';
import { InsuranceTab } from './tabs/InsuranceTab';
import { PharmacyTab } from './tabs/PharmacyTab';
import { EyeHistoryTab } from './tabs/EyeHistoryTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { MedHistoryTab } from './tabs/MedHistoryTab';
import { TimelineTab } from './tabs/TimelineTab';
import { AlertBanner } from './AlertBanner';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { CareTeamPanel } from './CareTeamPanel';
import { VitalsFlowsheetTab } from './tabs/VitalsFlowsheetTab';
import { ImagingTab } from './tabs/ImagingTab';
import { ProceduresTab } from './tabs/ProceduresTab';
import { QueueStatusTab } from './tabs/QueueStatusTab';
import { AdmissionsTab } from './tabs/AdmissionsTab';
import { ReferralsTab } from './tabs/ReferralsTab';
import { CounselingTab } from './tabs/CounselingTab';
import { PreOpTab } from './tabs/PreOpTab';
import { FeedbackTab } from './tabs/FeedbackTab';
import { PortalAccessTab } from './tabs/PortalAccessTab';

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
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'clinicalsnapshot' | 'vitals' | 'examinations' | 'eyehistory' | 'diagnoses' | 'prescriptions' | 'labreports' | 'imaging' | 'procedures' | 'appointments' | 'visits' | 'queue' | 'admissions' | 'medications' | 'dispensing' | 'optical' | 'billing' | 'insurance' | 'consents' | 'documents' | 'communications' | 'referrals' | 'counseling' | 'surgery' | 'notes' | 'preop' | 'feedback' | 'portalaccess' | 'allergies' | 'pharmacy' | 'history'>('timeline');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideTabName, setOverrideTabName] = useState('');
  const [overrideGranted, setOverrideGranted] = useState<Set<string>>(new Set());
  const [isOverriding, setIsOverriding] = useState(false);
  
  // Zone expansion state (localStorage persistence)
  const [expandedZones, setExpandedZones] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('patientDetailsExpandedZones');
      return saved ? new Set(JSON.parse(saved)) : new Set(['overview', 'clinical', 'diagnostics']);
    }
    return new Set(['overview', 'clinical', 'diagnostics']);
  });
  
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

  // Persist expanded zones to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('patientDetailsExpandedZones', JSON.stringify(Array.from(expandedZones)));
    }
  }, [expandedZones]);

  // Toggle zone expansion
  const toggleZone = (zoneId: string) => {
    setExpandedZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) {
        newSet.delete(zoneId);
      } else {
        newSet.add(zoneId);
      }
      return newSet;
    });
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
          description: `Ã¢â€šÂ¹${(bill.totalAmount || 0).toLocaleString('en-IN')} - ${bill.status || 'Pending'}`,
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
            unit: 'Ã‚Â°F',
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
      alert(`Ã¢Å“â€œ Override granted. This action has been logged to the audit trail.`);
    } catch (error) {
      console.error('Override failed:', error);
      alert('Ã¢ÂÅ’ Override failed. Please try again.');
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
          { parameter: 'WBC Count', value: '9.2', unit: '10Ã‚Â³/Ã‚ÂµL', referenceRange: '4-11', status: 'normal' },
          { parameter: 'Platelets', value: '250', unit: '10Ã‚Â³/Ã‚ÂµL', referenceRange: '150-400', status: 'normal' },
          { parameter: 'RBC Count', value: '4.5', unit: '10Ã¢ÂÂ¶/Ã‚ÂµL', referenceRange: '4.2-5.4', status: 'normal' }
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
      <div className="border-b bg-gray-50">
        <div className={isEmbedded ? '' : 'px-6 py-2'}>
          <div className="space-y-1">
            {/* ZONE 1: OVERVIEW (always expanded) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleZone('overview')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Overview</span>
                {expandedZones.has('overview') ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedZones.has('overview') && (
                <nav className="flex space-x-2 px-4 pb-2 flex-wrap gap-y-2">
                  {[
                    { id: 'timeline', label: 'Timeline', icon: Clock },
                    { id: 'details', label: 'Summary', icon: User },
                    { id: 'clinicalsnapshot', label: 'Clinical Snapshot', icon: Activity }
                  ].map((tab) => {
                    const isRestricted = restrictedTabs.includes(tab.id);
                    const isLocked = isRestricted && !isTabAccessible(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border font-medium text-sm ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isLocked
                            ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* ZONE 2: CLINICAL DATA (expanded by default) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleZone('clinical')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Clinical Data</span>
                {expandedZones.has('clinical') ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedZones.has('clinical') && (
                <nav className="flex space-x-2 px-4 pb-2 flex-wrap gap-y-2">
                  {[
                    { id: 'vitals', label: 'Vitals', icon: Heart },
                    { id: 'examinations', label: 'Examinations', icon: Stethoscope },
                    { id: 'eyehistory', label: 'Eye History', icon: TrendingUp },
                    { id: 'diagnoses', label: 'Diagnoses', icon: AlertTriangle },
                    { id: 'prescriptions', label: 'Medications', icon: Pill },
                    { id: 'allergies', label: 'Allergies', icon: AlertOctagon }
                  ].map((tab) => {
                    const isRestricted = restrictedTabs.includes(tab.id);
                    const isLocked = isRestricted && !isTabAccessible(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border font-medium text-sm ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isLocked
                            ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* ZONE 3: DIAGNOSTICS (expanded by default) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleZone('diagnostics')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Diagnostics</span>
                {expandedZones.has('diagnostics') ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedZones.has('diagnostics') && (
                <nav className="flex space-x-2 px-4 pb-2 flex-wrap gap-y-2">
                  {[
                    { id: 'labreports', label: 'Lab Reports', icon: FileText },
                    { id: 'imaging', label: 'Imaging', icon: Image },
                    { id: 'procedures', label: 'Procedures', icon: Scan }
                  ].map((tab) => {
                    const isRestricted = restrictedTabs.includes(tab.id);
                    const isLocked = isRestricted && !isTabAccessible(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border font-medium text-sm ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isLocked
                            ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* ZONE 4: PATIENT JOURNEY (collapsed by default) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleZone('journey')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Patient Journey</span>
                {expandedZones.has('journey') ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedZones.has('journey') && (
                <nav className="flex space-x-2 px-4 pb-2 flex-wrap gap-y-2">
                  {[
                    { id: 'appointments', label: 'Appointments', icon: Calendar },
                    { id: 'visits', label: 'Visits', icon: ClipboardList },
                    { id: 'queue', label: 'Queue Status', icon: Clock },
                    { id: 'admissions', label: 'IPD Admissions', icon: Hospital }
                  ].map((tab) => {
                    const isRestricted = restrictedTabs.includes(tab.id);
                    const isLocked = isRestricted && !isTabAccessible(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border font-medium text-sm ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isLocked
                            ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* ZONE 5: PHARMACY (collapsed by default) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleZone('pharmacy')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pharmacy</span>
                {expandedZones.has('pharmacy') ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedZones.has('pharmacy') && (
                <nav className="flex space-x-2 px-4 pb-2 flex-wrap gap-y-2">
                  {[
                    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                    { id: 'pharmacy', label: 'Dispensing', icon: Package },
                    { id: 'optical', label: 'Optical', icon: Eye }
                  ].map((tab) => {
                    const isRestricted = restrictedTabs.includes(tab.id);
                    const isLocked = isRestricted && !isTabAccessible(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border font-medium text-sm ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isLocked
                            ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* ZONE 6: ADMINISTRATIVE (collapsed by default) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleZone('administrative')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Administrative</span>
                {expandedZones.has('administrative') ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedZones.has('administrative') && (
                <nav className="flex space-x-2 px-4 pb-2 flex-wrap gap-y-2">
                  {[
                    { id: 'billing', label: 'Billing', icon: DollarSign },
                    { id: 'insurance', label: 'Insurance', icon: Shield },
                    { id: 'consents', label: 'Consents', icon: FileSignature },
                    { id: 'documents', label: 'Documents', icon: FileCheck },
                    { id: 'communications', label: 'Communications', icon: MessageSquare },
                    { id: 'referrals', label: 'Referrals', icon: ArrowRight },
                    { id: 'counseling', label: 'Counseling', icon: MessageCircle },
                    { id: 'surgery', label: 'Surgery', icon: Activity },
                    { id: 'notes', label: 'Notes', icon: StickyNote },
                    { id: 'preop', label: 'Pre-Op', icon: ClipboardList },
                    { id: 'feedback', label: 'Feedback', icon: Star },
                    { id: 'portalaccess', label: 'Portal Access', icon: Globe }
                  ].map((tab) => {
                    const isRestricted = restrictedTabs.includes(tab.id);
                    const isLocked = isRestricted && !isTabAccessible(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 py-2 px-3 rounded-md border font-medium text-sm ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isLocked
                            ? 'border-gray-200 text-gray-400 hover:bg-gray-50'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${isEmbedded ? 'p-0' : 'p-6'}`}>
          {/* Timeline Tab - NEW TAB 1 (Highest Priority) */}
          {activeTab === 'timeline' && (
            <TimelineTab patientId={patient?.id || ''} />
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplet className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-medium">{patient.bloodGroup || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.contactNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{patient.contactNumber}</p>
                      </div>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  {patient.address && (
                    <div className="md:col-span-2 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(patient.emergencyContactName || patient.emergencyContactNumber) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.emergencyContactName && (
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{patient.emergencyContactName}</p>
                      </div>
                    )}
                    {patient.emergencyContactNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{patient.emergencyContactNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                <div className="space-y-4">
                  {patient.allergies && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Allergies</p>
                        <p className="font-medium text-red-700">{patient.allergies}</p>
                      </div>
                    </div>
                  )}
                  {patient.medicalConditions && (
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Medical Conditions</p>
                        <p className="font-medium">{patient.medicalConditions}</p>
                      </div>
                    </div>
                  )}
                  {patient.medications && (
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Current Medications</p>
                        <p className="font-medium">{patient.medications}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              {(patient.insuranceProvider || patient.insuranceNumber) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.insuranceProvider && (
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="font-medium">{patient.insuranceProvider}</p>
                      </div>
                    )}
                    {patient.insuranceNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Policy Number</p>
                        <p className="font-medium">{patient.insuranceNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {patient.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{patient.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Visit History</h3>
                <span className="text-sm text-gray-600">{visits.length} total visits</span>
              </div>

              {/* Loading State */}
              {loadingVisits && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading visits...</span>
                </div>
              )}

              {/* Empty State */}
              {!loadingVisits && visits.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Visits Recorded</h3>
                  <p className="text-gray-600">This patient hasn't had any visits yet.</p>
                </div>
              )}

              {/* Visit Timeline */}
              <div className="space-y-4">
                {!loadingVisits && visits.map((visit, idx) => {
                  const visitDate = visit.checkedInAt ? new Date(visit.checkedInAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
                  const checkInTime = visit.checkedInAt ? new Date(visit.checkedInAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A';
                  const checkOutTime = visit.completedAt ? new Date(visit.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'In Progress';
                  
                  // Calculate duration
                  let duration = 'N/A';
                  if (visit.checkedInAt && visit.completedAt) {
                    const start = new Date(visit.checkedInAt);
                    const end = new Date(visit.completedAt);
                    const diffMs = end.getTime() - start.getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${hours}h ${minutes}m`;
                  }

                  const statusColors = {
                    'Checked In': 'bg-blue-100 text-blue-800',
                    'In Progress': 'bg-yellow-100 text-yellow-800',
                    'Completed': 'bg-green-100 text-green-800',
                    'Cancelled': 'bg-red-100 text-red-800'
                  };
                  const statusColor = statusColors[visit.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

                  return (
                  <div key={visit.id || idx} className="bg-white border-l-4 border-indigo-500 rounded-r-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <ClipboardList className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{visitDate}</h4>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              Token: {visit.tokenNumber}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{visit.visitType} Visit{visit.departmentName ? ` Ã¢â‚¬Â¢ ${visit.departmentName}` : ''}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                        {visit.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Check-In</p>
                        <p className="font-medium text-gray-900">{checkInTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Check-Out</p>
                        <p className="font-medium text-gray-900">{checkOutTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-medium text-gray-900">{duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Doctor</p>
                        <p className="font-medium text-gray-900">{visit.consultantName || 'Not Assigned'}</p>
                      </div>
                    </div>
                    {visit.currentStation && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Current Station:</p>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                          {visit.currentStation}
                        </span>
                      </div>
                    )}
                    {visit.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{visit.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        {visit.isEmergency && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium mr-2">
                            EMERGENCY
                          </span>
                        )}
                        {visit.billNumber ? `Bill: ${visit.billNumber}` : 'No Bill'}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book New Appointment
                </button>
              </div>

              {/* Loading State */}
              {loadingAppointments && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading appointments...</span>
                </div>
              )}

              {/* Empty State */}
              {!loadingAppointments && appointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                  <p className="text-gray-600">This patient hasn't scheduled any appointments yet.</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Book First Appointment
                  </button>
                </div>
              )}

              {!loadingAppointments && appointments.length > 0 && (
                <>
                  {/* Upcoming Appointments */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Upcoming Appointments
                    </h4>
                    <div className="space-y-3">
                      {appointments
                        .filter((appt) => {
                          const apptDate = new Date(appt.appointmentDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return apptDate >= today && appt.status !== 'Cancelled' && appt.status !== 'Completed';
                        })
                        .map((appt, idx) => {
                          const apptDate = new Date(appt.appointmentDate);
                          const today = new Date();
                          const daysLeft = Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          const formattedDate = apptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          const canCheckIn = daysLeft === 0; // Can check in on the same day

                          return (
                          <div key={appt.id} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                  <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900">{formattedDate} at {appt.startTime}</h5>
                                  <p className="text-sm text-gray-600">{appt.doctorName}{appt.departmentName ? ` Ã¢â‚¬Â¢ ${appt.departmentName}` : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  {appt.status}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {daysLeft === 0 ? 'Today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-600">Type:</span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{appt.appointmentType}</span>
                              {appt.priority && appt.priority !== 'Normal' && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">{appt.priority}</span>
                              )}
                            </div>
                            {appt.reasonForVisit && (
                              <p className="text-sm text-gray-700 mb-3">
                                <span className="font-medium">Reason:</span> {appt.reasonForVisit}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <button className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                Reschedule
                              </button>
                              <button className="flex-1 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium">
                                Cancel
                              </button>
                              {canCheckIn && (
                                <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                                  Check-In
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {appointments.filter((appt) => {
                        const apptDate = new Date(appt.appointmentDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return apptDate >= today && appt.status !== 'Cancelled' && appt.status !== 'Completed';
                      }).length === 0 && (
                        <p className="text-gray-600 text-center py-4">No upcoming appointments</p>
                      )}
                    </div>
                  </div>

                  {/* Past Appointments */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-gray-600" />
                      Past Appointments
                    </h4>
                    <div className="space-y-2">
                      {appointments
                        .filter((appt) => {
                          const apptDate = new Date(appt.appointmentDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return apptDate < today || appt.status === 'Completed' || appt.status === 'Cancelled';
                        })
                        .map((appt, idx) => {
                          const apptDate = new Date(appt.appointmentDate);
                          const formattedDate = apptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          
                          return (
                          <div key={appt.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium text-gray-900">{formattedDate} at {appt.startTime}</h5>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    appt.status === 'No-Show' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appt.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{appt.doctorName} Ã¢â‚¬Â¢ {appt.appointmentType}</p>
                                {appt.notes && (
                                  <p className="text-sm text-gray-700 mt-2">
                                    <span className="font-medium">Notes:</span> {appt.notes}
                                  </p>
                                )}
                                {appt.cancellationReason && (
                                  <p className="text-sm text-red-700 mt-2">
                                    <span className="font-medium">Cancellation Reason:</span> {appt.cancellationReason}
                                  </p>
                                )}
                              </div>
                              <button className="text-indigo-600 hover:text-indigo-700 p-2">
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {appointments.filter((appt) => {
                        const apptDate = new Date(appt.appointmentDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return apptDate < today || appt.status === 'Completed' || appt.status === 'Cancelled';
                      }).length === 0 && (
                        <p className="text-gray-600 text-center py-4">No past appointments</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Generate New Bill
                </button>
              </div>

              {loadingBilling ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Outstanding Balance */}
                  {(() => {
                    const outstanding = opdBills.reduce(
                      (sum, bill) => sum + ((bill.balanceAmount || bill.totalAmount - bill.paidAmount) || 0),
                      0
                    );
                    const lastPaymentBill = opdBills
                      .filter(b => b.paidAmount > 0)
                      .sort((a, b) => new Date(b.billDate || b.createdAt || 0).getTime() - new Date(a.billDate || a.createdAt || 0).getTime())[0];
                    
                    return (
                      <div className={`border rounded-lg p-6 ${
                        outstanding > 0 
                          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">Outstanding Balance</h4>
                            <p className={`text-3xl font-bold ${outstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>
                              Ã¢â€šÂ¹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {outstanding > 0 
                                ? `${opdBills.filter(b => (b.balanceAmount || b.totalAmount - b.paidAmount) > 0).length} unpaid bills` 
                                : 'All bills paid'}
                              {lastPaymentBill && ` Ã¢â‚¬Â¢ Last payment: ${formatDate(lastPaymentBill.billDate || lastPaymentBill.createdAt)}`}
                            </p>
                          </div>
                          <div className={`p-4 rounded-full ${outstanding > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                            {outstanding > 0 ? (
                              <AlertCircle className="w-12 h-12 text-red-600" />
                            ) : (
                              <CheckCircle2 className="w-12 h-12 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bills Table */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">All Bills</h4>
                    {opdBills.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No billing records found</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {opdBills.map((bill) => {
                                const balance = bill.balanceAmount ?? (bill.totalAmount - bill.paidAmount);
                                const billStatus = bill.status || 
                                  (balance === 0 ? 'paid' : 
                                   bill.paidAmount > 0 ? 'partial' : 'pending');
                                
                                return (
                                  <tr key={bill.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {formatDate(bill.billDate || bill.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                                      {bill.billNumber || `BILL-${bill.id?.substring(0, 8)}`}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {bill.billItems && bill.billItems.length > 0
                                        ? bill.billItems.map((item: any) => item.itemName || item.serviceName).join(', ')
                                        : bill.description || 'OPD Services'}
                                      {bill.isFreeVisit && (
                                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                          Free Visit
                                        </span>
                                      )}
                                      {bill.isCredit && (
                                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                          Credit
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                      Ã¢â€šÂ¹{(bill.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                                      Ã¢â€šÂ¹{(bill.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                      Ã¢â€šÂ¹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        billStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                        billStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                        billStatus === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {billStatus.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex gap-2">
                                        <button 
                                          className="text-indigo-600 hover:text-indigo-700 p-1"
                                          title="View Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                          className="text-green-600 hover:text-green-700 p-1"
                                          title="Download Receipt"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Patient Timeline</h3>
                <button 
                  onClick={() => loadTimeline()}
                  className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Clock className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Event Type Filters */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Event Type</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'visits', label: 'Visits', color: 'blue', icon: ClipboardList },
                    { id: 'appointments', label: 'Appointments', color: 'purple', icon: Calendar },
                    { id: 'examinations', label: 'Examinations', color: 'indigo', icon: Stethoscope },
                    { id: 'prescriptions', label: 'Prescriptions', color: 'green', icon: Pill },
                    { id: 'billing', label: 'Billing', color: 'orange', icon: DollarSign }
                  ].map((filter) => {
                    const isActive = timelineFilters.includes(filter.id);
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setTimelineFilters(prev => 
                            isActive 
                              ? prev.filter(f => f !== filter.id)
                              : [...prev, filter.id]
                          );
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          isActive
                            ? `bg-${filter.color}-100 text-${filter.color}-700 border-${filter.color}-300 border-2`
                            : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <filter.icon className="w-3.5 h-3.5" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Content */}
              {loadingTimeline ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : timelineEvents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No timeline events found</p>
                  <p className="text-xs text-gray-400 mt-1">Events will appear here as the patient interacts with the system</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline Events */}
                  <div className="space-y-6">
                    {(() => {
                      // Filter events based on selected filters
                      const filteredEvents = timelineEvents.filter(event => 
                        timelineFilters.includes(event.type)
                      );

                      // Group events by date
                      const groupedEvents: { [key: string]: any[] } = {};
                      filteredEvents.forEach(event => {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);

                        let groupKey: string;
                        if (eventDate >= today) {
                          groupKey = 'Today';
                        } else if (eventDate >= yesterday) {
                          groupKey = 'Yesterday';
                        } else if (eventDate >= weekAgo) {
                          groupKey = 'This Week';
                        } else {
                          groupKey = eventDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        }

                        if (!groupedEvents[groupKey]) {
                          groupedEvents[groupKey] = [];
                        }
                        groupedEvents[groupKey].push(event);
                      });

                      return Object.entries(groupedEvents).map(([dateGroup, events], groupIdx) => (
                        <div key={groupIdx}>
                          {/* Date Group Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-16 text-right">
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                {dateGroup}
                              </span>
                            </div>
                            <div className="flex-1 h-px bg-gray-200"></div>
                          </div>

                          {/* Events in this group */}
                          {events.map((event, eventIdx) => {
                            const EventIcon = event.icon;
                            const colorClasses = {
                              blue: 'bg-blue-100 text-blue-600 border-blue-200',
                              purple: 'bg-purple-100 text-purple-600 border-purple-200',
                              indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
                              green: 'bg-green-100 text-green-600 border-green-200',
                              orange: 'bg-orange-100 text-orange-600 border-orange-200',
                              red: 'bg-red-100 text-red-600 border-red-200'
                            };

                            return (
                              <div key={event.id} className="flex gap-4 mb-4 relative">
                                {/* Timeline dot */}
                                <div className="flex-shrink-0 w-16 flex justify-end items-start pt-1">
                                  <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                                    colorClasses[event.color as keyof typeof colorClasses] || colorClasses.blue
                                  }`}>
                                    <EventIcon className="w-5 h-5" />
                                  </div>
                                </div>

                                {/* Event Card */}
                                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                      {formatDate(event.date)} {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  {/* Event-specific details */}
                                  {event.type === 'visit' && event.details && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                                      <div className="grid grid-cols-2 gap-2">
                                        {event.details.departmentName && (
                                          <div><span className="text-gray-600">Department:</span> <span className="font-medium">{event.details.departmentName}</span></div>
                                        )}
                                        {event.details.chiefComplaint && (
                                          <div><span className="text-gray-600">Complaint:</span> <span className="font-medium">{event.details.chiefComplaint}</span></div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {event.type === 'appointment' && event.details && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                                      <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          event.details.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                          event.details.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                          event.details.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {event.details.status}
                                        </span>
                                        {event.details.branchName && (
                                          <span className="text-gray-600">Branch: <span className="font-medium">{event.details.branchName}</span></span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {event.type === 'prescription' && event.details?.medications && event.details.medications.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <p className="text-xs text-gray-600 mb-2">Medications:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {event.details.medications.slice(0, 3).map((med: any, idx: number) => (
                                          <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                            {med.drugName || med.name}
                                          </span>
                                        ))}
                                        {event.details.medications.length > 3 && (
                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                            +{event.details.medications.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {event.type === 'billing' && event.details && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="text-gray-600">Balance:</span>
                                          <span className={`font-semibold ${
                                            (event.details.balanceAmount || 0) === 0 ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            Ã¢â€šÂ¹{((event.details.balanceAmount || event.details.totalAmount - event.details.paidAmount) || 0).toLocaleString('en-IN')}
                                          </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          event.details.status === 'paid' ? 'bg-green-100 text-green-800' :
                                          event.details.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-orange-100 text-orange-800'
                                        }`}>
                                          {event.details.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {event.type === 'examination' && event.details && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                                      {event.details.diagnosis && (
                                        <div className="mb-2">
                                          <span className="text-gray-600">Diagnosis:</span> 
                                          <span className="font-medium ml-1">{event.details.diagnosis}</span>
                                        </div>
                                      )}
                                      {event.details.treatment && (
                                        <div>
                                          <span className="text-gray-600">Treatment:</span> 
                                          <span className="text-gray-700 ml-1">{event.details.treatment}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Empty state when all events filtered out */}
                  {timelineEvents.length > 0 && timelineEvents.filter(e => timelineFilters.includes(e.type)).length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No events match the selected filters</p>
                      <p className="text-xs text-gray-400 mt-1">Try selecting more event types from the filters above</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vitals Tab */}
          {/* Vitals Flowsheet Tab - NEW Week 2 */}
          {activeTab === 'vitals' && (
            <VitalsFlowsheetTab patientId={patient?.id || ''} />
          )}

          {/* Clinical Snapshot Tab - Coming Soon */}
          {activeTab === 'clinicalsnapshot' && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical Snapshot</h3>
              <p className="text-gray-600 mb-4">At-a-glance view of current clinical status</p>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium">Coming in Week 3</span>
            </div>
          )}

          {/* Imaging Tab - NEW Week 2 */}
          {activeTab === 'imaging' && (
            <ImagingTab patientId={patient?.id || ''} />
          )}

          {/* Procedures Tab - NEW Week 2 */}
          {activeTab === 'procedures' && (
            <ProceduresTab patientId={patient?.id || ''} />
          )}

          {/* Queue Status Tab - NEW Week 2 */}
          {activeTab === 'queue' && (
            <QueueStatusTab patientId={patient?.id || ''} />
          )}

          {/* Admissions Tab - NEW Week 2 */}
          {activeTab === 'admissions' && (
            <AdmissionsTab patientId={patient?.id || ''} />
          )}

          {/* Referrals Tab - NEW Week 2 */}
          {activeTab === 'referrals' && (
            <ReferralsTab patientId={patient?.id || ''} />
          )}

          {/* Counseling Tab - NEW Week 2 */}
          {activeTab === 'counseling' && (
            <CounselingTab patientId={patient?.id || ''} />
          )}

          {/* Pre-Op Tab - NEW Week 2 */}
          {activeTab === 'preop' && (
            <PreOpTab patientId={patient?.id || ''} />
          )}

          {/* Feedback Tab - NEW Week 2 */}
          {activeTab === 'feedback' && (
            <FeedbackTab patientId={patient?.id || ''} />
          )}

          {/* Portal Access Tab - NEW Week 2 */}
          {activeTab === 'portalaccess' && (
            <PortalAccessTab patientId={patient?.id || ''} />
          )}

          {/* Diagnoses Tab */}
          {activeTab === 'diagnoses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Diagnoses & Conditions</h3>
                <button 
                  onClick={() => loadDiagnoses()}
                  className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {loadingDiagnoses ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : diagnosesData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No diagnoses found</p>
                  <p className="text-xs text-gray-400 mt-1">Diagnoses will be recorded during clinical examinations</p>
                </div>
              ) : (
                <>
                  {/* Active Diagnoses */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Active Diagnoses
                    </h4>
                    <div className="space-y-3">
                      {diagnosesData
                        .filter(d => d.status === 'active' || d.status === 'ongoing')
                        .map((diagnosis, idx) => (
                          <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-lg">{diagnosis.diagnosis}</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  First Diagnosed: {formatDate(diagnosis.firstDiagnosed)} Ã¢â‚¬Â¢ Last Seen: {formatDate(diagnosis.lastSeen)}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                Active
                              </span>
                            </div>
                            
                            {diagnosis.treatment && (
                              <div className="mb-3 p-3 bg-white rounded border border-orange-100">
                                <p className="text-xs text-gray-600 mb-1">Current Treatment:</p>
                                <p className="text-sm text-gray-900">{diagnosis.treatment}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Occurrences</p>
                                <p className="font-medium text-gray-900">{diagnosis.occurrences} time(s)</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Last Seen By</p>
                                <p className="font-medium text-gray-900">{diagnosis.doctorName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Related Visits</p>
                                <p className="font-medium text-gray-900">{diagnosis.examinations?.length || 0}</p>
                              </div>
                            </div>

                            {diagnosis.notes && (
                              <div className="mt-3 pt-3 border-t border-orange-100">
                                <p className="text-xs text-gray-600 mb-1">Recent Notes:</p>
                                <p className="text-sm text-gray-700">{diagnosis.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {diagnosesData.filter(d => d.status === 'active' || d.status === 'ongoing').length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                          <p className="mt-2 text-sm text-gray-500">No active diagnoses</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resolved/Past Diagnoses */}
                  {diagnosesData.filter(d => d.status === 'resolved' || d.status === 'completed').length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Resolved Diagnoses
                      </h4>
                      <div className="space-y-2">
                        {diagnosesData
                          .filter(d => d.status === 'resolved' || d.status === 'completed')
                          .map((diagnosis, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{diagnosis.diagnosis}</h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {formatDate(diagnosis.firstDiagnosed)} - {formatDate(diagnosis.lastSeen)}
                                  </p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Resolved
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* All Diagnoses History Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800">Complete Diagnosis History</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Diagnosed</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occurrences</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {diagnosesData.map((diagnosis, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{diagnosis.diagnosis}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(diagnosis.firstDiagnosed)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(diagnosis.lastSeen)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{diagnosis.occurrences}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  diagnosis.status === 'active' || diagnosis.status === 'ongoing'
                                    ? 'bg-orange-100 text-orange-800'
                                    : diagnosis.status === 'resolved' || diagnosis.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {diagnosis.status?.toUpperCase() || 'UNKNOWN'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Allergies Tab */}
          {activeTab === 'allergies' && (
            <AllergiesTab patientId={patient?.id || ''} />
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <CommunicationsTab patientId={patient?.id || ''} />
          )}

          {/* Consents Tab */}
          {activeTab === 'consents' && (
            <ConsentsTab patientId={patient?.id || ''} />
          )}

          {/* Eye History Tab */}
          {activeTab === 'eyehistory' && (
            <EyeHistoryTab patientId={patient?.id || ''} />
          )}

          {/* Medical History Tab */}
          {activeTab === 'history' && (
            <MedHistoryTab patientId={patient?.id || ''} patientData={patient} />
          )}

          {activeTab === 'examinations' && (
            !isTabAccessible('examinations') ? (
              <BlockedTabContent tabName="Examinations" isCheckedIn={isCheckedIn} canOverride={canOverride} onOverrideClick={(name) => { setOverrideTabName(name); setShowOverrideDialog(true); }} />
            ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Examination History</h3>
                <span className="text-sm text-gray-600">{examinations.length} examinations</span>
              </div>

              {examinations.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No examinations found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Examination records will appear here once created
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {examinations.map((exam) => (
                    <div key={exam.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{exam.examinationType}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(exam.examinationDate)} Ã¢â‚¬Â¢ Dr. {exam.doctorName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                          exam.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exam.status}
                        </span>
                      </div>

                      {exam.diagnosis && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{exam.diagnosis}</p>
                        </div>
                      )}

                      {exam.symptoms && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                          <p className="text-sm text-gray-600">{exam.symptoms}</p>
                        </div>
                      )}

                      {exam.treatment && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Treatment:</p>
                          <p className="text-sm text-gray-600">{exam.treatment}</p>
                        </div>
                      )}

                      {exam.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600">{exam.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            )
          )}

          {/* Lab Reports Tab */}
          {activeTab === 'labreports' && (
            <LabReportsTab patientId={patient?.id || ''} />
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            !isTabAccessible('prescriptions') ? (
              <BlockedTabContent tabName="Prescriptions" isCheckedIn={isCheckedIn} canOverride={canOverride} onOverrideClick={(name) => { setOverrideTabName(name); setShowOverrideDialog(true); }} />
            ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Prescription History</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  New Prescription
                </button>
              </div>

              {/* Optical Prescriptions */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  Optical Prescriptions
                </h4>
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">Eyeglasses Prescription</h5>
                        <p className="text-sm text-gray-600">Prescribed: January 15, 2026 by Dr. Anderson</p>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Right Eye (OD)</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p>SPH: -2.50 | CYL: -0.75 | AXIS: 180Ã‚Â°</p>
                          <p className="mt-1">Add: +2.00 (Reading)</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Left Eye (OS)</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p>SPH: -2.75 | CYL: -0.50 | AXIS: 175Ã‚Â°</p>
                          <p className="mt-1">Add: +2.00 (Reading)</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">PD: 63mm | Valid until: January 15, 2027</p>
                  </div>
                </div>
              </div>

              {/* Medication Prescriptions */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-green-600" />
                  Medication Prescriptions
                </h4>
                
                {loadingPrescriptions ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Pill className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No medication prescriptions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-gray-900">
                                Prescription #{prescription.id?.substring(0, 8) || 'N/A'}
                              </h5>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                prescription.status === 'active' || prescription.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : prescription.status === 'dispensed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : prescription.status === 'expired'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {prescription.status?.toUpperCase() || (prescription.isActive ? 'ACTIVE' : 'INACTIVE')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Prescribed: {prescription.prescriptionDate ? formatDate(prescription.prescriptionDate) : 'N/A'} 
                              {prescription.doctorName && ` by ${prescription.doctorName}`}
                              {prescription.expiryDate && ` Ã¢â‚¬Â¢ Valid until: ${formatDate(prescription.expiryDate)}`}
                            </p>
                            
                            {/* Medications List */}
                            {prescription.medications && prescription.medications.length > 0 ? (
                              <div className="space-y-2 mb-2">
                                {prescription.medications.map((med: any, idx: number) => (
                                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-900">{med.drugName || med.name}</p>
                                    <p className="text-sm text-gray-700 mt-1">
                                      <strong>Dosage:</strong> {med.dosage || 'N/A'} 
                                      {med.frequency && ` Ã¢â‚¬Â¢ ${med.frequency}`}
                                    </p>
                                    {med.duration && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        <strong>Duration:</strong> {med.duration}
                                      </p>
                                    )}
                                    {med.instructions && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        <strong>Instructions:</strong> {med.instructions}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 mb-2">No medications listed</p>
                            )}
                            
                            {prescription.notes && (
                              <p className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                                <strong>Notes:</strong> {prescription.notes}
                              </p>
                            )}
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Print
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )
          )}

          {/* Surgery Tab */}
          {activeTab === 'surgery' && (
            <SurgeryTab patientId={patient?.id || ''} patientName={patient ? `${patient.firstName} ${patient.lastName}` : ''} />
          )}

          {/* Optical Tab */}
          {activeTab === 'optical' && (
            <OpticalTab patientId={patient?.id || ''} />
          )}

          {/* Pharmacy Tab */}
          {activeTab === 'pharmacy' && (
            <PharmacyTab patientId={patient?.id || ''} />
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentsTab patientId={patient?.id || ''} />
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <NotesTab patientId={patient?.id || ''} />
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <InsuranceTab patientId={patient?.id || ''} />
          )}
      </div>
    </div>
  );

  // Early returns for closed modal or loading states
  if (!isEmbedded && !isOpen) return null;

  if (loading || !patient) {
    if (isEmbedded) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading patient details...</span>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading patient details...</span>
          </div>
        </div>
      </div>
    );
  }

 // Embedded mode - return tabs only
  if (isEmbedded) {
    return tabContentElement;
  }

  // Modal mode - wrap in modal container
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>MRN: {patient.medicalRecordNumber || patient.mrn}</span>
                <span>Age: {calculateAge(patient.dateOfBirth)} years</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>
          </div>
          
          {/* Care Team Panel - Week 3 */}
          <div className="w-80 flex-shrink-0">
            <CareTeamPanel patientId={patient.id} />
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Edit Patient
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Alert Banner - CRITICAL ALERTS */}
        <div className="px-6 pt-4">
          <AlertBanner patientId={patient.id} patient={patient} />
        </div>
        
        {/* Quick Actions Toolbar - Week 2 */}
        <QuickActionsToolbar 
          patientId={patient.id} 
          patientName={`${patient.firstName} ${patient.lastName}`}
          onActionComplete={(action) => console.log(`Action completed: ${action}`)}
        />
        
        {tabContentElement}
      </div>
      
      {/* Emergency Override Dialog */}
      <EmergencyOverrideDialog
        isOpen={showOverrideDialog}
        onClose={() => setShowOverrideDialog(false)}
        onOverride={handleOverride}
        patientName={patient?.firstName ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
        tabName={overrideTabName}
        isLoading={isOverriding}
      />
    </div>
  );
}

export default PatientDetailsModal;