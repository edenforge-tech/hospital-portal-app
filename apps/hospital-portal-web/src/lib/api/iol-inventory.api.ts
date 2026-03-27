import { getApi } from '@/lib/api';

export interface IOLInventoryItem {
  id: string;
  tenantId: string;
  branchId?: string;
  
  // IOL Details
  model: string;
  manufacturer: string;
  sku: string;
  type: 'MONOFOCAL' | 'MULTIFOCAL' | 'TORIC' | 'EDOF';
  material: string; // Acrylic, Silicone, PMMA
  
  // Optical Properties
  aConstant: number;
  powerRangeMin: number;
  powerRangeMax: number;
  powerIncrement: number; // 0.5D or 1.0D
  opticDiameter: number; // mm
  overallDiameter: number; // mm
  
  // For Toric IOLs
  cylinderPowerRange?: string;
  toricity?: string;
  
  // Stock Management
  currentStock: number;
  minimumStock: number;
  reorderQuantity: number;
  location?: string; // Storage location
  
  // Pricing
  unitPrice: number;
  supplierCost?: number;
  
  // Supplier Info
  supplierId?: string;
  supplierName?: string;
  leadTimeDays?: number;
  
  // Usage Tracking
  totalUsed?: number;
  lastUsedDate?: string;
  
  // Additional Info
  notes?: string;
  expiryDate?: string;
  batchNumber?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface IOLStatistics {
  totalItems: number;
  totalStock: number;
  lowStockCount: number;
  totalValue: number;
  monofocalCount: number;
  multifocalCount: number;
  toricCount: number;
  edofCount: number;
  monthlyUsage?: number;
  topUsedModels?: { model: string; count: number }[];
}

export interface IOLFilter {
  branchId?: string;
  type?: 'MONOFOCAL' | 'MULTIFOCAL' | 'TORIC' | 'EDOF';
  manufacturer?: string;
  lowStock?: boolean;
  supplierId?: string;
}

export interface StockAdjustment {
  itemId: string;
  quantity: number;
  type: 'ADDITION' | 'USAGE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT';
  reason: string;
  patientId?: string; // If used for surgery
  surgeryId?: string;
  batchNumber?: string;
  expiryDate?: string;
}

const iolInventoryApi = {
  // Get all IOL inventory items
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filter?: IOLFilter;
  }) => {
    const api = getApi();
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    if (params?.filter) {
      if (params.filter.branchId) queryParams.append('branchId', params.filter.branchId);
      if (params.filter.type) queryParams.append('type', params.filter.type);
      if (params.filter.manufacturer) queryParams.append('manufacturer', params.filter.manufacturer);
      if (params.filter.lowStock) queryParams.append('lowStock', 'true');
      if (params.filter.supplierId) queryParams.append('supplierId', params.filter.supplierId);
    }
    
    const response = await api.get<{ data: IOLInventoryItem[]; total: number }>(
      `/iol-inventory?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get IOL item by ID
  getById: async (id: string) => {
    const api = getApi();
    const response = await api.get<IOLInventoryItem>(`/iol-inventory/${id}`);
    return response.data;
  },

  // Get IOL statistics
  getStatistics: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/iol-inventory/statistics?branchId=${branchId}` : '/iol-inventory/statistics';
    const response = await api.get<IOLStatistics>(url);
    return response.data;
  },

  // Create new IOL item
  create: async (data: Partial<IOLInventoryItem>) => {
    const api = getApi();
    const response = await api.post<IOLInventoryItem>('/iol-inventory', data);
    return response.data;
  },

  // Update IOL item
  update: async (id: string, data: Partial<IOLInventoryItem>) => {
    const api = getApi();
    const response = await api.put<IOLInventoryItem>(`/iol-inventory/${id}`, data);
    return response.data;
  },

  // Delete IOL item
  delete: async (id: string) => {
    const api = getApi();
    await api.delete(`/iol-inventory/${id}`);
  },

  // Adjust stock
  adjustStock: async (adjustment: StockAdjustment) => {
    const api = getApi();
    const response = await api.post('/iol-inventory/adjust-stock', adjustment);
    return response.data;
  },

  // Get low stock items
  getLowStock: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/iol-inventory/low-stock?branchId=${branchId}` : '/iol-inventory/low-stock';
    const response = await api.get<IOLInventoryItem[]>(url);
    return response.data;
  },

  // Get stock history for an item
  getStockHistory: async (itemId: string, params?: { dateFrom?: string; dateTo?: string }) => {
    const api = getApi();
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    
    const response = await api.get(`/iol-inventory/${itemId}/stock-history?${queryParams.toString()}`);
    return response.data;
  },

  // Get IOLs by power range
  getByPowerRange: async (minPower: number, maxPower: number, type?: string) => {
    const api = getApi();
    const queryParams = new URLSearchParams();
    queryParams.append('minPower', minPower.toString());
    queryParams.append('maxPower', maxPower.toString());
    if (type) queryParams.append('type', type);
    
    const response = await api.get<IOLInventoryItem[]>(`/iol-inventory/by-power-range?${queryParams.toString()}`);
    return response.data;
  },

  // Get A-constant library
  getAConstantLibrary: async () => {
    const api = getApi();
    const response = await api.get('/iol-inventory/a-constant-library');
    return response.data;
  },

  // Search IOL inventory
  search: async (query: string) => {
    const api = getApi();
    const response = await api.get<IOLInventoryItem[]>(`/iol-inventory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Export inventory report
  exportReport: async (format: 'PDF' | 'EXCEL') => {
    const api = getApi();
    const response = await api.get(`/iol-inventory/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get manufacturers list
  getManufacturers: async () => {
    const api = getApi();
    const response = await api.get<string[]>('/iol-inventory/manufacturers');
    return response.data;
  },

  // Generate purchase order for low stock items
  generatePurchaseOrder: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/iol-inventory/generate-po?branchId=${branchId}` : '/iol-inventory/generate-po';
    const response = await api.post(url);
    return response.data;
  },
};

export default iolInventoryApi;
