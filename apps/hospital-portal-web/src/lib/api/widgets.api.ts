/**
 * Widget Data API Service
 * Provides API functions for all widget data fetching
 */

import { getApi } from '../api';

// ============================================================================
// Patient Summary Widget API
// ============================================================================

export interface PatientSummaryData {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  email?: string;
  address: string;
  bloodGroup?: string;
  allergies?: string;
  chiefComplaint?: string;
  referralSource?: string;
  referredDate?: string;
}

export const getPatientSummary = async (patientId: string): Promise<PatientSummaryData> => {
  try {
    const response = await getApi().get(`/patients/${patientId}`);
    return response.data;
  } catch (error: any) {
    console.warn('Failed to fetch patient summary, using mock data:', error.message);
    // Return mock data for development/demo
    return {
      id: patientId,
      mrn: 'MRN00123',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      age: 65,
      gender: 'male',
      dateOfBirth: '1959-03-15',
      contactNumber: '+91 98765 43210',
      email: 'ramesh.kumar@email.com',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      bloodGroup: 'B+',
      allergies: 'None',
      chiefComplaint: 'Blurred vision in both eyes',
      referralSource: 'Dr. Sharma (Eye Consultant)',
      referredDate: new Date().toISOString(),
    };
  }
};

// ============================================================================
// Clinical Summary Widget API
// ============================================================================

export interface ClinicalSummaryData {
  diagnosis: string;
  icd10Code: string;
  referringDoctor?: string;
  referralDate?: string;
  chiefComplaint: string;
  visualAcuity: {
    rightEye: { distance: string; near: string };
    leftEye: { distance: string; near: string };
  };
  iop: {
    rightEye: number;
    leftEye: number;
  };
  cataractGrade?: {
    rightEye: string;
    leftEye: string;
  };
  allergies?: string[];
  comorbidities?: string[];
  currentMedications?: Array<{ name: string; dosage: string }>;
  lastExamDate?: string;
  lastExamFindings?: string;
}

export const getClinicalSummary = async (patientId: string): Promise<ClinicalSummaryData> => {
  try {
    // Fetch from examinations API - get latest examination for patient
    const response = await getApi().get(`/examinations/patient/${patientId}`);
    const examinations = response.data || [];
    
    // If no examinations, return minimal data
    if (!examinations.length) {
      throw new Error('No examinations found');
    }
    
    // Use latest examination
    const latest = examinations[0];
    return {
      diagnosis: latest.diagnosis || 'Not recorded',
      icd10Code: latest.icd10Code || '',
      referringDoctor: latest.referringDoctor,
      referralDate: latest.referralDate,
      chiefComplaint: latest.chiefComplaint || 'Not recorded',
      visualAcuity: latest.visualAcuity || {
        rightEye: { distance: '6/6', near: 'N6' },
        leftEye: { distance: '6/6', near: 'N6' },
      },
      iop: latest.iop || { rightEye: 15, leftEye: 15 },
      cataractGrade: latest.cataractGrade,
      allergies: latest.allergies?.split(',').map((a: string) => a.trim()) || [],
      comorbidities: latest.comorbidities?.split(',').map((c: string) => c.trim()) || [],
      currentMedications: latest.currentMedications || [],
      lastExamDate: latest.examinationDate,
      lastExamFindings: latest.findings,
    };
  } catch (error: any) {
    console.warn('Failed to fetch clinical summary, using mock data:', error.message);
    // Return mock data for development/demo
    return {
      diagnosis: 'Bilateral Cataract',
      icd10Code: 'H25.9',
      referringDoctor: 'Dr. Sharma',
      referralDate: new Date().toISOString(),
      chiefComplaint: 'Blurred vision in both eyes',
      visualAcuity: {
        rightEye: { distance: '6/18', near: 'N8' },
        leftEye: { distance: '6/24', near: 'N10' },
      },
      iop: {
        rightEye: 16,
        leftEye: 15,
      },
      cataractGrade: {
        rightEye: 'Grade 3 (NS)',
        leftEye: 'Grade 2-3 (NS)',
      },
      allergies: [],
      comorbidities: ['Type 2 Diabetes Mellitus', 'Hypertension'],
      currentMedications: [
        { name: 'Metformin', dosage: '500mg BD' },
        { name: 'Amlodipine', dosage: '5mg OD' },
      ],
      lastExamDate: new Date().toISOString(),
      lastExamFindings: 'Moderate nuclear sclerosis in both eyes',
    };
  }
};

// ============================================================================
// Package Selection Widget API
// ============================================================================

export interface Package {
  id: string;
  name: string;
  tier: 'Premium' | 'Standard' | 'Budget';
  basePrice: number;
  features: string[];
  iolIncluded: string;
  roomType: string;
  description: string;
}

