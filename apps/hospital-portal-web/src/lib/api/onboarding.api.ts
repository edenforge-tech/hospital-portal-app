import { getApi } from '../api';

// Enums
export enum OnboardingWorkflowStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum ChecklistItemStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Skipped = 'Skipped'
}

export enum ChecklistItemType {
  Document = 'Document',
  Training = 'Training',
  Task = 'Task',
  Approval = 'Approval',
  Orientation = 'Orientation',
  SystemAccess = 'SystemAccess'
}

export enum AccessLevel {
  None = 'None',
  Day1 = 'Day1',
  Day7 = 'Day7',
  Day30 = 'Day30',
  Full = 'Full'
}

// Interfaces
export interface OnboardingWorkflowDto {
  id: string;
  userId: string;
  userName: string;
  employeeId?: string;
  employeeName?: string;
  departmentId?: string;
  departmentName?: string;
  roleId?: string;
  roleName?: string;
  status: OnboardingWorkflowStatus;
  startDate: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  progressPercentage: number;
  mentorId?: string;
  mentorName?: string;
  currentAccessLevel: AccessLevel;
  day1AccessGrantedAt?: string;
  day7AccessGrantedAt?: string;
  day30AccessGrantedAt?: string;
  fullAccessGrantedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemDto {
  id: string;
  workflowId: string;
  itemName: string;
  itemDescription?: string;
  itemType: ChecklistItemType;
  isRequired: boolean;
  dayNumber: number;
  status: ChecklistItemStatus;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  notes?: string;
  documentPath?: string;
  order: number;
}

export interface OnboardingStatsDto {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  cancelledWorkflows: number;
  averageCompletionDays: number;
  pendingChecklistItems: number;
  completionRate: number;
}

export interface AccessLevelProgress {
  workflowId: string;
  currentAccessLevel: AccessLevel;
  day1Eligible: boolean;
  day7Eligible: boolean;
  day30Eligible: boolean;
  fullEligible: boolean;
  day1AccessGrantedAt?: string;
  day7AccessGrantedAt?: string;
  day30AccessGrantedAt?: string;
  fullAccessGrantedAt?: string;
}

// Request DTOs
export interface CreateOnboardingWorkflowRequest {
  userId: string;
  employeeId?: string;
  departmentId?: string;
  roleId?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  mentorId?: string;
}

export interface UpdateProgressRequest {
  progressPercentage: number;
  notes?: string;
}

export interface CompleteChecklistItemRequest {
  notes?: string;
  documentPath?: string;
}

export interface AssignMentorRequest {
  mentorId: string;
}

export interface GrantAccessRequest {
  accessLevel: AccessLevel;
}

/**
 * Onboarding API Client
 * Manages employee onboarding workflows, checklists, and progressive access
 */
export const onboardingApi = {
  /**
   * Create a new onboarding workflow
   */
  async create(data: CreateOnboardingWorkflowRequest): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().post('/Onboarding', data);
  },

  /**
   * Get workflow by ID
   */
  async getById(id: string): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().get(`/Onboarding/${id}`);
  },

  /**
   * Get workflow by user ID
   */
  async getByUser(userId: string): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().get(`/Onboarding/user/${userId}`);
  },

  /**
   * Get all workflows (optionally filtered by status)
   */
  async getAll(status?: OnboardingWorkflowStatus): Promise<{ data: OnboardingWorkflowDto[] }> {
    const params = status ? { status } : undefined;
    return getApi().get('/Onboarding', { params });
  },

  /**
   * Update workflow progress
   */
  async updateProgress(id: string, data: UpdateProgressRequest): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().put(`/Onboarding/${id}/progress`, data);
  },

  /**
   * Cancel workflow
   */
  async cancel(id: string): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().put(`/Onboarding/${id}/cancel`, {});
  },

  /**
   * Get checklist items for a workflow
   */
  async getChecklistItems(id: string): Promise<{ data: ChecklistItemDto[] }> {
    return getApi().get(`/Onboarding/${id}/checklist`);
  },

  /**
   * Complete a checklist item
   */
  async completeChecklistItem(
    workflowId: string,
    itemId: string,
    data: CompleteChecklistItemRequest
  ): Promise<{ data: ChecklistItemDto }> {
    return getApi().put(`/Onboarding/${workflowId}/checklist/${itemId}/complete`, data);
  },

  /**
   * Skip a checklist item (only non-required items)
   */
  async skipChecklistItem(workflowId: string, itemId: string): Promise<{ data: ChecklistItemDto }> {
    return getApi().put(`/Onboarding/${workflowId}/checklist/${itemId}/skip`, {});
  },

  /**
   * Assign mentor to workflow
   */
  async assignMentor(id: string, data: AssignMentorRequest): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().put(`/Onboarding/${id}/mentor`, data);
  },

  /**
   * Grant progressive access (Day 1, Day 7, or Day 30)
   */
  async grantAccess(id: string, data: GrantAccessRequest): Promise<{ data: OnboardingWorkflowDto }> {
    return getApi().put(`/Onboarding/${id}/access`, data);
  },

  /**
   * Get access progress for a workflow
   */
  async getAccessProgress(id: string): Promise<{ data: AccessLevelProgress }> {
    return getApi().get(`/Onboarding/${id}/access/progress`);
  },

  /**
   * Get onboarding statistics
   */
  async getStats(): Promise<{ data: OnboardingStatsDto }> {
    return getApi().get('/Onboarding/stats');
  }
};
