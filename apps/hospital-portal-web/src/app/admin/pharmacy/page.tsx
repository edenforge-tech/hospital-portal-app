'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Prescription {
  id: string;
  rxNumber: string;
  patientName: string;
  patientMrn: string;
  medicationName: string;
  strength: string;
  quantity: number;
  daysSupply: number;
  directions: string;
  prescriber: string;
  status: string;
  refillsRemaining: number;
  lastFilled?: string;
}

interface InventoryItem {
  id: string;
  medicationName: string;
  ndc: string;
  strength: string;
  quantityOnHand: number;
  reorderPoint: number;
  expirationDate: string;
  isLowStock: boolean;
  isExpiringSoon: boolean;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-blue-100 text-blue-700',
    filling: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    dispensed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    on_hold: 'bg-orange-100 text-orange-700',
    transferred: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({ label, value, icon, color, alert }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-lg border ${alert ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <p className={`text-2xl font-bold ${alert ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
        {alert && <span className="text-orange-500">⚠️</span>}
      </div>
    </div>
  );
}

function InteractionWarning({ severity, drugs, description }: { severity: string; drugs: string[]; description: string }) {
  const colors: Record<string, string> = {
    contraindicated: 'bg-red-50 border-red-200 text-red-800',
    severe: 'bg-red-50 border-red-200 text-red-700',
    moderate: 'bg-orange-50 border-orange-200 text-orange-700',
    mild: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className={`p-3 border rounded-lg ${colors[severity] || colors.moderate}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">⚠️</span>
        <div>
          <p className="font-medium text-sm">{drugs.join(' + ')}</p>
          <p className="text-xs mt-1">{description}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
            severity === 'contraindicated' || severity === 'severe' ? 'bg-red-200' : 'bg-orange-200'
          }`}>
            {severity.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PharmacyPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'refills' | 'inventory' | 'interactions'>('queue');
  const [showFillModal, setShowFillModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data
  const prescriptions: Prescription[] = [
    {
      id: '1',
      rxNumber: 'RX-2026-001234',
      patientName: 'John Smith',
      patientMrn: 'MRN-2026-001',
      medicationName: 'Lisinopril',
      strength: '10mg',
      quantity: 30,
      daysSupply: 30,
      directions: 'Take 1 tablet by mouth once daily',
      prescriber: 'Dr. Sarah Wilson',
      status: 'ready',
      refillsRemaining: 5,
      lastFilled: '2025-12-24',
    },
    {
      id: '2',
      rxNumber: 'RX-2026-001235',
      patientName: 'Emily Johnson',
      patientMrn: 'MRN-2026-015',
      medicationName: 'Metformin',
      strength: '500mg',
      quantity: 60,
      daysSupply: 30,
      directions: 'Take 1 tablet by mouth twice daily with meals',
      prescriber: 'Dr. Michael Chen',
      status: 'pending',
      refillsRemaining: 3,
    },
    {
      id: '3',
      rxNumber: 'RX-2026-001236',
      patientName: 'Michael Davis',
      patientMrn: 'MRN-2026-022',
      medicationName: 'Atorvastatin',
      strength: '20mg',
      quantity: 30,
      daysSupply: 30,
      directions: 'Take 1 tablet by mouth at bedtime',
      prescriber: 'Dr. Lisa Anderson',
      status: 'verified',
      refillsRemaining: 11,
    },
    {
      id: '4',
      rxNumber: 'RX-2026-001237',
      patientName: 'Sarah Williams',
      patientMrn: 'MRN-2025-089',
      medicationName: 'Omeprazole',
      strength: '20mg',
      quantity: 30,
      daysSupply: 30,
      directions: 'Take 1 capsule by mouth once daily before breakfast',
      prescriber: 'Dr. Sarah Wilson',
      status: 'filling',
      refillsRemaining: 2,
    },
    {
      id: '5',
      rxNumber: 'RX-2026-001238',
      patientName: 'Robert Brown',
      patientMrn: 'MRN-2026-031',
      medicationName: 'Amoxicillin',
      strength: '500mg',
      quantity: 21,
      daysSupply: 7,
      directions: 'Take 1 capsule by mouth three times daily',
      prescriber: 'Dr. Jennifer Martinez',
      status: 'on_hold',
      refillsRemaining: 0,
    },
  ];

  const refillRequests = [
    { id: '1', rxNumber: 'RX-2026-001200', patientName: 'Alice Thompson', medicationName: 'Metoprolol 25mg', requestedDate: '2026-01-24', status: 'pending' },
    { id: '2', rxNumber: 'RX-2026-001180', patientName: 'David Lee', medicationName: 'Levothyroxine 50mcg', requestedDate: '2026-01-23', status: 'pending' },
    { id: '3', rxNumber: 'RX-2026-001150', patientName: 'Jennifer White', medicationName: 'Gabapentin 300mg', requestedDate: '2026-01-22', status: 'approved' },
  ];

  const inventory: InventoryItem[] = [
    { id: '1', medicationName: 'Lisinopril 10mg', ndc: '00781-5180-01', strength: '10mg', quantityOnHand: 500, reorderPoint: 200, expirationDate: '2027-06-30', isLowStock: false, isExpiringSoon: false },
    { id: '2', medicationName: 'Metformin 500mg', ndc: '00378-0228-01', strength: '500mg', quantityOnHand: 150, reorderPoint: 200, expirationDate: '2027-03-15', isLowStock: true, isExpiringSoon: false },
    { id: '3', medicationName: 'Amoxicillin 500mg', ndc: '57237-042-01', strength: '500mg', quantityOnHand: 80, reorderPoint: 100, expirationDate: '2026-02-28', isLowStock: true, isExpiringSoon: true },
    { id: '4', medicationName: 'Atorvastatin 20mg', ndc: '00378-3952-77', strength: '20mg', quantityOnHand: 450, reorderPoint: 150, expirationDate: '2027-09-30', isLowStock: false, isExpiringSoon: false },
    { id: '5', medicationName: 'Omeprazole 20mg', ndc: '00143-9851-01', strength: '20mg', quantityOnHand: 300, reorderPoint: 100, expirationDate: '2026-08-31', isLowStock: false, isExpiringSoon: false },
  ];

  const drugInteractions = [
    { drugs: ['Warfarin', 'Aspirin'], severity: 'moderate', description: 'Increased risk of bleeding. Monitor closely.' },
    { drugs: ['Lisinopril', 'Potassium supplements'], severity: 'moderate', description: 'Risk of hyperkalemia. Monitor potassium levels.' },
    { drugs: ['Metformin', 'Contrast dye'], severity: 'severe', description: 'Risk of lactic acidosis. Hold metformin before/after contrast procedures.' },
    { drugs: ['Simvastatin', 'Amiodarone'], severity: 'contraindicated', description: 'Significantly increased risk of myopathy/rhabdomyolysis.' },
  ];

  const filteredPrescriptions = prescriptions.filter(rx => {
    return statusFilter === '' || rx.status === statusFilter;
  });

  const handleFillRx = (rx: Prescription) => {
    setSelectedRx(rx);
    setShowFillModal(true);
  };

  const pendingCount = prescriptions.filter(rx => rx.status === 'pending').length;
  const readyCount = prescriptions.filter(rx => rx.status === 'ready').length;
  const lowStockCount = inventory.filter(i => i.isLowStock).length;
  const expiringCount = inventory.filter(i => i.isExpiringSoon).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
          <p className="text-gray-500 mt-1">Manage prescriptions, refills, and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>🔍</span>
            Drug Lookup
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <span>➕</span>
            New Prescription
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'queue', label: 'Fill Queue', icon: '📋' },
            { id: 'refills', label: 'Refill Requests', icon: '🔄' },
            { id: 'inventory', label: 'Inventory', icon: '📦' },
            { id: 'interactions', label: 'Drug Interactions', icon: '⚠️' },
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
              {tab.id === 'queue' && pendingCount > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
              {tab.id === 'refills' && refillRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {refillRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Fill Queue Tab */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Pending Verification" value={pendingCount} icon="⏳" color="bg-yellow-100" alert={pendingCount > 0} />
            <MetricCard label="In Progress" value={prescriptions.filter(rx => rx.status === 'filling').length} icon="💊" color="bg-purple-100" />
            <MetricCard label="Ready for Pickup" value={readyCount} icon="✅" color="bg-green-100" />
            <MetricCard label="Low Stock Items" value={lowStockCount} icon="📦" color="bg-orange-100" alert={lowStockCount > 0} />
            <MetricCard label="Expiring Soon" value={expiringCount} icon="⏰" color="bg-red-100" alert={expiringCount > 0} />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="filling">Filling</option>
              <option value="ready">Ready for Pickup</option>
              <option value="on_hold">On Hold</option>
            </select>
            <input
              type="text"
              placeholder="Search by Rx #, patient, or medication..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prescriptions Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rx #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty / Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescriber</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-blue-600">{rx.rxNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{rx.patientName}</p>
                      <p className="text-xs text-gray-500">{rx.patientMrn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{rx.medicationName} {rx.strength}</p>
                      <p className="text-xs text-gray-500 max-w-xs truncate">{rx.directions}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{rx.quantity}</p>
                      <p className="text-xs text-gray-500">{rx.daysSupply} days</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{rx.prescriber}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={rx.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{rx.refillsRemaining}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {rx.status === 'pending' && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Verify</button>
                        )}
                        {rx.status === 'verified' && (
                          <button 
                            onClick={() => handleFillRx(rx)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Fill
                          </button>
                        )}
                        {rx.status === 'ready' && (
                          <button className="text-purple-600 hover:text-purple-800 text-sm">Dispense</button>
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

      {/* Refills Tab */}
      {activeTab === 'refills' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rx #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {refillRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{request.rxNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{request.medicationName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{request.requestedDate}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button className="text-green-600 hover:text-green-800 text-sm">Approve</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Deny</button>
                        </div>
                      )}
                      {request.status === 'approved' && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Process</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search medications..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Low Stock Only</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Expiring Soon</span>
            </label>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NDC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Hand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Point</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${item.isLowStock || item.isExpiringSoon ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{item.medicationName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.ndc}</td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-medium ${item.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.quantityOnHand}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.reorderPoint}</td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${item.isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                        {item.expirationDate}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {item.isLowStock && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Low Stock</span>
                        )}
                        {item.isExpiringSoon && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Expiring</span>
                        )}
                        {!item.isLowStock && !item.isExpiringSoon && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">OK</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Adjust</button>
                        {item.isLowStock && (
                          <button className="text-green-600 hover:text-green-800 text-sm">Reorder</button>
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

      {/* Drug Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🔍 Drug Interaction Checker</h3>
            <p className="text-sm text-blue-600 mb-4">Enter medications to check for potential interactions</p>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Add medication..."
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Check Interactions
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Drug Interactions Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drugInteractions.map((interaction, idx) => (
                <InteractionWarning
                  key={idx}
                  severity={interaction.severity}
                  drugs={interaction.drugs}
                  description={interaction.description}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fill Modal */}
      {showFillModal && selectedRx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Fill Prescription</h2>
                <button
                  onClick={() => setShowFillModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Patient: <span className="font-medium text-gray-900">{selectedRx.patientName}</span></p>
                  <p className="text-sm text-gray-600">Medication: <span className="font-medium text-gray-900">{selectedRx.medicationName} {selectedRx.strength}</span></p>
                  <p className="text-sm text-gray-600">Quantity: <span className="font-medium text-gray-900">{selectedRx.quantity}</span></p>
                  <p className="text-sm text-gray-600">Directions: <span className="font-medium text-gray-900">{selectedRx.directions}</span></p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Product (NDC)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>00378-3952-77 - Mylan - In Stock</option>
                    <option>00093-8152-01 - Teva - In Stock</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot Number</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacist Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowFillModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Complete Fill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
