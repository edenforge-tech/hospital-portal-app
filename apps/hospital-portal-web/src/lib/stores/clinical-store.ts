import { create } from 'zustand';

// Core Examination Data Interfaces
export interface VisualAcuityData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  distanceVA: {
    OD: { unaided: string; aided?: string; pinhole?: string };
    OS: { unaided: string; aided?: string; pinhole?: string };
  };
  nearVA?: {
    OD: { unaided: string; aided?: string };
    OS: { unaided: string; aided?: string };
  };
  chart: 'Snellen' | 'LogMAR' | 'ETDRS' | 'Lea Symbols' | 'Cardiff Cards';
  testingDistance: string;
  notes?: string;
}

export interface RetinoscopyData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  OD: {
    sphere: number;
    cylinder?: number;
    axis?: number;
    workingDistance: number;
  };
  OS: {
    sphere: number;
    cylinder?: number;
    axis?: number;
    workingDistance: number;
  };
  illumination: 'Plane' | 'Streak';
  notes?: string;
}

export interface RefractionData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  startingRx: {
    source: 'Retinoscopy' | 'Auto-Refractor' | 'Previous Prescription' | 'Manual';
    OD: { sphere: number; cylinder?: number; axis?: number };
    OS: { sphere: number; cylinder?: number; axis?: number };
  };
  finalRx: {
    OD: {
      sphere: number;
      cylinder?: number;
      axis?: number;
      visualAcuity: string;
    };
    OS: {
      sphere: number;
      cylinder?: number;
      axis?: number;
      visualAcuity: string;
    };
  };
  nearRx?: {
    OD: { add: number; nearVA: string };
    OS: { add: number; nearVA: string };
  };
  previousRx?: {
    OD: { sphere: number; cylinder?: number; axis?: number };
    OS: { sphere: number; cylinder?: number; axis?: number };
    changeInSphere: number;
    changeInCylinder: number;
  };
  notes?: string;
}

export interface TonometryData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  method: 'Goldmann' | 'NCT' | 'Rebound' | 'Tonopen' | 'Perkins';
  measurementTime: Date;
  OD: {
    measuredIOP: number;
    correctedIOP?: number;
    repeatMeasurements?: number[];
  };
  OS: {
    measuredIOP: number;
    correctedIOP?: number;
    repeatMeasurements?: number[];
  };
  cctCorrectionApplied: boolean;
  cctOD?: number;
  cctOS?: number;
  glaucomaSuspectOD: boolean;
  glaucomaSuspectOS: boolean;
  hypotonyOD: boolean;
  hypotonyOS: boolean;
  isGlaucomaPatient: boolean;
  targetIOPOD?: number;
  targetIOPOS?: number;
  onGlaucomaMedication: boolean;
  notes?: string;
}

export interface AutoRefractionData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: {
    manufacturer: 'Nidek' | 'Topcon' | 'Zeiss' | 'Marco' | 'Manual';
    model: string;
  };
  OD: {
    sphere: number;
    cylinder: number;
    axis: number;
    pupilDiameter?: number;
  };
  OS: {
    sphere: number;
    cylinder: number;
    axis: number;
    pupilDiameter?: number;
  };
  keratometry?: {
    OD: { K1: number; K2: number; axis: number };
    OS: { K1: number; K2: number; axis: number };
  };
  isCycloplegic: boolean;
  cycloplegicAgent?: 'Atropine 1%' | 'Cyclopentolate 1%' | 'Tropicamide 1%';
  notes?: string;
}

export interface KeratometryData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  OD: {
    K1: number;
    K2: number;
    axis: number;
    astigmatism: number;
    astigmatismType: 'WTR' | 'ATR' | 'Oblique';
    averageK: number;
  };
  OS: {
    K1: number;
    K2: number;
    axis: number;
    astigmatism: number;
    astigmatismType: 'WTR' | 'ATR' | 'Oblique';
    averageK: number;
  };
  miresQuality: 'Good' | 'Fair' | 'Poor' | 'Distorted';
  forIOLCalculation: boolean;
  forContactLensFitting: boolean;
  keratoconusSuspectOD?: boolean;
  keratoconusSuspectOS?: boolean;
  notes?: string;
}

