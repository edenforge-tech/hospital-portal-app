'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface LabOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientMrn: string;
  providerName: string;
  status: string;
  priority: string;
  orderDate: string;
  tests: { name: string; status: string; result?: string; flag?: string }[];
  specimenCollected: boolean;
}

interface Specimen {
  id: string;
  specimenNumber: string;
  patientName: string;
  type: string;
  status: string;
  collectedAt?: string;
  collectedBy?: string;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    collected: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    on_hold: 'bg-gray-100 text-gray-700',
    preliminary: 'bg-cyan-100 text-cyan-700',
    final: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    stat: 'bg-red-100 text-red-700 border border-red-300',
    urgent: 'bg-orange-100 text-orange-700',
    asap: 'bg-yellow-100 text-yellow-700',
    routine: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || colors.routine}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function ResultFlag({ flag }: { flag?: string }) {
  if (!flag || flag === 'normal') return <span className="text-green-600 text-xs">Normal</span>;
  
  const colors: Record<string, string> = {
    abnormal: 'text-yellow-600',
    high: 'text-orange-600',
    low: 'text-blue-600',
    critical: 'text-red-600 font-bold',
    critical_high: 'text-red-600 font-bold',
    critical_low: 'text-red-600 font-bold',
  };

  return <span className={`text-xs ${colors[flag] || 'text-gray-600'}`}>{flag.replace(/_/g, ' ').toUpperCase()}</span>;
}

