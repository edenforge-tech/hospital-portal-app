import { getApi } from '../api';

// ==========================================
// Doctor Queue & Workflow API
// ==========================================

export interface DoctorQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: string;
  tokenNumber?: string;
  appointmentTime?: string;
  chiefComplaint: string;
  source: 'Appointment' | 'Walk-in' | 'From Optometry' | 'Referred' | 'Emergency';
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Referred to Specialist' | 'Skipped';
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  assignedDoctor?: string;
  waitingSince?: string;
  
  // Priority scoring for mixed queue
  priorityScore: number; // Higher = more urgent
  
  // Optometry summary (if from optometry)
  hasOptometryData: boolean;
  optometrySummary?: {
    visualAcuity?: { od: string; os: string };
    iop?: { od: number; os: number };
    refraction?: { 
      od: { sphere: number; cylinder?: number; axis?: number };
      os: { sphere: number; cylinder?: number; axis?: number };
    };
    keratometry?: { od: string; os: string };
    completedAt?: string;
  };
  
  // Red flags from optometry
  hasRedFlags: boolean;
  redFlags?: string[];
  
  // Visit history
  lastVisitDate?: string;
  missedAppointments?: number;
}

export interface DoctorQueueStats {
  totalWaiting: number;
  inProgress: number;
  completedToday: number;
  referred: number;
  emergencyCount: number;
  urgentCount: number;
  averageConsultationTime: number; // minutes
  averageWaitTime: number; // minutes
  appointmentPatients: number;
  walkInPatients: number;
  fromOptometry: number;
}

export interface ExaminationDraft {
  id?: string;
  patientId: string;
  doctorId: string;
  timestamp: string;
  expiresAt: string; // Auto-expire after 24 hours
  data: {
    visualAcuityData?: any;
    iopData?: any;
    retinoscopyData?: any;
    anteriorSegmentData?: any;
    posteriorSegmentData?: any;
    medicationsData?: any;
    diagnosisData?: any;
    adviceData?: any;
  };
  completionPercentage: number;
}

export interface CompletedExamination {
  id?: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  
  // All examination data
  visualAcuityData?: any;
  iopData?: any;
  retinoscopyData?: any;
  anteriorSegmentData?: any;
  posteriorSegmentData?: any;
  medicationsData?: any;
  diagnosisData?: any;
  adviceData?: any;
  
  // Final assessment
  primaryDiagnosis: string;
  icd10Codes: string[];
  prescriptionIssued: boolean;
  investigationsOrdered: string[];
  followUpDate?: string;
  referralMade?: {
    speciality: string;
    reason: string;
    urgency: string;
  };
  
  // Status
  status: 'Draft' | 'Completed' | 'Signed';
  signedAt?: string;
  signature?: string; // Base64 image or digital signature
}