export interface PachymetryData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: 'Ultrasound' | 'OCT' | 'Scheimpflug' | 'Specular Microscopy';
  OD: {
    centralThickness: number;
    peripheralThickness?: {
      superior: number;
      inferior: number;
      nasal: number;
      temporal: number;
    };
    thinnestPoint?: number;
    residualStromalBed?: number;
  };
  OS: {
    centralThickness: number;
    peripheralThickness?: {
      superior: number;
      inferior: number;
      nasal: number;
      temporal: number;
    };
    thinnestPoint?: number;
    residualStromalBed?: number;
  };
  glaucomaRiskOD: boolean;
  glaucomaRiskOS: boolean;
  lasikSuitableOD: boolean;
  lasikSuitableOS: boolean;
  iopCorrectionFactorOD?: number;
  iopCorrectionFactorOS?: number;
  notes?: string;
}

export interface ColorVisionData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  ishiharaTest?: {
    platesRead: number;
    totalPlates: number;
    result: 'Normal' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia' | 'Achromatopsia';
    notes?: string;
  };
  farnsworthD15?: {
    errors: number;
    result: 'Normal' | 'Mild Deficiency' | 'Moderate Deficiency' | 'Severe Deficiency';
    type?: 'Protan' | 'Deutan' | 'Tritan';
    notes?: string;
  };
  HRR?: {
    result: 'Normal' | 'Protan' | 'Deutan' | 'Tritan';
    severity?: 'Mild' | 'Moderate' | 'Severe';
    notes?: string;
  };
  notes?: string;
}

export interface ContrastSensitivityData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  testType: 'Pelli-Robson' | 'Mars Letter' | 'CSV-1000' | 'Arden Grating';
  OD: {
    score: number;
    logCS?: number;
    interpretation: 'Normal' | 'Mild Reduction' | 'Moderate Reduction' | 'Severe Reduction';
  };
  OS: {
    score: number;
    logCS?: number;
    interpretation: 'Normal' | 'Mild Reduction' | 'Moderate Reduction' | 'Severe Reduction';
  };
  binocular?: {
    score: number;
    logCS?: number;
    interpretation: 'Normal' | 'Mild Reduction' | 'Moderate Reduction' | 'Severe Reduction';
  };
  testingDistance: string;
  lighting: 'Photopic' | 'Mesopic' | 'Scotopic';
  notes?: string;
}

export interface VisualFieldData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  testType: 'Confrontation' | 'Amsler Grid' | 'FDT' | 'Humphrey' | 'Goldmann';
  confrontationTest?: {
    OD: {
      superior: 'Normal' | 'Reduced' | 'Absent';
      inferior: 'Normal' | 'Reduced' | 'Absent';
      nasal: 'Normal' | 'Reduced' | 'Absent';
      temporal: 'Normal' | 'Reduced' | 'Absent';
    };
    OS: {
      superior: 'Normal' | 'Reduced' | 'Absent';
      inferior: 'Normal' | 'Reduced' | 'Absent';
      nasal: 'Normal' | 'Reduced' | 'Absent';
      temporal: 'Normal' | 'Reduced' | 'Absent';
    };
  };
  amslerGrid?: {
    OD: {
      result: 'Normal' | 'Metamorphopsia' | 'Scotoma' | 'Missing Lines';
      description?: string;
    };
    OS: {
      result: 'Normal' | 'Metamorphopsia' | 'Scotoma' | 'Missing Lines';
      description?: string;
    };
  };
  fdt?: {
    OD: {
      result: 'Normal' | 'Abnormal';
      defectType?: 'Central' | 'Peripheral' | 'Arcuate' | 'Altitudinal';
    };
    OS: {
      result: 'Normal' | 'Abnormal';
      defectType?: 'Central' | 'Peripheral' | 'Arcuate' | 'Altitudinal';
    };
  };
  notes?: string;
}

