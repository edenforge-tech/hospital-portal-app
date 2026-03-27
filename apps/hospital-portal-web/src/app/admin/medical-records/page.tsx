'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  recordType: string;
  title: string;
  status: string;
  providerName: string;
  departmentName: string;
  encounterDate: string;
  isSigned: boolean;
  confidentialityLevel: string;
  createdAt: string;
}

interface Diagnosis {
  code: string;
  description: string;
  type: string;
  status: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  status: string;
  prescribedBy: string;
}

interface VitalSigns {
  recordedAt: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
}

interface Allergy {
  allergen: string;
  reaction: string;
  severity: string;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    amended: 'bg-blue-100 text-blue-700',
    archived: 'bg-purple-100 text-purple-700',
    voided: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function RecordTypeBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    progress_note: '📝',
    admission_note: '🏥',
    discharge_summary: '🚪',
    consultation_note: '💬',
    procedure_note: '🔧',
    lab_result: '🧪',
    imaging_result: '📷',
    prescription: '💊',
    immunization: '💉',
    history_physical: '📋',
  };

  return (
    <span className="flex items-center gap-1 text-sm text-gray-700">
      <span>{icons[type] || '📄'}</span>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

function ConfidentialityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-700',
    restricted: 'bg-orange-100 text-orange-700',
    highly_restricted: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level] || colors.normal}`}>
      {level === 'highly_restricted' ? '🔒 Highly Restricted' : level === 'restricted' ? '⚠️ Restricted' : level}
    </span>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AllergyBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    mild: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    moderate: 'bg-orange-100 text-orange-700 border-orange-300',
    severe: 'bg-red-100 text-red-700 border-red-300',
    life_threatening: 'bg-red-200 text-red-800 border-red-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${colors[severity] || colors.mild}`}>
      {severity.replace(/_/g, ' ')}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MedicalRecordsPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'encounters' | 'history' | 'templates'>('records');
  const [selectedPatient, setSelectedPatient] = useState<string | null>('P001');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);

  // Mock data
  const records: MedicalRecord[] = [
    {
      id: '1',
      patientId: 'P001',
      patientName: 'John Smith',
      mrn: 'MRN-2026-001',
      recordType: 'progress_note',
      title: 'Follow-up Visit - Hypertension Management',
      status: 'active',
      providerName: 'Dr. Sarah Wilson',
      departmentName: 'Internal Medicine',
      encounterDate: '2026-01-24',
      isSigned: true,
      confidentialityLevel: 'normal',
      createdAt: '2026-01-24T10:30:00Z',
    },
    {
      id: '2',
      patientId: 'P001',
      patientName: 'John Smith',
      mrn: 'MRN-2026-001',
      recordType: 'lab_result',
      title: 'Comprehensive Metabolic Panel',
      status: 'active',
      providerName: 'Lab Services',
      departmentName: 'Laboratory',
      encounterDate: '2026-01-20',
      isSigned: true,
      confidentialityLevel: 'normal',
      createdAt: '2026-01-20T14:00:00Z',
    },
    {
      id: '3',
      patientId: 'P001',
      patientName: 'John Smith',
      mrn: 'MRN-2026-001',
      recordType: 'prescription',
      title: 'Lisinopril 10mg - Hypertension',
      status: 'active',
      providerName: 'Dr. Sarah Wilson',
      departmentName: 'Internal Medicine',
      encounterDate: '2026-01-24',
      isSigned: true,
      confidentialityLevel: 'normal',
      createdAt: '2026-01-24T10:45:00Z',
    },
    {
      id: '4',
      patientId: 'P001',
      patientName: 'John Smith',
      mrn: 'MRN-2026-001',
      recordType: 'imaging_result',
      title: 'Chest X-Ray - Annual Screening',
      status: 'pending_review',
      providerName: 'Dr. Michael Chen',
      departmentName: 'Radiology',
      encounterDate: '2026-01-15',
      isSigned: false,
      confidentialityLevel: 'normal',
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: '5',
      patientId: 'P001',
      patientName: 'John Smith',
      mrn: 'MRN-2026-001',
      recordType: 'consultation_note',
      title: 'Cardiology Consultation - Palpitations',
      status: 'draft',
      providerName: 'Dr. Emily Brown',
      departmentName: 'Cardiology',
      encounterDate: '2026-01-10',
      isSigned: false,
      confidentialityLevel: 'restricted',
      createdAt: '2026-01-10T16:00:00Z',
    },
  ];

  const diagnoses: Diagnosis[] = [
    { code: 'I10', description: 'Essential (primary) hypertension', type: 'primary', status: 'active' },
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', type: 'secondary', status: 'active' },
    { code: 'J06.9', description: 'Acute upper respiratory infection', type: 'secondary', status: 'resolved' },
  ];

  const medications: Medication[] = [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', route: 'oral', status: 'active', prescribedBy: 'Dr. Sarah Wilson' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', route: 'oral', status: 'active', prescribedBy: 'Dr. Sarah Wilson' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', route: 'oral', status: 'active', prescribedBy: 'Dr. Sarah Wilson' },
  ];

  const vitals: VitalSigns = {
    recordedAt: '2026-01-24T10:15:00Z',
    bloodPressure: '128/82',
    heartRate: 72,
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 180,
    height: 70,
  };

  const allergies: Allergy[] = [
    { allergen: 'Penicillin', reaction: 'Rash, Hives', severity: 'moderate' },
    { allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'life_threatening' },
    { allergen: 'Latex', reaction: 'Skin irritation', severity: 'mild' },
  ];

  const recordTypes = [
    'progress_note', 'admission_note', 'discharge_summary', 'consultation_note',
    'procedure_note', 'lab_result', 'imaging_result', 'prescription', 'immunization', 'history_physical'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500 mt-1">Clinical notes, test results, and medical history</p>
        </div>
        <button
          onClick={() => setShowNewRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>➕</span>
          New Record
        </button>
      </div>

      {/* Patient Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by name, MRN, or DOB..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="John Smith - MRN-2026-001"
              />
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🔍 Search
              </button>
            </div>
          </div>
        </div>
        
        {selectedPatient && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">JS</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">John Smith</h3>
                <p className="text-sm text-gray-500">MRN: MRN-2026-001 • DOB: 05/15/1970 (55y)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Gender: <span className="text-gray-700">Male</span></span>
              <span className="text-gray-500">Blood Type: <span className="text-gray-700">A+</span></span>
              <span className="text-gray-500">Primary: <span className="text-gray-700">Dr. Sarah Wilson</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Records" value={156} icon="📋" color="bg-blue-100" />
        <MetricCard label="Active Diagnoses" value={2} icon="🩺" color="bg-purple-100" />
        <MetricCard label="Current Medications" value={3} icon="💊" color="bg-green-100" />
        <MetricCard label="Known Allergies" value={3} icon="⚠️" color="bg-red-100" />
      </div>

      {/* Allergy Alert Banner */}
      {allergies.some(a => a.severity === 'life_threatening' || a.severity === 'severe') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h4 className="font-semibold text-red-800">Critical Allergies</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {allergies.filter(a => a.severity === 'life_threatening' || a.severity === 'severe').map((allergy, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                    {allergy.allergen}: {allergy.reaction}
                    <AllergyBadge severity={allergy.severity} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'records', label: 'Medical Records', icon: '📋' },
            { id: 'encounters', label: 'Encounters', icon: '🏥' },
            { id: 'history', label: 'Patient History', icon: '📊' },
            { id: 'templates', label: 'Templates', icon: '📄' },
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
            </button>
          ))}
        </nav>
      </div>

      {/* Medical Records Tab */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Record Types</option>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="active">Active</option>
                <option value="amended">Amended</option>
              </select>
              <input
                type="text"
                placeholder="Search records..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedRecord?.id === record.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <RecordTypeBadge type={record.recordType} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{record.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-gray-500">{record.providerName}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{record.departmentName}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{new Date(record.encounterDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <StatusBadge status={record.status} />
                          {record.isSigned && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              ✓ Signed
                            </span>
                          )}
                          {record.confidentialityLevel !== 'normal' && (
                            <ConfidentialityBadge level={record.confidentialityLevel} />
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Record Details / Quick View */}
          <div className="space-y-4">
            {/* Current Vitals */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>❤️</span> Latest Vitals
                <span className="text-xs text-gray-500 font-normal">
                  ({new Date(vitals.recordedAt).toLocaleString()})
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Blood Pressure</p>
                  <p className="font-semibold text-gray-900">{vitals.bloodPressure} mmHg</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Heart Rate</p>
                  <p className="font-semibold text-gray-900">{vitals.heartRate} bpm</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Temperature</p>
                  <p className="font-semibold text-gray-900">{vitals.temperature}°F</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">SpO2</p>
                  <p className="font-semibold text-gray-900">{vitals.oxygenSaturation}%</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Resp. Rate</p>
                  <p className="font-semibold text-gray-900">{vitals.respiratoryRate}/min</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="font-semibold text-gray-900">{vitals.weight} lbs</p>
                </div>
              </div>
              <button className="mt-3 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                + Record New Vitals
              </button>
            </div>

            {/* Active Diagnoses */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🩺</span> Active Diagnoses
              </h3>
              <div className="space-y-2">
                {diagnoses.filter(d => d.status === 'active').map((dx, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{dx.description}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        dx.type === 'primary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {dx.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{dx.code}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>💊</span> Current Medications
              </h3>
              <div className="space-y-2">
                {medications.map((med, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-900">{med.name} {med.dosage}</p>
                    <p className="text-xs text-gray-500">{med.frequency} • {med.route}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                View All Medications
              </button>
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>⚠️</span> Allergies
              </h3>
              <div className="space-y-2">
                {allergies.map((allergy, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{allergy.allergen}</p>
                      <p className="text-xs text-gray-500">{allergy.reaction}</p>
                    </div>
                    <AllergyBadge severity={allergy.severity} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encounters Tab */}
      {activeTab === 'encounters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Encounters</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ New Encounter
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chief Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { date: '2026-01-24', type: 'Outpatient', provider: 'Dr. Sarah Wilson', dept: 'Internal Medicine', complaint: 'Hypertension follow-up', status: 'completed' },
                  { date: '2026-01-15', type: 'Outpatient', provider: 'Dr. Michael Chen', dept: 'Radiology', complaint: 'Annual chest X-ray', status: 'completed' },
                  { date: '2026-01-10', type: 'Outpatient', provider: 'Dr. Emily Brown', dept: 'Cardiology', complaint: 'Palpitations evaluation', status: 'in_progress' },
                  { date: '2025-12-20', type: 'Emergency', provider: 'Dr. James Lee', dept: 'Emergency', complaint: 'Chest pain', status: 'completed' },
                ].map((enc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{enc.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{enc.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{enc.provider}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{enc.dept}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{enc.complaint}</td>
                    <td className="px-6 py-4"><StatusBadge status={enc.status} /></td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient History Tab */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical History */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Medical History
            </h3>
            <div className="space-y-3">
              {[
                { condition: 'Hypertension', diagnosed: '2020', status: 'active' },
                { condition: 'Type 2 Diabetes', diagnosed: '2018', status: 'active' },
                { condition: 'Appendicitis', diagnosed: '2005', status: 'resolved' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{item.condition}</p>
                    <p className="text-sm text-gray-500">Diagnosed: {item.diagnosed}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Surgical History */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔧</span> Surgical History
            </h3>
            <div className="space-y-3">
              {[
                { procedure: 'Appendectomy', date: '2005', hospital: 'City General Hospital' },
                { procedure: 'Knee Arthroscopy', date: '2015', hospital: 'Sports Medicine Center' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium text-gray-900">{item.procedure}</p>
                  <p className="text-sm text-gray-500">{item.date} • {item.hospital}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family History */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👨‍👩‍👧‍👦</span> Family History
            </h3>
            <div className="space-y-3">
              {[
                { relation: 'Father', condition: 'Heart Disease', age: 'Died at 72' },
                { relation: 'Mother', condition: 'Type 2 Diabetes', age: 'Living, 75' },
                { relation: 'Brother', condition: 'Hypertension', age: 'Living, 52' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{item.relation}</p>
                    <span className="text-sm text-gray-500">{item.age}</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.condition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social History */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏠</span> Social History
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Smoking</p>
                  <p className="font-medium text-gray-900">Former (quit 2015)</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Alcohol</p>
                  <p className="font-medium text-gray-900">Occasional</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Occupation</p>
                  <p className="font-medium text-gray-900">Software Engineer</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Marital Status</p>
                  <p className="font-medium text-gray-900">Married</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Exercise</p>
                  <p className="font-medium text-gray-900">Walks 30 min/day</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Diet</p>
                  <p className="font-medium text-gray-900">Low sodium</p>
                </div>
              </div>
            </div>
          </div>

          {/* Immunizations */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💉</span> Immunization Record
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Vaccine</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date Given</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Lot #</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Site</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Next Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { vaccine: 'Influenza (Flu)', date: '2025-10-15', lot: 'FLU2025A', site: 'Left arm', next: '2026-10-01' },
                    { vaccine: 'COVID-19 Booster', date: '2025-09-01', lot: 'COV2025B', site: 'Right arm', next: '2026-09-01' },
                    { vaccine: 'Tdap', date: '2022-05-10', lot: 'TDAP22X', site: 'Left arm', next: '2032-05-10' },
                    { vaccine: 'Pneumococcal (PPSV23)', date: '2021-03-20', lot: 'PNEU21Y', site: 'Left arm', next: 'N/A' },
                  ].map((imm, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-gray-900">{imm.vaccine}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{imm.date}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{imm.lot}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{imm.site}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{imm.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Documentation Templates</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Progress Note - General', type: 'progress_note', specialty: 'General', uses: 245 },
              { name: 'H&P - Adult', type: 'history_physical', specialty: 'Internal Medicine', uses: 189 },
              { name: 'Consultation Note', type: 'consultation_note', specialty: 'General', uses: 156 },
              { name: 'Discharge Summary', type: 'discharge_summary', specialty: 'General', uses: 134 },
              { name: 'Procedure Note - Minor', type: 'procedure_note', specialty: 'Surgery', uses: 98 },
              { name: 'Emergency Note', type: 'progress_note', specialty: 'Emergency', uses: 87 },
            ].map((template, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <RecordTypeBadge type={template.type} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{template.specialty}</span>
                  <span>{template.uses} uses</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Preview
                  </button>
                  <button className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Record Modal */}
      {showNewRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Medical Record</h2>
                <button
                  onClick={() => setShowNewRecordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {recordTypes.slice(0, 6).map((type) => (
                      <button
                        key={type}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                      >
                        <RecordTypeBadge type={type} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Enter record title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template (Optional)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a template...</option>
                    <option value="1">Progress Note - General</option>
                    <option value="2">H&P - Adult</option>
                    <option value="3">Consultation Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confidentiality Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="normal">Normal</option>
                    <option value="restricted">Restricted</option>
                    <option value="highly_restricted">Highly Restricted</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewRecordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
