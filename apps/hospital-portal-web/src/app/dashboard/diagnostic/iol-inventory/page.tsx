'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Search, Package, AlertTriangle, TrendingDown, Eye, Filter } from 'lucide-react';
import iolInventoryApi, { IOLInventoryItem, IOLStatistics } from '@/lib/api/iol-inventory.api';
import { toast } from 'react-hot-toast';

export default function IOLInventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<IOLInventoryItem[]>([]);
  const [statistics, setStatistics] = useState<IOLStatistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'MONOFOCAL' | 'MULTIFOCAL' | 'TORIC' | 'EDOF'>('ALL');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterType, showLowStock]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        iolInventoryApi.getAll({
          pageSize: 100,
          filter: {
            type: filterType !== 'ALL' ? filterType : undefined,
            lowStock: showLowStock || undefined,
          },
        }),
        iolInventoryApi.getStatistics(),
      ]);

      setItems(itemsData.data);
      setStatistics(statsData);
      toast.success('IOL inventory loaded');
    } catch (error) {
      console.error('Failed to fetch IOL inventory:', error);
      toast.error('Failed to load IOL inventory');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleNewItem = () => {
    router.push('/dashboard/diagnostic/iol-inventory/new');
  };

  const handleViewItem = (id: string) => {
    router.push(`/dashboard/diagnostic/iol-inventory/${id}`);
  };

  const stats = statistics || {
    totalItems: 0,
    totalStock: 0,
    lowStockCount: 0,
    totalValue: 0,
    monofocalCount: 0,
    multifocalCount: 0,
    toricCount: 0,
    edofCount: 0,
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { color: 'red', label: 'Out of Stock' };
    if (current <= minimum) return { color: 'amber', label: 'Low Stock' };
    if (current <= minimum * 2) return { color: 'yellow', label: 'Moderate' };
    return { color: 'green', label: 'Good Stock' };
  };

  return (
    <ProtectedRoute requiredPermission="INVENTORY:IOL:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              IOL Inventory & Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage intraocular lens inventory, stock levels, and A-constants
            </p>
          </div>
          <button
            onClick={handleNewItem}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add IOL Model
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Models</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Stock</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalStock} units</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-amber-900">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-purple-900">${stats.totalValue.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by model, manufacturer, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* IOL Type Filter */}
            <div className="flex gap-2">
              {['ALL', 'MONOFOCAL', 'MULTIFOCAL', 'TORIC', 'EDOF'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Low Stock Toggle */}
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showLowStock
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              Low Stock Only
            </button>
          </div>
        </div>

        {/* IOL Inventory Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading IOL inventory...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No IOL Models Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first IOL model'}
              </p>
              <button
                onClick={handleNewItem}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First IOL Model
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model & Manufacturer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    A-Constant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.model}</div>
                          <div className="text-sm text-gray-500">{item.manufacturer}</div>
                          <div className="text-xs text-gray-400">SKU: {item.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.type === 'MONOFOCAL' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'MULTIFOCAL' ? 'bg-purple-100 text-purple-800' :
                          item.type === 'TORIC' ? 'bg-green-100 text-green-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        +{item.powerRangeMin} to +{item.powerRangeMax} D
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.aConstant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-semibold">{item.currentStock}</span> / {item.minimumStock} min
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              stockStatus.color === 'red' ? 'bg-red-600' :
                              stockStatus.color === 'amber' ? 'bg-amber-600' :
                              stockStatus.color === 'yellow' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min((item.currentStock / (item.minimumStock * 3)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                          stockStatus.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                          stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewItem(item.id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* IOL Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">IOL Type Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Monofocal</p>
              <p className="text-3xl font-bold text-blue-900">{stats.monofocalCount}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Multifocal</p>
              <p className="text-3xl font-bold text-purple-900">{stats.multifocalCount}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Toric</p>
              <p className="text-3xl font-bold text-green-900">{stats.toricCount}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600">EDOF</p>
              <p className="text-3xl font-bold text-amber-900">{stats.edofCount}</p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 IOL Types Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
            <div><span className="font-medium">Monofocal:</span> Single focus distance (distance or near)</div>
            <div><span className="font-medium">Multifocal:</span> Multiple focus points for reduced glasses dependence</div>
            <div><span className="font-medium">Toric:</span> Corrects astigmatism (cylindrical power)</div>
            <div><span className="font-medium">EDOF:</span> Extended Depth of Focus for intermediate vision</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
