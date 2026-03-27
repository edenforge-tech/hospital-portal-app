// Prescription Validation Types
// Phase 3: Drug Interaction Service & Prescription Safety

export interface ValidationError {
  errorType: 'contraindication' | 'allergy' | 'duplicate' | 'critical_interaction';
  medicationName: string;
  message: string;
  severity: string;
  conflictsWith: string;
  recommendation: string;
}

export interface ValidationWarning {
  warningType: 'interaction' | 'pregnancy' | 'monitoring' | 'duplicate';
  medicationName: string;
  message: string;
  severity: string;
  conflictsWith?: string;
  recommendation?: string;
  canOverride: boolean;
}

export interface DrugInteraction {
  id: string;
  drug1Name: string;
  drug2Name: string;
  severity: string;
  description: string;
  management: string;
  references?: string;
}

export interface PrescriptionValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  interactions: DrugInteraction[];
  requiresOverride: boolean;
}

export interface ValidatePrescriptionMedication {
  medicationName: string;
  eyeSpecificity?: 'OD' | 'OS' | 'OU' | 'Systemic';
  genericName?: string;
  route?: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
}

export interface ValidatePrescriptionRequest {
  patientId: string;
  medications: ValidatePrescriptionMedication[];
  checkAllergies?: boolean;
  checkInteractions?: boolean;
  checkContraindications?: boolean;
  checkDuplicates?: boolean;
}

export interface OphthalMedication {
  id: string;
  genericName: string;
  brandNames?: string[];
  drugClass: string;
  indications: string;
  contraindications?: string;
  warnings?: string;
  pregnancyCategory?: string;
  route?: string;
  commonSideEffects?: string[];
  seriousSideEffects?: string[];
}
