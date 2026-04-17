'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw,
  MoreVertical,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Barcode,
  MapPin,
  Truck,
  FileText,
  Settings,
  Tag,
  Box,
  Thermometer,
  Calendar,
  DollarSign,
  ShoppingCart,
  ClipboardList,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Copy,
  Archive,
  History,
  QrCode,
  Layers,
  AlertOctagon,
  PackageCheck,
  PackageX,
  RotateCcw,
  ArrowRightLeft,
  Minus,
  BarChart3,
  PieChart,
  Grid,
  List,
  SlidersHorizontal,
  Shield
} from 'lucide-react';
import { inventoryDashboardApi, type InventoryDashboardSummary } from '@/lib/api/inventory-service.api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface InventoryItem {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  subcategory?: string;
  type: 'supply' | 'equipment' | 'medication' | 'consumable';
  manufacturer: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  location: string;
  expirationTracking: boolean;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'discontinued';
  lastCountedAt?: string;
  lastOrderedAt?: string;
  updatedAt: string;
}

interface StockAlert {
  id: string;
  type: 'low-stock' | 'expiring' | 'expired' | 'reorder' | 'temperature';
  severity: 'info' | 'warning' | 'critical';
  itemId: string;
  itemName: string;
  message: string;
  createdAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';
  itemCount: number;
  total: number;
  expectedDate?: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'active' | 'inactive';
  itemCount: number;
  totalSpend: number;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  code: string;
  itemCount: number;
  subcategories?: Category[];
}

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  itemCount: number;
  capacity: number;
  occupancy: number;
}