export interface PackageAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const getPackages = async (): Promise<Package[]> => {
  try {
    // Try to fetch from backend first
    const response = await getApi().get('/package-management/templates');
    const packageData = response.data || [];
    
    if (packageData.length > 0) {
      console.log('✅ Package data loaded from backend:', packageData.length, 'items');
      
      // Transform backend data to frontend format
      return packageData.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.packageName || pkg.name,
        tier: pkg.basePrice >= 100000 ? 'Premium' : pkg.basePrice >= 60000 ? 'Standard' : 'Budget',
        basePrice: pkg.basePrice || pkg.price,
        iolIncluded: pkg.iolType || 'IOL Included',
        roomType: pkg.roomType || 'Semi-Private',
        description: pkg.description || `${pkg.name} cataract surgery package`,
        features: pkg.features ? pkg.features.split(',').map((f: string) => f.trim()) : [],
      }));
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch package data from backend, using fallback:', error);
  }
  
  // Fallback to hardcoded data for development/offline mode
  console.log('📋 Using fallback package data');
  return [
    // ── BUDGET PACKAGES ────────────────────────────────────────────────────────
    {
      id: 'pkg-mono-indian',
      name: 'Indian Monofocal Package',
      tier: 'Budget' as const,
      basePrice: 35000,
      iolIncluded: 'Indian Monofocal (Supraphob / Premium)',
      roomType: 'General Ward',
      description: 'Affordable cataract surgery with Indian monofocal lens (per eye)',
      features: [
        'Indian Monofocal IOL (Supraphob / Premium)',
        'General Ward (1 day)',
        'Standard pre-op tests',
        'Post-op care (1 month)',
        'Basic follow-up visits',
      ],
    },
    {
      id: 'pkg-mono-alcon-sp',
      name: 'Alcon SP / Sensor 1 Package',
      tier: 'Budget' as const,
      basePrice: 40000,
      iolIncluded: 'Imported Monofocal (Alcon SP / Sensor 1)',
      roomType: 'General Ward',
      description: 'Imported monofocal with proven reliability (per eye)',
      features: [
        'Imported Monofocal IOL (Alcon SP / Sensor 1)',
        'General Ward (1 day)',
        'Standard pre-op tests',
        'Post-op care (1 month)',
        'Follow-up visits',
      ],
    },
    // ── STANDARD PACKAGES ──────────────────────────────────────────────────────
    {
      id: 'pkg-mono-alcon-iq',
      name: 'Alcon IQ / Tecnis / Clareon Package',
      tier: 'Standard' as const,
      basePrice: 50000,
      iolIncluded: 'Imported Monofocal (Alcon IQ / Tecnis / Clareon)',
      roomType: 'Semi-Private Room',
      description: 'Premium aspheric monofocal for HD distance vision (per eye)',
      features: [
        'Aspheric Monofocal IOL (Alcon IQ / Tecnis / Clareon)',
        'Semi-Private Room (1 day)',
        'Essential pre-op tests',
        'Post-op care (6 weeks)',
        'Standard follow-up visits',
      ],
    },
    {
      id: 'pkg-mono-preload',
      name: 'Pre-Load Lens Package',
      tier: 'Standard' as const,
      basePrice: 55000,
      iolIncluded: 'Imported Monofocal Pre-Load Lens',
      roomType: 'Semi-Private Room',
      description: 'Pre-loaded IOL for precise, efficient surgery (per eye)',
      features: [
        'Pre-Load Monofocal IOL',
        'Semi-Private Room (1 day)',
        'Essential pre-op tests',
        'Post-op care (6 weeks)',
        'Standard follow-up visits',
      ],
    },
    {
      id: 'pkg-eyehance',
      name: 'Eye Hance Package (60cm Distance)',
      tier: 'Standard' as const,
      basePrice: 60000,
      iolIncluded: 'Eye Hance Extended Range IOL (J&J)',
      roomType: 'Semi-Private Room',
      description: 'Extended intermediate vision – ideal for computer users (per eye)',
      features: [
        'Eye Hance IOL (J&J) – 60cm working distance',
        'Semi-Private Room (1 day)',
        'Essential pre-op tests',
        'Post-op care (6 weeks)',
        'Reduced reading glass dependence',
      ],
    },
    {
      id: 'pkg-multi-indian',
      name: 'Indian Multifocal Package',
      tier: 'Standard' as const,
      basePrice: 60000,
      iolIncluded: 'Indian Multifocal IOL (33cm)',
      roomType: 'Semi-Private Room',
      description: 'Cost-effective multifocal for near + distance vision (per eye)',
      features: [
        'Indian Multifocal IOL (33cm reading)',
        'Semi-Private Room (1 day)',
        'Essential pre-op tests',
        'Post-op care (6 weeks)',
        'Near + distance vision',
      ],
    },
    {
      id: 'pkg-mono-toric',
      name: 'Monofocal Toric Package',
      tier: 'Standard' as const,
      basePrice: 70000,
      iolIncluded: 'Monofocal Toric Lens',
      roomType: 'Semi-Private Room',
      description: 'Astigmatism correction with clear distance vision (per eye)',
      features: [
        'Toric Monofocal IOL',
        'Semi-Private Room (1 day)',
        'Pre-op keratometry included',
        'Post-op care (6 weeks)',
        'Astigmatism correction',
      ],
    },
    {
      id: 'pkg-trifocal-indian',
      name: 'Indian Trifocal Package',
      tier: 'Standard' as const,
      basePrice: 70000,
      iolIncluded: 'Indian Trifocal IOL (33–60cm)',
      roomType: 'Semi-Private Room',
      description: 'Near + intermediate + distance vision (per eye)',
      features: [
        'Indian Trifocal IOL (33–60cm range)',
        'Semi-Private Room (1 day)',
        'Essential pre-op tests',
        'Post-op care (6 weeks)',
        'All-distance vision',
      ],
    },
    // ── PREMIUM PACKAGES ───────────────────────────────────────────────────────
    {
      id: 'pkg-multi-imported',
      name: 'Imported Multifocal Package (Zeiss / J&J)',
      tier: 'Premium' as const,
      basePrice: 95000,
      iolIncluded: 'Imported Multifocal IOL (Zeiss / J&J)',
      roomType: 'Private Room',
      description: 'Premium imported multifocal – near + distance (per eye)',
      features: [
        'Imported Multifocal IOL (Zeiss AT LISA / PanOptix)',
        'Private Room (2 days)',
        'All pre-op tests included',
        'Post-op care (3 months)',
        'Priority scheduling',
      ],
    },
    {
      id: 'pkg-multi-toric',
      name: 'Multifocal Toric Package (Zeiss / J&J)',
      tier: 'Premium' as const,
      basePrice: 120000,
      iolIncluded: 'Multifocal Toric IOL (Zeiss / J&J)',
      roomType: 'Private Room',
      description: 'Premium multifocal + astigmatism correction (per eye)',
      features: [
        'Multifocal Toric IOL (AT LISA T / PanOptix Toric)',
        'Private Room (2 days)',
        'All pre-op tests included',
        'Post-op care (3 months)',
        'Astigmatism + presbyopia correction',
      ],
    },
    {
      id: 'pkg-trifocal-imported',
      name: 'Imported Trifocal Package (Zeiss / Alcon / J&J)',
      tier: 'Premium' as const,
      basePrice: 120000,
      iolIncluded: 'Imported Trifocal IOL (Zeiss / Alcon / J&J)',
      roomType: 'Private Room',
      description: 'Best-in-class trifocal for all-distance vision (per eye)',
      features: [
        'Imported Trifocal IOL (AT LISA tri / PanOptix / Synergy)',
        'Private Room (2 days)',
        'All pre-op tests included',
        'Post-op care (3 months)',
        'Near + intermediate + distance vision',
      ],
    },
    {
      id: 'pkg-edof',
      name: 'EDOF Package (Vivity / PureSee)',
      tier: 'Premium' as const,
      basePrice: 120000,
      iolIncluded: 'Imported EDOF IOL (Vivity / PureSee)',
      roomType: 'Private Room',
      description: 'Extended depth of focus – minimal halos (per eye)',
      features: [
        'EDOF IOL (Alcon Vivity / Bausch+Lomb PureSee)',
        'Private Room (2 days)',
        'All pre-op tests included',
        'Post-op care (3 months)',
        'Minimal halos & glare',
      ],
    },
    {
      id: 'pkg-trifocal-toric',
      name: 'Trifocal Toric Package (Zeiss / Alcon / J&J)',
      tier: 'Premium' as const,
      basePrice: 150000,
      iolIncluded: 'Imported Trifocal Toric IOL (Zeiss / Alcon / J&J)',
      roomType: 'Private Deluxe Room',
      description: 'Astigmatism + all-distance vision – top-tier (per eye)',
      features: [
        'Trifocal Toric IOL (AT LISA tri T / PanOptix Toric)',
        'Private Deluxe Room (3 days)',
        'All pre-op tests included',
        'Post-op care (3 months)',
        'Astigmatism + full-range vision',
      ],
    },
    {
      id: 'pkg-edof-toric',
      name: 'EDOF Toric Package (Vivity Toric / PureSee Toric)',
      tier: 'Premium' as const,
      basePrice: 150000,
      iolIncluded: 'Imported EDOF Toric IOL (Vivity Toric / PureSee Toric)',
      roomType: 'Private Deluxe Room',
      description: 'Astigmatism + extended focus – best for night driving (per eye)',
      features: [
        'EDOF Toric IOL (Vivity Toric / PureSee Toric)',
        'Private Deluxe Room (3 days)',
        'All pre-op tests included',
        'Post-op care (3 months)',
        'Astigmatism + extended depth of focus',
      ],
    },
  ];
};

export const getPackageAddons = async (): Promise<PackageAddon[]> => {
  try {
    // Try to fetch from backend first
    const response = await getApi().get('/package-management/addons');
    const addonsData = response.data || [];
    
    if (addonsData.length > 0) {
      console.log('✅ Package addons loaded from backend:', addonsData.length, 'items');
      
      // Transform backend data to frontend format
      return addonsData.map((addon: any) => ({
        id: addon.id,
        name: addon.name || addon.addonName,
        price: addon.price || addon.addonPrice,
        description: addon.description || addon.addonDescription || '',
      }));
    }
    
    console.warn('⚠️ Backend returned empty addons list, using fallback data');
  } catch (error) {
    console.log('📋 Using fallback package addons data (backend not available)');
  }
  
  // Fallback hardcoded data
  return [
    { id: 'addon-toric', name: 'Toric IOL Upgrade', price: 25000, description: 'Corrects astigmatism' },
    { id: 'addon-room', name: 'Room Upgrade', price: 15000, description: 'Upgrade to better room' },
    { id: 'addon-care', name: 'Extended Care', price: 10000, description: 'Extended post-op visits' },
    { id: 'addon-transport', name: 'Transport Service', price: 5000, description: 'Pickup/drop service' },
  ];
};

