import { getApi } from './base.api';

// Enhanced Organization Interfaces
export interface Organization {
  id: string;
  name: string;
  description: string;
  type: OrganizationType;
  parentOrganizationId?: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Hierarchy Information
  hierarchy: {
    level: number;
    path: string;
    children: Organization[];
    parent?: Organization;
    fullPath: string[];
  };

  // Location Information
  locations: Location[];
  primaryLocationId?: string;
  
  // Department Assignments
  departments: DepartmentAssignment[];
  
  // Contact Information
  contactInfo: {
    primaryContact: ContactPerson;
    secondaryContacts: ContactPerson[];
    emergencyContact?: ContactPerson;
  };
  
  // Operational Information
  operationalInfo: {
    operatingHours: OperatingHours[];
    timeZone: string;
    capacity: OrganizationCapacity;
    services: OrganizationService[];
    certifications: Certification[];
  };
  
  // Financial Information
  financialInfo: {
    taxId?: string;
    licenseNumber?: string;
    insuranceInfo: InsuranceInfo[];
    budget?: BudgetInfo;
  };
  
  // Analytics
  analytics: {
    totalEmployees: number;
    totalPatients: number;
    totalRevenue: number;
    performance: PerformanceMetric[];
    trends: TrendData[];
  };
  
  // Compliance & Accreditation
  compliance: {
    accreditations: Accreditation[];
    licenses: License[];
    complianceScore: number;
    lastAuditDate?: string;
    nextAuditDue?: string;
  };
  
  // Configuration
  settings: {
    allowSubOrganizations: boolean;
    autoAssignDepartments: boolean;
    inheritParentSettings: boolean;
    customFields: CustomField[];
  };
  
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface OrganizationType {
  id: string;
  name: string;
  category: 'Hospital' | 'Clinic' | 'Department' | 'Unit' | 'Branch' | 'Subsidiary';
  description: string;
  requiredFields: string[];
  allowedChildren: string[];
  maxChildren?: number;
  permissions: string[];
}

export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  type: 'Main' | 'Branch' | 'Satellite' | 'Remote' | 'Virtual';
  contactInfo: {
    phone?: string;
    fax?: string;
    email?: string;
  };
  facilities: Facility[];
  accessibility: AccessibilityFeature[];
  parking: ParkingInfo;
  publicTransport: TransportInfo[];
  isActive: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type: 'EmergencyRoom' | 'OperatingRoom' | 'ICU' | 'Laboratory' | 'Pharmacy' | 'Radiology' | 'Cafeteria' | 'Chapel' | 'GiftShop';
  floor: number;
  capacity: number;
  equipment: string[];
  availability: AvailabilitySchedule[];
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Closed';
}

export interface DepartmentAssignment {
  departmentId: string;
  departmentName: string;
  organizationId: string;
  assignmentType: 'Primary' | 'Secondary' | 'Shared' | 'Temporary';
  effectiveDate: string;
  expirationDate?: string;
  responsibilities: string[];
  budgetAllocation?: number;
  staffCount: number;
  headOfDepartment?: {
    userId: string;
    name: string;
    title: string;
  };
  performance: {
    efficiency: number;
    patientSatisfaction: number;
    qualityScore: number;
    financialPerformance: number;
  };
}

export interface ContactPerson {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  fax?: string;
  department?: string;
  role: 'CEO' | 'COO' | 'CFO' | 'CMO' | 'CNO' | 'Administrator' | 'Manager' | 'Director' | 'Coordinator';
  isActive: boolean;
  preferredContactMethod: 'Email' | 'Phone' | 'Mobile' | 'Fax';
}

export interface OperatingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  isOpen: boolean;
  breaks: TimeSlot[];
  specialNotes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  description: string;
}

export interface OrganizationCapacity {
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  emergencyBeds: number;
  operatingRooms: number;
  maxStaff: number;
  currentStaff: number;
  maxPatients: number;
  currentPatients: number;
  utilizationRate: number;
}

export interface OrganizationService {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  cost?: number;
  duration?: number; // in minutes
  requirements: string[];
  providedBy: string[];
  qualityMetrics: {
    averageRating: number;
    totalReviews: number;
    successRate: number;
  };
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expirationDate: string;
  certificateNumber: string;
  status: 'Valid' | 'Expired' | 'Suspended' | 'Pending';
  documentUrl?: string;
}

