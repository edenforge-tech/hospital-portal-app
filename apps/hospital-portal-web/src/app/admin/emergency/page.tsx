'use client';

import React, { useState, useEffect } from 'react';
import {
  emergencyCasesApi,
  trackBoardApi,
  codeBlueApi,
  triageProtocolsApi,
  emergencyProtocolsApi,
  type EmergencyCase,
  type EDTrackBoard,
  type CodeBlue,
  type TriageProtocol,
  type VitalSigns,
} from '@/lib/api/emergency.api';

const EmergencyPage = () => {
  const [activeTab, setActiveTab] = useState<'track-board' | 'triage' | 'protocols' | 'code-blue'>('track-board');
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [trackBoard, setTrackBoard] = useState<EDTrackBoard | null>(null);
  const [codeBlues, setCodeBlues] = useState<CodeBlue[]>([]);
  const [protocols, setProtocols] = useState<TriageProtocol[]>([]);
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCodeBlueModal, setShowCodeBlueModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTriageLevel, setFilterTriageLevel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [activeTab, filterTriageLevel, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'track-board') {
        const [casesData, boardData] = await Promise.all([
          trackBoardApi.getCases(),
          trackBoardApi.get(),
        ]);
        setCases(casesData);
        setTrackBoard(boardData);
      } else if (activeTab === 'triage') {
        const response = await emergencyCasesApi.list({
          triageLevel: filterTriageLevel ? parseInt(filterTriageLevel) : undefined,
          status: filterStatus || undefined,
        });
        setCases(response.data);
      } else if (activeTab === 'protocols') {
        const data = await triageProtocolsApi.list();
        setProtocols(data);
      } else if (activeTab === 'code-blue') {
        const response = await codeBlueApi.list({ status: 'active' });
        setCodeBlues(response.data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (data: any) => {
    try {
      await emergencyCasesApi.create(data);
      setShowNewCaseModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create case');
    }
  };

  const handleTriageCase = async (caseId: string, data: { triageLevel: number; triageScore: number; vitalSigns: VitalSigns }) => {
    try {
      await emergencyCasesApi.triage(caseId, data);
      setShowTriageModal(false);
      setSelectedCase(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to triage case');
    }
  };

  const handleActivateCodeBlue = async (data: { codeType: CodeBlue['codeType']; location: string }) => {
    try {
      await codeBlueApi.activate(data);
      setShowCodeBlueModal(false);
      alert('CODE BLUE ACTIVATED! Team has been notified.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate code blue');
    }
  };

  const handleDischarge = async (caseId: string) => {
    try {
      await emergencyCasesApi.discharge(caseId, {
        disposition: 'discharge',
        instructions: 'Follow discharge instructions provided',
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to discharge patient');
    }
  };

  const TriageBadge = ({ level, color }: { level: number; color: string }) => {
    const colors = {
      red: 'bg-red-600 text-white',
      orange: 'bg-orange-500 text-white',
      yellow: 'bg-yellow-400 text-gray-900',
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors[color as keyof typeof colors]}`}>
        Level {level}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      pending_triage: 'bg-yellow-100 text-yellow-800',
      triaged: 'bg-blue-100 text-blue-800',
      in_treatment: 'bg-purple-100 text-purple-800',
      awaiting_results: 'bg-orange-100 text-orange-800',
      admitted: 'bg-green-100 text-green-800',
      discharged: 'bg-gray-100 text-gray-800',
      transferred: 'bg-teal-100 text-teal-800',
      deceased: 'bg-black text-white',
      active: 'bg-red-600 text-white animate-pulse',
      responded: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const MetricCard = ({ label, value, subtext, color, alert }: { label: string; value: number | string; subtext?: string; color: string; alert?: boolean }) => (
    <div className={`bg-white p-4 rounded-lg shadow ${alert ? 'border-2 border-red-500 animate-pulse' : ''}`}>
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );

  const OccupancyBar = ({ occupied, total }: { occupied: number; total: number }) => {
    const percentage = (occupied / total) * 100;
    const color = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="text-sm font-medium whitespace-nowrap">{occupied}/{total}</span>
      </div>
    );
  };

  const NewCaseModal = () => {
    const [formData, setFormData] = useState({
      patientName: '',
      patientAge: '',
      patientGender: '',
      arrivalMethod: 'walk_in' as EmergencyCase['arrivalMethod'],
      chiefComplaint: '',
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">New Emergency Case</h3>
            <button onClick={() => setShowNewCaseModal(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient Name</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="John Doe or Unknown"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.patientGender}
                  onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arrival Method</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.arrivalMethod}
                onChange={(e) => setFormData({ ...formData, arrivalMethod: e.target.value as any })}
              >
                <option value="walk_in">Walk-in</option>
                <option value="ambulance">Ambulance</option>
                <option value="police">Police</option>
                <option value="helicopter">Helicopter</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Chief Complaint</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="Describe the chief complaint..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowNewCaseModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreateCase({
                patientName: formData.patientName || 'Unknown',
                patientAge: formData.patientAge ? parseInt(formData.patientAge) : undefined,
                patientGender: formData.patientGender || undefined,
                arrivalMethod: formData.arrivalMethod,
                chiefComplaint: formData.chiefComplaint,
              })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={!formData.chiefComplaint}
            >
              Register Patient
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TriageModal = ({ caseData }: { caseData: EmergencyCase }) => {
    const [triageLevel, setTriageLevel] = useState(3);
    const [vitals, setVitals] = useState<VitalSigns>({
      recordedAt: new Date().toISOString(),
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Triage Assessment - {caseData.patientName}</h3>
            <button onClick={() => setShowTriageModal(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Triage Level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => {
                  const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
                  return (
                    <button
                      key={level}
                      onClick={() => setTriageLevel(level)}
                      className={`flex-1 py-3 rounded-md font-semibold ${
                        triageLevel === level
                          ? `bg-${colors[level - 1]}-600 text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Level {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Blood Pressure</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Systolic"
                    onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: parseInt(e.target.value) || undefined })}
                  />
                  <span className="self-center">/</span>
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Diastolic"
                    onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="HR"
                  onChange={(e) => setVitals({ ...vitals, heartRate: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resp Rate</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="RR"
                  onChange={(e) => setVitals({ ...vitals, respiratoryRate: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Temp"
                  onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">O2 Saturation (%)</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="SpO2"
                  onChange={(e) => setVitals({ ...vitals, oxygenSaturation: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pain Scale (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Pain"
                  onChange={(e) => setVitals({ ...vitals, painScale: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Consciousness Level</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                onChange={(e) => setVitals({ ...vitals, consciousnessLevel: e.target.value as any })}
              >
                <option value="alert">Alert</option>
                <option value="verbal">Verbal</option>
                <option value="pain">Pain</option>
                <option value="unresponsive">Unresponsive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowTriageModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleTriageCase(caseData.id, {
                triageLevel,
                triageScore: triageLevel * 20,
                vitalSigns: vitals,
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Triage
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">🚨 Emergency Department</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCodeBlueModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-bold animate-pulse"
          >
            🔔 ACTIVATE CODE BLUE
          </button>
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Case
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {activeTab === 'track-board' && trackBoard && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <MetricCard label="Total Patients" value={trackBoard.totalPatients} color="text-blue-600" />
          <MetricCard
            label="Bed Occupancy"
            value={`${trackBoard.bedOccupancy.utilization}%`}
            subtext={`${trackBoard.bedOccupancy.occupied}/${trackBoard.bedOccupancy.total} beds`}
            color="text-purple-600"
            alert={trackBoard.bedOccupancy.utilization >= 90}
          />
          <MetricCard
            label="Avg Wait Time"
            value={`${trackBoard.averageWaitTime} min`}
            color="text-orange-600"
            alert={trackBoard.averageWaitTime >= 60}
          />
          <MetricCard
            label="Longest Wait"
            value={`${trackBoard.longestWaitTime} min`}
            color="text-red-600"
            alert={trackBoard.longestWaitTime >= 120}
          />
          <MetricCard
            label="Physicians On Duty"
            value={trackBoard.staffing.physicians.onDuty}
            subtext={`${trackBoard.staffing.physicians.patients} pts/MD`}
            color="text-green-600"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {['track-board', 'triage', 'protocols', 'code-blue'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'triage' && (
          <div className="p-4 border-b">
            <div className="flex gap-4">
              <select
                className="border rounded-md px-3 py-2"
                value={filterTriageLevel}
                onChange={(e) => setFilterTriageLevel(e.target.value)}
              >
                <option value="">All Triage Levels</option>
                <option value="1">Level 1 (Red)</option>
                <option value="2">Level 2 (Orange)</option>
                <option value="3">Level 3 (Yellow)</option>
                <option value="4">Level 4 (Green)</option>
                <option value="5">Level 5 (Blue)</option>
              </select>
              <select
                className="border rounded-md px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending_triage">Pending Triage</option>
                <option value="triaged">Triaged</option>
                <option value="in_treatment">In Treatment</option>
                <option value="awaiting_results">Awaiting Results</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {(activeTab === 'track-board' || activeTab === 'triage') && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chief Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrival</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      Loading cases...
                    </td>
                  </tr>
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No emergency cases
                    </td>
                  </tr>
                ) : (
                  cases.map((caseData) => (
                    <tr key={caseData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{caseData.caseNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{caseData.patientName || 'Unknown'}</div>
                        {caseData.patientAge && (
                          <div className="text-xs text-gray-500">{caseData.patientAge}y, {caseData.patientGender}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{caseData.chiefComplaint}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {caseData.triageLevel ? (
                          <TriageBadge level={caseData.triageLevel} color={caseData.triageColor} />
                        ) : (
                          <span className="text-xs text-gray-500">Not triaged</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={caseData.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {caseData.assignedBedNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {caseData.assignedProviderName || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(caseData.arrivalTime).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {caseData.status === 'pending_triage' && (
                          <button
                            onClick={() => {
                              setSelectedCase(caseData);
                              setShowTriageModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Triage
                          </button>
                        )}
                        {caseData.status === 'in_treatment' && (
                          <button
                            onClick={() => handleDischarge(caseData.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Discharge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'protocols' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Triage Protocols</h3>
              <div className="space-y-4">
                {protocols.map((protocol) => (
                  <div key={protocol.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">{protocol.name}</div>
                        <div className="text-sm text-gray-600">System: {protocol.system.toUpperCase()} • Version {protocol.version}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${protocol.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {protocol.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {protocol.levels.map((level) => (
                        <div key={level.level} className="border rounded p-2">
                          <div className={`font-semibold mb-1 ${level.color === 'red' ? 'text-red-600' : level.color === 'orange' ? 'text-orange-500' : level.color === 'yellow' ? 'text-yellow-600' : level.color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
                            Level {level.level}: {level.name}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">{level.description}</div>
                          <div className="text-xs text-gray-500">Max wait: {level.maxWaitTime} min</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'code-blue' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Active Code Blue Events</h3>
              {codeBlues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No active code blue events</div>
              ) : (
                <div className="space-y-4">
                  {codeBlues.map((code) => (
                    <div key={code.id} className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-lg text-red-600">
                            CODE {code.codeType.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-700">Location: {code.location}</div>
                          <div className="text-sm text-gray-600">
                            Activated: {new Date(code.activatedTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <StatusBadge status={code.status} />
                      </div>
                      {code.teamMembers && code.teamMembers.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold mb-1">Response Team:</div>
                          <div className="flex flex-wrap gap-2">
                            {code.teamMembers.map((member, idx) => (
                              <span key={idx} className="text-xs bg-white px-2 py-1 rounded">
                                {member.userName} ({member.role})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showNewCaseModal && <NewCaseModal />}
      {showTriageModal && selectedCase && <TriageModal caseData={selectedCase} />}
      {showCodeBlueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-red-600">
            <h3 className="text-xl font-bold text-red-600 mb-4">🚨 ACTIVATE CODE BLUE</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Code Type</label>
                <select className="w-full border rounded-md px-3 py-2" id="codeType">
                  <option value="blue">Code Blue (Cardiac Arrest)</option>
                  <option value="red">Code Red (Fire)</option>
                  <option value="purple">Code Purple (Missing Infant)</option>
                  <option value="silver">Code Silver (Active Shooter)</option>
                  <option value="yellow">Code Yellow (Bomb Threat)</option>
                  <option value="gray">Code Gray (Combative Person)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Room number or location"
                  id="codeLocation"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCodeBlueModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const codeType = (document.getElementById('codeType') as HTMLSelectElement).value;
                  const location = (document.getElementById('codeLocation') as HTMLInputElement).value;
                  if (location) {
                    handleActivateCodeBlue({ codeType: codeType as any, location });
                  } else {
                    alert('Please specify a location');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-bold"
              >
                ACTIVATE NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
