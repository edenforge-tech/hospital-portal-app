import { getApi } from '../api';
import type {
  VisualAcuityData,
  RetinoscopyData,
  RefractionData,
  TonometryData,
  AutoRefractionData,
  KeratometryData,
  PachymetryData,
  ColorVisionData,
  ContrastSensitivityData,
  VisualFieldData,
  SpectacleDispensingData,
  ContactLensData,
} from '../stores/clinical-store';

// Visual Acuity API
export const visualAcuityApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/visual-acuity/${patientId}`);
    return response.data;
  },
  
  save: async (data: VisualAcuityData) => {
    const response = await getApi().post('/clinical/examination/visual-acuity', data);
    return response.data;
  },
  
  update: async (id: string, data: VisualAcuityData) => {
    const response = await getApi().put(`/clinical/examination/visual-acuity/${id}`, data);
    return response.data;
  },
  
  getHistory: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/visual-acuity/${patientId}/history`);
    return response.data;
  },
};

// Retinoscopy API
export const retinoscopyApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/retinoscopy/${patientId}`);
    return response.data;
  },
  
  save: async (data: RetinoscopyData) => {
    const response = await getApi().post('/clinical/examination/retinoscopy', data);
    return response.data;
  },
  
  update: async (id: string, data: RetinoscopyData) => {
    const response = await getApi().put(`/clinical/examination/retinoscopy/${id}`, data);
    return response.data;
  },
};

// Refraction API
export const refractionApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/refraction/${patientId}`);
    return response.data;
  },
  
  save: async (data: RefractionData) => {
    const response = await getApi().post('/clinical/examination/refraction', data);
    return response.data;
  },
  
  update: async (id: string, data: RefractionData) => {
    const response = await getApi().put(`/clinical/examination/refraction/${id}`, data);
    return response.data;
  },
  
  getHistory: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/refraction/${patientId}/history`);
    return response.data;
  },
};

// Auto-Refraction API
export const autoRefractionApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/auto-refraction/${patientId}`);
    return response.data;
  },
  
  save: async (data: AutoRefractionData) => {
    const response = await getApi().post('/clinical/examination/auto-refraction', data);
    return response.data;
  },
  
  update: async (id: string, data: AutoRefractionData) => {
    const response = await getApi().put(`/clinical/examination/auto-refraction/${id}`, data);
    return response.data;
  },
};

// Keratometry API
export const keratometryApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/keratometry/${patientId}`);
    return response.data;
  },
  
  save: async (data: KeratometryData) => {
    const response = await getApi().post('/clinical/examination/keratometry', data);
    return response.data;
  },
  
  update: async (id: string, data: KeratometryData) => {
    const response = await getApi().put(`/clinical/examination/keratometry/${id}`, data);
    return response.data;
  },
};

// Pachymetry API
export const pachymetryApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/pachymetry/${patientId}`);
    return response.data;
  },
  
  save: async (data: PachymetryData) => {
    const response = await getApi().post('/clinical/examination/pachymetry', data);
    return response.data;
  },
  
  update: async (id: string, data: PachymetryData) => {
    const response = await getApi().put(`/clinical/examination/pachymetry/${id}`, data);
    return response.data;
  },
};

// Tonometry API
export const tonometryApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/tonometry/${patientId}`);
    return response.data;
  },
  
  save: async (data: TonometryData) => {
    const response = await getApi().post('/clinical/examination/tonometry', data);
    return response.data;
  },
  
  update: async (id: string, data: TonometryData) => {
    const response = await getApi().put(`/clinical/examination/tonometry/${id}`, data);
    return response.data;
  },
  
  getTrend: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/tonometry/${patientId}/trend`);
    return response.data;
  },
};

// Color Vision API
export const colorVisionApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/color-vision/${patientId}`);
    return response.data;
  },
  
  save: async (data: ColorVisionData) => {
    const response = await getApi().post('/clinical/examination/color-vision', data);
    return response.data;
  },
  
  update: async (id: string, data: ColorVisionData) => {
    const response = await getApi().put(`/clinical/examination/color-vision/${id}`, data);
    return response.data;
  },
};

// Contrast Sensitivity API
export const contrastSensitivityApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/contrast-sensitivity/${patientId}`);
    return response.data;
  },
  
  save: async (data: ContrastSensitivityData) => {
    const response = await getApi().post('/clinical/examination/contrast-sensitivity', data);
    return response.data;
  },
  
  update: async (id: string, data: ContrastSensitivityData) => {
    const response = await getApi().put(`/clinical/examination/contrast-sensitivity/${id}`, data);
    return response.data;
  },
};

