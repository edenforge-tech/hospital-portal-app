import { getApi } from '../api';

// ==========================================
// Optometrist Queue & Workflow API
// ==========================================

export interface OptometryQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: string;
  tokenNumber: string;
  appointmentTime: string;
  chiefComplaint: string;
  source: 'OPD' | 'Walk-in' | 'Post-Op' | 'Follow-up';
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Referred' | 'Skipped';
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  assignedOptometrist?: string;
  waitingSince?: string;
  completedExams: string[];
  hasRedFlags: boolean;
  redFlags?: string[];
  // Optometry summary (populated after exams)
  visualAcuityOD?: string;
  visualAcuityOS?: string;
  iopOD?: number;
  iopOS?: number;
  refractionCompleted?: boolean;
}

export interface OptometryQueueStats {
  totalWaiting: number;
  inProgress: number;
  completed: number;
  referred: number;
  emergencyCount: number;
  urgentCount: number;
  averageWaitTime: number; // minutes
}

export interface PatientEducationRecord {
  id?: string;
  patientId: string;
  visitId?: string;
  spectacleRecommendation?: {
    wearType: 'Full-time' | 'Distance only' | 'Reading only' | 'As needed';
    lensType: 'Single Vision' | 'Bifocal' | 'Progressive' | 'Computer/Intermediate';
    coatings: string[];
    specialInstructions?: string;
  };
  contactLensGuidance?: {
    wearSchedule: string;
    cleaningInstructions: string;
    followUpSchedule: string;
    warningSignsExplained: boolean;
  };
  opticalShopReferral?: {
    referred: boolean;
    referredAt?: string;
    prescriptionAttached: boolean;
    notes?: string;
  };
  generalEducation?: {
    eyeHygiene: boolean;
    screenTimeGuidance: boolean;
    uvProtection: boolean;
    dietaryAdvice: boolean;
    exerciseGuidance: boolean;
    notes?: string;
  };
  educatedBy: string;
  educatedAt: string;
  patientAcknowledged: boolean;
  notes?: string;
}

export interface DoctorReferral {
  id?: string;
  patientId: string;
  visitId?: string;
  referredByOptometristId: string;
  referredByOptometristName?: string;
  referredToDoctorId?: string;
  referredToDoctorName?: string;
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  reason: string;
  alerts: string[];
  optometrySummary: {
    visualAcuity?: { od: string; os: string };
    refraction?: { 
      od: { sphere: number; cylinder?: number; axis?: number };
      os: { sphere: number; cylinder?: number; axis?: number };
    };
    iop?: { od: number; os: number; method: string };
    keratometry?: { od: string; os: string };
    pachymetry?: { od: number; os: number };
    additionalFindings?: string;
  };
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  referredAt: string;
  acceptedAt?: string;
  completedAt?: string;
  doctorNotes?: string;
}

export interface OptometryCompleteSummary {
  patientId: string;
  visitDate: string;
  visualAcuity?: {
    distanceOD: string;
    distanceOS: string;
    nearOD?: string;
    nearOS?: string;
    pinholeOD?: string;
    pinholeOS?: string;
  };
  refraction?: {
    finalRxOD: { sphere: number; cylinder?: number; axis?: number };
    finalRxOS: { sphere: number; cylinder?: number; axis?: number };
    nearAddOD?: number;
    nearAddOS?: number;
  };
  tonometry?: {
    iopOD: number;
    iopOS: number;
    method: string;
    time: string;
  };
  keratometry?: {
    k1OD: number; k2OD: number; axisOD: number;
    k1OS: number; k2OS: number; axisOS: number;
  };
  pachymetry?: {
    cctOD: number;
    cctOS: number;
  };
  colorVision?: { result: string };
  contrastSensitivity?: { result: string };
  visualField?: { result: string; flaggedForPerimetry: boolean };
  alerts: string[];
  completedExams: string[];
  overallStatus: 'Complete' | 'Partial' | 'Pending';
}

// ==========================================
// Queue Management API
// ==========================================
export const optometryQueueApi = {
  getQueue: async (params?: { status?: string; urgency?: string; date?: string }) => {
    const response = await getApi().get('/Queue', { params: { ...params, department: 'optometry' } });
    return response.data;
  },

  getStats: async () => {
    const response = await getApi().get('/Queue/statistics', { params: { department: 'optometry' } });
    return response.data;
  },

  callNext: async () => {
    const response = await getApi().post('/Queue/call-next', { department: 'optometry' });
    return response.data;
  },

  updateStatus: async (queueItemId: string, status: string) => {
    const response = await getApi().put(`/Queue/${queueItemId}/status`, { status });
    return response.data;
  },

  skipPatient: async (queueItemId: string, reason: string) => {
    const response = await getApi().post(`/Queue/${queueItemId}/skip`, { reason });
    return response.data;
  },
};

// ==========================================
// Patient Education API
// ==========================================
export const patientEducationApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/patient-education/${patientId}`);
    return response.data;
  },

  save: async (data: PatientEducationRecord) => {
    const response = await getApi().post('/clinical/patient-education', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PatientEducationRecord>) => {
    const response = await getApi().put(`/clinical/patient-education/${id}`, data);
    return response.data;
  },

  sendToOpticalShop: async (patientId: string, prescriptionData: any) => {
    const response = await getApi().post(`/clinical/patient-education/${patientId}/optical-referral`, prescriptionData);
    return response.data;
  },
};

// ==========================================
// Referral to Doctor API
// ==========================================
export const doctorReferralApi = {
  create: async (data: DoctorReferral) => {
    const response = await getApi().post('/clinical/referral/doctor', data);
    return response.data;
  },

  get: async (referralId: string) => {
    const response = await getApi().get(`/clinical/referral/doctor/${referralId}`);
    return response.data;
  },

  getByPatient: async (patientId: string) => {
    const response = await getApi().get(`/clinical/referral/doctor/patient/${patientId}`);
    return response.data;
  },

  getPendingForDoctor: async (doctorId?: string) => {
    const response = await getApi().get('/clinical/referral/doctor/pending', { params: { doctorId } });
    return response.data;
  },

  updateStatus: async (referralId: string, status: string, notes?: string) => {
    const response = await getApi().put(`/clinical/referral/doctor/${referralId}/status`, { status, notes });
    return response.data;
  },
};

// ==========================================
// Optometry Complete Summary API  
// ==========================================
export const optometrySummaryApi = {
  getCompleteSummary: async (patientId: string): Promise<OptometryCompleteSummary> => {
    const response = await getApi().get(`/clinical/optometry/summary/${patientId}`);
    return response.data;
  },

  getExamStatus: async (patientId: string) => {
    const response = await getApi().get(`/clinical/optometry/status/${patientId}`);
    return response.data;
  },
};
