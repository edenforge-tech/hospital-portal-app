'use client';

import React, { useState, useEffect } from 'react';
import {
  qualityMetricsApi,
  complianceApi,
  qualityAuditsApi,
  incidentsApi,
  type QualityMetric,
  type QualityMeasurement,
  type ComplianceCheck,
  type QualityAudit,
  type Incident,
} from '@/lib/api/quality.api';

const QualityAssurancePage = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'compliance' | 'audits' | 'incidents'>('metrics');
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([]);
  const [audits, setAudits] = useState<QualityAudit[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [dashboard, setDashboard] = useState<any>(null);
  const [incidentStats, setIncidentStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, filterCategory, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'metrics') {
        const data = await qualityMetricsApi.list({ category: filterCategory || undefined });
        setMetrics(data);
        const dashData = await qualityMetricsApi.getDashboard();
        setDashboard(dashData);
      } else if (activeTab === 'compliance') {
        const data = await complianceApi.list({ status: filterStatus || undefined });
        setCompliance(data);
      } else if (activeTab === 'audits') {
        const response = await qualityAuditsApi.list({ status: filterStatus || undefined });
        setAudits(response.data);
      } else if (activeTab === 'incidents') {
        const response = await incidentsApi.list({ status: filterStatus || undefined });
        setIncidents(response.data);
        const stats = await incidentsApi.getStats();
        setIncidentStats(stats);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = async (metricId: string, value: number) => {
    try {
      await qualityMetricsApi.addMeasurement(metricId, {
        value,
        period: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add measurement');
    }
  };

  const handleCompleteAudit = async (id: string, overallScore: number, recommendations: string) => {
    try {
      await qualityAuditsApi.complete(id, { overallScore, recommendations });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete audit');
    }
  };

  const handleResolveIncident = async (id: string, notes: string) => {
    try {
      await incidentsApi.resolve(id, notes);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve incident');
    }
  };

  const PerformanceBadge = ({ level }: { level: string }) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending_review: 'bg-blue-100 text-blue-800',
      planned: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      reported: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      major: 'bg-orange-100 text-orange-800',
      minor: 'bg-yellow-100 text-yellow-800',
      observation: 'bg-blue-100 text-blue-800',
      near_miss: 'bg-gray-100 text-gray-800',
      no_harm: 'bg-green-100 text-green-800',
      severe: 'bg-red-100 text-red-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      death: 'bg-black text-white',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {severity.replace(/_/g, ' ').toUpperCase()}
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

  const ProgressBar = ({ value, target, label }: { value: number; target: number; label: string }) => {
    const percentage = Math.min((value / target) * 100, 100);
    const color = percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className="text-gray-600">{value} / {target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quality Assurance</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New {activeTab === 'metrics' ? 'Metric' : activeTab === 'compliance' ? 'Check' : activeTab === 'audits' ? 'Audit' : 'Incident Report'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {activeTab === 'metrics' && dashboard && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Metrics" value={metrics.length} color="text-blue-600" />
          <MetricCard
            label="Avg Performance"
            value={`${dashboard.summary[0]?.avgPerformance || 0}%`}
            color="text-green-600"
          />
          <MetricCard
            label="Trending Up"
            value={dashboard.trending.filter((t: any) => t.trend === 'up').length}
            color="text-green-600"
          />
          <MetricCard
            label="Alerts"
            value={dashboard.alerts.length}
            color="text-red-600"
          />
        </div>
      )}

      {activeTab === 'incidents' && incidentStats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total Incidents" value={incidentStats.total} color="text-blue-600" />
          <MetricCard
            label="Critical"
            value={incidentStats.bySeverity.severe || 0}
            color="text-red-600"
          />
          <MetricCard
            label="Open"
            value={incidentStats.byStatus.reported + incidentStats.byStatus.investigating || 0}
            color="text-yellow-600"
          />
          <MetricCard
            label="Resolved This Month"
            value={incidentStats.byStatus.resolved || 0}
            color="text-green-600"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {['metrics', 'compliance', 'audits', 'incidents'].map((tab) => (
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

        <div className="p-4 border-b">
          <div className="flex gap-4">
            {activeTab === 'metrics' && (
              <select
                className="border rounded-md px-3 py-2"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="patient_safety">Patient Safety</option>
                <option value="clinical_effectiveness">Clinical Effectiveness</option>
                <option value="patient_experience">Patient Experience</option>
                <option value="operational_efficiency">Operational Efficiency</option>
                <option value="infection_control">Infection Control</option>
                <option value="medication_safety">Medication Safety</option>
              </select>
            )}
            {(activeTab === 'compliance' || activeTab === 'audits' || activeTab === 'incidents') && (
              <select
                className="border rounded-md px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {activeTab === 'compliance' && (
                  <>
                    <option value="compliant">Compliant</option>
                    <option value="non_compliant">Non-Compliant</option>
                    <option value="partial">Partial</option>
                    <option value="pending_review">Pending Review</option>
                  </>
                )}
                {activeTab === 'audits' && (
                  <>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </>
                )}
                {activeTab === 'incidents' && (
                  <>
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </>
                )}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'metrics' && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Measured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading metrics...
                    </td>
                  </tr>
                ) : metrics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No metrics found
                    </td>
                  </tr>
                ) : (
                  metrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{metric.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs">{metric.category.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{metric.measurementType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{metric.target}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{metric.frequency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {metric.lastMeasuredAt
                          ? new Date(metric.lastMeasuredAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const value = prompt('Enter measurement value:');
                            if (value) handleAddMeasurement(metric.id, parseFloat(value));
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                        >
                          Add Measurement
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(metric);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'compliance' && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Check</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Check</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading compliance checks...
                    </td>
                  </tr>
                ) : compliance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No compliance checks found
                    </td>
                  </tr>
                ) : (
                  compliance.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{check.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs uppercase">{check.checkType}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={check.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {check.lastCheckDate
                          ? new Date(check.lastCheckDate).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {check.nextCheckDate
                          ? new Date(check.nextCheckDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {check.responsiblePersonName || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedItem(check);
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

          {activeTab === 'audits' && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading audits...
                    </td>
                  </tr>
                ) : audits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No audits found
                    </td>
                  </tr>
                ) : (
                  audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{audit.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs">{audit.auditType.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={audit.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(audit.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {audit.auditorName || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {audit.findings.length} findings
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedItem(audit);
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

          {activeTab === 'incidents' && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Loading incidents...
                    </td>
                  </tr>
                ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{incident.incidentNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs">{incident.type.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SeverityBadge severity={incident.severity} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={incident.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{incident.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(incident.incidentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{incident.reportedByName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedItem(incident);
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
    </div>
  );
};

export default QualityAssurancePage;
