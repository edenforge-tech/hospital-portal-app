import { getApi } from '../api';

// Enhanced Department interfaces
export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  description: string;
  status: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  departmentHeadId?: string;
  departmentHeadName?: string;
  staffCount: number;
  subDepartmentsCount: number;
  branchId?: string | null;
  branchName?: string | null;
  
  // Enhanced fields for capacity and services
  capacity: DepartmentCapacity;
  services: DepartmentService[];
  workflowSettings: DepartmentWorkflow;
  operationalMetrics: DepartmentMetrics;
  staffAssignments: StaffAssignment[];
  
  // Legacy compatibility fields
  tenantId?: string;
  organizationId?: string;
  operatingHours?: string;
  budget?: number;
  currency?: string;
  maxConcurrentPatients?: number;
  approvalWorkflowRequired?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface DepartmentCapacity {
  maxPatients: number;
  currentPatients: number;
  maxStaff: number;
  currentStaff: number;
  beds: BedCapacity;
  equipment: EquipmentCapacity;
  rooms: RoomCapacity;
  utilizationRate: number;
  peakHours: TimeSlot[];
  averageWaitTime: number;
}

export interface BedCapacity {
  total: number;
  occupied: number;
  available: number;
  reserved: number;
  outOfService: number;
  bedTypes: {
    icu: number;
    general: number;
    private: number;
    emergency: number;
  };
}

export interface EquipmentCapacity {
  totalUnits: number;
  availableUnits: number;
  inUseUnits: number;
  maintenanceUnits: number;
  equipment: {
    id: string;
    name: string;
    type: string;
    status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
    lastMaintenance?: string;
    nextMaintenance?: string;
  }[];
}

export interface RoomCapacity {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  roomTypes: {
    consultation: number;
    procedure: number;
    surgery: number;
    examination: number;
    recovery: number;
  };
}

export interface DepartmentService {
  id: string;
  serviceName: string;
  serviceCode: string;
  description: string;
  category: string;
  isActive: boolean;
  duration: number; // in minutes
  cost: number;
  currency: string;
  requiredStaffCount: number;
  requiredEquipment: string[];
  prerequisites: string[];
  waitlistCount: number;
  averageRating: number;
  totalRatings: number;
}

export interface DepartmentWorkflow {
  patientAdmissionProcess: WorkflowStep[];
  staffAssignmentProcess: WorkflowStep[];
  equipmentRequestProcess: WorkflowStep[];
  serviceDeliveryProcess: WorkflowStep[];
  emergencyProcedures: WorkflowStep[];
  qualityCheckpoints: QualityCheckpoint[];
}

export interface WorkflowStep {
  id: string;
  stepName: string;
  description: string;
  order: number;
  estimatedDuration: number;
  requiredRole: string;
  isRequired: boolean;
  nextSteps: string[];
  approvalRequired: boolean;
  automatable: boolean;
}

export interface QualityCheckpoint {
  id: string;
  checkpointName: string;
  frequency: 'per-patient' | 'daily' | 'weekly' | 'monthly';
  criteria: string[];
  responsibleRole: string;
  complianceScore: number;
}

export interface DepartmentMetrics {
  patientSatisfaction: number;
  staffSatisfaction: number;
  averageServiceTime: number;
  throughputPerDay: number;
  errorRate: number;
  complianceScore: number;
  costPerPatient: number;
  revenuePerDay: number;
  utilizationTrends: MetricTrend[];
  performanceIndicators: KPI[];
}