export interface InsuranceInfo {
  id: string;
  provider: string;
  policyNumber: string;
  type: 'Liability' | 'Malpractice' | 'Property' | 'Workers Compensation';
  coverage: number;
  effectiveDate: string;
  expirationDate: string;
  status: 'Active' | 'Expired' | 'Cancelled';
}

export interface BudgetInfo {
  fiscalYear: string;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  budgetCategories: {
    category: string;
    allocated: number;
    spent: number;
  }[];
  varianceAnalysis: {
    category: string;
    variance: number;
    percentageVariance: number;
  }[];
}

export interface PerformanceMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'Increasing' | 'Decreasing' | 'Stable';
  period: string;
  lastUpdated: string;
}

export interface TrendData {
  period: string;
  metric: string;
  value: number;
  change: number;
  changePercentage: number;
}

export interface Accreditation {
  id: string;
  name: string;
  accreditingBody: string;
  level: string;
  achievedDate: string;
  expirationDate: string;
  status: 'Current' | 'Expired' | 'Provisional' | 'Denied';
  score?: number;
  conditions: string[];
  documentUrl?: string;
}

export interface License {
  id: string;
  type: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expirationDate: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Pending Renewal';
  restrictions: string[];
  documentUrl?: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'Text' | 'Number' | 'Date' | 'Boolean' | 'Select' | 'MultiSelect';
  value: any;
  options?: string[];
  required: boolean;
  description?: string;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  type: 'Wheelchair' | 'VisualAid' | 'HearingAid' | 'Elevator' | 'Ramp' | 'SignLanguage';
  description: string;
  location: string;
  isAvailable: boolean;
}

export interface ParkingInfo {
  totalSpaces: number;
  handicapSpaces: number;
  visitorSpaces: number;
  staffSpaces: number;
  valetService: boolean;
  hourlyRate?: number;
  dailyRate?: number;
  validationRequired: boolean;
}

export interface TransportInfo {
  type: 'Bus' | 'Train' | 'Subway' | 'Taxi' | 'Shuttle';
  provider: string;
  route?: string;
  schedule?: string[];
  distance: number; // in meters
  walkingTime: number; // in minutes
}

export interface AvailabilitySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  capacity: number;
}

// Organization Analytics and Reporting
export interface OrganizationAnalytics {
  overview: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalLocations: number;
    totalDepartments: number;
    totalEmployees: number;
    totalPatients: number;
    totalRevenue: number;
  };
  
  hierarchy: {
    maxDepth: number;
    averageChildren: number;
    organizationsByLevel: { level: number; count: number }[];
    largestOrganization: Organization;
  };
  
  performance: {
    topPerformers: Organization[];
    performanceDistribution: { range: string; count: number }[];
    trends: { month: string; averagePerformance: number }[];
  };
  
  geographic: {
    locationsByState: { state: string; count: number }[];
    locationsByType: { type: string; count: number }[];
    averageDistance: number;
  };
  
  financial: {
    totalBudget: number;
    budgetUtilization: number;
    revenueByOrganization: { organizationId: string; name: string; revenue: number }[];
    costCenters: { category: string; cost: number }[];
  };
  
  compliance: {
    overallComplianceScore: number;
    accreditationCoverage: number;
    expiringCertifications: Certification[];
    complianceByOrganization: { organizationId: string; score: number }[];
  };
  
  recommendations: OrganizationRecommendation[];
}

export interface OrganizationRecommendation {
  id: string;
  type: 'Performance' | 'Compliance' | 'Financial' | 'Operational';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  affectedOrganizations: string[];
  estimatedImpact: string;
  estimatedEffort: string;
  actionItems: string[];
  dueDate?: string;
}

// API Filters and Search
export interface OrganizationFilters {
  search?: string;
  type?: string;
  status?: string;
  location?: string;
  parentId?: string;
  hasChildren?: boolean;
  level?: number;
  departments?: string[];
  services?: string[];
  certifications?: string[];
  employees?: { min?: number; max?: number };
  revenue?: { min?: number; max?: number };
  compliance?: { min?: number; max?: number };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Enhanced Organizations API
export const organizationsEnhancedApi = {
  // Organization Management
  async getOrganizations(filters?: OrganizationFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Organization>> {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(Object.entries(filters || {}).map(([k, v]) => [k, String(v)]))
    });
    const response = await api.get(`/organizations/enhanced?${params}`);
    return response.data;
  },