// ============================================================================
// IOL Recommendation Widget API
// ============================================================================

export interface IOLType {
  id: string;
  name: string;
  type: 'Monofocal' | 'Multifocal' | 'Toric' | 'Premium' | 'Trifocal' | 'EDOF' | 'ICL';
  manufacturer: string;
  model: string;
  features: string[];
  costRange: { min: number; max: number };
  priceRange?: string;  // Optional formatted string like "₹25,000-40,000"
  benefits?: string[];  // Optional array of benefits
  limitations?: string[];  // Optional array of limitations
  needsGlasses: boolean;
  readingGlassesRequired?: boolean;  // Alias for needsGlasses
  bestFor: string[];
  recommended?: boolean;  // Optional recommendation flag
}

export interface BiometryData {
  eye: 'RE' | 'LE';
  k1: number;
  k2: number;
  axialLength: number;
  targetPower: number;
  acd: number;
  ltThickness: number;
}

export const getIOLRecommendations = async (): Promise<IOLType[]> => {
  try {
    // Try to fetch from backend first
    const response = await getApi().get('/iol-inventory/available');
    const iolData = response.data || [];
    
    if (iolData.length > 0) {
      console.log('✅ IOL data loaded from backend:', iolData.length, 'items');
      
      // Transform backend data to frontend format
      return iolData.map((iol: any) => ({
        id: iol.id,
        name: iol.name || iol.iolName,
        type: iol.type as IOLType['type'],
        manufacturer: iol.manufacturer,
        model: iol.model,
        features: iol.features ? iol.features.split(',').map((f: string) => f.trim()) : [],
        costRange: {
          min: iol.priceMin || iol.price_min || 15000,
          max: iol.priceMax || iol.price_max || 25000,
        },
        needsGlasses: iol.needsGlasses !== false,
        bestFor: iol.bestFor ? iol.bestFor.split(',').map((b: string) => b.trim()) : [],
        recommended: iol.isRecommended || iol.is_recommended || false,
      }));
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch IOL data from backend, using fallback:', error);
  }
  
  // Fallback to hardcoded data for development/offline mode
  console.log('📋 Using fallback IOL data');
  return [
    // ── MONOFOCAL: INDIAN ──────────────────────────────────────────────────
    {
      id: 'iol-mono-indian',
      name: 'Monofocal (Indian Lens)',
      type: 'Monofocal' as const,
      manufacturer: 'Indian',
      model: 'Supraphob / Premium',
      priceRange: '₹35,000 / eye',
      features: ['Single focus – distance', 'UV protection', 'Proven reliability', 'Cost-effective'],
      costRange: { min: 35000, max: 35000 },
      needsGlasses: true,
      readingGlassesRequired: true,
      bestFor: ['Distance vision', 'Budget-conscious', 'Simple lifestyle'],
      recommended: false,
    },
    // ── MONOFOCAL: IMPORTED BASIC ──────────────────────────────────────────
    {
      id: 'iol-mono-alcon-sp',
      name: 'Monofocal (Alcon SP / Sensor 1)',
      type: 'Monofocal' as const,
      manufacturer: 'Alcon',
      model: 'Alcon SP / Sensor 1',
      priceRange: '₹40,000 / eye',
      features: ['Imported quality', 'Single focus – distance', 'Proven optics', 'UV protection'],
      costRange: { min: 40000, max: 40000 },
      needsGlasses: true,
      readingGlassesRequired: true,
      bestFor: ['Distance vision', 'Reliable imported option'],
      recommended: false,
    },
    // ── MONOFOCAL: ALCON IQ / TECNIS / CLAREON ────────────────────────────
    {
      id: 'iol-mono-alcon-iq',
      name: 'Monofocal (Alcon IQ / Tecnis / Clareon)',
      type: 'Monofocal' as const,
      manufacturer: 'Alcon / J&J',
      model: 'Alcon IQ / Tecnis / Clareon',
      priceRange: '₹50,000 / eye',
      features: ['Aspheric optics', 'Reduced glare & halos', 'HD distance vision', 'Yellow blue-light filter'],
      costRange: { min: 50000, max: 50000 },
      needsGlasses: true,
      readingGlassesRequired: true,
      bestFor: ['HD distance vision', 'Night driving', 'Aspheric optics preference'],
      recommended: true,
    },
    // ── MONOFOCAL: PRE-LOAD ───────────────────────────────────────────────
    {
      id: 'iol-mono-preload',
      name: 'Monofocal Pre-Load Lens',
      type: 'Monofocal' as const,
      manufacturer: 'Various',
      model: 'Pre-Load Lens',
      priceRange: '₹55,000 / eye',
      features: ['Pre-loaded for easy insertion', 'Consistent surgical outcomes', 'Reduced insertion time', 'Premium quality'],
      costRange: { min: 55000, max: 55000 },
      needsGlasses: true,
      readingGlassesRequired: true,
      bestFor: ['Consistent outcomes', 'Ease of surgery'],
      recommended: false,
    },
    // ── MONOFOCAL: EYE HANCE (60cm) ──────────────────────────────────────
    {
      id: 'iol-mono-eyehance',
      name: 'Eye Hance (60cm Distance)',
      type: 'Monofocal' as const,
      manufacturer: 'Johnson & Johnson',
      model: 'Eye Hance',
      priceRange: '₹60,000 / eye',
      features: ['Extended intermediate vision', '60cm working distance', 'Reduced spectacle dependence', 'Premium aspheric optics'],
      costRange: { min: 60000, max: 60000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Computer users', 'Reading at 60 cm distance', 'Intermediate vision preference'],
      recommended: false,
    },
    // ── TORIC: MONOFOCAL ─────────────────────────────────────────────────
    {
      id: 'iol-mono-toric',
      name: 'Monofocal Toric Lens',
      type: 'Toric' as const,
      manufacturer: 'Various',
      model: 'Toric Lens',
      priceRange: '₹70,000 / eye',
      features: ['Astigmatism correction', 'Sharp distance vision', 'Stable axis positioning', 'Custom alignment'],
      costRange: { min: 70000, max: 70000 },
      needsGlasses: true,
      readingGlassesRequired: true,
      bestFor: ['Astigmatism patients', 'Clear distance vision without glasses'],
      recommended: false,
    },
    // ── MULTIFOCAL: INDIAN ───────────────────────────────────────────────
    {
      id: 'iol-multi-indian',
      name: 'Indian Multifocal (33cm)',
      type: 'Multifocal' as const,
      manufacturer: 'Indian',
      model: 'Indian Multifocal',
      priceRange: '₹60,000 / eye',
      features: ['Near + distance vision', '33cm reading distance', 'Reduced glass dependence', 'Cost-effective bifocal'],
      costRange: { min: 60000, max: 60000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Reading + distance vision', 'Budget multifocal option'],
      recommended: false,
    },
    // ── MULTIFOCAL: IMPORTED (Zeiss/J&J) ────────────────────────────────
    {
      id: 'iol-multi-imported',
      name: 'Imported Multifocal (Zeiss / J&J)',
      type: 'Multifocal' as const,
      manufacturer: 'Zeiss / J&J',
      model: 'AT LISA / PanOptix',
      priceRange: '₹95,000 / eye',
      features: ['Near + distance vision', 'Advanced diffractive optics', 'Reduced halos', 'Premium imported'],
      costRange: { min: 95000, max: 95000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Active lifestyle', 'Reading + distance', 'Premium expectations'],
      recommended: false,
    },
    // ── MULTIFOCAL TORIC (Zeiss/J&J) ────────────────────────────────────
    {
      id: 'iol-multi-toric',
      name: 'Multifocal Toric (Zeiss / J&J)',
      type: 'Toric' as const,
      manufacturer: 'Zeiss / J&J',
      model: 'AT LISA T / PanOptix Toric',
      priceRange: '₹1,20,000 / eye',
      features: ['Astigmatism + multifocal', 'Near + distance vision', 'Premium imported', 'Maximum independence'],
      costRange: { min: 120000, max: 120000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Astigmatism + presbyopia', 'Maximum spectacle independence'],
      recommended: false,
    },
    // ── TRIFOCAL: INDIAN ────────────────────────────────────────────────
    {
      id: 'iol-trifocal-indian',
      name: 'Indian Trifocal (33–60cm)',
      type: 'Trifocal' as const,
      manufacturer: 'Indian',
      model: 'Indian Trifocal',
      priceRange: '₹70,000 / eye',
      features: ['Near + intermediate + distance', '33–60cm range', 'Glasses-free lifestyle', 'Cost-effective trifocal'],
      costRange: { min: 70000, max: 70000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['All-distance vision', 'Active lifestyle on a budget'],
      recommended: false,
    },
    // ── TRIFOCAL: IMPORTED (Zeiss/Alcon/J&J) ────────────────────────────
    {
      id: 'iol-trifocal-imported',
      name: 'Imported Trifocal (Zeiss / Alcon / J&J)',
      type: 'Trifocal' as const,
      manufacturer: 'Zeiss / Alcon / J&J',
      model: 'AT LISA tri / PanOptix / Synergy',
      priceRange: '₹1,20,000 / eye',
      features: ['Near + intermediate + distance', 'Best-in-class optics', 'Minimal halos', 'Glasses-free lifestyle'],
      costRange: { min: 120000, max: 120000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Complete vision at all distances', 'Active professionals'],
      recommended: false,
    },
    // ── TRIFOCAL TORIC: IMPORTED (Zeiss/Alcon/J&J) ──────────────────────
    {
      id: 'iol-trifocal-toric',
      name: 'Imported Trifocal Toric (Zeiss / Alcon / J&J)',
      type: 'Trifocal' as const,
      manufacturer: 'Zeiss / Alcon / J&J',
      model: 'AT LISA tri T / PanOptix Toric',
      priceRange: '₹1,50,000 / eye',
      features: ['Astigmatism + trifocal', 'All-distance vision', 'Top-tier optics', 'Maximum independence'],
      costRange: { min: 150000, max: 150000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Astigmatism + all-distance vision', 'Premium expectations'],
      recommended: false,
    },
    // ── EDOF: IMPORTED (Vivity/PureSee) ─────────────────────────────────
    {
      id: 'iol-edof',
      name: 'Imported EDOF (Vivity / PureSee)',
      type: 'EDOF' as const,
      manufacturer: 'Alcon / Bausch+Lomb',
      model: 'Vivity / PureSee',
      priceRange: '₹1,20,000 / eye',
      features: ['Extended depth of focus', '40cm–distance range', 'Minimal halos & glare', 'Best for night drivers'],
      costRange: { min: 120000, max: 120000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Night drivers', 'Minimal halo preference', 'Extended intermediate vision'],
      recommended: false,
    },
    // ── EDOF TORIC: IMPORTED (Vivity Toric/PureSee Toric) ───────────────
    {
      id: 'iol-edof-toric',
      name: 'Imported EDOF Toric (Vivity Toric / PureSee Toric)',
      type: 'EDOF' as const,
      manufacturer: 'Alcon / Bausch+Lomb',
      model: 'Vivity Toric / PureSee Toric',
      priceRange: '₹1,50,000 / eye',
      features: ['Astigmatism + EDOF', 'Extended focus range', 'Minimal halos', 'Premium quality'],
      costRange: { min: 150000, max: 150000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['Astigmatism + extended focus', 'Night drivers with astigmatism'],
      recommended: false,
    },
    // ── ICL: NON-TORIC INDIAN ────────────────────────────────────────────
    {
      id: 'iol-icl-nontoric-indian',
      name: 'Non-Toric ICL (Indian)',
      type: 'ICL' as const,
      manufacturer: 'Indian',
      model: 'Non-Toric ICL',
      priceRange: '₹70,000 / eye',
      features: ['Implantable contact lens', 'No corneal tissue removal', 'Reversible procedure', 'High myopia correction'],
      costRange: { min: 70000, max: 70000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['High myopia (−6D to −20D)', 'Thin corneas', 'Younger patients'],
      recommended: false,
    },
    // ── ICL: NON-TORIC IMPORTED ──────────────────────────────────────────
    {
      id: 'iol-icl-nontoric-imported',
      name: 'Non-Toric ICL (Imported – STAAR Visian)',
      type: 'ICL' as const,
      manufacturer: 'STAAR Surgical',
      model: 'STAAR VISIAN ICL',
      priceRange: '₹90,000 / eye',
      features: ['Central port – no iridotomy needed', 'UV protection built-in', 'Reversible', 'Best optical quality'],
      costRange: { min: 90000, max: 90000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['High myopia', 'Best optical quality ICL'],
      recommended: false,
    },
    // ── ICL: TORIC INDIAN ────────────────────────────────────────────────
    {
      id: 'iol-icl-toric-indian',
      name: 'Toric ICL (Indian)',
      type: 'ICL' as const,
      manufacturer: 'Indian',
      model: 'Toric ICL',
      priceRange: '₹90,000 / eye',
      features: ['Astigmatism + myopia correction', 'Implantable lens', 'Reversible', 'High myopia + cylinder'],
      costRange: { min: 90000, max: 90000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['High myopia + astigmatism', 'Thin corneas'],
      recommended: false,
    },
    // ── ICL: TORIC IMPORTED ──────────────────────────────────────────────
    {
      id: 'iol-icl-toric-imported',
      name: 'Toric ICL (Imported – STAAR TICL)',
      type: 'ICL' as const,
      manufacturer: 'STAAR Surgical',
      model: 'STAAR VISIAN TICL',
      priceRange: '₹1,20,000 / eye',
      features: ['Premium toric ICL', 'Astigmatism + myopia', 'Central port technology', 'Best quality imported'],
      costRange: { min: 120000, max: 120000 },
      needsGlasses: false,
      readingGlassesRequired: false,
      bestFor: ['High myopia + astigmatism', 'Premium expectations'],
      recommended: false,
    },
  ];
};

export const getBiometryData = async (patientId: string): Promise<{ RE: BiometryData; LE: BiometryData }> => {
  // TODO: Replace with actual endpoint /biometry/patient/:id
  return {
    RE: { eye: 'RE', k1: 43.5, k2: 44.2, axialLength: 23.45, targetPower: 21.5, acd: 3.2, ltThickness: 4.5 },
    LE: { eye: 'LE', k1: 43.8, k2: 44.0, axialLength: 23.52, targetPower: 21.0, acd: 3.1, ltThickness: 4.6 },
  };
};

// ============================================================================
// Surgery Scheduling Widget API
// ============================================================================

export interface Surgeon {
  id: string;
  name: string;
  specialization: string;
  availability: string[];
  available?: boolean;  // Optional - whether surgeon is generally available
}

export interface SurgerySlot {
  date: string;
  slots: Array<{ time: string; available: boolean }>;
}

export const getSurgeons = async (): Promise<Surgeon[]> => {
  try {
    const response = await getApi().get('/users/surgeons');
    const surgeons = response.data || [];
    return surgeons.map((doc: any) => ({
      id: doc.id,
      name: doc.name || `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim(),
      specialization: doc.specialization || 'Ophthalmology',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      available: true,
    }));
  } catch (error: any) {
    console.warn('Failed to fetch surgeons from API:', error.message);
    // Return empty array so the scheduling widget still renders
    return [];
  }
};

export interface Nurse {
  id: string;
  name: string;
}

export const getNurses = async (): Promise<Nurse[]> => {
  try {
    const response = await getApi().get('/users/nurses');
    const nurses = response.data || [];
    return nurses.map((u: any) => ({
      id: u.id,
      name: u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    }));
  } catch (error: any) {
    console.warn('Failed to fetch nurses from API:', error.message);
    return [];
  }
};

export interface OtTheater {
  id: string;
  name: string;
  code?: string;
}

export const getOtTheaters = async (branchId: string): Promise<OtTheater[]> => {
  try {
    const response = await getApi().get('/otbooking/theaters', { params: { branchId } });
    const theaters = response.data || [];
    return theaters.map((t: any) => ({
      id: t.id,
      name: t.name || t.theaterName || t.theater_name || '',
      code: t.code || t.theaterCode || undefined,
    }));
  } catch (error: any) {
    console.warn('Failed to fetch OT theaters from API:', error.message);
    return [];
  }
};

export const getSurgeryAvailability = async (surgeonId: string, month: string): Promise<SurgerySlot[]> => {
  // TODO: Replace with /surgery/availability endpoint
  // For now, generate dummy availability
  const slots: SurgerySlot[] = [];
  const startDate = new Date(month);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    slots.push({
      date: date.toISOString().split('T')[0],
      slots: [
        { time: '08:00', available: Math.random() > 0.3 },
        { time: '10:00', available: Math.random() > 0.3 },
        { time: '14:00', available: Math.random() > 0.3 },
        { time: '16:00', available: Math.random() > 0.3 },
      ],
    });
  }
  
  return slots;
};

// ============================================================================
// Payment Summary Widget API
// ============================================================================

export interface PaymentSummaryData {
  packageAmount: number;
  addons: Array<{ name: string; amount: number }>;
  subtotal: number;
  discount: { type: string; amount: number };
  insuranceCoverage: { status: string; amount: number };
  totalPayable: number;
  advancePaid: number;
  balanceDue: number;
  dueDate?: string;
  paymentHistory: Array<{
    date: string;
    amount: number;
    mode: string;
    reference: string;
  }>;
}

export const getPaymentSummary = async (patientId: string): Promise<PaymentSummaryData> => {
  // TODO: Replace with /billing/patient/:id/summary
  try {
    const response = await getApi().get(`/opdbills`, { params: { patientId } });
    const bills = response.data?.bills || response.data || [];
    
    if (!bills.length) {
      return {
        packageAmount: 0,
        addons: [],
        subtotal: 0,
        discount: { type: 'None', amount: 0 },
        insuranceCoverage: { status: 'Not Applied', amount: 0 },
        totalPayable: 0,
        advancePaid: 0,
        balanceDue: 0,
        paymentHistory: [],
      };
    }
    
    // Aggregate billing data
    const totalAmount = bills.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
    const paidAmount = bills.reduce((sum: number, b: any) => sum + (b.paidAmount || 0), 0);
    
    return {
      packageAmount: totalAmount * 0.7,
      addons: [],
      subtotal: totalAmount,
      discount: { type: 'None', amount: 0 },
      insuranceCoverage: { status: 'Not Applied', amount: 0 },
      totalPayable: totalAmount,
      advancePaid: paidAmount,
      balanceDue: totalAmount - paidAmount,
      dueDate: bills[0]?.dueDate,
      paymentHistory: bills.map((b: any) => ({
        date: b.billDate,
        amount: b.paidAmount || 0,
        mode: b.paymentMode || 'Cash',
        reference: b.billNumber,
      })),
    };
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return {
      packageAmount: 0,
      addons: [],
      subtotal: 0,
      discount: { type: 'None', amount: 0 },
      insuranceCoverage: { status: 'Not Applied', amount: 0 },
      totalPayable: 0,
      advancePaid: 0,
      balanceDue: 0,
      paymentHistory: [],
    };
  }
};

// ============================================================================
// Document Viewer Widget API
// ============================================================================

export interface Document {
  id: string;
  name: string;
  type: string;
  category: 'referral' | 'lab-report' | 'imaging' | 'consent' | 'other';
  uploadedDate: string;
  uploadedAt?: Date;  // Optional Date format
  uploadedBy: string;
  fileUrl: string;
  url?: string;  // Alias for fileUrl
  fileSize: number;
  mimeType: string;
  pageCount?: number;  // Optional for PDFs
}

export const getPatientDocuments = async (patientId: string): Promise<Document[]> => {
  // TODO: Replace with /documents/patient/:id
  return [];
};

// ============================================================================
// Session Notes Widget API
// ============================================================================

export interface SessionNotesData {
  sessionId: string;
  notes: string;
  lastSaved?: string;
  templates: Array<{ id: string; name: string; content: string }>;
}

export const getSessionNotes = async (sessionId: string): Promise<SessionNotesData> => {
  // TODO: Replace with /sessions/:id/notes
  try {
    const response = await getApi().get(`/counseling/sessions/${sessionId}`);
    const session = response.data;
    
    return {
      sessionId,
      notes: session.additionalNotes || '',
      lastSaved: session.updatedAt,
      templates: [],
    };
  } catch (error) {
    return {
      sessionId,
      notes: '',
      templates: [],
    };
  }
};

export const saveSessionNotes = async (sessionId: string, notes: string): Promise<void> => {
  await getApi().put(`/counseling/sessions/${sessionId}`, { additionalNotes: notes });
};

// ============================================================================
// Pre-Op Checklist Widget API
// ============================================================================

export interface ChecklistItem {
  id: string;
  category: 'tests' | 'documents' | 'approvals' | 'instructions';
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: string | Date;  // Support both string and Date
  completedBy?: string;
  notes?: string;
  remarks?: string;  // Alias for notes
}

export const getPreOpChecklist = async (patientId: string): Promise<ChecklistItem[]> => {
  // TODO: Replace with /preop-checklist/patient/:id
  return [];
};

export const updateChecklistItem = async (patientId: string, itemId: string, completed: boolean): Promise<void> => {
  // TODO: Replace with actual endpoint
  await getApi().put(`/preop-checklist/${itemId}`, { completed });
};

// ============================================================================
// Admission Planning Widget API
// ============================================================================

export interface WardOption {
  id: string;
  name: string;
  type: 'General' | 'Semi-Private' | 'Private-Deluxe' | 'ICU';
  pricePerDay: number;
  available: boolean;
  amenities: string[];
  features?: string[];  // Alias for amenities
  bedsAvailable?: number;  // Optional number of beds available
}

export const getWardOptions = async (): Promise<WardOption[]> => {
  // TODO: Replace with /wards/available
  return [
    {
      id: 'ward-general',
      name: 'General Ward',
      type: 'General',
      pricePerDay: 2000,
      available: true,
      amenities: ['Shared room', 'Basic care', 'Visitor hours: 4-6 PM'],
    },
    {
      id: 'ward-semi',
      name: 'Semi-Private',
      type: 'Semi-Private',
      pricePerDay: 4000,
      available: true,
      amenities: ['2-bed room', 'AC', 'TV', 'Attached bath', 'Visitor hours: 10 AM-8 PM'],
    },
    {
      id: 'ward-deluxe',
      name: 'Private Deluxe',
      type: 'Private-Deluxe',
      pricePerDay: 8000,
      available: true,
      amenities: ['Single bed', 'AC', 'TV', 'Sofa', 'Mini fridge', 'Patient attendant bed', '24/7 visitors'],
    },
    {
      id: 'ward-icu',
      name: 'ICU',
      type: 'ICU',
      pricePerDay: 15000,
      available: false,
      amenities: ['Intensive monitoring', 'Ventilator', 'Cardiac monitoring', 'Dedicated nursing'],
    },
  ];
};

export const createAdmission = async (data: any): Promise<void> => {
  // TODO: Replace with /admissions endpoint
  await getApi().post('/admissions', data);
};

// ============================================================================
// Payment Collection Widget API
// ============================================================================

export const collectPayment = async (data: {
  patientId: string;
  amount: number;
  mode: string;
  transactionRef?: string;
  sessionId?: string;
}): Promise<any> => {
  // TODO: Replace with real payment API
  const response = await getApi().post('/payments/collect', data);
  return response.data;
};

// ============================================================================
// Insurance Pre-Auth Widget API
// ============================================================================

export interface PreAuthData {
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  companyName?: string;
  policyNumber?: string;
  approvedAmount?: number;
  requestedAmount?: number;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }>;
}

export const getPreAuthData = async (patientId: string): Promise<PreAuthData> => {
  try {
    const response = await getApi().get(`/insurance/preauth/${patientId}`);
    return response.data;
  } catch (err) {
    // Return default structure if endpoint doesn't exist
    return {
      status: 'pending',
      documents: [],
    };
  }
};

// ============================================================================
// Consent Signing Widget API
// ============================================================================

export interface ConsentForm {
  id: string;
  title: string;
  description: string;
  required: boolean;
  signed: boolean;
  signedAt?: string;
  signedBy?: string;
}

export const getConsentForms = async (patientId: string): Promise<ConsentForm[]> => {
  try {
    const response = await getApi().get(`/consents/patient/${patientId}`);
    return response.data;
  } catch (err) {
    // Return mock data if endpoint doesn't exist
    return [
      {
        id: 'consent1',
        title: 'Surgery Consent Form',
        description: 'Authorization for cataract surgery procedure',
        required: true,
        signed: false,
      },
      {
        id: 'consent2',
        title: 'Anesthesia Consent',
        description: 'Consent for anesthesia administration',
        required: true,
        signed: false,
      },
      {
        id: 'consent3',
        title: 'IOL Implant Consent',
        description: 'Consent for intraocular lens implantation',
        required: true,
        signed: false,
      },
      {
        id: 'consent4',
        title: 'Data Privacy Consent',
        description: 'Consent for medical data processing',
        required: true,
        signed: false,
      },
    ];
  }
};

// ============================================================================
// Post-Operative Care Widget APIs
// ============================================================================

export interface PostOpMilestone {
  id: string;
  day: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface PostOpFollowUpData {
  surgeryId: string;
  surgeryDate: string;
  surgeryType: string;
  currentDay: number;
  milestones: PostOpMilestone[];
  symptoms: {
    painLevel: number;
    visionClarity: string;
    discharge: string;
    complications?: string[];
  };
  photos: Array<{ id: string; url: string; uploadedAt: string; notes?: string }>;
  nextFollowUpDate?: string;
}

export const getPostOpFollowUp = async (surgeryId: string): Promise<PostOpFollowUpData> => {
  try {
    const response = await getApi().get(`/post-op-tracking/${surgeryId}`);
    return response.data;
  } catch (error) {
    // Mock data for development
    const surgeryDate = new Date();
    surgeryDate.setDate(surgeryDate.getDate() - 7);
    return {
      surgeryId,
      surgeryDate: surgeryDate.toISOString(),
      surgeryType: 'Cataract Surgery - Right Eye',
      currentDay: 7,
      milestones: [
        { id: '1', day: 1, title: 'Initial Check', description: 'Post-surgery assessment', completed: true, completedAt: new Date(surgeryDate.getTime() + 86400000).toISOString() },
        { id: '2', day: 3, title: 'Dressing Removal', description: 'Remove eye dressing', completed: true, completedAt: new Date(surgeryDate.getTime() + 259200000).toISOString() },
        { id: '3', day: 7, title: 'Vision Assessment', description: 'Check vision improvement', completed: false },
        { id: '4', day: 30, title: 'Final Check', description: 'Final post-op review', completed: false },
      ],
      symptoms: {
        painLevel: 2,
        visionClarity: 'Good',
        discharge: 'None',
        complications: [],
      },
      photos: [],
      nextFollowUpDate: new Date(surgeryDate.getTime() + 2592000000).toISOString(), // 30 days
    };
  }
};

export const updatePostOpMilestone = async (surgeryId: string, milestoneId: string, data: { completed: boolean; notes?: string }): Promise<void> => {
  await getApi().post(`/post-op-tracking/${surgeryId}/milestone/${milestoneId}`, data);
};

export const uploadPostOpPhoto = async (surgeryId: string, photo: File, notes?: string): Promise<void> => {
  const formData = new FormData();
  formData.append('photo', photo);
  if (notes) formData.append('notes', notes);
  await getApi().post(`/post-op-tracking/${surgeryId}/photo`, formData);
};

// Medication Schedule APIs

export interface MedicationDose {
  id: string;
  time: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  taken: boolean;
 takenAt?: string;
  skipped: boolean;
  skipReason?: string;
}

export interface MedicationScheduleData {
  patientId: string;
  date: string;
  doses: MedicationDose[];
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  nextRefillDate?: string;
}

export const getMedicationSchedule = async (patientId: string, date?: string): Promise<MedicationScheduleData> => {
  try {
    const dateParam = date || new Date().toISOString().split('T')[0];
    const response = await getApi().get(`/prescriptions/patient/${patientId}/active?date=${dateParam}`);
    return response.data;
  } catch (error) {
    // Mock data
    return {
      patientId,
      date: new Date().toISOString().split('T')[0],
      doses: [
        {
          id: '1',
          time: '08:00',
          medicationName: 'Moxifloxacin Eye Drops',
          dosage: '0.5% - 1 drop RE',
          instructions: 'Apply to right eye',
          taken: true,
          takenAt: '08:15',
          skipped: false,
        },
        {
          id: '2',
          time: '12:00',
          medicationName: 'Prednisolone Eye Drops',
          dosage: '1% - 1 drop RE',
          instructions: 'Anti-inflammatory',
          taken: false,
          skipped: false,
        },
        {
          id: '3',
          time: '20:00',
          medicationName: 'Moxifloxacin Eye Drops',
          dosage: '0.5% - 1 drop RE',
          instructions: 'Apply to right eye',
          taken: false,
          skipped: false,
        },
      ],
      adherenceRate: 95,
      totalDoses: 40,
      takenDoses: 38,
      missedDoses: 2,
      nextRefillDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    };
  }
};

export const logDoseTaken = async (patientId: string, doseId: string, taken: boolean, notes?: string): Promise<void> => {
  await getApi().post(`/prescriptions/${patientId}/dose-logged`, { doseId, taken, notes, timestamp: new Date().toISOString() });
};

export const getMedicationAdherence = async (patientId: string): Promise<{ adherenceRate: number; history: Array<{ date: string; rate: number }> }> => {
  try {
    const response = await getApi().get(`/prescriptions/${patientId}/adherence-report`);
    return response.data;
  } catch (error) {
    return { adherenceRate: 95, history: [] };
  }
};

// ============================================================================
// Patient Education Widget APIs
// ============================================================================

export interface EducationContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'article' | 'quiz';
  category: string;
  duration?: number;
  language: string;
  thumbnailUrl?: string;
  contentUrl: string;
  viewed: boolean;
  viewedAt?: string;
  completionRequired: boolean;
}

export interface EducationLibraryData {
  patientId: string;
  procedureType?: string;
  content: EducationContent[];
  completionRate: number;
  requiredContentCompleted: boolean;
}

export const getEducationLibrary = async (patientId: string, category?: string): Promise<EducationLibraryData> => {
  try {
    const response = await getApi().get(`/education/patient/${patientId}${category ? `?category=${category}` : ''}`);
    return response.data;
  } catch (error) {
    return {
      patientId,
      procedureType: 'Cataract Surgery',
      content: [
        {
          id: '1',
          title: 'Understanding Cataract Surgery',
          description: 'Complete guide to cataract surgery procedure',
          type: 'video',
          category: 'About Your Procedure',
          duration: 15,
          language: 'English',
          contentUrl: '/education/cataract-surgery-overview.mp4',
          viewed: true,
          viewedAt: new Date(Date.now() - 86400000).toISOString(),
          completionRequired: true,
        },
        {
          id: '2',
          title: 'Pre-Op Preparation Guide',
          description: 'What to do before your surgery',
          type: 'pdf',
          category: 'Pre-Op Preparation',
          duration: 10,
          language: 'English',
          contentUrl: '/education/pre-op-guide.pdf',
          viewed: false,
          completionRequired: true,
        },
      ],
      completionRate: 50,
      requiredContentCompleted: false,
    };
  }
};

export const trackContentViewed = async (patientId: string, contentId: string): Promise<void> => {
  await getApi().post(`/education/track-view`, { patientId, contentId, viewedAt: new Date().toISOString() });
};

export const submitEducationQuiz = async (patientId: string, contentId: string, answers: Record<string, string>): Promise<{ score: number; passed: boolean }> => {
  const response = await getApi().post(`/education/quiz/${contentId}/submit`, { patientId, answers });
  return response.data;
};

// Appointment Reminder APIs

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  doctorName: string;
  location: string;
  confirmed: boolean;
  remindersSent: number;
  canReschedule: boolean;
}

export const getAppointmentReminders = async (patientId: string): Promise<AppointmentReminder[]> => {
  try {
    const response = await getApi().get(`/appointments/patient/${patientId}/upcoming`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const confirmAppointment = async (appointmentId: string): Promise<void> => {
  await getApi().post(`/appointments/${appointmentId}/confirm`);
};

export const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string): Promise<void> => {
  await getApi().post(`/appointments/${appointmentId}/reschedule`, { newDate, newTime });
};

// ============================================================================
// Enhanced Clinical Widget APIs
// ============================================================================

export interface VitalsReading {
  id: string;
  measuredAt: string;
  bloodPressure: { systolic: number; diastolic: number };
  pulseRate: number;
  temperature: number;
  bloodGlucose?: number;
  oxygenSaturation?: number;
  weight?: number;
  heightCm?: number;
  measuredBy: string;
  notes?: string;
  flagged: boolean;
  flagReason?: string;
}

export const getVitalsHistory = async (patientId: string, limit: number = 10): Promise<VitalsReading[]> => {
  try {
    const response = await getApi().get(`/vitals/patient/${patientId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const recordVitals = async (patientId: string, vitals: Omit<VitalsReading, 'id' | 'measuredBy'>): Promise<void> => {
  await getApi().post(`/vitals/patient/${patientId}`, vitals);
};

// Medical History Timeline

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'diagnosis' | 'examination' | 'prescription' | 'surgery' | 'complication' | 'follow-up' | 'test-result';
  title: string;
  description: string;
  category: string;
  documents?: Array<{ id: string; name: string; url: string }>;
  relatedDoctorName?: string;
}

export const getMedicalHistoryTimeline = async (patientId: string, filters?: { type?: string; startDate?: string; endDate?: string }): Promise<TimelineEvent[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await getApi().get(`/medical-history/patient/${patientId}/timeline?${params}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Lab Test Integration

export interface LabTest {
  id: string;
  testName: string;
  testCode: string;
  category: string;
  status: 'ordered' | 'sample-collected' | 'processing' | 'ready' | 'delivered';
  orderedAt: string;
  sampleCollectedAt?: string;
  resultReadyAt?: string;
  priority: 'routine' | 'urgent' | 'stat';
}

export interface LabTestResult {
  id: string;
  testId: string;
  testName: string;
  parameterName: string;
  value: string | number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export const getLabTests = async (patientId: string): Promise<LabTest[]> => {
  try {
    const response = await getApi().get(`/lab-tests/patient/${patientId}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getLabTestResults = async (testId: string): Promise<LabTestResult[]> => {
  try {
    const response = await getApi().get(`/lab-tests/${testId}/results`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Imaging APIs

export interface ImagingStudy {
  id: string;
  studyType: string;
  modality: 'CT' | 'MRI' | 'X-RAY' | 'OCT' | 'FUNDUS' | 'ULTRASOUND' | 'DICOM';
  studyDate: string;
  bodyPart: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'reported';
  imageCount: number;
  reportUrl?: string;
  viewerUrl?: string;
}

export const createImagingOrder = async (patientId: string, orderData: { studyType: string; modality: string; bodyPart: string; reason: string }): Promise<string> => {
  const response = await getApi().post(`/imaging/orders`, { patientId, ...orderData });
  return response.data.orderId;
};

export const getImagingStudies = async (patientId: string): Promise<ImagingStudy[]> => {
  try {
    const response = await getApi().get(`/imaging/patient/${patientId}/studies`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const viewDicomImage = async (studyId: string): Promise<{ viewerUrl: string; images: Array<{ id: string; url: string; thumbnail: string }> }> => {
  try {
    const response = await getApi().get(`/imaging/studies/${studyId}/viewer`);
    return response.data;
  } catch (error) {
    return { viewerUrl: `/imaging/viewer/${studyId}`, images: [] };
  }
};

//  ============================================================================
// Financial & Admin Widget APIs
// ============================================================================

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  tpaName: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'submitted' | 'under-review' | 'additional-info-required' | 'approved' | 'rejected' | 'settled';
  submittedDate: string;
  lastUpdatedDate: string;
  expectedSettlementDate?: string;
  documents: Array<{ id: string; name: string; type: string; uploaded: boolean }>;
  rejectionReason?: string;
}

export const getInsuranceClaimStatus = async (patientId: string): Promise<InsuranceClaim[]> => {
  try {
    const response = await getApi().get(`/insurance/claims/patient/${patientId}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const submitInsuranceClaim = async (patientId: string, claimData: { tpaName: string; policyNumber: string; claimAmount: number; documents: string[] }): Promise<string> => {
  const response = await getApi().post(`/insurance/claims`, { patientId, ...claimData });
  return response.data.claimId;
};

export const uploadClaimDocument = async (claimId: string, document: File, documentType: string): Promise<void> => {
  const formData = new FormData();
  formData.append('document', document);
  formData.append('type', documentType);
  await getApi().post(`/insurance/claims/${claimId}/documents`, formData);
};

// Billing & Payment Plan

export interface BillingStatement {
  id: string;
  patientId: string;
  totalAmount: number;
  insuranceCovered: number;
  patientResponsibility: number;
  paidAmount: number;
  balanceDue: number;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    referenceNumber: string;
  }>;
  invoiceUrl?: string;
}

export interface PaymentPlan {
  id: string;
  totalAmount: number;
  downPayment: number;
  installments: number;
  installmentAmount: number;
  frequency: 'weekly' | 'monthly';
  startDate: string;
  schedule: Array<{
    number: number;
    dueDate: string;
    amount: number;
    paid: boolean;
    paidDate?: string;
  }>;
}

export const getBillingStatement = async (patientId: string): Promise<BillingStatement> => {
  try {
    const response = await getApi().get(`/billing/patient/${patientId}/statement`);
    return response.data;
  } catch (error) {
    // Mock data
    return {
      id: '1',
      patientId,
      totalAmount: 150000,
      insuranceCovered: 100000,
      patientResponsibility: 50000,
      paidAmount: 20000,
      balanceDue: 30000,
      lineItems: [
        { id: '1', description: 'Cataract Surgery - Right Eye', quantity: 1, unitPrice: 75000, totalPrice: 75000, category: 'Surgery' },
      ],
      payments: [],
      invoiceUrl: '/invoices/INV-2026-001234.pdf',
    };
  }
};

export const createPaymentPlan = async (patientId: string, planData: { totalAmount: number; downPayment: number; installments: number; frequency: string }): Promise<PaymentPlan> => {
  const response = await getApi().post(`/billing/patient/${patientId}/payment-plan`, planData);
  return response.data;
};

export const processPayment = async (patientId: string, paymentData: { amount: number; method: string; notes?: string }): Promise<{ receiptUrl: string; transactionId: string }> => {
  const response = await getApi().post(`/billing/patient/${patientId}/payment`, paymentData);
  return response.data;
};

// Referral Management

export interface Referral {
  id: string;
  patientId: string;
  referredTo: {
    name: string;
    specialty: string;
    facility: string;
    contactNumber: string;
  };
  referredBy: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  referralDate: string;
  appointmentDate?: string;
  notes?: string;
  documents: Array<{ id: string; name: string; url: string }>;
  followUpRequired: boolean;
}

export const createReferral = async (patientId: string, referralData: Omit<Referral, 'id' | 'status' | 'referralDate'>): Promise<string> => {
  const response = await getApi().post(`/referrals`, { patientId, ...referralData });
  return response.data.referralId;
};

export const getReferralStatus = async (patientId: string): Promise<Referral[]> => {
  try {
    const response = await getApi().get(`/referrals/patient/${patientId}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Patient Feedback

export interface PatientFeedback {
  id: string;
  patientId: string;
  sessionId?: string;
  feedbackDate: string;
  rating: number;
  npsScore: number;
  categories: {
    staff: number;
    facility: number;
    treatment: number;
    waitingTime: number;
  };
  comments: string;
  complaint: boolean;
  complaintCategory?: string;
  complaintResolved?: boolean;
}

export const getPatientFeedback = async (patientId: string): Promise<PatientFeedback[]> => {
  try {
    const response = await getApi().get(`/feedback/patient/${patientId}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const submitFeedback = async (patientId: string, feedbackData: Omit<PatientFeedback, 'id' | 'feedbackDate'>): Promise<void> => {
  await getApi().post(`/feedback`, { patientId, ...feedbackData });
};

// ============================================================================
// Advanced Features Widget APIs
// ============================================================================

export interface TelemedicineSession {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  meetingUrl: string;
  recordingUrl?: string;
  notes?: string;
}

export const startTelemedicineCall = async (patientId: string, doctorId: string): Promise<TelemedicineSession> => {
  const response = await getApi().post(`/telemedicine/start`, { patientId, doctorId });
  return response.data;
};

export const endTelemedicineCall = async (sessionId: string, notes?: string): Promise<void> => {
  await getApi().post(`/telemedicine/${sessionId}/end`, { notes });
};

// Treatment Plan Comparison

export interface TreatmentOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  insuranceCovered: boolean;
  successRate: number;
  recoveryTime: string;
  risks: string[];
  benefits: string[];
  recommended: boolean;
}

export const getTreatmentOptions = async (patientId: string, condition: string): Promise<TreatmentOption[]> => {
  try {
    const response = await getApi().get(`/treatment-plans/patient/${patientId}?condition=${condition}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const compareTreatmentPlans = async (planIds: string[]): Promise<{ comparison: Record<string, any>; recommendation: string }> => {
  const response = await getApi().post(`/treatment-plans/compare`, { planIds });
  return response.data;
};

export const selectTreatmentPlan = async (patientId: string, planId: string): Promise<void> => {
  await getApi().post(`/treatment-plans/select`, { patientId, planId });
};

// Smart Workflow Assistant

export interface WorkflowSuggestion {
  id: string;
  type: 'info' | 'warning' | 'action' | 'recommendation';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

export const getWorkflowSuggestions = async (sessionId: string, currentStage: string): Promise<WorkflowSuggestion[]> => {
  try {
    const response = await getApi().get(`/workflow-assistant/suggestions?sessionId=${sessionId}&stage=${currentStage}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const logWorkflowAction = async (sessionId: string, action: string, data?: Record<string, any>): Promise<void> => {
  await getApi().post(`/workflow-assistant/log`, { sessionId, action, data, timestamp: new Date().toISOString() });
};

// ============================================================================
// Export all APIs
// ============================================================================

export const widgetsApi = {
  // Patient Context
  getPatientSummary,
  
  // Clinical
  getClinicalSummary,
  getPackages,
  getPackageAddons,
  getIOLRecommendations,
  getBiometryData,
  getSurgeons,
  getSurgeryAvailability,
  
  // Financial
  getPaymentSummary,
  collectPayment,
  
  // Documentation
  getPatientDocuments,
  getSessionNotes,
  saveSessionNotes,
  
  // Insurance & Consent
  getPreAuthData,
  getConsentForms,
  
  // Post-Session
  getPreOpChecklist,
  updateChecklistItem,
  getWardOptions,
  createAdmission,
  
  // Post-Operative Care
  getPostOpFollowUp,
  updatePostOpMilestone,
  uploadPostOpPhoto,
  getMedicationSchedule,
  logDoseTaken,
  getMedicationAdherence,
  
  // Patient Education
  getEducationLibrary,
  trackContentViewed,
  submitEducationQuiz,
  getAppointmentReminders,
  confirmAppointment,
  rescheduleAppointment,
  
  // Enhanced Clinical
  getVitalsHistory,
  recordVitals,
  getMedicalHistoryTimeline,
  getLabTests,
  getLabTestResults,
  createImagingOrder,
  getImagingStudies,
  viewDicomImage,
  
  // Financial & Admin
  getInsuranceClaimStatus,
  submitInsuranceClaim,
  uploadClaimDocument,
  getBillingStatement,
  createPaymentPlan,
  processPayment,
  createReferral,
  getReferralStatus,
  getPatientFeedback,
  submitFeedback,
  
  // Advanced Features
  startTelemedicineCall,
  endTelemedicineCall,
  getTreatmentOptions,
  compareTreatmentPlans,
  selectTreatmentPlan,
  getWorkflowSuggestions,
  logWorkflowAction,
};
