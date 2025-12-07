import { getApi } from '../api';

// ===== Types & Interfaces =====

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  type?: string;
  status: string;
  parentOrganizationId?: string;
  parentOrganizationName?: string;
  hierarchyLevel: number;
  totalBranches: number;
  totalUsers: number;
  createdAt: string;
}

export interface OrganizationDetails {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  type?: string;
  description?: string;
  status: string;
  
  // Hierarchy
  parentOrganizationId?: string;
  parentOrganizationName?: string;
  hierarchyLevel: number;
  childOrganizationsCount: number;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  countryCode?: string;
  
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactAddress?: string;
  
  // Configuration
  timezone?: string;
  languageCode?: string;
  currencyCode?: string;
  
  // Operations
  totalBranches: number;
  totalUsers: number;
  operationalSince?: string;
  registrationNumber?: string;
  
  // Settings
  settings?: Record<string, any>;
  brandingConfig?: Record<string, any>;
  
  // Audit
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface OrganizationHierarchyNode {
  id: string;
  name: string;
  code?: string;
  type?: string;
  hierarchyLevel: number;
  totalBranches: number;
  totalUsers: number;
  children: OrganizationHierarchyNode[];
}

export interface OrganizationFilters {
  tenantId?: string;
  search?: string;
  type?: string;
  status?: string;
  parentOrganizationId?: string;
  rootOrganizationsOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrganizationListResponse {
  organizations: Organization[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateOrganizationRequest {
  tenantId: string;
  name: string;
  code?: string;
  type?: string;
  description?: string;
  status?: string;
  
  // Hierarchy
  parentOrganizationId?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  countryCode?: string;
  
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactAddress?: string;
  
  // Configuration
  timezone?: string;
  languageCode?: string;
  currencyCode?: string;
  
  // Operations
  operationalSince?: string;
  registrationNumber?: string;
  
  // Settings
  settings?: Record<string, any>;
  brandingConfig?: Record<string, any>;
}

export interface UpdateOrganizationRequest {
  name?: string;
  type?: string;
  description?: string;
  status?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  countryCode?: string;
  
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactAddress?: string;
  
  // Configuration
  timezone?: string;
  languageCode?: string;
  currencyCode?: string;
  
  // Operations
  operationalSince?: string;
  registrationNumber?: string;
  
  // Settings
  settings?: Record<string, any>;
  brandingConfig?: Record<string, any>;
}

export interface MoveOrganizationRequest {
  newParentOrganizationId?: string;
}

export interface OrganizationOperationResult {
  success: boolean;
  message: string;
  organizationId?: string;
  errors?: string[];
}

export interface MoveBranchesRequest {
  targetOrganizationId: string;
}

export interface OrganizationStatistics {
  totalOrganizations: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageUsersPerOrganization: number;
  averageBranchesPerOrganization: number;
}

// ===== API Functions =====

export const organizationsApi = {
  // Get all organizations with filters
  getAllOrganizations: async (filters?: OrganizationFilters): Promise<OrganizationListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.parentOrganizationId) params.append('parentOrganizationId', filters.parentOrganizationId);
    if (filters?.rootOrganizationsOnly !== undefined) params.append('rootOrganizationsOnly', String(filters.rootOrganizationsOnly));
    if (filters?.pageNumber) params.append('pageNumber', String(filters.pageNumber));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await getApi().get<OrganizationListResponse>(`/organizations?${params.toString()}`);
    return response.data;
  },

  // Get organization by ID
  getOrganizationById: async (id: string): Promise<OrganizationDetails> => {
    const response = await getApi().get<OrganizationDetails>(`/organizations/${id}`);
    return response.data;
  },

  // Get organization by code
  getOrganizationByCode: async (code: string, tenantId: string): Promise<OrganizationDetails> => {
    const response = await getApi().get<OrganizationDetails>(`/organizations/code/${code}?tenantId=${tenantId}`);
    return response.data;
  },

  // Create organization
  createOrganization: async (data: CreateOrganizationRequest): Promise<OrganizationOperationResult> => {
    const response = await getApi().post<OrganizationOperationResult>('/organizations', data);
    return response.data;
  },

  // Update organization
  updateOrganization: async (id: string, data: UpdateOrganizationRequest): Promise<OrganizationOperationResult> => {
    const response = await getApi().put<OrganizationOperationResult>(`/organizations/${id}`, data);
    return response.data;
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<OrganizationOperationResult> => {
    const response = await getApi().delete<OrganizationOperationResult>(`/organizations/${id}`);
    return response.data;
  },

  // Move organization to different parent
  moveOrganization: async (id: string, data: MoveOrganizationRequest): Promise<OrganizationOperationResult> => {
    const response = await getApi().patch<OrganizationOperationResult>(`/organizations/${id}/move`, data);
    return response.data;
  },

  // Get organization hierarchy tree
  getHierarchy: async (tenantId: string, rootOrganizationId?: string): Promise<OrganizationHierarchyNode> => {
    const params = new URLSearchParams({ tenantId });
    if (rootOrganizationId) params.append('rootOrganizationId', rootOrganizationId);
    
    const response = await getApi().get<OrganizationHierarchyNode>(`/organizations/hierarchy?${params.toString()}`);
    return response.data;
  },

  // Get child organizations
  getChildOrganizations: async (parentId: string): Promise<Organization[]> => {
    const response = await getApi().get<Organization[]>(`/organizations/${parentId}/children`);
    return response.data;
  },

  // Get branches for organization
  getBranchesByOrganization: async (organizationId: string): Promise<any[]> => {
    const response = await getApi().get<any[]>(`/organizations/${organizationId}/branches`);
    return response.data;
  },

  // Move branches to another organization
  moveBranches: async (organizationId: string, data: MoveBranchesRequest): Promise<OrganizationOperationResult> => {
    const response = await getApi().patch<OrganizationOperationResult>(
      `/organizations/${organizationId}/branches/move`,
      data
    );
    return response.data;
  },

  // Get organization statistics
  getStatistics: async (tenantId?: string): Promise<OrganizationStatistics> => {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await getApi().get<OrganizationStatistics>(`/organizations/statistics${params}`);
    return response.data;
  },

  // Toggle organization status
  toggleStatus: async (id: string): Promise<OrganizationOperationResult> => {
    const response = await getApi().patch<OrganizationOperationResult>(`/organizations/${id}/toggle-status`);
    return response.data;
  },
};