// ==========================================
// Queue Management API
// ==========================================
export const doctorQueueApi = {
  /**
   * Get doctor's patient queue with mixed priority
   * Priority algorithm:
   * 1. Emergency patients (regardless of source)
   * 2. Urgent from optometry with red flags
   * 3. Scheduled appointments (time-based)
   * 4. Urgent walk-ins
   * 5. Optometry referrals (routine)
   * 6. Routine walk-ins
   */
  getQueue: async (params?: { 
    status?: string; 
    urgency?: string; 
    source?: string;
    date?: string;
    doctorId?: string;
  }) => {
    const response = await getApi().get('/Queue/doctor', { 
      params: { ...params, department: 'consultation' } 
    });
    
    // Transform backend response to match frontend interface
    const queueItems = response.data.map((item: any) => ({
      id: item.id,
      patientId: item.patientId || item.patient?.id,
      patientName: item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : 'Unknown',
      mrn: item.patient?.medicalRecordNumber || '',
      age: item.patient?.dateOfBirth ? new Date().getFullYear() - new Date(item.patient.dateOfBirth).getFullYear() : 0,
      gender: item.patient?.gender || '',
      tokenNumber: item.tokenNumber,
      appointmentTime: item.appointment?.scheduledTime,
      chiefComplaint: item.appointment?.chiefComplaint || 'General Consultation',
      source: item.appointmentId ? 'Appointment' : 'Walk-in',
      status: item.status === 'waiting' ? 'Waiting' : 
              item.status === 'in-progress' ? 'In Progress' :
              item.status === 'completed' ? 'Completed' : 'Waiting',
      urgency: item.priority === 'emergency' ? 'Emergency' :
               item.priority === 'follow-up' ? 'Urgent' : 'Routine',
      waitingSince: item.checkedInAt,
      priorityScore: item.priority === 'emergency' ? 100 :
                     item.priority === 'follow-up' ? 75 : 50,
      hasOptometryData: false,
      hasRedFlags: false,
    }));
    
    return queueItems as DoctorQueueItem[];
  },

  getStats: async (doctorId?: string) => {
    const response = await getApi().get(`/Queue/doctor/stats/${doctorId}`);
    return response.data as DoctorQueueStats;
  },

  callNextPatient: async (doctorId: string) => {
    const response = await getApi().post('/Queue/doctor/call-next', { 
      doctorId,
      timestamp: new Date().toISOString() 
    });
    return response.data as DoctorQueueItem;
  },

  startConsultation: async (queueItemId: string, doctorId: string) => {
    const response = await getApi().post(`/Queue/${queueItemId}/start-consultation`, { 
      DoctorId: doctorId
    });
    return response.data;
  },

  completeConsultation: async (queueItemId: string, examinationId: string) => {
    const response = await getApi().post(`/Queue/${queueItemId}/complete`, { 
      examinationId,
      completedAt: new Date().toISOString() 
    });
    return response.data;
  },

  skipPatient: async (queueItemId: string, reason: string) => {
    const response = await getApi().post(`/Queue/${queueItemId}/skip`, { 
      Reason: reason
    });
    return response.data;
  },

  referToSpecialist: async (queueItemId: string, referralData: {
    specialistId: string;
    notes?: string;
  }) => {
    const response = await getApi().post(`/Queue/${queueItemId}/refer-specialist`, {
      SpecialistId: referralData.specialistId,
      Notes: referralData.notes || ''
    });
    return response.data;
  },

  referToImaging: async (queueItemId: string, investigationType: string) => {
    const response = await getApi().post(`/Queue/${queueItemId}/refer-imaging`, {
      InvestigationType: investigationType
    });
    return response.data;
  },

  referToCounselor: async (queueItemId: string, reason: string) => {
    const response = await getApi().post(`/Queue/${queueItemId}/refer-counselor`, {
      Reason: reason
    });
    return response.data;
  },
};