interface DashboardMetric {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockItems: InventoryItem[] = [
  {
    id: '1',
    sku: 'MED-001',
    barcode: '1234567890123',
    name: 'Surgical Gloves (Box of 100)',
    category: 'Medical Supplies',
    subcategory: 'Personal Protective Equipment',
    type: 'consumable',
    manufacturer: 'MedSafe Inc.',
    quantityOnHand: 250,
    quantityReserved: 50,
    reorderLevel: 100,
    reorderQuantity: 500,
    unitCost: 12.99,
    totalValue: 3247.50,
    location: 'Warehouse A - Shelf 12',
    expirationTracking: true,
    status: 'in-stock',
    lastCountedAt: '2026-01-20T10:00:00Z',
    lastOrderedAt: '2026-01-15T14:00:00Z',
    updatedAt: '2026-01-23T08:00:00Z'
  },
  {
    id: '2',
    sku: 'MED-002',
    barcode: '1234567890124',
    name: 'N95 Respirator Masks (Box of 20)',
    category: 'Medical Supplies',
    subcategory: 'Personal Protective Equipment',
    type: 'consumable',
    manufacturer: '3M Healthcare',
    quantityOnHand: 45,
    quantityReserved: 10,
    reorderLevel: 50,
    reorderQuantity: 200,
    unitCost: 24.99,
    totalValue: 1124.55,
    location: 'Warehouse A - Shelf 13',
    expirationTracking: true,
    status: 'low-stock',
    lastCountedAt: '2026-01-21T09:00:00Z',
    lastOrderedAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-01-23T07:30:00Z'
  },
  {
    id: '3',
    sku: 'EQP-001',
    barcode: '1234567890125',
    name: 'Portable ECG Monitor',
    category: 'Medical Equipment',
    subcategory: 'Diagnostic Equipment',
    type: 'equipment',
    manufacturer: 'Philips Healthcare',
    quantityOnHand: 12,
    quantityReserved: 3,
    reorderLevel: 5,
    reorderQuantity: 10,
    unitCost: 2499.00,
    totalValue: 29988.00,
    location: 'Equipment Storage B',
    expirationTracking: false,
    status: 'in-stock',
    lastCountedAt: '2026-01-19T14:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z'
  },
  {
    id: '4',
    sku: 'MED-003',
    barcode: '1234567890126',
    name: 'IV Catheter 20G (Box of 50)',
    category: 'Medical Supplies',
    subcategory: 'IV Supplies',
    type: 'consumable',
    manufacturer: 'BD Medical',
    quantityOnHand: 0,
    quantityReserved: 0,
    reorderLevel: 30,
    reorderQuantity: 100,
    unitCost: 45.00,
    totalValue: 0,
    location: 'Stockroom C - Bin 5',
    expirationTracking: true,
    status: 'out-of-stock',
    lastCountedAt: '2026-01-22T11:00:00Z',
    lastOrderedAt: '2026-01-23T08:00:00Z',
    updatedAt: '2026-01-23T08:30:00Z'
  },
  {
    id: '5',
    sku: 'MED-004',
    name: 'Sterile Gauze Pads 4x4 (Pack of 100)',
    category: 'Medical Supplies',
    subcategory: 'Wound Care',
    type: 'consumable',
    manufacturer: 'Johnson & Johnson',
    quantityOnHand: 180,
    quantityReserved: 20,
    reorderLevel: 75,
    reorderQuantity: 250,
    unitCost: 8.50,
    totalValue: 1530.00,
    location: 'Stockroom C - Bin 8',
    expirationTracking: true,
    status: 'in-stock',
    lastCountedAt: '2026-01-18T15:00:00Z',
    updatedAt: '2026-01-21T12:00:00Z'
  },
  {
    id: '6',
    sku: 'PHARM-001',
    name: 'Acetaminophen 500mg (Bottle of 500)',
    category: 'Pharmaceuticals',
    subcategory: 'Pain Management',
    type: 'medication',
    manufacturer: 'Generic Pharma',
    quantityOnHand: 85,
    quantityReserved: 5,
    reorderLevel: 50,
    reorderQuantity: 100,
    unitCost: 15.99,
    totalValue: 1359.15,
    location: 'Pharmacy Storage - Controlled',
    expirationTracking: true,
    status: 'in-stock',
    lastCountedAt: '2026-01-23T06:00:00Z',
    updatedAt: '2026-01-23T06:30:00Z'
  }
];

const mockAlerts: StockAlert[] = [
  {
    id: 'a1',
    type: 'low-stock',
    severity: 'warning',
    itemId: '2',
    itemName: 'N95 Respirator Masks',
    message: 'Stock level below reorder point (45 < 50)',
    createdAt: '2026-01-23T07:30:00Z',
    status: 'active'
  },
  {
    id: 'a2',
    type: 'reorder',
    severity: 'critical',
    itemId: '4',
    itemName: 'IV Catheter 20G',
    message: 'Item out of stock - order placed',
    createdAt: '2026-01-23T08:00:00Z',
    status: 'active'
  },
  {
    id: 'a3',
    type: 'expiring',
    severity: 'warning',
    itemId: '1',
    itemName: 'Surgical Gloves',
    message: '50 units expiring in 30 days',
    createdAt: '2026-01-22T10:00:00Z',
    status: 'active'
  },
  {
    id: 'a4',
    type: 'temperature',
    severity: 'critical',
    itemId: '',
    itemName: 'Refrigerator Unit 2',
    message: 'Temperature exceeds safe range (12°C > 8°C)',
    createdAt: '2026-01-23T09:15:00Z',
    status: 'active'
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', orderNumber: 'PO-2026-001', supplier: 'MedSafe Inc.', status: 'ordered', itemCount: 5, total: 2450.00, expectedDate: '2026-01-28', createdAt: '2026-01-20T10:00:00Z' },
  { id: 'po2', orderNumber: 'PO-2026-002', supplier: 'BD Medical', status: 'pending', itemCount: 3, total: 1850.00, createdAt: '2026-01-23T08:00:00Z' },
  { id: 'po3', orderNumber: 'PO-2026-003', supplier: '3M Healthcare', status: 'draft', itemCount: 8, total: 5200.00, createdAt: '2026-01-23T09:00:00Z' },
  { id: 'po4', orderNumber: 'PO-2025-098', supplier: 'Philips Healthcare', status: 'received', itemCount: 2, total: 8500.00, createdAt: '2026-01-10T14:00:00Z' }
];

const mockCategories: Category[] = [
  { id: 'c1', name: 'Medical Supplies', code: 'MED', itemCount: 1245 },
  { id: 'c2', name: 'Medical Equipment', code: 'EQP', itemCount: 189 },
  { id: 'c3', name: 'Pharmaceuticals', code: 'PHARM', itemCount: 567 },
  { id: 'c4', name: 'Laboratory Supplies', code: 'LAB', itemCount: 234 },
  { id: 'c5', name: 'Office Supplies', code: 'OFF', itemCount: 156 }
];

const mockLocations: Location[] = [
  { id: 'l1', name: 'Warehouse A', code: 'WH-A', type: 'warehouse', itemCount: 856, capacity: 1000, occupancy: 85.6 },
  { id: 'l2', name: 'Equipment Storage B', code: 'EQ-B', type: 'stockroom', itemCount: 189, capacity: 250, occupancy: 75.6 },
  { id: 'l3', name: 'Stockroom C', code: 'SR-C', type: 'stockroom', itemCount: 423, capacity: 500, occupancy: 84.6 },
  { id: 'l4', name: 'Pharmacy Storage', code: 'PH-S', type: 'controlled', itemCount: 567, capacity: 600, occupancy: 94.5 },
  { id: 'l5', name: 'ER Supply Cart', code: 'ER-C1', type: 'cart', itemCount: 45, capacity: 50, occupancy: 90.0 }
];

const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'MedSafe Inc.', code: 'MEDSAFE', type: 'distributor', status: 'active', itemCount: 234, totalSpend: 125000, rating: 4.8 },
  { id: 's2', name: '3M Healthcare', code: '3MHC', type: 'manufacturer', status: 'active', itemCount: 89, totalSpend: 78000, rating: 4.9 },
  { id: 's3', name: 'BD Medical', code: 'BDMED', type: 'manufacturer', status: 'active', itemCount: 156, totalSpend: 95000, rating: 4.7 },
  { id: 's4', name: 'Philips Healthcare', code: 'PHILIPS', type: 'manufacturer', status: 'active', itemCount: 45, totalSpend: 250000, rating: 4.6 },
  { id: 's5', name: 'Generic Pharma', code: 'GENPH', type: 'distributor', status: 'active', itemCount: 312, totalSpend: 45000, rating: 4.4 }
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const MetricCard: React.FC<{ metric: DashboardMetric }> = ({ metric }) => {
  const Icon = metric.icon;
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[metric.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {metric.trend && (
          <div className={`flex items-center gap-1 text-sm ${
            metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {metric.trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {metric.trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {metric.change !== undefined && <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{metric.name}</p>
      </div>
    </div>
  );
};

const AlertBadge: React.FC<{ alert: StockAlert }> = ({ alert }) => {
  const severityColors = {
    info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
  };

  const typeIcons = {
    'low-stock': <AlertTriangle className="w-4 h-4" />,
    'expiring': <Clock className="w-4 h-4" />,
    'expired': <AlertOctagon className="w-4 h-4" />,
    'reorder': <ShoppingCart className="w-4 h-4" />,
    'temperature': <Thermometer className="w-4 h-4" />
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${severityColors[alert.severity]}`}>
      <div className="mt-0.5">{typeIcons[alert.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{alert.itemName}</p>
        <p className="text-sm opacity-80">{alert.message}</p>
        <p className="text-xs opacity-60 mt-1">
          {new Date(alert.createdAt).toLocaleString()}
        </p>
      </div>
      <button className="text-xs font-medium hover:underline">
        View
      </button>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon?: React.ElementType }> = {
    'in-stock': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
    'low-stock': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: AlertTriangle },
    'out-of-stock': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: PackageX },
    'expired': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', icon: AlertOctagon },
    'discontinued': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-500', icon: Minus },
    'draft': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
    'pending': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    'approved': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    'ordered': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    'partial': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    'received': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    'cancelled': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    'active': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    'inactive': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-500' }
  };

  const config = statusConfig[status] || statusConfig['active'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {status.replace('-', ' ')}
    </span>
  );
};

const InventoryTable: React.FC<{ 
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onView: (item: InventoryItem) => void;
}> = ({ items, onEdit, onView }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">On Hand</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Cost</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.manufacturer}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <code className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {item.sku}
                </code>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{item.category}</td>
              <td className="px-4 py-4 text-center">
                <span className={`font-medium ${
                  item.quantityOnHand <= item.reorderLevel ? 'text-red-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {item.quantityOnHand}
                </span>
                {item.quantityOnHand <= item.reorderLevel && (
                  <div className="text-xs text-gray-500">Min: {item.reorderLevel}</div>
                )}
              </td>
              <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                {item.quantityOnHand - item.quantityReserved}
              </td>
              <td className="px-4 py-4 text-right text-gray-900 dark:text-white font-medium">
                ${item.unitCost.toFixed(2)}
              </td>
              <td className="px-4 py-4 text-center">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-1">
                  <button 
                    onClick={() => onView(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'orders' | 'suppliers' | 'locations'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [procurementSummary, setProcurementSummary] = useState<InventoryDashboardSummary | null>(null);

  useEffect(() => {
    inventoryDashboardApi.getSummary()
      .then(setProcurementSummary)
      .catch(() => { /* graceful — no summary shown */ });
  }, []);

  const dashboardMetrics: DashboardMetric[] = [
    { id: '1', name: 'Total Items', value: '2,391', icon: Package, color: 'blue' },
    { id: '2', name: 'Total Value', value: '$1.2M', previousValue: 1150000, change: 4.3, trend: 'up', icon: DollarSign, color: 'green' },
    { id: '3', name: 'Low Stock Items', value: '23', previousValue: 28, change: -17.8, trend: 'down', icon: AlertTriangle, color: 'yellow' },
    { id: '4', name: 'Out of Stock', value: '5', previousValue: 3, change: 66.7, trend: 'up', icon: PackageX, color: 'red' },
    { id: '5', name: 'Pending Orders', value: '12', icon: ShoppingCart, color: 'purple' },
    { id: '6', name: 'Active Suppliers', value: '45', icon: Truck, color: 'orange' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Inventory Management
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Barcode className="w-4 h-4" />
                <span className="text-sm">Scan</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Item</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'items', label: 'Items', icon: Package },
              { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
              { id: 'suppliers', label: 'Suppliers', icon: Truck },
              { id: 'locations', label: 'Locations', icon: MapPin }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Procurement Overview — live data */}
            {procurementSummary && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    Procurement Overview
                  </h3>
                  <div className="flex gap-2">
                    <Link href="/admin/inventory/requisitions" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Requisitions →</Link>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Link href="/admin/inventory/po" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Purchase Orders →</Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Pending Requisitions', value: procurementSummary.pendingRequisitions, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: ClipboardList },
                    { label: 'Open RFQs', value: procurementSummary.openRfqs, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: FileText },
                    { label: 'Pending POs', value: procurementSummary.pendingPoCount, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: ShoppingCart },
                    { label: 'Low Stock Items', value: procurementSummary.lowStockCount, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: AlertTriangle },
                    { label: 'This Month Spend', value: `₹${procurementSummary.thisMonthPoSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: DollarSign },
                    { label: 'On-Time Delivery', value: `${procurementSummary.onTimeDeliveryRate}%`, color: procurementSummary.onTimeDeliveryRate >= 80 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', bg: procurementSummary.onTimeDeliveryRate >= 80 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20', icon: Truck },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-lg p-4 ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {dashboardMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>

            {/* Alerts and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Alerts */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Active Alerts
                  </h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
                </div>
                <div className="space-y-3">
                  {mockAlerts.slice(0, 4).map((alert) => (
                    <AlertBadge key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: Plus, label: 'Add New Item', color: 'blue' },
                    { icon: ShoppingCart, label: 'Create Purchase Order', color: 'green' },
                    { icon: ClipboardList, label: 'Start Physical Count', color: 'purple' },
                    { icon: ArrowRightLeft, label: 'Stock Transfer', color: 'orange' },
                    { icon: RotateCcw, label: 'Process Return', color: 'red' },
                    { icon: FileText, label: 'Generate Report', color: 'gray' }
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Purchase Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  Recent Purchase Orders
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockPurchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-blue-600">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order.supplier}</td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{order.itemCount}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          ${order.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {order.expectedDate || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Categories and Locations Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  Categories
                </h3>
                <div className="space-y-3">
                  {mockCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
                          {category.code}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{category.itemCount} items</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Suppliers */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-500" />
                  Top Suppliers
                </h3>
                <div className="space-y-3">
                  {mockSuppliers.slice(0, 5).map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.itemCount} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">${(supplier.totalSpend / 1000).toFixed(0)}k</p>
                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                          {'★'.repeat(Math.floor(supplier.rating))}
                          <span className="text-gray-400 ml-1">{supplier.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items by name or SKU..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {mockCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600'}`}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Items Table/Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <InventoryTable 
                items={filteredItems}
                onEdit={(item) => console.log('Edit:', item)}
                onView={(item) => console.log('View:', item)}
              />
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">{filteredItems.length}</span> of <span className="font-medium">{mockItems.length}</span> items
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Orders</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Order
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockPurchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium text-blue-600">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order.supplier}</td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{order.itemCount}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          ${order.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {order.expectedDate || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-green-600 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Suppliers</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSuppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={supplier.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{supplier.itemCount}</p>
                      <p className="text-xs text-gray-500">Items</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">${(supplier.totalSpend / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-500">Spend</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-yellow-500 flex items-center justify-center gap-1">
                        ★ {supplier.rating}
                      </p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100">
                      View Details
                    </button>
                    <button className="px-3 py-2 text-sm text-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Locations</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockLocations.map((location) => (
                <div key={location.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{location.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{location.type}</p>
                      </div>
                    </div>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.code}</code>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Capacity Usage</span>
                      <span className="font-medium text-gray-900 dark:text-white">{location.occupancy}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          location.occupancy > 90 ? 'bg-red-500' : location.occupancy > 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${location.occupancy}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{location.itemCount} items stored</span>
                    <button className="text-blue-600 hover:text-blue-700">View Items →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
