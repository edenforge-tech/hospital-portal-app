// Workflow Module Hooks - Module 3.10
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import type {
  WorkflowState,
  StageTransition,
  InitializeWorkflowRequest,
  WorkflowListResponse,
} from '@/types/counselor';

// ==================== Workflow State Hooks ====================

export function useWorkflows(sessionId?: string, status?: string, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['workflow', 'workflows', sessionId, status, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      const response = await getApi().get<WorkflowListResponse>(`/workflow?${params}`);
      return response.data;
    },
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', 'workflow', id],
    queryFn: async () => {
      const response = await getApi().get<WorkflowState>(`/workflow/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useInitializeWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InitializeWorkflowRequest) => {
      const response = await getApi().post<WorkflowState>('/workflow/initialize', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'workflows'] });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InitializeWorkflowRequest> }) => {
      const response = await getApi().put<WorkflowState>(`/workflow/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', 'workflow', variables.id] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await getApi().delete(`/workflow/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'workflows'] });
    },
  });
}

export function useUpdateWorkflowStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      workflowId: string;
      newStage: string;
      stageData?: Record<string, any>;
      triggeredBy: string;
    }) => {
      const response = await getApi().post('/workflow/update-stage', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'workflow', variables.workflowId] });
      queryClient.invalidateQueries({ queryKey: ['workflow', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', 'progress', variables.workflowId] });
    },
  });
}

// ==================== Workflow Progress Hooks ====================

export function useWorkflowProgress(workflowId: string) {
  return useQuery({
    queryKey: ['workflow', 'progress', workflowId],
    queryFn: async () => {
      const response = await getApi().get(`/workflow/${workflowId}/progress`);
      return response.data;
    },
    enabled: !!workflowId,
    refetchInterval: 30000, // Refetch every 30 seconds for live progress
  });
}

export function useStageTransitions(workflowId: string) {
  return useQuery({
    queryKey: ['workflow', 'transitions', workflowId],
    queryFn: async () => {
      const response = await getApi().get<{ transitions: StageTransition[] }>(`/workflow/${workflowId}/transitions`);
      return response.data;
    },
    enabled: !!workflowId,
  });
}

export function useStageDependencies(workflowId: string) {
  return useQuery({
    queryKey: ['workflow', 'dependencies', workflowId],
    queryFn: async () => {
      const response = await getApi().get(`/workflow/${workflowId}/dependencies`);
      return response.data;
    },
    enabled: !!workflowId,
  });
}
