// Inventory Management API Service
// Medical supplies tracking, equipment management, and automated reordering

import api from './axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InventoryItem {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  category: ItemCategory;
  subcategory?: string;
  type: 'supply' | 'equipment' | 'medication' | 'consumable' | 'device';
  manufacturer: string;
  brand?: string;
  model?: string;
  unitOfMeasure: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  maxQuantity: number;
  unitCost: number;
  totalValue: number;
  location: StorageLocation;
  alternateLocations: StorageLocation[];
  expirationTracking: boolean;
  lotTracking: boolean;
  serialTracking: boolean;
  temperatureSensitive: boolean;
  hazardous: boolean;
  controlledSubstance: boolean;
  status: 'active' | 'inactive' | 'discontinued' | 'recalled';
  images: string[];
  specifications: Record<string, any>;
  suppliers: ItemSupplier[];
  substitutes: string[];
  tags: string[];
  notes?: string;
  lastCountedAt?: string;
  lastOrderedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  description?: string;
  icon?: string;
  itemCount: number;
  subcategories?: ItemCategory[];
}

export interface StorageLocation {
  id: string;
  name: string;
  code: string;
  type: 'warehouse' | 'stockroom' | 'cabinet' | 'refrigerator' | 'freezer' | 'controlled' | 'cart';
  departmentId?: string;
  departmentName?: string;
  building?: string;
  floor?: string;
  room?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  capacity: number;
  currentOccupancy: number;
  temperature?: {
    min: number;
    max: number;
    current?: number;
    unit: 'C' | 'F';
  };
  humidity?: {
    min: number;
    max: number;
    current?: number;
  };
  isDefault: boolean;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface ItemSupplier {
  supplierId: string;
  supplierName: string;
  supplierSku: string;
  unitCost: number;
  minOrderQuantity: number;
  leadTimeDays: number;
  isPreferred: boolean;
  lastOrderDate?: string;
  contract?: {
    id: string;
    number: string;
    expiresAt: string;
  };
}

export interface Lot {
  id: string;
  itemId: string;
  lotNumber: string;
  quantity: number;
  quantityAvailable: number;
  manufacturingDate?: string;
  expirationDate?: string;
  receivedDate: string;
  location: StorageLocation;
  supplier?: {
    id: string;
    name: string;
  };
  purchaseOrderId?: string;
  unitCost: number;
  status: 'available' | 'quarantine' | 'expired' | 'recalled' | 'depleted';
  notes?: string;
}

export interface SerializedItem {
  id: string;
  itemId: string;
  serialNumber: string;
  lotId?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired' | 'lost';
  location: StorageLocation;
  assignedTo?: {
    type: 'patient' | 'department' | 'staff';
    id: string;
    name: string;
  };
  purchaseDate?: string;
  warrantyExpiration?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceHistory: MaintenanceRecord[];
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  type: 'preventive' | 'corrective' | 'calibration' | 'inspection';
  performedBy: string;
  performedAt: string;
  description: string;
  cost?: number;
  nextDueDate?: string;
  attachments?: string[];
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  lotId?: string;
  lotNumber?: string;
  serialNumber?: string;
  fromLocation?: StorageLocation;
  toLocation?: StorageLocation;
  reason: string;
  reference?: {
    type: 'purchase-order' | 'requisition' | 'return' | 'adjustment' | 'transfer' | 'consumption';
    id: string;
    number: string;
  };
  unitCost?: number;
  totalCost?: number;
  performedBy: string;
  performedAt: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export type TransactionType = 
  | 'receive' 
  | 'issue' 
  | 'transfer' 
  | 'adjust' 
  | 'return' 
  | 'dispose' 
  | 'reserve' 
  | 'unreserve'
  | 'count';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  deliveryAddress: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  paymentTerms: string;
  notes?: string;
  attachments: string[];
  approvalWorkflow: ApprovalStep[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  orderedAt?: string;
  receivedAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  supplierSku?: string;
  quantity: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  requestedDeliveryDate?: string;
  notes?: string;
}

export interface ApprovalStep {
  id: string;
  order: number;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: string;
  comments?: string;
}

export interface Requisition {
  id: string;
  requestNumber: string;
  requestedBy: string;
  requestedByName: string;
  departmentId: string;
  departmentName: string;
  status: 'draft' | 'pending' | 'approved' | 'fulfilled' | 'partial' | 'rejected' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  items: RequisitionItem[];
  neededByDate?: string;
  justification?: string;
  notes?: string;
  approvalWorkflow: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
  fulfilledAt?: string;
}

export interface RequisitionItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantityRequested: number;
  quantityApproved: number;
  quantityFulfilled: number;
  unitOfMeasure: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: 'manufacturer' | 'distributor' | 'wholesaler' | 'local';
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  contacts: SupplierContact[];
  addresses: SupplierAddress[];
  paymentTerms: string;
  creditLimit?: number;
  currency: string;
  taxId?: string;
  rating: number;
  certifications: string[];
  contracts: Contract[];
  itemCount: number;
  totalSpend: number;
  lastOrderDate?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierContact {
  id: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
  department?: string;
}

export interface SupplierAddress {
  id: string;
  type: 'billing' | 'shipping' | 'warehouse';
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Contract {
  id: string;
  supplierId: string;
  number: string;
  name: string;
  type: 'purchase' | 'service' | 'consignment' | 'gpo';
  status: 'draft' | 'active' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  value?: number;
  terms: string;
  attachments: string[];
  autoRenew: boolean;
  renewalNoticeDays: number;
  contacts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalCount {
  id: string;
  countNumber: string;
  type: 'full' | 'cycle' | 'spot' | 'perpetual';
  status: 'planned' | 'in-progress' | 'pending-review' | 'completed' | 'cancelled';
  location?: StorageLocation;
  category?: ItemCategory;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo: string[];
  items: CountItem[];
  variance: {
    totalItems: number;
    itemsWithVariance: number;
    totalVarianceValue: number;
  };
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CountItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  location: StorageLocation;
  lotNumber?: string;
  serialNumber?: string;
  systemQuantity: number;
  countedQuantity?: number;
  variance?: number;
  varianceValue?: number;
  status: 'pending' | 'counted' | 'recounted' | 'adjusted';
  countedBy?: string;
  countedAt?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'low-stock' | 'expiring' | 'expired' | 'recall' | 'reorder' | 'temperature' | 'maintenance';
  severity: 'info' | 'warning' | 'critical';
  itemId?: string;
  itemName?: string;
  locationId?: string;
  locationName?: string;
  message: string;
  details: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface UsageReport {
  itemId: string;
  itemName: string;
  category: string;
  period: string;
  quantityUsed: number;
  quantityOrdered: number;
  averageMonthlyUsage: number;
  costPerUnit: number;
  totalCost: number;
  daysOfStock: number;
  turnoverRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// ============================================================================
// INVENTORY ITEMS API
// ============================================================================

export const itemsApi = {
  // Get all items
  getItems: async (params?: {
    search?: string;
    category?: string;
    type?: string;
    status?: string;
    lowStock?: boolean;
    expiringSoon?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: InventoryItem[]; total: number }> => {
    const response = await api.get('/inventory/items', { params });
    return response.data;
  },

  // Get item by ID
  getItem: async (id: string): Promise<InventoryItem> => {
    const response = await api.get(`/inventory/items/${id}`);
    return response.data;
  },

  // Get item by barcode
  getItemByBarcode: async (barcode: string): Promise<InventoryItem> => {
    const response = await api.get(`/inventory/items/barcode/${barcode}`);
    return response.data;
  },

  // Create item
  createItem: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.post('/inventory/items', data);
    return response.data;
  },

  // Update item
  updateItem: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put(`/inventory/items/${id}`, data);
    return response.data;
  },

  // Delete item
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/items/${id}`);
  },

  // Get item lots
  getItemLots: async (itemId: string): Promise<Lot[]> => {
    const response = await api.get(`/inventory/items/${itemId}/lots`);
    return response.data;
  },

  // Get item serial numbers
  getItemSerials: async (itemId: string): Promise<SerializedItem[]> => {
    const response = await api.get(`/inventory/items/${itemId}/serials`);
    return response.data;
  },

  // Get item transactions
  getItemTransactions: async (itemId: string, params?: { fromDate?: string; toDate?: string }): Promise<StockTransaction[]> => {
    const response = await api.get(`/inventory/items/${itemId}/transactions`, { params });
    return response.data;
  },

  // Get item usage history
  getItemUsage: async (itemId: string, params?: { period?: string }): Promise<UsageReport> => {
    const response = await api.get(`/inventory/items/${itemId}/usage`, { params });
    return response.data;
  },

  // Get low stock items
  getLowStockItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory/items/low-stock');
    return response.data;
  },

  // Get expiring items
  getExpiringItems: async (days?: number): Promise<{ item: InventoryItem; lot: Lot }[]> => {
    const response = await api.get('/inventory/items/expiring', { params: { days } });
    return response.data;
  },

  // Import items
  importItems: async (file: File): Promise<{ imported: number; errors: any[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/inventory/items/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Export items
  exportItems: async (params?: { category?: string; format?: string }): Promise<Blob> => {
    const response = await api.get('/inventory/items/export', { params, responseType: 'blob' });
    return response.data;
  }
};

// ============================================================================
// STOCK TRANSACTIONS API
// ============================================================================

export const transactionsApi = {
  // Get all transactions
  getTransactions: async (params?: {
    itemId?: string;
    type?: TransactionType;
    fromDate?: string;
    toDate?: string;
    locationId?: string;
  }): Promise<StockTransaction[]> => {
    const response = await api.get('/inventory/transactions', { params });
    return response.data;
  },

  // Receive stock
  receiveStock: async (data: {
    itemId: string;
    quantity: number;
    locationId: string;
    lotNumber?: string;
    expirationDate?: string;
    serialNumbers?: string[];
    purchaseOrderId?: string;
    unitCost?: number;
    notes?: string;
  }): Promise<StockTransaction> => {
    const response = await api.post('/inventory/transactions/receive', data);
    return response.data;
  },

  // Issue stock
  issueStock: async (data: {
    itemId: string;
    quantity: number;
    locationId: string;
    lotId?: string;
    serialNumber?: string;
    requisitionId?: string;
    reason: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    const response = await api.post('/inventory/transactions/issue', data);
    return response.data;
  },

  // Transfer stock
  transferStock: async (data: {
    itemId: string;
    quantity: number;
    fromLocationId: string;
    toLocationId: string;
    lotId?: string;
    serialNumber?: string;
    reason: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    const response = await api.post('/inventory/transactions/transfer', data);
    return response.data;
  },

  // Adjust stock
  adjustStock: async (data: {
    itemId: string;
    quantity: number;
    locationId: string;
    lotId?: string;
    adjustmentType: 'increase' | 'decrease' | 'set';
    reason: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    const response = await api.post('/inventory/transactions/adjust', data);
    return response.data;
  },

  // Return stock
  returnStock: async (data: {
    itemId: string;
    quantity: number;
    locationId: string;
    originalTransactionId: string;
    condition: 'good' | 'damaged' | 'expired';
    reason: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    const response = await api.post('/inventory/transactions/return', data);
    return response.data;
  },

  // Dispose stock
  disposeStock: async (data: {
    itemId: string;
    quantity: number;
    locationId: string;
    lotId?: string;
    serialNumber?: string;
    reason: string;
    disposalMethod: string;
    notes?: string;
  }): Promise<StockTransaction> => {
    const response = await api.post('/inventory/transactions/dispose', data);
    return response.data;
  }
};

// ============================================================================
// PURCHASE ORDERS API
// ============================================================================

export const purchaseOrdersApi = {
  // Get all purchase orders
  getPurchaseOrders: async (params?: {
    status?: string;
    supplierId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PurchaseOrder[]> => {
    const response = await api.get('/inventory/purchase-orders', { params });
    return response.data;
  },

  // Get purchase order by ID
  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.get(`/inventory/purchase-orders/${id}`);
    return response.data;
  },

  // Create purchase order
  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await api.post('/inventory/purchase-orders', data);
    return response.data;
  },

  // Update purchase order
  updatePurchaseOrder: async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await api.put(`/inventory/purchase-orders/${id}`, data);
    return response.data;
  },

  // Delete purchase order
  deletePurchaseOrder: async (id: string): Promise<void> => {
    await api.delete(`/inventory/purchase-orders/${id}`);
  },

  // Submit for approval
  submitForApproval: async (id: string): Promise<void> => {
    await api.post(`/inventory/purchase-orders/${id}/submit`);
  },

  // Approve purchase order
  approvePurchaseOrder: async (id: string, comments?: string): Promise<void> => {
    await api.post(`/inventory/purchase-orders/${id}/approve`, { comments });
  },

  // Reject purchase order
  rejectPurchaseOrder: async (id: string, reason: string): Promise<void> => {
    await api.post(`/inventory/purchase-orders/${id}/reject`, { reason });
  },

  // Send to supplier
  sendToSupplier: async (id: string): Promise<void> => {
    await api.post(`/inventory/purchase-orders/${id}/send`);
  },

  // Receive items
  receiveItems: async (id: string, items: { itemId: string; quantityReceived: number; lotNumber?: string; expirationDate?: string }[]): Promise<void> => {
    await api.post(`/inventory/purchase-orders/${id}/receive`, { items });
  },

  // Cancel purchase order
  cancelPurchaseOrder: async (id: string, reason: string): Promise<void> => {
    await api.post(`/inventory/purchase-orders/${id}/cancel`, { reason });
  },

  // Generate auto-reorder PO
  generateAutoReorder: async (): Promise<PurchaseOrder> => {
    const response = await api.post('/inventory/purchase-orders/auto-reorder');
    return response.data;
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/inventory/purchase-orders/pending-approvals');
    return response.data;
  }
};

// ============================================================================
// REQUISITIONS API
// ============================================================================

export const requisitionsApi = {
  // Get all requisitions
  getRequisitions: async (params?: {
    status?: string;
    departmentId?: string;
    requestedBy?: string;
  }): Promise<Requisition[]> => {
    const response = await api.get('/inventory/requisitions', { params });
    return response.data;
  },

  // Get requisition by ID
  getRequisition: async (id: string): Promise<Requisition> => {
    const response = await api.get(`/inventory/requisitions/${id}`);
    return response.data;
  },

  // Create requisition
  createRequisition: async (data: Partial<Requisition>): Promise<Requisition> => {
    const response = await api.post('/inventory/requisitions', data);
    return response.data;
  },

  // Update requisition
  updateRequisition: async (id: string, data: Partial<Requisition>): Promise<Requisition> => {
    const response = await api.put(`/inventory/requisitions/${id}`, data);
    return response.data;
  },

  // Delete requisition
  deleteRequisition: async (id: string): Promise<void> => {
    await api.delete(`/inventory/requisitions/${id}`);
  },

  // Submit requisition
  submitRequisition: async (id: string): Promise<void> => {
    await api.post(`/inventory/requisitions/${id}/submit`);
  },

  // Approve requisition
  approveRequisition: async (id: string, items?: { itemId: string; quantityApproved: number }[]): Promise<void> => {
    await api.post(`/inventory/requisitions/${id}/approve`, { items });
  },

  // Reject requisition
  rejectRequisition: async (id: string, reason: string): Promise<void> => {
    await api.post(`/inventory/requisitions/${id}/reject`, { reason });
  },

  // Fulfill requisition
  fulfillRequisition: async (id: string, items: { itemId: string; quantityFulfilled: number; locationId: string }[]): Promise<void> => {
    await api.post(`/inventory/requisitions/${id}/fulfill`, { items });
  },

  // Cancel requisition
  cancelRequisition: async (id: string, reason: string): Promise<void> => {
    await api.post(`/inventory/requisitions/${id}/cancel`, { reason });
  },

  // Get my requisitions
  getMyRequisitions: async (): Promise<Requisition[]> => {
    const response = await api.get('/inventory/requisitions/my');
    return response.data;
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<Requisition[]> => {
    const response = await api.get('/inventory/requisitions/pending-approvals');
    return response.data;
  }
};

// ============================================================================
// SUPPLIERS API
// ============================================================================

export const suppliersApi = {
  // Get all suppliers
  getSuppliers: async (params?: { status?: string; type?: string; search?: string }): Promise<Supplier[]> => {
    const response = await api.get('/inventory/suppliers', { params });
    return response.data;
  },

  // Get supplier by ID
  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/inventory/suppliers/${id}`);
    return response.data;
  },

  // Create supplier
  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const response = await api.post('/inventory/suppliers', data);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await api.put(`/inventory/suppliers/${id}`, data);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/inventory/suppliers/${id}`);
  },

  // Get supplier items
  getSupplierItems: async (supplierId: string): Promise<InventoryItem[]> => {
    const response = await api.get(`/inventory/suppliers/${supplierId}/items`);
    return response.data;
  },

  // Get supplier orders
  getSupplierOrders: async (supplierId: string): Promise<PurchaseOrder[]> => {
    const response = await api.get(`/inventory/suppliers/${supplierId}/orders`);
    return response.data;
  },

  // Get supplier contracts
  getSupplierContracts: async (supplierId: string): Promise<Contract[]> => {
    const response = await api.get(`/inventory/suppliers/${supplierId}/contracts`);
    return response.data;
  },

  // Rate supplier
  rateSupplier: async (id: string, rating: number, feedback?: string): Promise<void> => {
    await api.post(`/inventory/suppliers/${id}/rate`, { rating, feedback });
  }
};

// ============================================================================
// LOCATIONS API
// ============================================================================

export const locationsApi = {
  // Get all locations
  getLocations: async (params?: { type?: string; departmentId?: string }): Promise<StorageLocation[]> => {
    const response = await api.get('/inventory/locations', { params });
    return response.data;
  },

  // Get location by ID
  getLocation: async (id: string): Promise<StorageLocation> => {
    const response = await api.get(`/inventory/locations/${id}`);
    return response.data;
  },

  // Create location
  createLocation: async (data: Partial<StorageLocation>): Promise<StorageLocation> => {
    const response = await api.post('/inventory/locations', data);
    return response.data;
  },

  // Update location
  updateLocation: async (id: string, data: Partial<StorageLocation>): Promise<StorageLocation> => {
    const response = await api.put(`/inventory/locations/${id}`, data);
    return response.data;
  },

  // Delete location
  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/inventory/locations/${id}`);
  },