export interface MetricTrend {
  date: string;
  utilization: number;
  patientCount: number;
  staffCount: number;
  revenue: number;
  satisfaction: number;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface StaffAssignment {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position: string;
  isHeadOfDepartment: boolean;
  isPrimary: boolean;
  assignment: {
    startDate: string;
    endDate?: string;
    workingHours: string;
    responsibilities: string[];
    accessLevel: 'basic' | 'advanced' | 'admin';
    certifications: string[];
  };
  performance: {
    rating: number;
    lastEvaluation: string;
    goals: string[];
    achievements: string[];
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  utilization: number;
}

export interface DepartmentFormData {
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  description?: string;
  branchId: string;
  organizationId?: string;
  parentDepartmentId?: string;
  departmentHeadId?: string;
  operatingHours?: string;
  budget?: number;
  currency?: string;
  maxConcurrentPatients?: number;
  approvalWorkflowRequired: boolean;
  status: 'Active' | 'Inactive' | 'UnderMaintenance';
  
  // Enhanced form fields
  capacity: {
    maxPatients: number;
    maxStaff: number;
    totalBeds: number;
    totalRooms: number;
  };
  services: Omit<DepartmentService, 'id' | 'waitlistCount' | 'averageRating' | 'totalRatings'>[];
  workflowSettings: Omit<DepartmentWorkflow, 'id'>;
}

export interface DepartmentHierarchy {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  departmentHeadName?: string;
  totalStaff: number;
  status: string;
  children: DepartmentHierarchy[];
  capacity: DepartmentCapacity;
  metrics: DepartmentMetrics;
}

export interface DepartmentDetails {
  department: Department;
  staff: StaffAssignment[];
  subDepartments: Department[];
  recentActivity: ActivityLog[];
  analytics: DepartmentAnalytics;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  activityType: string;
  description: string;
  performedBy: string;
  affectedResource: string;
  details: Record<string, any>;
}

export interface DepartmentAnalytics {
  utilizationTrend: MetricTrend[];
  servicePerformance: ServiceAnalytics[];
  staffProductivity: StaffProductivity[];
  patientFlow: PatientFlowAnalytics[];
  costAnalysis: CostAnalytics;
}

export interface ServiceAnalytics {
  serviceId: string;
  serviceName: string;
  totalDelivered: number;
  averageDuration: number;
  patientSatisfaction: number;
  revenue: number;
  profitMargin: number;
  demand: number;
}

export interface StaffProductivity {
  userId: string;
  name: string;
  role: string;
  patientsServed: number;
  averageServiceTime: number;
  utilizationRate: number;
  performanceScore: number;
}

export interface PatientFlowAnalytics {
  hour: number;
  admissions: number;
  discharges: number;
  currentOccupancy: number;
  averageWaitTime: number;
  bottlenecks: string[];
}

export interface CostAnalytics {
  staffCosts: number;
  equipmentCosts: number;
  facilityCosts: number;
  supplyCosts: number;
  totalCosts: number;
  costPerPatient: number;
  budgetUtilization: number;
  costTrends: { month: string; cost: number }[];
}

export interface DepartmentFilters {
  search?: string;
  departmentType?: string;
  status?: string;
  branchId?: string;
  parentDepartmentId?: string;
  utilizationMin?: number;
  utilizationMax?: number;
  staffCountMin?: number;
  staffCountMax?: number;
}

// Enhanced API functions
export const departmentsEnhancedApi = {
  // Core CRUD operations
  getAll: async (filters?: DepartmentFilters) => {
    const response = await getApi().get<{ items: Department[]; totalCount: number }>('/departments/enhanced', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await getApi().get<Department>(`/departments/${id}/enhanced`);
    return response.data;
  },

  create: async (data: DepartmentFormData) => {
    const response = await getApi().post<Department>('/departments/enhanced', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DepartmentFormData>) => {
    const response = await getApi().put<Department>(`/departments/${id}/enhanced`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await getApi().delete(`/departments/${id}`);
  },

  // Capacity management
  getCapacity: async (id: string) => {
    const response = await getApi().get<DepartmentCapacity>(`/departments/${id}/capacity`);
    return response.data;
  },

  updateCapacity: async (id: string, capacity: Partial<DepartmentCapacity>) => {
    const response = await getApi().put<DepartmentCapacity>(`/departments/${id}/capacity`, capacity);
    return response.data;
  },

  getBedStatus: async (id: string) => {
    const response = await getApi().get<BedCapacity>(`/departments/${id}/beds`);
    return response.data;
  },

  updateBedStatus: async (id: string, bedId: string, status: string) => {
    const response = await getApi().put(`/departments/${id}/beds/${bedId}`, { status });
    return response.data;
  },

  getEquipmentStatus: async (id: string) => {
    const response = await getApi().get<EquipmentCapacity>(`/departments/${id}/equipment`);
    return response.data;
  },

  updateEquipmentStatus: async (id: string, equipmentId: string, status: string) => {
    const response = await getApi().put(`/departments/${id}/equipment/${equipmentId}`, { status });
    return response.data;
  },

  // Service management
  getServices: async (id: string) => {
    const response = await getApi().get<DepartmentService[]>(`/departments/${id}/services`);
    return response.data;
  },

  addService: async (id: string, service: Omit<DepartmentService, 'id' | 'waitlistCount' | 'averageRating' | 'totalRatings'>) => {
    const response = await getApi().post<DepartmentService>(`/departments/${id}/services`, service);
    return response.data;
  },

  updateService: async (id: string, serviceId: string, service: Partial<DepartmentService>) => {
    const response = await getApi().put<DepartmentService>(`/departments/${id}/services/${serviceId}`, service);
    return response.data;
  },

  deleteService: async (id: string, serviceId: string) => {
    await getApi().delete(`/departments/${id}/services/${serviceId}`);
  },

  // Staff assignment
  getStaffAssignments: async (id: string) => {
    const response = await getApi().get<StaffAssignment[]>(`/departments/${id}/staff-assignments`);
    return response.data;
  },

  assignStaff: async (id: string, assignment: Omit<StaffAssignment, 'id'>) => {
    const response = await getApi().post<StaffAssignment>(`/departments/${id}/staff-assignments`, assignment);
    return response.data;
  },

  updateStaffAssignment: async (id: string, assignmentId: string, assignment: Partial<StaffAssignment>) => {
    const response = await getApi().put<StaffAssignment>(`/departments/${id}/staff-assignments/${assignmentId}`, assignment);
    return response.data;
  },

  removeStaffAssignment: async (id: string, assignmentId: string) => {
    await getApi().delete(`/departments/${id}/staff-assignments/${assignmentId}`);
  },

  // Workflow management
  getWorkflow: async (id: string) => {
    const response = await getApi().get<DepartmentWorkflow>(`/departments/${id}/workflow`);
    return response.data;
  },

  updateWorkflow: async (id: string, workflow: DepartmentWorkflow) => {
    const response = await getApi().put<DepartmentWorkflow>(`/departments/${id}/workflow`, workflow);
    return response.data;
  },

  getWorkflowTemplates: async () => {
    const response = await getApi().get<DepartmentWorkflow[]>('/departments/workflow-templates');
    return response.data;
  },

  // Analytics and metrics
  getMetrics: async (id: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await getApi().get<DepartmentMetrics>(`/departments/${id}/metrics?${params.toString()}`);
    return response.data;
  },

  getAnalytics: async (id: string, period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    const response = await getApi().get<DepartmentAnalytics>(`/departments/${id}/analytics?period=${period}`);
    return response.data;
  },

  getUtilizationReport: async (id: string, startDate: string, endDate: string) => {
    const response = await getApi().get<MetricTrend[]>(`/departments/${id}/utilization`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Hierarchy and relationships
  getHierarchy: async (branchId?: string) => {
    const response = await getApi().get<DepartmentHierarchy[]>('/departments/hierarchy/enhanced', {
      params: { branchId }
    });
    return response.data;
  },

  getSubDepartments: async (parentId: string) => {
    const response = await getApi().get<Department[]>(`/departments/${parentId}/sub-departments/enhanced`);
    return response.data;
  },

  getDetails: async (id: string) => {
    const response = await getApi().get<DepartmentDetails>(`/departments/${id}/details/enhanced`);
    return response.data;
  },

  // Activity and logging
  getActivityLog: async (id: string, limit: number = 50) => {
    const response = await getApi().get<ActivityLog[]>(`/departments/${id}/activity`, {
      params: { limit }
    });
    return response.data;
  },

  // Bulk operations
  bulkUpdateStatus: async (departmentIds: string[], status: string) => {
    const response = await getApi().put('/departments/bulk/status', {
      departmentIds,
      status
    });
    return response.data;
  },

  exportDepartmentData: async (id: string, format: 'csv' | 'xlsx' | 'pdf' = 'xlsx') => {
    const response = await getApi().get(`/departments/${id}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Utility functions
  getDepartmentTypes: async () => {
    const response = await getApi().get<string[]>('/departments/types');
    return response.data;
  },

  getAvailableStaff: async (departmentType?: string) => {
    const response = await getApi().get('/users/available-for-assignment', {
      params: { departmentType }
    });
    return response.data;
  },

  validateCapacity: async (id: string, proposedChanges: Partial<DepartmentCapacity>) => {
    const response = await getApi().post(`/departments/${id}/validate-capacity`, proposedChanges);
    return response.data;
  }
};