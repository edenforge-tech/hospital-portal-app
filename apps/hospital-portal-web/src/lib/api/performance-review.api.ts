import { getApi } from '../api';

// Types - Aligned with backend PerformanceReviewDto
export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName?: string;
  reviewerId: string;
  reviewerName?: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewType: string; // Annual, Mid-Year, Probation, etc.
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  overallScore?: number;
  weightedScore?: number;
  goals?: ReviewGoal[];
  competencies?: ReviewCompetency[];
  strengths?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  reviewerComments?: string;
  employeeComments?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewGoal {
  id?: string;
  goalDescription: string;
  targetMetric?: string;
  achievedMetric?: string;
  weight: number;
  score?: number;
  comments?: string;
}

export interface ReviewCompetency {
  id?: string;
  competencyName: string;
  description?: string;
  weight: number;
  score?: number;
  comments?: string;
}

export interface CreatePerformanceReviewRequest {
  employeeId: string;
  reviewerId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewType: string;
  goals?: ReviewGoal[];
  competencies?: ReviewCompetency[];
}

export interface UpdateReviewScoresRequest {
  goals?: ReviewGoal[];
  competencies?: ReviewCompetency[];
  strengths?: string;
  areasForImprovement?: string;
  developmentPlan?: string;
  reviewerComments?: string;
}

export interface SubmitForApprovalRequest {
  employeeComments?: string;
}

export interface ApproveReviewRequest {
  approved: boolean;
  approverComments?: string;
  requiresFollowUp?: boolean;
  followUpDate?: string;
}

export interface CompleteProbationRequest {
  passed: boolean;
  comments?: string;
  extendProbation?: boolean;
  extensionPeriodMonths?: number;
}

export interface ReviewStatisticsDto {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  averageScore: number;
  reviewsThisQuarter: number;
  reviewsDueThisMonth: number;
}

/**
 * API client for performance review operations
 */
export const performanceReviewApi = {
  /**
   * Create a new performance review
   */
  async create(data: CreatePerformanceReviewRequest) {
    const api = getApi();
    return api.post<PerformanceReview>('/PerformanceReview', data);
  },

  /**
   * Get a single performance review by ID
   */
  async getById(id: string) {
    const api = getApi();
    return api.get<PerformanceReview>(`/PerformanceReview/${id}`);
  },

  /**
   * Get all reviews for a specific employee
   */
  async getByEmployee(employeeId: string) {
    const api = getApi();
    return api.get<PerformanceReview[]>(`/PerformanceReview/employee/${employeeId}`);
  },

  /**
   * Get pending reviews (optionally filtered by reviewer)
   */
  async getPending(reviewerId?: string) {
    const api = getApi();
    const query = reviewerId ? `?reviewerId=${reviewerId}` : '';
    return api.get<PerformanceReview[]>(`/PerformanceReview/pending${query}`);
  },

  /**
   * Update review scores and comments
   */
  async updateScores(id: string, data: UpdateReviewScoresRequest) {
    const api = getApi();
    return api.put<PerformanceReview>(`/PerformanceReview/${id}/scores`, data);
  },

  /**
   * Submit review for approval
   */
  async submitForApproval(id: string, data: SubmitForApprovalRequest) {
    const api = getApi();
    return api.post<PerformanceReview>(`/PerformanceReview/${id}/submit`, data);
  },

  /**
   * Approve or reject a review
   */
  async approve(id: string, data: ApproveReviewRequest) {
    const api = getApi();
    return api.post<PerformanceReview>(`/PerformanceReview/${id}/approve`, data);
  },

  /**
   * Complete probation review
   */
  async completeProbation(id: string, data: CompleteProbationRequest) {
    const api = getApi();
    return api.post<PerformanceReview>(`/PerformanceReview/${id}/probation/complete`, data);
  },

  /**
   * Get review statistics
   */
  async getStatistics() {
    const api = getApi();
    return api.get<ReviewStatisticsDto>('/PerformanceReview/statistics');
  },

  /**
   * Get weighted score for a review
   */
  async getWeightedScore(id: string) {
    const api = getApi();
    return api.get<{ reviewId: string; weightedScore: number }>(`/PerformanceReview/${id}/weighted-score`);
  },

  /**
   * Delete a review (soft delete)
   */
  async delete(id: string) {
    const api = getApi();
    return api.delete(`/PerformanceReview/${id}`);
  }
};