  // Get location inventory
  getLocationInventory: async (locationId: string): Promise<{ item: InventoryItem; quantity: number; lots: Lot[] }[]> => {
    const response = await api.get(`/inventory/locations/${locationId}/inventory`);
    return response.data;
  },

  // Update temperature reading
  updateTemperature: async (locationId: string, temperature: number): Promise<void> => {
    await api.post(`/inventory/locations/${locationId}/temperature`, { temperature });
  }
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<ItemCategory[]> => {
    const response = await api.get('/inventory/categories');
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: string): Promise<ItemCategory> => {
    const response = await api.get(`/inventory/categories/${id}`);
    return response.data;
  },

  // Create category
  createCategory: async (data: Partial<ItemCategory>): Promise<ItemCategory> => {
    const response = await api.post('/inventory/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, data: Partial<ItemCategory>): Promise<ItemCategory> => {
    const response = await api.put(`/inventory/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/inventory/categories/${id}`);
  }
};

// ============================================================================
// PHYSICAL COUNTS API
// ============================================================================

export const physicalCountsApi = {
  // Get all counts
  getCounts: async (params?: { status?: string }): Promise<PhysicalCount[]> => {
    const response = await api.get('/inventory/counts', { params });
    return response.data;
  },

  // Get count by ID
  getCount: async (id: string): Promise<PhysicalCount> => {
    const response = await api.get(`/inventory/counts/${id}`);
    return response.data;
  },

  // Create count
  createCount: async (data: Partial<PhysicalCount>): Promise<PhysicalCount> => {
    const response = await api.post('/inventory/counts', data);
    return response.data;
  },

  // Start count
  startCount: async (id: string): Promise<void> => {
    await api.post(`/inventory/counts/${id}/start`);
  },

  // Record count
  recordCount: async (id: string, itemId: string, quantity: number, notes?: string): Promise<void> => {
    await api.post(`/inventory/counts/${id}/record`, { itemId, quantity, notes });
  },

  // Complete count
  completeCount: async (id: string): Promise<void> => {
    await api.post(`/inventory/counts/${id}/complete`);
  },

  // Apply adjustments
  applyAdjustments: async (id: string): Promise<void> => {
    await api.post(`/inventory/counts/${id}/apply`);
  },

  // Cancel count
  cancelCount: async (id: string, reason: string): Promise<void> => {
    await api.post(`/inventory/counts/${id}/cancel`, { reason });
  }
};

// ============================================================================
// ALERTS API
// ============================================================================

export const alertsApi = {
  // Get all alerts
  getAlerts: async (params?: { type?: string; severity?: string; status?: string }): Promise<Alert[]> => {
    const response = await api.get('/inventory/alerts', { params });
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (id: string): Promise<void> => {
    await api.post(`/inventory/alerts/${id}/acknowledge`);
  },

  // Resolve alert
  resolveAlert: async (id: string, notes?: string): Promise<void> => {
    await api.post(`/inventory/alerts/${id}/resolve`, { notes });
  },

  // Get alert settings
  getAlertSettings: async (): Promise<any> => {
    const response = await api.get('/inventory/alerts/settings');
    return response.data;
  },

  // Update alert settings
  updateAlertSettings: async (settings: any): Promise<void> => {
    await api.put('/inventory/alerts/settings', settings);
  }
};

// ============================================================================
// REPORTS API
// ============================================================================

export const reportsApi = {
  // Get usage report
  getUsageReport: async (params?: { category?: string; period?: string }): Promise<UsageReport[]> => {
    const response = await api.get('/inventory/reports/usage', { params });
    return response.data;
  },

  // Get valuation report
  getValuationReport: async (params?: { category?: string; location?: string }): Promise<any> => {
    const response = await api.get('/inventory/reports/valuation', { params });
    return response.data;
  },

  // Get expiration report
  getExpirationReport: async (days?: number): Promise<any> => {
    const response = await api.get('/inventory/reports/expiration', { params: { days } });
    return response.data;
  },

  // Get turnover report
  getTurnoverReport: async (params?: { category?: string; period?: string }): Promise<any> => {
    const response = await api.get('/inventory/reports/turnover', { params });
    return response.data;
  },

  // Get supplier performance report
  getSupplierPerformanceReport: async (): Promise<any> => {
    const response = await api.get('/inventory/reports/supplier-performance');
    return response.data;
  },

  // Export report
  exportReport: async (reportType: string, format: 'pdf' | 'excel' | 'csv', params?: any): Promise<Blob> => {
    const response = await api.get(`/inventory/reports/${reportType}/export`, {
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default {
  itemsApi,
  transactionsApi,
  purchaseOrdersApi,
  requisitionsApi,
  suppliersApi,
  locationsApi,
  categoriesApi,
  physicalCountsApi,
  alertsApi,
  reportsApi
};
