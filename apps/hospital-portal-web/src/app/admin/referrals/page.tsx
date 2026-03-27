'use client';

import React, { useState, useEffect } from 'react';
import {
  referralsApi,
  referralTemplatesApi,
  type Referral,
  type ReferralTemplate,
  type CreateReferralRequest,
} from '@/lib/api/referrals.api';

const ReferralsPage = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled' | 'completed' | 'templates'>('pending');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [templates, setTemplates] = useState<ReferralTemplate[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showNewReferralModal, setShowNewReferralModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadReferrals();
    loadTemplates();
    loadStats();
  }, [activeTab, filterSpecialty, filterPriority, filterType]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      let status: string | undefined;
      if (activeTab === 'pending') status = 'pending';
      if (activeTab === 'scheduled') status = 'scheduled';
      if (activeTab === 'completed') status = 'completed';

      const response = await referralsApi.list({
        status,
        specialty: filterSpecialty || undefined,
        priority: filterPriority || undefined,
        type: filterType || undefined,
        search: searchTerm || undefined,
      });
      setReferrals(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await referralTemplatesApi.list();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await referralsApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateReferral = async (data: CreateReferralRequest) => {
    try {
      await referralsApi.create(data);
      setShowNewReferralModal(false);
      loadReferrals();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create referral');
    }
  };

  const handleAcceptReferral = async (id: string) => {
    try {
      await referralsApi.accept(id);
      loadReferrals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept referral');
    }
  };

  const handleRejectReferral = async (id: string, reason: string) => {
    try {
      await referralsApi.reject(id, reason);
      loadReferrals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject referral');
    }
  };

  const handleCompleteReferral = async (id: string) => {
    try {
      await referralsApi.complete(id);
      loadReferrals();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete referral');
    }
  };

  const handleScheduleReferral = async (id: string, date: string) => {
    try {
      await referralsApi.schedule(id, date);
      loadReferrals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule referral');
    }
  };

  const handleRequestAuthorization = async (id: string) => {
    try {
      await referralsApi.requestAuthorization(id);
      loadReferrals();
      alert('Authorization request submitted');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request authorization');
    }
  };

  const PriorityBadge = ({ priority }: { priority: Referral['priority'] }) => {
    const colors = {
      routine: 'bg-blue-100 text-blue-800',
      urgent: 'bg-orange-100 text-orange-800',
      stat: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: Referral['status'] }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const TypeBadge = ({ type }: { type: Referral['type'] }) => {
    const colors = {
      internal: 'bg-purple-100 text-purple-800',
      external: 'bg-teal-100 text-teal-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const MetricCard = ({ label, value, subtext, color }: { label: string; value: number | string; subtext?: string; color: string }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );

  const NewReferralModal = () => {
    const [formData, setFormData] = useState<CreateReferralRequest>({
      patientId: '',
      referringProviderId: '',
      referredToSpecialty: '',
      priority: 'routine',
      type: 'internal',
      reason: '',
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">New Referral</h3>
            <button onClick={() => setShowNewReferralModal(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient ID</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Referring Provider ID</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formData.referringProviderId}
                onChange={(e) => setFormData({ ...formData, referringProviderId: e.target.value })}
                placeholder="Enter provider ID"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Specialty</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.referredToSpecialty}
                  onChange={(e) => setFormData({ ...formData, referredToSpecialty: e.target.value })}
                >
                  <option value="">Select Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Referred To Provider ID (Optional)</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.referredToProviderId || ''}
                  onChange={(e) => setFormData({ ...formData, referredToProviderId: e.target.value })}
                  placeholder="Provider ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reason for Referral</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter reason for referral..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Diagnosis (Optional)</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formData.diagnosis || ''}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Enter diagnosis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Clinical Notes (Optional)</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                value={formData.clinicalNotes || ''}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                placeholder="Additional clinical notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowNewReferralModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreateReferral(formData)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!formData.patientId || !formData.referringProviderId || !formData.referredToSpecialty || !formData.reason}
            >
              Create Referral
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReferralDetailModal = ({ referral }: { referral: Referral }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Referral #{referral.referralNumber}</h3>
          <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <StatusBadge status={referral.status} />
            <PriorityBadge priority={referral.priority} />
            <TypeBadge type={referral.type} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Patient</div>
              <div className="font-semibold">{referral.patientName}</div>
              <div className="text-sm text-gray-500">MRN: {referral.patientMrn}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">DOB</div>
              <div className="font-semibold">{new Date(referral.patientDob).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Referring Provider</div>
                <div className="font-semibold">{referral.referringProviderName}</div>
                {referral.referringDepartment && (
                  <div className="text-sm text-gray-500">{referral.referringDepartment}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Referred To</div>
                <div className="font-semibold">{referral.referredToProviderName || referral.referredToSpecialty}</div>
                {referral.referredToFacility && (
                  <div className="text-sm text-gray-500">{referral.referredToFacility}</div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 mb-1">Reason for Referral</div>
            <div className="text-sm">{referral.reason}</div>
          </div>

          {referral.diagnosis && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Diagnosis</div>
              <div className="text-sm">{referral.diagnosis}</div>
            </div>
          )}

          {referral.clinicalNotes && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Clinical Notes</div>
              <div className="text-sm whitespace-pre-wrap">{referral.clinicalNotes}</div>
            </div>
          )}

          {referral.insurance?.authorizationRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="text-sm font-semibold text-yellow-800">Insurance Authorization Required</div>
              {referral.insurance.authorizationNumber && (
                <div className="text-sm text-yellow-700 mt-1">
                  Auth #: {referral.insurance.authorizationNumber}
                  <span className="ml-2">
                    Status: {referral.insurance.authorizationStatus?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {referral.appointmentDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm font-semibold text-blue-800">Scheduled Appointment</div>
              <div className="text-sm text-blue-700 mt-1">
                {new Date(referral.appointmentDate).toLocaleString()}
              </div>
            </div>
          )}

          {referral.attachments && referral.attachments.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Attachments ({referral.attachments.length})</div>
              <div className="space-y-1">
                {referral.attachments.map((att) => (
                  <div key={att.id} className="text-sm bg-gray-50 p-2 rounded flex items-center justify-between">
                    <span>📄 {att.documentName}</span>
                    <button className="text-blue-600 hover:text-blue-800 text-xs">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 text-xs text-gray-500">
            <div>Created: {new Date(referral.createdAt).toLocaleString()}</div>
            {referral.expirationDate && (
              <div>Expires: {new Date(referral.expirationDate).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {referral.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  const reason = prompt('Enter reason for rejection:');
                  if (reason) handleRejectReferral(referral.id, reason);
                }}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleAcceptReferral(referral.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Accept
              </button>
            </>
          )}
          {referral.status === 'scheduled' && (
            <button
              onClick={() => handleCompleteReferral(referral.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Mark as Completed
            </button>
          )}
          {referral.insurance?.authorizationRequired && !referral.insurance.authorizationNumber && (
            <button
              onClick={() => handleRequestAuthorization(referral.id)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Request Authorization
            </button>
          )}
          <button
            onClick={() => setShowDetailModal(false)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Referral Management</h1>
        <button
          onClick={() => setShowNewReferralModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Referral
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Referrals" value={stats.total} color="text-blue-600" />
          <MetricCard label="Pending" value={stats.pending} color="text-yellow-600" />
          <MetricCard label="Overdue" value={stats.overdue} color="text-red-600" />
          <MetricCard
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            color="text-green-600"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {['pending', 'scheduled', 'completed', 'templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== 'templates' && (
          <div className="p-4 border-b">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by patient, provider, or referral #..."
                className="flex-1 border rounded-md px-3 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="border rounded-md px-3 py-2"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Oncology">Oncology</option>
              </select>
              <select
                className="border rounded-md px-3 py-2"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
              <select
                className="border rounded-md px-3 py-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {activeTab === 'templates' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auth Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{template.specialty}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={template.defaultPriority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.authorizationRequired ? '✓ Yes' : '✗ No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{template.expirationDays} days</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Use Template</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Loading referrals...
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No referrals found
                    </td>
                  </tr>
                ) : (
                  referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{referral.referralNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{referral.patientName}</div>
                        <div className="text-xs text-gray-500">MRN: {referral.patientMrn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{referral.referredToSpecialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={referral.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TypeBadge type={referral.type} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={referral.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedReferral(referral);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showNewReferralModal && <NewReferralModal />}
      {showDetailModal && selectedReferral && <ReferralDetailModal referral={selectedReferral} />}
    </div>
  );
};

export default ReferralsPage;
