'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

interface QualityMetrics {
  overallScore: number;
  activeAudits: number;
  openIssues: number;
  complianceRate: number;
}

interface QualityAudit {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed';
  score: number;
  auditor: string;
  dueDate: string;
  findings: number;
}

export default function QualityPage() {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    overallScore: 0,
    activeAudits: 0,
    openIssues: 0,
    complianceRate: 0
  });
  const [audits, setAudits] = useState<QualityAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      setMetrics({
        overallScore: 92,
        activeAudits: 3,
        openIssues: 5,
        complianceRate: 96
      });

      setAudits([
        {
          id: '1',
          title: 'Patient Safety Review Q1 2026',
          type: 'Patient Safety',
          status: 'in_progress',
          score: 88,
          auditor: 'Quality Team',
          dueDate: '2026-02-15',
          findings: 3
        },
        {
          id: '2',
          title: 'HIPAA Compliance Audit',
          type: 'Compliance',
          status: 'completed',
          score: 95,
          auditor: 'Compliance Officer',
          dueDate: '2026-01-31',
          findings: 1
        }
      ]);
    } catch (error) {
      console.error('Failed to load quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Overall Score', value: `${metrics.overallScore}%`, icon: Star, color: 'bg-green-500' },
    { title: 'Active Audits', value: metrics.activeAudits, icon: BarChart3, color: 'bg-blue-500' },
    { title: 'Open Issues', value: metrics.openIssues, icon: AlertCircle, color: 'bg-orange-500' },
    { title: 'Compliance Rate', value: `${metrics.complianceRate}%`, icon: CheckCircle, color: 'bg-purple-500' }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return <div className="p-6"><div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading quality data...</div></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quality Management</h1>
        <p className="text-gray-600 mt-1">Monitor quality metrics and compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quality Audits</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{audit.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(audit.status)}`}>
                        {audit.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500">Type</p><p className="text-gray-900 font-medium">{audit.type}</p></div>
                      <div><p className="text-gray-500">Score</p><p className="text-gray-900 font-medium">{audit.score}%</p></div>
                      <div><p className="text-gray-500">Auditor</p><p className="text-gray-900 font-medium">{audit.auditor}</p></div>
                      <div><p className="text-gray-500">Due Date</p><p className="text-gray-900 font-medium">{new Date(audit.dueDate).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
