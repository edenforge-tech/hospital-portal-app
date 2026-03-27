'use client';

import { useState, useEffect } from 'react';
import { Pill, AlertCircle, Calendar, Package, TrendingUp, Search, Filter } from 'lucide-react';

interface PharmacyStats {
  totalPrescriptions: number;
  pendingRefills: number;
  expiringMeds: number;
  inventoryAlerts: number;
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refillsRemaining: number;
  prescribedDate: string;
  expiryDate: string;
  prescribedBy: string;
  status: 'active' | 'expired' | 'discontinued';
  lastFilled?: string;
}

export default function PharmacyPage() {
  const [stats, setStats] = useState<PharmacyStats>({
    totalPrescriptions: 0,
    pendingRefills: 0,
    expiringMeds: 0,
    inventoryAlerts: 0
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = async () => {
    try {
      // Simulated data - will be replaced with real API calls
      setStats({
        totalPrescriptions: 12,
        pendingRefills: 3,
        expiringMeds: 2,
        inventoryAlerts: 5
      });

      setPrescriptions([
        {
          id: '1',
          medicationName: 'Latanoprost Eye Drops',
          dosage: '0.005%',
          frequency: 'Once daily at bedtime',
          quantity: 2.5,
          refillsRemaining: 2,
          prescribedDate: '2025-12-15',
          expiryDate: '2026-06-15',
          prescribedBy: 'Dr. Sarah Johnson',
          status: 'active',
          lastFilled: '2025-12-15'
        },
        {
          id: '2',
          medicationName: 'Timolol Maleate',
          dosage: '0.5%',
          frequency: 'Twice daily',
          quantity: 5,
          refillsRemaining: 1,
          prescribedDate: '2025-11-20',
          expiryDate: '2026-05-20',
          prescribedBy: 'Dr. Sarah Johnson',
          status: 'active',
          lastFilled: '2026-01-10'
        },
        {
          id: '3',
          medicationName: 'Prednisolone Acetate',
          dosage: '1%',
          frequency: 'Four times daily',
          quantity: 10,
          refillsRemaining: 0,
          prescribedDate: '2026-01-15',
          expiryDate: '2026-02-15',
          prescribedBy: 'Dr. Michael Chen',
          status: 'active'
        }
      ]);
    } catch (error) {
      console.error('Failed to load pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefillRequest = (prescriptionId: string) => {
    console.log('Requesting refill for:', prescriptionId);
    // API call will go here
  };

  const statCards = [
    {
      title: 'Total Prescriptions',
      value: stats.totalPrescriptions,
      icon: Pill,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Pending Refills',
      value: stats.pendingRefills,
      icon: Calendar,
      color: 'bg-orange-500',
      change: 'Action needed'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringMeds,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: 'Within 30 days'
    },
    {
      title: 'Inventory Alerts',
      value: stats.inventoryAlerts,
      icon: Package,
      color: 'bg-purple-500',
      change: 'Low stock'
    }
  ];

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = rx.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      discontinued: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading pharmacy data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy Management</h1>
        <p className="text-gray-600 mt-1">Manage prescriptions and medication inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Alerts Banner */}
      {stats.expiringMeds > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Attention Required</p>
              <p className="text-sm text-yellow-700">
                {stats.expiringMeds} prescription(s) expiring within 30 days. Request refills soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Prescriptions</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              New Prescription
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No prescriptions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((rx) => (
                <div key={rx.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{rx.medicationName}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(rx.status)}`}>
                          {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                        </span>
                        {rx.refillsRemaining === 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            No Refills
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Dosage</p>
                          <p className="text-gray-900 font-medium">{rx.dosage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Frequency</p>
                          <p className="text-gray-900 font-medium">{rx.frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="text-gray-900 font-medium">{rx.quantity} mL</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Refills Remaining</p>
                          <p className="text-gray-900 font-medium">{rx.refillsRemaining}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Prescribed by: {rx.prescribedBy}</span>
                        <span>•</span>
                        <span>Prescribed: {new Date(rx.prescribedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Expires: {new Date(rx.expiryDate).toLocaleDateString()}</span>
                        {rx.lastFilled && (
                          <>
                            <span>•</span>
                            <span>Last Filled: {new Date(rx.lastFilled).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleRefillRequest(rx.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        disabled={rx.refillsRemaining === 0}
                      >
                        Request Refill
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Inventory Status</h3>
          </div>
          <p className="text-sm text-gray-600">Check medication stock levels</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Refill History</h3>
          </div>
          <p className="text-sm text-gray-600">View past refill records</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Usage Analytics</h3>
          </div>
          <p className="text-sm text-gray-600">Medication usage trends</p>
        </div>
      </div>
    </div>
  );
}
