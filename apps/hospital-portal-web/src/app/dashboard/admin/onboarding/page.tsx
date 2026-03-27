'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Plus, Search, Filter, TrendingUp, Clock, 
  CheckCircle, XCircle, Users, Calendar 
} from 'lucide-react';
import { 
  onboardingApi, OnboardingWorkflowDto, OnboardingWorkflowStatus, 
  OnboardingStatsDto, AccessLevel 
} from '@/lib/api/onboarding.api';
import { getApi } from '@/lib/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<OnboardingWorkflowDto[]>([]);
  const [statistics, setStatistics] = useState<OnboardingStatsDto | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OnboardingWorkflowStatus | 'all'>('all');
  
  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;

      const [workflowsRes, statsRes, employeesRes] = await Promise.all([
        onboardingApi.getAll(status),
        onboardingApi.getStats(),
        getApi().get<Employee[]>('/employees')
      ]);

      setWorkflows(workflowsRes.data);
      setStatistics(statsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
      alert('Failed to load onboarding workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorkflow = (id: string) => {
    router.push(`/dashboard/admin/onboarding/${id}`);
  };

  const filteredWorkflows = workflows.filter(w => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      w.userName.toLowerCase().includes(search) ||
      w.employeeName?.toLowerCase().includes(search) ||
      w.departmentName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage onboarding workflows and progressive access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          New Workflow
        </button>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Workflows</p>
                <p className="text-3xl font-bold mt-1">{statistics.totalWorkflows}</p>
                <p className="text-blue-100 text-xs mt-2">All time</p>
              </div>
              <Briefcase className="h-12 w-12 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active Workflows</p>
                <p className="text-3xl font-bold mt-1">{statistics.activeWorkflows}</p>
                <p className="text-orange-100 text-xs mt-2">In progress</p>
              </div>
              <Clock className="h-12 w-12 text-orange-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-1">{statistics.completedWorkflows}</p>
                <p className="text-green-100 text-xs mt-2">Success rate: {statistics.completionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Duration</p>
                <p className="text-3xl font-bold mt-1">{statistics.averageCompletionDays}</p>
                <p className="text-purple-100 text-xs mt-2">days to complete</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-200 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value={OnboardingWorkflowStatus.NotStarted}>Not Started</option>
              <option value={OnboardingWorkflowStatus.InProgress}>In Progress</option>
              <option value={OnboardingWorkflowStatus.Completed}>Completed</option>
              <option value={OnboardingWorkflowStatus.Cancelled}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading workflows...</p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No onboarding workflows found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkflows.map(workflow => (
                <tr key={workflow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{workflow.userName}</div>
                      <div className="text-sm text-gray-500">{workflow.employeeName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {workflow.departmentName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${workflow.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{workflow.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      workflow.currentAccessLevel === AccessLevel.Full ? 'bg-green-100 text-green-800' :
                      workflow.currentAccessLevel === AccessLevel.Day30 ? 'bg-blue-100 text-blue-800' :
                      workflow.currentAccessLevel === AccessLevel.Day7 ? 'bg-purple-100 text-purple-800' :
                      workflow.currentAccessLevel === AccessLevel.Day1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.currentAccessLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      workflow.status === OnboardingWorkflowStatus.Completed ? 'bg-green-100 text-green-800' :
                      workflow.status === OnboardingWorkflowStatus.InProgress ? 'bg-blue-100 text-blue-800' :
                      workflow.status === OnboardingWorkflowStatus.Cancelled ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(workflow.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewWorkflow(workflow.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateWorkflowModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Create Workflow Modal
function CreateWorkflowModal({ 
  employees, 
  onClose, 
  onSuccess 
}: { 
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    userId: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId) {
      alert('Please select an employee');
      return;
    }

    try {
      await onboardingApi.create(formData);
      alert('Onboarding workflow created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create onboarding workflow');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Onboarding Workflow</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion Date</label>
            <input
              type="date"
              value={formData.expectedCompletionDate}
              onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
