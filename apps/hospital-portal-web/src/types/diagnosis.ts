// Diagnosis Types - ICD-10 Codes
// Phase 3: Prescription & Clinical Examination

export interface DiagnosisCode {
  id: string;
  code: string;
  description: string;
  category: string;
  icdVersion: string;
  isOphthalmology: boolean;
  laterality?: 'OD' | 'OS' | 'OU' | null;
  commonUsage?: string;
  clinicalNotes?: string;
}

export interface PatientDiagnosis {
  id: string;
  patientId: string;
  diagnosisCodeId: string;
  diagnosisCode: DiagnosisCode;
  laterality: 'OD' | 'OS' | 'OU';
  isPrimary: boolean;
  diagnosedDate: string;
  diagnosedBy: string;
  diagnosedByUserName?: string;
  notes?: string;
  status: 'active' | 'resolved' | 'chronic';
}

export interface DiagnosisSearchResult {
  code: DiagnosisCode;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

export interface DiagnosisSuggestion {
  code: DiagnosisCode;
  reason: string;
  confidence: number;
  relatedCodes?: DiagnosisCode[];
}

export interface CreatePatientDiagnosisRequest {
  patientId: string;
  diagnosisCodeId: string;
  laterality: 'OD' | 'OS' | 'OU';
  isPrimary: boolean;
  notes?: string;
  status?: 'active' | 'resolved' | 'chronic';
}

export interface UpdatePatientDiagnosisRequest {
  laterality?: 'OD' | 'OS' | 'OU';
  isPrimary?: boolean;
  notes?: string;
  status?: 'active' | 'resolved' | 'chronic';
}
