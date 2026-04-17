'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Plus, Search, Glasses, Eye, ShoppingCart, Package, 
  CreditCard, Truck, CheckCircle, Clock, AlertTriangle,
  Tag, BarChart, RefreshCcw, FileText
} from 'lucide-react';

interface OpticalProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: 'frames' | 'lenses' | 'contact-lenses' | 'sunglasses' | 'accessories';
  subcategory?: string;
  price: number;
  costPrice: number;
  quantity: number;
  reorderLevel: number;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface OpticalOrder {
  id: string;
  orderNumber: string;
  patientMRN: string;
  patientName: string;
  orderDate: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  prescriptionId?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

const mockProducts: OpticalProduct[] = [
  {
    id: '1',
    sku: 'FR-RAY-001',
    name: 'Aviator Classic',
    brand: 'Ray-Ban',
    category: 'frames',
    subcategory: 'Metal Frames',
    price: 8500,
    costPrice: 5000,
    quantity: 15,
    reorderLevel: 5,
    supplier: 'Luxottica India',
    status: 'in-stock'
  },
  {
    id: '2',
    sku: 'FR-TIT-002',
    name: 'Titanium Flex',
    brand: 'Titan EyePlus',
    category: 'frames',
    subcategory: 'Titanium',
    price: 4500,
    costPrice: 2500,
    quantity: 8,
    reorderLevel: 5,
    supplier: 'Titan Eyewear',
    status: 'in-stock'
  },
  {
    id: '3',
    sku: 'LN-ESS-001',
    name: 'Essilor Crizal UV',
    brand: 'Essilor',
    category: 'lenses',
    subcategory: 'Single Vision',
    price: 3500,
    costPrice: 2000,
    quantity: 25,
    reorderLevel: 10,
    supplier: 'Essilor India',
    status: 'in-stock'
  },
  {
    id: '4',
    sku: 'LN-ZEI-002',
    name: 'Zeiss Progressive',
    brand: 'Carl Zeiss',
    category: 'lenses',
    subcategory: 'Progressive',
    price: 12000,
    costPrice: 7500,
    quantity: 4,
    reorderLevel: 5,
    supplier: 'Zeiss Vision Care',
    status: 'low-stock'
  },
  {
    id: '5',
    sku: 'CL-ALC-001',
    name: 'Dailies Total 1',
    brand: 'Alcon',
    category: 'contact-lenses',
    subcategory: 'Daily Disposable',
    price: 2800,
    costPrice: 1800,
    quantity: 50,
    reorderLevel: 20,
    supplier: 'Alcon Laboratories',
    status: 'in-stock'
  },
  {
    id: '6',
    sku: 'CL-JJ-002',
    name: 'Acuvue Oasys',
    brand: 'Johnson & Johnson',
    category: 'contact-lenses',
    subcategory: 'Bi-weekly',
    price: 1800,
    costPrice: 1100,
    quantity: 2,
    reorderLevel: 10,
    supplier: 'J&J Vision',
    status: 'low-stock'
  },
];

const mockOrders: OpticalOrder[] = [
  {
    id: '1',
    orderNumber: 'OPT-2024-001',
    patientMRN: 'MRN-2024-0456',
    patientName: 'Rajesh Kumar',
    orderDate: '2024-01-15',
    items: [
      { product: 'Ray-Ban Aviator', quantity: 1, price: 8500 },
      { product: 'Essilor Crizal UV', quantity: 2, price: 7000 },
    ],
    totalAmount: 15500,
    status: 'processing',
    prescriptionId: 'RX-2024-0123',
    paymentStatus: 'paid'
  },
  {
    id: '2',
    orderNumber: 'OPT-2024-002',
    patientMRN: 'MRN-2024-0789',
    patientName: 'Sunita Devi',
    orderDate: '2024-01-15',
    items: [
      { product: 'Titan EyePlus Flex', quantity: 1, price: 4500 },
      { product: 'Zeiss Progressive', quantity: 2, price: 24000 },
    ],
    totalAmount: 28500,
    status: 'ready',
    prescriptionId: 'RX-2024-0124',
    paymentStatus: 'partial'
  },
  {
    id: '3',
    orderNumber: 'OPT-2024-003',
    patientMRN: 'MRN-2024-0234',
    patientName: 'Mohammed Ali',
    orderDate: '2024-01-14',
    items: [
      { product: 'Acuvue Oasys (6 pack)', quantity: 2, price: 3600 },
    ],
    totalAmount: 3600,
    status: 'delivered',
    paymentStatus: 'paid'
  },
];

export default function OpticalShopPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'prescriptions'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'in-stock': 'bg-green-100 text-green-800',
      'low-stock': 'bg-yellow-100 text-yellow-800',
      'out-of-stock': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800',
      'processing': 'bg-blue-100 text-blue-800',
      'ready': 'bg-green-100 text-green-800',
      'delivered': 'bg-gray-100 text-gray-600',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      'unpaid': 'bg-red-100 text-red-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Statistics
  const totalProducts = mockProducts.length;
  const lowStockCount = mockProducts.filter(p => p.status === 'low-stock').length;
  const pendingOrders = mockOrders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const todaysRevenue = mockOrders.filter(o => o.orderDate === '2024-01-15').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <ProtectedRoute requiredPermission="OPTICAL:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Glasses className="h-8 w-8 text-blue-600" />
              Optical Shop Management
            </h1>
            <p className="text-gray-600 mt-1">
              Frames, lenses, contact lenses inventory and orders
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/optical/new-order')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              New Order
            </button>
            <button
              onClick={() => router.push('/dashboard/optical/add-product')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-900">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-900">₹{todaysRevenue.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-purple-900">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, brand, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value="frames">Frames</option>
                <option value="lenses">Lenses</option>
                <option value="contact-lenses">Contact Lenses</option>
                <option value="sunglasses">Sunglasses</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                          {product.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.quantity <= product.reorderLevel ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.quantity}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">(min: {product.reorderLevel})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button className="text-gray-600 hover:text-gray-800">Reorder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">{order.patientName} ({order.patientMRN})</p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(order.status)}
                    {getPaymentBadge(order.paymentStatus)}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left font-normal pb-2">Item</th>
                        <th className="text-center font-normal pb-2">Qty</th>
                        <th className="text-right font-normal pb-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{item.product}</td>
                          <td className="text-center py-1">{item.quantity}</td>
                          <td className="text-right py-1">₹{item.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={2} className="pt-2 font-semibold">Total</td>
                        <td className="text-right pt-2 font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Order Date: {new Date(order.orderDate).toLocaleDateString('en-IN')}
                    {order.prescriptionId && (
                      <span className="ml-4">Prescription: {order.prescriptionId}</span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                      View Details
                    </button>
                    {order.status === 'ready' && (
                      <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Optical Prescriptions</h3>
            <p className="text-gray-600 mb-4">View and manage optical prescriptions for frame/lens orders</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              View All Prescriptions
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