  async getOrganization(organizationId: string, includeHierarchy = false, includeAnalytics = false): Promise<Organization> {
    const api = getApi();
    const params = new URLSearchParams({
      includeHierarchy: includeHierarchy.toString(),
      includeAnalytics: includeAnalytics.toString()
    });
    const response = await api.get(`/organizations/${organizationId}/enhanced?${params}`);
    return response.data;
  },

  async createOrganization(organizationData: Partial<Organization>): Promise<Organization> {
    const api = getApi();
    const response = await api.post('/organizations/enhanced', organizationData);
    return response.data;
  },

  async updateOrganization(organizationId: string, updates: Partial<Organization>): Promise<Organization> {
    const api = getApi();
    const response = await api.put(`/organizations/${organizationId}/enhanced`, updates);
    return response.data;
  },

  async deleteOrganization(organizationId: string, transferChildren?: string): Promise<void> {
    const api = getApi();
    const params = transferChildren ? { transferTo: transferChildren } : {};
    await api.delete(`/organizations/${organizationId}`, { params });
  },

  // Hierarchy Management
  async getOrganizationHierarchy(): Promise<Organization[]> {
    const api = getApi();
    const response = await api.get('/organizations/hierarchy');
    return response.data;
  },

  async moveOrganizationInHierarchy(organizationId: string, newParentId?: string, position?: number): Promise<Organization[]> {
    const api = getApi();
    const response = await api.post(`/organizations/${organizationId}/move`, {
      newParentId,
      position
    });
    return response.data;
  },

  async getOrganizationPath(organizationId: string): Promise<Organization[]> {
    const api = getApi();
    const response = await api.get(`/organizations/${organizationId}/path`);
    return response.data;
  },

  async getOrganizationChildren(organizationId: string, recursive = false): Promise<Organization[]> {
    const api = getApi();
    const response = await api.get(`/organizations/${organizationId}/children`, {
      params: { recursive: recursive.toString() }
    });
    return response.data;
  },

  // Location Management
  async getLocations(organizationId?: string): Promise<Location[]> {
    const api = getApi();
    const params = organizationId ? { organizationId } : {};
    const response = await api.get('/locations', { params });
    return response.data;
  },

  async getLocation(locationId: string): Promise<Location> {
    const api = getApi();
    const response = await api.get(`/locations/${locationId}`);
    return response.data;
  },

  async createLocation(locationData: Partial<Location>): Promise<Location> {
    const api = getApi();
    const response = await api.post('/locations', locationData);
    return response.data;
  },

  async updateLocation(locationId: string, updates: Partial<Location>): Promise<Location> {
    const api = getApi();
    const response = await api.put(`/locations/${locationId}`, updates);
    return response.data;
  },

  async deleteLocation(locationId: string): Promise<void> {
    const api = getApi();
    await api.delete(`/locations/${locationId}`);
  },

  // Department Assignments
  async getDepartmentAssignments(organizationId: string): Promise<DepartmentAssignment[]> {
    const api = getApi();
    const response = await api.get(`/organizations/${organizationId}/departments`);
    return response.data;
  },

  async assignDepartment(organizationId: string, assignmentData: Partial<DepartmentAssignment>): Promise<DepartmentAssignment> {
    const api = getApi();
    const response = await api.post(`/organizations/${organizationId}/departments`, assignmentData);
    return response.data;
  },

  async updateDepartmentAssignment(organizationId: string, departmentId: string, updates: Partial<DepartmentAssignment>): Promise<DepartmentAssignment> {
    const api = getApi();
    const response = await api.put(`/organizations/${organizationId}/departments/${departmentId}`, updates);
    return response.data;
  },

  async removeDepartmentAssignment(organizationId: string, departmentId: string): Promise<void> {
    const api = getApi();
    await api.delete(`/organizations/${organizationId}/departments/${departmentId}`);
  },

  // Contact Management
  async getContacts(organizationId: string): Promise<ContactPerson[]> {
    const api = getApi();
    const response = await api.get(`/organizations/${organizationId}/contacts`);
    return response.data;
  },

  async addContact(organizationId: string, contactData: Partial<ContactPerson>): Promise<ContactPerson> {
    const api = getApi();
    const response = await api.post(`/organizations/${organizationId}/contacts`, contactData);
    return response.data;
  },

