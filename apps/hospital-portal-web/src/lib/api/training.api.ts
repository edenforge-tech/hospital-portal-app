import { getApi } from '../api';

// Types - Aligned with backend TrainingDto
export interface TrainingProgram {
  id: string;
  programName: string;
  programCode: string;
  description?: string;
  category: string;
  durationHours: number;
  provider?: string;
  cost?: number;
  maxParticipants?: number;
  status: 'Active' | 'Inactive' | 'Completed';
  startDate?: string;
  endDate?: string;
  location?: string;
  instructor?: string;
  certificateIssued: boolean;
  mandatoryForRoles?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingEnrollment {
  id: string;
  programId: string;
  programName?: string;
  employeeId: string;
  employeeName?: string;
  enrollmentDate: string;
  status: 'Enrolled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Failed';
  completionDate?: string;
  score?: number;
  certificateNumber?: string;
  certificateIssueDate?: string;
  feedback?: string;
  attendancePercentage?: number;
}

export interface CreateTrainingProgramRequest {
  programName: string;
  programCode: string;
  description?: string;
  category: string;
  durationHours: number;
  provider?: string;
  cost?: number;
  maxParticipants?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  instructor?: string;
  certificateIssued?: boolean;
  mandatoryForRoles?: string[];
}

export interface EnrollEmployeeRequest {
  employeeId: string;
  notes?: string;
}

export interface CompleteTrainingRequest {
  completionDate: string;
  score?: number;
  certificateNumber?: string;
  feedback?: string;
  attendancePercentage?: number;
}

export interface TrainingStatistics {
  totalPrograms: number;
  activePrograms: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageCompletionRate: number;
  upcomingPrograms: number;
}

/**
 * API client for training management operations
 */
export const trainingApi = {
  /**
   * Get all training programs
   */
  async getPrograms(params?: {
    status?: string;
    category?: string;
    search?: string;
  }) {
    const api = getApi();
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return api.get<TrainingProgram[]>(`/training/programs${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single training program by ID
   */
  async getProgramById(id: string) {
    const api = getApi();
    return api.get<TrainingProgram>(`/training/programs/${id}`);
  },

  /**
   * Create a new training program
   */
  async createProgram(data: CreateTrainingProgramRequest) {
    const api = getApi();
    return api.post<TrainingProgram>('/training/programs', data);
  },

  /**
   * Update an existing training program
   */
  async updateProgram(id: string, data: Partial<CreateTrainingProgramRequest>) {
    const api = getApi();
    return api.put<TrainingProgram>(`/training/programs/${id}`, data);
  },

  /**
   * Delete a training program
   */
  async deleteProgram(id: string) {
    const api = getApi();
    return api.delete(`/training/programs/${id}`);
  },

  /**
   * Enroll an employee in a training program
   */
  async enrollEmployee(programId: string, data: EnrollEmployeeRequest) {
    const api = getApi();
    return api.post<TrainingEnrollment>(`/training/${programId}/enroll`, data);
  },

  /**
   * Get all enrollments (optionally filtered)
   */
  async getEnrollments(params?: {
    programId?: string;
    employeeId?: string;
    status?: string;
  }) {
    const api = getApi();
    const queryParams = new URLSearchParams();
    if (params?.programId) queryParams.append('programId', params.programId);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return api.get<TrainingEnrollment[]>(`/training/enrollments${query ? `?${query}` : ''}`);
  },

  /**
   * Complete a training enrollment
   */
  async completeEnrollment(enrollmentId: string, data: CompleteTrainingRequest) {
    const api = getApi();
    return api.post<TrainingEnrollment>(`/training/enrollments/${enrollmentId}/complete`, data);
  },

  /**
   * Get training statistics
   */
  async getStatistics() {
    const api = getApi();
    return api.get<TrainingStatistics>('/training/statistics');
  },

  /**
   * Cancel an enrollment
   */
  async cancelEnrollment(enrollmentId: string, reason?: string) {
    const api = getApi();
    return api.post(`/training/enrollments/${enrollmentId}/cancel`, { reason });
  }
};
