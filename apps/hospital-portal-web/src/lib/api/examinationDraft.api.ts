/**
 * Examination Draft API
 * 
 * Manages saving and retrieving examination drafts from the backend.
 * Drafts are auto-saved every 30 seconds and expire after 24 hours.
 */

import { getApi } from '../api';

export interface ExaminationDraftData {
  patientId: string;
  doctorId: string;
  data: any; // JSON data containing all form fields
  expiresAt?: string;
}

export interface ExaminationDraft {
  id: string;
  patientId: string;
  doctorId: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export const examinationDraftApi = {
  /**
   * Save or update examination draft
   * POST /api/Examinations/draft
   */
  async saveDraft(draftData: ExaminationDraftData): Promise<ExaminationDraft> {
    const api = getApi();
    const response = await api.post<ExaminationDraft>('/Examinations/draft', draftData);
    return response.data;
  },

  /**
   * Get draft for a specific patient
   * GET /api/Examinations/draft/{patientId}
   */
  async getDraft(patientId: string): Promise<ExaminationDraft | null> {
    const api = getApi();
    try {
      const response = await api.get<ExaminationDraft>(`/Examinations/draft/${patientId}`);
      return response.data;
    } catch (error: any) {
      // Return null if no draft found (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Check if draft exists for patient
   * HEAD /api/Examinations/draft/{patientId}
   */
  async hasDraft(patientId: string): Promise<boolean> {
    const api = getApi();
    try {
      await api.head(`/Examinations/draft/${patientId}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      // If error is not 404, still return false but log
      console.error('Error checking draft existence:', error);
      return false;
    }
  },

  /**
   * Delete draft for a specific patient
   * DELETE /api/Examinations/draft/{patientId}
   */
  async deleteDraft(patientId: string): Promise<void> {
    const api = getApi();
    await api.delete(`/Examinations/draft/${patientId}`);
  },

  /**
   * Get all drafts for current doctor
   * GET /api/Examinations/drafts
   */
  async getAllDrafts(): Promise<ExaminationDraft[]> {
    const api = getApi();
    const response = await api.get<ExaminationDraft[]>('/Examinations/drafts');
    return response.data;
  },

  /**
   * Cleanup expired drafts (admin endpoint)
   * POST /api/Examinations/drafts/cleanup
   */
  async cleanupExpiredDrafts(): Promise<{ deletedCount: number }> {
    const api = getApi();
    const response = await api.post<{ deletedCount: number }>('/Examinations/drafts/cleanup');
    return response.data;
  },
};

export default examinationDraftApi;