  async updateContact(organizationId: string, contactId: string, updates: Partial<ContactPerson>): Promise<ContactPerson> {
    const api = getApi();
    const response = await api.put(`/organizations/${organizationId}/contacts/${contactId}`, updates);
    return response.data;
  },

  async removeContact(organizationId: string, contactId: string): Promise<void> {
    const api = getApi();
    await api.delete(`/organizations/${organizationId}/contacts/${contactId}`);
  },

  // Analytics and Reporting
  async getOrganizationAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<OrganizationAnalytics> {
    const api = getApi();
    const response = await api.get('/organizations/analytics', {
      params: { timeRange }
    });
    return response.data;
  },

  async getOrganizationPerformance(organizationId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{
    organization: Organization;
    metrics: PerformanceMetric[];
    trends: TrendData[];
    ranking: { position: number; total: number };
    comparisons: { organizationId: string; name: string; performance: number }[];
  }> {
    const api = getApi();
    const response = await api.get(`/organizations/${organizationId}/performance`, {
      params: { timeRange }
    });
    return response.data;
  },

  async getFinancialReport(organizationId?: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<{
    summary: BudgetInfo;
    breakdown: { category: string; budget: number; actual: number; variance: number }[];
    trends: { period: string; revenue: number; expenses: number; profit: number }[];
  }> {
    const api = getApi();
    const params: any = { period };
    if (organizationId) params.organizationId = organizationId;
    const response = await api.get('/organizations/financial-report', { params });
    return response.data;
  },

  async getComplianceReport(organizationId?: string): Promise<{
    overall: { score: number; grade: string };
    accreditations: Accreditation[];
    licenses: License[];
    certifications: Certification[];
    expiringItems: { type: string; name: string; expirationDate: string }[];
    recommendations: string[];
  }> {
    const api = getApi();
    const params = organizationId ? { organizationId } : {};
    const response = await api.get('/organizations/compliance-report', { params });
    return response.data;
  },

  // Organization Types and Configuration
  async getOrganizationTypes(): Promise<OrganizationType[]> {
    const api = getApi();
    const response = await api.get('/organization-types');
    return response.data;
  },

  async createOrganizationType(typeData: Partial<OrganizationType>): Promise<OrganizationType> {
    const api = getApi();
    const response = await api.post('/organization-types', typeData);
    return response.data;
  },

  // Bulk Operations
  async bulkUpdateOrganizations(updates: { organizationId: string; changes: Partial<Organization> }[]): Promise<{
    successful: string[];
    failed: { organizationId: string; error: string }[];
  }> {
    const api = getApi();
    const response = await api.post('/organizations/bulk-update', { updates });
    return response.data;
  },

  async bulkAssignDepartments(assignments: { organizationId: string; departmentIds: string[] }[]): Promise<{
    successful: string[];
    failed: { organizationId: string; error: string }[];
  }> {
    const api = getApi();
    const response = await api.post('/organizations/bulk-assign-departments', { assignments });
    return response.data;
  },

  // Search and Discovery
  async searchOrganizations(query: string, filters?: OrganizationFilters): Promise<{
    organizations: Organization[];
    locations: Location[];
    departments: DepartmentAssignment[];
    contacts: ContactPerson[];
    totalResults: number;
  }> {
    const api = getApi();
    const response = await api.get('/organizations/search', {
      params: { query, ...filters }
    });
    return response.data;
  },

  async suggestOrganizationStructure(parentId?: string): Promise<{
    suggestions: {
      type: string;
      name: string;
      description: string;
      confidence: number;
    }[];
    reasoning: string[];
  }> {
    const api = getApi();
    const params = parentId ? { parentId } : {};
    const response = await api.get('/organizations/structure-suggestions', { params });
    return response.data;
  },

  // Import/Export
  async exportOrganizations(format: 'json' | 'xlsx' | 'csv' = 'xlsx', includeHierarchy = true): Promise<Blob> {
    const api = getApi();
    const response = await api.get('/organizations/export', {
      params: { format, includeHierarchy },
      responseType: 'blob'
    });
    return response.data;
  },

  async importOrganizations(file: File, options?: {
    validateOnly?: boolean;
    skipDuplicates?: boolean;
    preserveHierarchy?: boolean;
  }): Promise<{
    success: boolean;
    importedCount: number;
    errors: string[];
    warnings: string[];
    preview?: Organization[];
  }> {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    const response = await api.post('/organizations/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default organizationsEnhancedApi;