// Visual Field API
export const visualFieldApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/visual-field/${patientId}`);
    return response.data;
  },
  
  save: async (data: VisualFieldData) => {
    const response = await getApi().post('/clinical/examination/visual-field', data);
    return response.data;
  },
  
  update: async (id: string, data: VisualFieldData) => {
    const response = await getApi().put(`/clinical/examination/visual-field/${id}`, data);
    return response.data;
  },
};

// Spectacle Dispensing API
export const spectacleDispensingApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/spectacle-dispensing/${patientId}`);
    return response.data;
  },
  
  save: async (data: SpectacleDispensingData) => {
    const response = await getApi().post('/clinical/examination/spectacle-dispensing', data);
    return response.data;
  },
  
  update: async (id: string, data: SpectacleDispensingData) => {
    const response = await getApi().put(`/clinical/examination/spectacle-dispensing/${id}`, data);
    return response.data;
  },
};

// Contact Lens API
export const contactLensApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/examination/contact-lens/${patientId}`);
    return response.data;
  },
  
  save: async (data: ContactLensData) => {
    const response = await getApi().post('/clinical/examination/contact-lens', data);
    return response.data;
  },
  
  update: async (id: string, data: ContactLensData) => {
    const response = await getApi().put(`/clinical/examination/contact-lens/${id}`, data);
    return response.data;
  },
};

// Imaging APIs
export const anteriorSegmentApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/imaging/anterior-segment/${patientId}`);
    return response.data;
  },
  save: async (data: any) => {
    const response = await getApi().post('/clinical/imaging/anterior-segment', data);
    return response.data;
  },
  update: async (data: any) => {
    const response = await getApi().put('/clinical/imaging/anterior-segment', data);
    return response.data;
  },
};

export const biometryApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/imaging/biometry/${patientId}`);
    return response.data;
  },
  save: async (data: any) => {
    const response = await getApi().post('/clinical/imaging/biometry', data);
    return response.data;
  },
  update: async (data: any) => {
    const response = await getApi().put('/clinical/imaging/biometry', data);
    return response.data;
  },
};

export const electrophysiologyApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/imaging/electrophysiology/${patientId}`);
    return response.data;
  },
  save: async (data: any) => {
    const response = await getApi().post('/clinical/imaging/electrophysiology', data);
    return response.data;
  },
  update: async (data: any) => {
    const response = await getApi().put('/clinical/imaging/electrophysiology', data);
    return response.data;
  },
};

export const fundusPhotographyApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/imaging/fundus-photography/${patientId}`);
    return response.data;
  },
  save: async (data: any) => {
    const response = await getApi().post('/clinical/imaging/fundus-photography', data);
    return response.data;
  },
  update: async (data: any) => {
    const response = await getApi().put('/clinical/imaging/fundus-photography', data);
    return response.data;
  },
};

export const topographyApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/imaging/topography/${patientId}`);
    return response.data;
  },
  save: async (data: any) => {
    const response = await getApi().post('/clinical/imaging/topography', data);
    return response.data;
  },
  update: async (data: any) => {
    const response = await getApi().put('/clinical/imaging/topography', data);
    return response.data;
  },
};

export const ultraWidefieldApi = {
  get: async (patientId: string) => {
    const response = await getApi().get(`/clinical/imaging/ultra-widefield/${patientId}`);
    return response.data;
  },
  save: async (data: any) => {
    const response = await getApi().post('/clinical/imaging/ultra-widefield', data);
    return response.data;
  },
  update: async (data: any) => {
    const response = await getApi().put('/clinical/imaging/ultra-widefield', data);
    return response.data;
  },
};

// Combined Examination API
export const examinationApi = {  visualAcuity: visualAcuityApi,
  retinoscopy: retinoscopyApi,
  refraction: refractionApi,
  autoRefraction: autoRefractionApi,
  keratometry: keratometryApi,
  pachymetry: pachymetryApi,
  tonometry: tonometryApi,
  colorVision: colorVisionApi,
  contrastSensitivity: contrastSensitivityApi,
  visualField: visualFieldApi,
  spectacleDispensing: spectacleDispensingApi,
  contactLens: contactLensApi,
};