// ==========================================
// Examination Draft & Auto-save API
// ==========================================
export const examinationDraftApi = {
  /**
   * Check if draft exists for this patient
   */
  getDraft: async (patientId: string, doctorId: string) => {
    const response = await getApi().get('/Examinations/draft', { 
      params: { patientId, doctorId } 
    });
    return response.data as ExaminationDraft | null;
  },

  /**
   * Save or update draft (auto-save every 30 seconds)
   */
  saveDraft: async (draft: Partial<ExaminationDraft>) => {
    const response = await getApi().post('/Examinations/draft', {
      ...draft,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
    return response.data as ExaminationDraft;
  },

  /**
   * Delete draft after completing examination
   */
  deleteDraft: async (draftId: string) => {
    const response = await getApi().delete(`/Examinations/draft/${draftId}`);
    return response.data;
  },

  /**
   * List all drafts for recovery (in case of crash)
   */
  listDrafts: async (doctorId: string) => {
    const response = await getApi().get('/Examinations/drafts', { 
      params: { doctorId } 
    });
    return response.data as ExaminationDraft[];
  },
};

// ==========================================
// Examination Completion & Retrieval API
// ==========================================
export const examinationApi = {
  /**
   * Get latest optometry examination for auto-import
   */
  getLatestOptometry: async (patientId: string) => {
    const response = await getApi().get('/Examinations/optometry/latest', { 
      params: { patientId } 
    });
    return response.data;
  },

  /**
   * Save complete doctor examination
   */
  saveExamination: async (examination: Partial<CompletedExamination>) => {
    const response = await getApi().post('/Examinations/doctor', examination);
    return response.data as CompletedExamination;
  },

  /**
   * Update existing examination
   */
  updateExamination: async (examinationId: string, data: Partial<CompletedExamination>) => {
    const response = await getApi().put(`/Examinations/doctor/${examinationId}`, data);
    return response.data;
  },

  /**
   * Get examination by ID
   */
  getExamination: async (examinationId: string) => {
    const response = await getApi().get(`/Examinations/doctor/${examinationId}`);
    return response.data as CompletedExamination;
  },

  /**
   * Get patient examination history
   */
  getPatientHistory: async (patientId: string, params?: { limit?: number; offset?: number }) => {
    const response = await getApi().get(`/Examinations/patient/${patientId}/history`, { params });
    return response.data as CompletedExamination[];
  },

  /**
   * Sign examination (digital signature)
   */
  signExamination: async (examinationId: string, signature: string) => {
    const response = await getApi().post(`/Examinations/doctor/${examinationId}/sign`, {
      signature,
      signedAt: new Date().toISOString()
    });
    return response.data;
  },

  /**
   * Finalize examination with PIN-based digital signature
   */
  finalize: async (examinationId: string, request: { pin: string; followUpDate?: string; followUpReason?: string }) => {
    const response = await getApi().post(`/Examinations/${examinationId}/finalize`, request);
    return response.data as {
      success: boolean;
      message: string;
      digitalSignature: string;
      signedAt: string;
      followUpAppointmentId?: string;
    };
  },
};

// ==========================================
// Prescription & Export API
// ==========================================
export const prescriptionApi = {
  /**
   * Generate prescription PDF
   */
  generatePDF: async (examinationId: string) => {
    const response = await getApi().get(`/Prescriptions/${examinationId}/pdf`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  /**
   * Print prescription
   */
  print: async (examinationId: string) => {
    const blob = await prescriptionApi.generatePDF(examinationId);
    const url = window.URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    printWindow?.print();
  },

  /**
   * Email prescription to patient
   */
  email: async (examinationId: string, emailAddress: string) => {
    const response = await getApi().post(`/Prescriptions/${examinationId}/email`, {
      emailAddress,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },

  /**
   * SMS prescription link
   */
  sms: async (examinationId: string, phoneNumber: string) => {
    const response = await getApi().post(`/Prescriptions/${examinationId}/sms`, {
      phoneNumber,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },
};

// ==========================================
// Report Generation API
// ==========================================
export const reportApi = {
  /**
   * Generate complete examination report
   */
  generateReport: async (examinationId: string, format: 'pdf' | 'docx') => {
    const response = await getApi().get(`/Reports/examination/${examinationId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  /**
   * Generate investigation orders (OCT, VF, etc.)
   */
  generateInvestigationOrder: async (examinationId: string, investigations: string[]) => {
    const response = await getApi().post(`/Reports/investigation-order`, {
      examinationId,
      investigations,
      timestamp: new Date().toISOString()
    }, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  /**
   * Generate referral letter
   */
  generateReferralLetter: async (examinationId: string, referralData: any) => {
    const response = await getApi().post(`/Reports/referral-letter`, {
      examinationId,
      ...referralData,
      timestamp: new Date().toISOString()
    }, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  /**
   * Generate medical certificate
   */
  generateMedicalCertificate: async (patientId: string, certificateData: {
    diagnosis: string;
    daysOfRest: number;
    fromDate: string;
    toDate: string;
    additionalNotes?: string;
  }) => {
    const response = await getApi().post(`/Reports/medical-certificate`, {
      patientId,
      ...certificateData,
      timestamp: new Date().toISOString()
    }, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  /**
   * Download report blob as file
   */
  downloadBlob: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