function MetricCard({ label, value, icon, color, alert }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-lg border ${alert ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
        {alert && <span className="text-red-500 animate-pulse">⚠️</span>}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function LabIntegrationPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'specimens' | 'results' | 'catalog'>('orders');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Mock data
  const labOrders: LabOrder[] = [
    {
      id: '1',
      orderNumber: 'LAB-2026-001234',
      patientName: 'John Smith',
      patientMrn: 'MRN-2026-001',
      providerName: 'Dr. Sarah Wilson',
      status: 'completed',
      priority: 'routine',
      orderDate: '2026-01-24',
      specimenCollected: true,
      tests: [
        { name: 'Complete Blood Count (CBC)', status: 'final', result: 'See details', flag: 'normal' },
        { name: 'Comprehensive Metabolic Panel', status: 'final', result: 'See details', flag: 'abnormal' },
      ],
    },
    {
      id: '2',
      orderNumber: 'LAB-2026-001235',
      patientName: 'Emily Johnson',
      patientMrn: 'MRN-2026-015',
      providerName: 'Dr. Michael Chen',
      status: 'in_progress',
      priority: 'urgent',
      orderDate: '2026-01-24',
      specimenCollected: true,
      tests: [
        { name: 'Troponin I', status: 'in_progress' },
        { name: 'BNP', status: 'pending' },
      ],
    },
    {
      id: '3',
      orderNumber: 'LAB-2026-001236',
      patientName: 'Michael Davis',
      patientMrn: 'MRN-2026-022',
      providerName: 'Dr. Lisa Anderson',
      status: 'pending',
      priority: 'stat',
      orderDate: '2026-01-24',
      specimenCollected: false,
      tests: [
        { name: 'Blood Culture x2', status: 'pending' },
        { name: 'Lactate', status: 'pending' },
        { name: 'Procalcitonin', status: 'pending' },
      ],
    },
    {
      id: '4',
      orderNumber: 'LAB-2026-001237',
      patientName: 'Sarah Williams',
      patientMrn: 'MRN-2025-089',
      providerName: 'Dr. Sarah Wilson',
      status: 'completed',
      priority: 'routine',
      orderDate: '2026-01-23',
      specimenCollected: true,
      tests: [
        { name: 'HbA1c', status: 'final', result: '7.2%', flag: 'high' },
        { name: 'Lipid Panel', status: 'final', result: 'See details', flag: 'normal' },
      ],
    },
    {
      id: '5',
      orderNumber: 'LAB-2026-001238',
      patientName: 'Robert Brown',
      patientMrn: 'MRN-2026-031',
      providerName: 'Dr. Jennifer Martinez',
      status: 'collected',
      priority: 'asap',
      orderDate: '2026-01-24',
      specimenCollected: true,
      tests: [
        { name: 'Urinalysis', status: 'in_progress' },
        { name: 'Urine Culture', status: 'pending' },
      ],
    },
  ];

  const specimens: Specimen[] = [
    { id: '1', specimenNumber: 'SP-2026-0001', patientName: 'John Smith', type: 'Blood - EDTA', status: 'completed', collectedAt: '2026-01-24 08:30', collectedBy: 'Jane Doe, RN' },
    { id: '2', specimenNumber: 'SP-2026-0002', patientName: 'Emily Johnson', type: 'Blood - SST', status: 'processing', collectedAt: '2026-01-24 09:15', collectedBy: 'Mike Smith, RN' },
    { id: '3', specimenNumber: 'SP-2026-0003', patientName: 'Michael Davis', type: 'Blood Culture x2', status: 'pending_collection' },
    { id: '4', specimenNumber: 'SP-2026-0004', patientName: 'Robert Brown', type: 'Urine - Clean Catch', status: 'received', collectedAt: '2026-01-24 10:00', collectedBy: 'Self-collected' },
  ];

  const testCatalog = [
    { code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', turnaround: '2 hours', specimen: 'Blood - EDTA' },
    { code: 'CMP', name: 'Comprehensive Metabolic Panel', category: 'Chemistry', turnaround: '4 hours', specimen: 'Blood - SST' },
    { code: 'BMP', name: 'Basic Metabolic Panel', category: 'Chemistry', turnaround: '2 hours', specimen: 'Blood - SST' },
    { code: 'LIPID', name: 'Lipid Panel', category: 'Chemistry', turnaround: '4 hours', specimen: 'Blood - SST' },
    { code: 'TSH', name: 'Thyroid Stimulating Hormone', category: 'Endocrinology', turnaround: '4 hours', specimen: 'Blood - SST' },
    { code: 'HBA1C', name: 'Hemoglobin A1c', category: 'Endocrinology', turnaround: '24 hours', specimen: 'Blood - EDTA' },
    { code: 'UA', name: 'Urinalysis', category: 'Urinalysis', turnaround: '1 hour', specimen: 'Urine' },
    { code: 'TROP', name: 'Troponin I', category: 'Cardiac', turnaround: '1 hour', specimen: 'Blood - SST' },
    { code: 'BNP', name: 'B-type Natriuretic Peptide', category: 'Cardiac', turnaround: '2 hours', specimen: 'Blood - EDTA' },
    { code: 'PT', name: 'Prothrombin Time / INR', category: 'Coagulation', turnaround: '1 hour', specimen: 'Blood - Citrate' },
  ];

  const filteredOrders = labOrders.filter(order => {
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesPriority = priorityFilter === '' || order.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleViewResults = (order: LabOrder) => {
    setSelectedOrder(order);
    setShowResultsModal(true);
  };

  const criticalCount = labOrders.filter(o => o.tests.some(t => t.flag?.includes('critical'))).length;
  const pendingCollection = labOrders.filter(o => !o.specimenCollected).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Integration</h1>
          <p className="text-gray-500 mt-1">Manage lab orders, specimens, and results</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>🖨️</span>
            Print Labels
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            New Lab Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'orders', label: 'Lab Orders', icon: '📋' },
            { id: 'specimens', label: 'Specimens', icon: '🧪' },
            { id: 'results', label: 'Critical Results', icon: '⚠️' },
            { id: 'catalog', label: 'Test Catalog', icon: '📖' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'results' && criticalCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{criticalCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Pending Orders" value={labOrders.filter(o => o.status === 'pending').length} icon="⏳" color="bg-yellow-100" />
            <MetricCard label="In Progress" value={labOrders.filter(o => o.status === 'in_progress').length} icon="🔬" color="bg-purple-100" />
            <MetricCard label="Completed Today" value={labOrders.filter(o => o.status === 'completed').length} icon="✅" color="bg-green-100" />
            <MetricCard label="Pending Collection" value={pendingCollection} icon="🩸" color="bg-blue-100" alert={pendingCollection > 0} />
            <MetricCard label="Critical Results" value={criticalCount} icon="🚨" color="bg-red-100" alert={criticalCount > 0} />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="collected">Collected</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="stat">STAT</option>
              <option value="urgent">Urgent</option>
              <option value="asap">ASAP</option>
              <option value="routine">Routine</option>
            </select>
            <input
              type="text"
              placeholder="Search by order #, patient, or MRN..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specimen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-blue-600">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.orderDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.patientName}</p>
                      <p className="text-xs text-gray-500">{order.patientMrn}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.providerName}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.tests.slice(0, 2).map((test, idx) => (
                          <p key={idx} className="text-xs text-gray-600">{test.name}</p>
                        ))}
                        {order.tests.length > 2 && (
                          <p className="text-xs text-gray-400">+{order.tests.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={order.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      {order.specimenCollected ? (
                        <span className="text-green-600 text-sm">✓ Collected</span>
                      ) : (
                        <span className="text-orange-600 text-sm">⏳ Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.status === 'completed' && (
                          <button 
                            onClick={() => handleViewResults(order)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Results
                          </button>
                        )}
                        {!order.specimenCollected && (
                          <button className="text-green-600 hover:text-green-800 text-sm">Collect</button>
                        )}
                        <button className="text-gray-600 hover:text-gray-800 text-sm">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Specimens Tab */}
      {activeTab === 'specimens' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specimen #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {specimens.map((specimen) => (
                  <tr key={specimen.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-blue-600">{specimen.specimenNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{specimen.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{specimen.type}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={specimen.status} />
                    </td>
                    <td className="px-6 py-4">
                      {specimen.collectedAt ? (
                        <div>
                          <p className="text-sm text-gray-900">{specimen.collectedAt}</p>
                          <p className="text-xs text-gray-500">{specimen.collectedBy}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not collected</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Print Label</button>
                        {specimen.status === 'pending_collection' && (
                          <button className="text-green-600 hover:text-green-800 text-sm">Collect</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Critical Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Critical Results Requiring Acknowledgment</h3>
            <p className="text-sm text-red-600">These results require immediate provider notification and acknowledgment.</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-red-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">James Wilson</p>
                    <p className="text-xs text-gray-500">MRN-2026-045</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Potassium</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">6.8 mEq/L</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">CRITICAL HIGH</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">Dr. Sarah Wilson</td>
                  <td className="px-6 py-4 text-sm text-gray-500">10 min ago</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        📞 Call Provider
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Acknowledge</button>
                    </div>
                  </td>
                </tr>
                <tr className="bg-red-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">Maria Garcia</p>
                    <p className="text-xs text-gray-500">MRN-2026-052</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">Troponin I</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">2.5 ng/mL</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">CRITICAL HIGH</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">Dr. Michael Chen</td>
                  <td className="px-6 py-4 text-sm text-gray-500">25 min ago</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        📞 Call Provider
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Acknowledge</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search tests by name or code..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="hematology">Hematology</option>
              <option value="chemistry">Chemistry</option>
              <option value="cardiac">Cardiac</option>
              <option value="endocrinology">Endocrinology</option>
              <option value="coagulation">Coagulation</option>
              <option value="urinalysis">Urinalysis</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specimen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turnaround</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {testCatalog.map((test, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{test.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{test.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{test.specimen}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{test.turnaround}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Lab Order</h2>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <input
                    type="text"
                    placeholder="Search patient by name or MRN..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="routine">Routine</option>
                      <option value="asap">ASAP</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fasting Required</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="no">No</option>
                      <option value="yes">Yes - 8 hours</option>
                      <option value="yes12">Yes - 12 hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Tests *</label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                    {testCatalog.map((test, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">{test.code} - {test.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{test.specimen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes / Diagnosis</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Relevant clinical information..."
                  />
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Submit Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Lab Results</h2>
                  <p className="text-sm text-gray-500">{selectedOrder.orderNumber} • {selectedOrder.patientName}</p>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedOrder.tests.map((test, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{test.name}</h3>
                      <ResultFlag flag={test.flag} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Result</p>
                        <p className="font-medium text-gray-900">{test.result || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reference Range</p>
                        <p className="text-gray-700">Varies by test</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <StatusBadge status={test.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  🖨️ Print Results
                </button>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