export interface SpectacleDispensingData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  prescription: {
    OD: {
      sphere: number;
      cylinder?: number;
      axis?: number;
      add?: number;
    };
    OS: {
      sphere: number;
      cylinder?: number;
      axis?: number;
      add?: number;
    };
    pupillaryDistance: number;
  };
  frameDetails?: {
    type: 'Full Rim' | 'Semi-Rimless' | 'Rimless';
    material: 'Metal' | 'Plastic' | 'Titanium' | 'TR-90';
    color: string;
  };
  lensDetails?: {
    material: 'CR-39' | 'Polycarbonate' | 'High Index' | 'Trivex';
    coating?: string[];
    type: 'Single Vision' | 'Bifocal' | 'Progressive' | 'Occupational';
  };
  notes?: string;
}

export interface ContactLensData {
  id?: string;
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  lensType: 'Soft' | 'RGP' | 'Hybrid' | 'Scleral';
  OD: {
    baseCurve: number;
    diameter: number;
    power: number;
    brand?: string;
  };
  OS: {
    baseCurve: number;
    diameter: number;
    power: number;
    brand?: string;
  };
  wearingSchedule?: string;
  replacementSchedule?: string;
  complications?: string[];
  notes?: string;
}

// Patient Interface
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  mrn: string;
}

// Clinical Store Interface
interface ClinicalStore {
  // Current Patient
  currentPatient: Patient | null;
  
  // Core Examination Data
  visualAcuity: VisualAcuityData | null;
  retinoscopy: RetinoscopyData | null;
  refraction: RefractionData | null;
  autoRefraction: AutoRefractionData | null;
  keratometry: KeratometryData | null;
  pachymetry: PachymetryData | null;
  tonometry: TonometryData | null;
  colorVision: ColorVisionData | null;
  contrastSensitivity: ContrastSensitivityData | null;
  visualField: VisualFieldData | null;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentPatient: (patient: Patient | null) => void;
  updateVisualAcuity: (data: VisualAcuityData | null) => void;
  updateRetinoscopy: (data: RetinoscopyData | null) => void;
  updateRefraction: (data: RefractionData | null) => void;
  updateAutoRefraction: (data: AutoRefractionData | null) => void;
  updateKeratometry: (data: KeratometryData | null) => void;
  updatePachymetry: (data: PachymetryData | null) => void;
  updateTonometry: (data: TonometryData | null) => void;
  updateColorVision: (data: ColorVisionData | null) => void;
  updateContrastSensitivity: (data: ContrastSensitivityData | null) => void;
  updateVisualField: (data: VisualFieldData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAllExaminations: () => void;
}

export const useClinicalStore = create<ClinicalStore>((set) => ({
  // Initial State
  currentPatient: null,
  visualAcuity: null,
  retinoscopy: null,
  refraction: null,
  autoRefraction: null,
  keratometry: null,
  pachymetry: null,
  tonometry: null,
  colorVision: null,
  contrastSensitivity: null,
  visualField: null,
  isLoading: false,
  error: null,
  
  // Actions
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  updateVisualAcuity: (data) => set({ visualAcuity: data }),
  updateRetinoscopy: (data) => set({ retinoscopy: data }),
  updateRefraction: (data) => set({ refraction: data }),
  updateAutoRefraction: (data) => set({ autoRefraction: data }),
  updateKeratometry: (data) => set({ keratometry: data }),
  updatePachymetry: (data) => set({ pachymetry: data }),
  updateTonometry: (data) => set({ tonometry: data }),
  updateColorVision: (data) => set({ colorVision: data }),
  updateContrastSensitivity: (data) => set({ contrastSensitivity: data }),
  updateVisualField: (data) => set({ visualField: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearAllExaminations: () => set({
    visualAcuity: null,
    retinoscopy: null,
    refraction: null,
    autoRefraction: null,
    keratometry: null,
    pachymetry: null,
    tonometry: null,
    colorVision: null,
    contrastSensitivity: null,
    visualField: null,
    error: null,
  }),
}));
