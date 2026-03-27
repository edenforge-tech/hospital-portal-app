'use client';

import React from 'react';
import { 
  UserMinus, 
  FileText, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Users,
  ArrowRight,
  Building,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';

type ExitType = 'resignation' | 'termination' | 'retirement' | 'end-of-contract' | 'mutual-separation';
type ExitStatus = 'initiated' | 'in-progress' | 'clearance-pending' | 'interview-pending' | 'completed' | 'cancelled';

interface ExitCase {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  joiningDate: string;
  exitType: ExitType;
  resignationDate: string;
  lastWorkingDate: string;
  noticePeriod: number; // days
  status: ExitStatus;
  reason: string;
  handoverAssignee?: string;
  exitInterviewDate?: string;
  exitInterviewCompleted: boolean;
  clearanceStatus: {
    it: boolean;
    hr: boolean;
    finance: boolean;
    admin: boolean;
    department: boolean;
  };
  fnfStatus: 'pending' | 'calculated' | 'approved' | 'paid';
  fnfAmount?: number;
  relievingLetterIssued: boolean;
  experienceLetterIssued: boolean;
  remarks?: string;
}

interface OffboardingTask {
  id: string;
  caseId: string;
  taskName: string;
  department: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: string;
  remarks?: string;
}

interface ExitInterviewQuestion {
  id: string;
  category: string;
  question: string;
  response?: string;
  rating?: number;
}

const mockExitCases: ExitCase[] = [
  {
    id: 'EXIT001',
    employeeId: 'EMP045',
    employeeName: 'Dr. Suresh Menon',
    department: 'Ophthalmology',
    designation: 'Senior Consultant',
    joiningDate: '2019-03-15',
    exitType: 'resignation',
    resignationDate: '2026-01-05',
    lastWorkingDate: '2026-02-05',
    noticePeriod: 30,
    status: 'in-progress',
    reason: 'Better opportunity',
    handoverAssignee: 'Dr. Anita Sharma',
    exitInterviewDate: '2026-02-03',
    exitInterviewCompleted: false,
    clearanceStatus: {
      it: true,
      hr: false,
      finance: false,
      admin: true,
      department: true
    },
    fnfStatus: 'calculated',
    fnfAmount: 245000,
    relievingLetterIssued: false,
    experienceLetterIssued: false
  },
  {
    id: 'EXIT002',
    employeeId: 'EMP089',
    employeeName: 'Kavitha Raghavan',
    department: 'Nursing',
    designation: 'Staff Nurse',
    joiningDate: '2021-06-01',
    exitType: 'resignation',
    resignationDate: '2026-01-10',
    lastWorkingDate: '2026-01-25',
    noticePeriod: 15,
    status: 'clearance-pending',
    reason: 'Relocation',
    handoverAssignee: 'Meera Joseph',
    exitInterviewDate: '2026-01-24',
    exitInterviewCompleted: true,
    clearanceStatus: {
      it: true,
      hr: true,
      finance: false,
      admin: true,
      department: true
    },
    fnfStatus: 'pending',
    relievingLetterIssued: false,
    experienceLetterIssued: false
  },
  {
    id: 'EXIT003',
    employeeId: 'EMP023',
    employeeName: 'Ramesh Babu',
    department: 'Administration',
    designation: 'Office Manager',
    joiningDate: '2015-01-10',
    exitType: 'retirement',
    resignationDate: '2025-12-01',
    lastWorkingDate: '2026-01-31',
    noticePeriod: 60,
    status: 'completed',
    reason: 'Superannuation',
    exitInterviewDate: '2026-01-28',
    exitInterviewCompleted: true,
    clearanceStatus: {
      it: true,
      hr: true,
      finance: true,
      admin: true,
      department: true
    },
    fnfStatus: 'paid',
    fnfAmount: 580000,
    relievingLetterIssued: true,
    experienceLetterIssued: true,
    remarks: 'Farewell conducted on Jan 30'
  },
  {
    id: 'EXIT004',
    employeeId: 'EMP112',
    employeeName: 'Arun Kumar',
    department: 'IT',
    designation: 'System Administrator',
    joiningDate: '2023-04-15',
    exitType: 'termination',
    resignationDate: '2026-01-20',
    lastWorkingDate: '2026-01-20',
    noticePeriod: 0,
    status: 'clearance-pending',
    reason: 'Policy violation',
    exitInterviewCompleted: false,
    clearanceStatus: {
      it: false,
      hr: false,
      finance: false,
      admin: false,
      department: false
    },
    fnfStatus: 'calculated',
    fnfAmount: 45000,
    relievingLetterIssued: false,
    experienceLetterIssued: false,
    remarks: 'Security access revoked immediately'
  }
];

const mockOffboardingTasks: OffboardingTask[] = [
  {
    id: 'TASK001',
    caseId: 'EXIT001',
    taskName: 'Revoke system access',
    department: 'IT',
    assignee: 'Rajesh IT Admin',
    dueDate: '2026-02-05',
    status: 'completed',
    completedDate: '2026-01-28'
  },
  {
    id: 'TASK002',
    caseId: 'EXIT001',
    taskName: 'Collect ID card & access badges',
    department: 'Admin',
    assignee: 'Security Desk',
    dueDate: '2026-02-05',
    status: 'pending'
  },
  {
    id: 'TASK003',
    caseId: 'EXIT001',
    taskName: 'Knowledge transfer documentation',
    department: 'Ophthalmology',
    assignee: 'Dr. Anita Sharma',
    dueDate: '2026-02-03',
    status: 'in-progress'
  },
  {
    id: 'TASK004',
    caseId: 'EXIT001',
    taskName: 'Calculate final settlement',
    department: 'Finance',
    assignee: 'Accounts Team',
    dueDate: '2026-02-05',
    status: 'completed',
    completedDate: '2026-01-25'
  },
  {
    id: 'TASK005',
    caseId: 'EXIT002',
    taskName: 'Process PF withdrawal',
    department: 'Finance',
    assignee: 'HR Finance',
    dueDate: '2026-01-25',
    status: 'pending'
  }
];

const exitInterviewQuestions: ExitInterviewQuestion[] = [
  { id: 'Q1', category: 'Work Environment', question: 'How would you rate your overall work experience?' },
  { id: 'Q2', category: 'Work Environment', question: 'Was the work-life balance satisfactory?' },
  { id: 'Q3', category: 'Management', question: 'How was your relationship with your immediate supervisor?' },
  { id: 'Q4', category: 'Management', question: 'Did you receive adequate support from management?' },
  { id: 'Q5', category: 'Growth', question: 'Were there sufficient opportunities for career growth?' },
  { id: 'Q6', category: 'Growth', question: 'Did you receive adequate training and development?' },
  { id: 'Q7', category: 'Compensation', question: 'Were you satisfied with your compensation and benefits?' },
  { id: 'Q8', category: 'Culture', question: 'How would you describe the organization culture?' },
  { id: 'Q9', category: 'Suggestions', question: 'What improvements would you suggest?' },
  { id: 'Q10', category: 'Rehire', question: 'Would you consider rejoining this organization?' }
];

export default function ExitManagementPage() {
  const [activeTab, setActiveTab] = React.useState<'cases' | 'tasks' | 'interview' | 'analytics'>('cases');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedCase, setSelectedCase] = React.useState<ExitCase | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = React.useState(false);

  const getExitTypeColor = (type: ExitType) => {
    switch (type) {
      case 'resignation': return 'bg-blue-100 text-blue-700';
      case 'termination': return 'bg-red-100 text-red-700';
      case 'retirement': return 'bg-purple-100 text-purple-700';
      case 'end-of-contract': return 'bg-orange-100 text-orange-700';
      case 'mutual-separation': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: ExitStatus) => {
    switch (status) {
      case 'initiated': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'clearance-pending': return 'bg-orange-100 text-orange-700';
      case 'interview-pending': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getClearancePercentage = (clearance: ExitCase['clearanceStatus']) => {
    const total = Object.keys(clearance).length;
    const completed = Object.values(clearance).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const stats = {
    totalCases: mockExitCases.length,
    inProgress: mockExitCases.filter(c => c.status === 'in-progress').length,
    pendingClearance: mockExitCases.filter(c => c.status === 'clearance-pending').length,
    completed: mockExitCases.filter(c => c.status === 'completed').length,
    pendingTasks: mockOffboardingTasks.filter(t => t.status === 'pending').length,
    pendingInterviews: mockExitCases.filter(c => !c.exitInterviewCompleted && c.exitType !== 'termination').length
  };

  const filteredCases = mockExitCases.filter(exitCase => {
    const matchesSearch = exitCase.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exitCase.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exitCase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderCases = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="initiated">Initiated</option>
          <option value="in-progress">In Progress</option>
          <option value="clearance-pending">Clearance Pending</option>
          <option value="interview-pending">Interview Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button 
          onClick={() => setShowNewCaseModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Exit Case
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map(exitCase => (
          <div 
            key={exitCase.id} 
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserMinus className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{exitCase.employeeName}</h3>
                    <p className="text-sm text-gray-500">{exitCase.designation} • {exitCase.department}</p>
                    <p className="text-xs text-gray-400">{exitCase.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExitTypeColor(exitCase.exitType)}`}>
                    {exitCase.exitType.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exitCase.status)}`}>
                    {exitCase.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Resignation Date</p>
                  <p className="font-medium text-gray-900">{new Date(exitCase.resignationDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Working Day</p>
                  <p className="font-medium text-gray-900">{new Date(exitCase.lastWorkingDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Notice Period</p>
                  <p className="font-medium text-gray-900">{exitCase.noticePeriod} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reason</p>
                  <p className="font-medium text-gray-900">{exitCase.reason}</p>
                </div>
              </div>

              {/* Clearance Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Clearance Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getClearancePercentage(exitCase.clearanceStatus)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${getClearancePercentage(exitCase.clearanceStatus)}%` }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {Object.entries(exitCase.clearanceStatus).map(([dept, cleared]) => (
                    <span 
                      key={dept}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        cleared ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {dept.toUpperCase()} {cleared ? '✓' : '○'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {exitCase.exitInterviewCompleted ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Interview Done
                    </span>
                  ) : exitCase.exitInterviewDate ? (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Clock className="w-4 h-4" />
                      Interview: {new Date(exitCase.exitInterviewDate).toLocaleDateString('en-IN')}
                    </span>
                  ) : null}
                  {exitCase.fnfStatus === 'paid' && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      F&F Paid: ₹{exitCase.fnfAmount?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedCase(exitCase)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Offboarding Tasks</h3>
        <div className="flex gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                status === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assignee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockOffboardingTasks.map(task => {
                const relatedCase = mockExitCases.find(c => c.id === task.caseId);
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{task.taskName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{relatedCase?.employeeName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{task.department}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{task.assignee}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.status === 'pending' && (
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInterview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Exit Interview Templates</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Standard Exit Interview Questions</h4>
        <div className="space-y-4">
          {exitInterviewQuestions.map((q, idx) => (
            <div key={q.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {idx + 1}
              </span>
              <div className="flex-1">
                <span className="text-xs text-blue-600 font-medium uppercase">{q.category}</span>
                <p className="text-gray-900 mt-1">{q.question}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Interviews */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Pending Exit Interviews</h4>
        <div className="space-y-3">
          {mockExitCases
            .filter(c => !c.exitInterviewCompleted && c.exitType !== 'termination')
            .map(exitCase => (
              <div key={exitCase.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{exitCase.employeeName}</p>
                    <p className="text-sm text-gray-500">
                      {exitCase.exitInterviewDate 
                        ? `Scheduled: ${new Date(exitCase.exitInterviewDate).toLocaleDateString('en-IN')}`
                        : 'Not scheduled'}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                  Conduct Interview
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserMinus className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Total Exits</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
          <p className="text-sm text-gray-500 mt-1">This quarter</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">In Progress</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          <p className="text-sm text-gray-500 mt-1">Active cases</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-900">Pending Tasks</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
          <p className="text-sm text-gray-500 mt-1">Offboarding tasks</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Interviews Pending</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingInterviews}</p>
          <p className="text-sm text-gray-500 mt-1">Exit interviews</p>
        </div>
      </div>

      {/* Exit Reasons Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Exit Reasons Analysis</h3>
        <div className="space-y-4">
          {[
            { reason: 'Better Opportunity', count: 45, percentage: 35, color: 'bg-blue-500' },
            { reason: 'Relocation', count: 28, percentage: 22, color: 'bg-green-500' },
            { reason: 'Higher Studies', count: 18, percentage: 14, color: 'bg-purple-500' },
            { reason: 'Personal Reasons', count: 15, percentage: 12, color: 'bg-orange-500' },
            { reason: 'Retirement', count: 12, percentage: 9, color: 'bg-gray-500' },
            { reason: 'Other', count: 10, percentage: 8, color: 'bg-pink-500' }
          ].map(item => (
            <div key={item.reason} className="flex items-center gap-4">
              <div className="w-36 text-sm text-gray-600">{item.reason}</div>
              <div className="flex-1">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${item.percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
              <div className="w-12 text-sm text-right text-gray-600">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Average Notice Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Attrition by Department</h3>
          <div className="space-y-3">
            {[
              { dept: 'Nursing', exits: 12, percentage: 8.5 },
              { dept: 'Administration', exits: 5, percentage: 6.2 },
              { dept: 'IT', exits: 3, percentage: 4.8 },
              { dept: 'Ophthalmology', exits: 2, percentage: 2.1 },
              { dept: 'Pharmacy', exits: 2, percentage: 3.5 }
            ].map(item => (
              <div key={item.dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{item.dept}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{item.exits} exits</span>
                  <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Avg. Tenure Before Exit</h3>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-blue-600">2.8</p>
            <p className="text-gray-500 mt-2">Years Average</p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">18</p>
              <p className="text-xs text-gray-500">&lt;1 Year</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">45</p>
              <p className="text-xs text-gray-500">1-3 Years</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">22</p>
              <p className="text-xs text-gray-500">&gt;3 Years</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <UserMinus className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Exit Management</h1>
          </div>
          <p className="text-gray-500">Manage employee separations, offboarding, and exit interviews</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalCases}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Total Cases</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.inProgress}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.pendingClearance}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Pending Clearance</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Completed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {[
            { id: 'cases', label: 'Exit Cases', icon: UserMinus },
            { id: 'tasks', label: 'Offboarding Tasks', icon: ClipboardList },
            { id: 'interview', label: 'Exit Interview', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'cases' && renderCases()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'interview' && renderInterview()}
        {activeTab === 'analytics' && renderAnalytics()}

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Exit Case Details</h2>
                  <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserMinus className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedCase.employeeName}</h3>
                    <p className="text-sm text-gray-500">{selectedCase.designation}</p>
                    <p className="text-sm text-gray-400">{selectedCase.department} • {selectedCase.employeeId}</p>
                  </div>
                </div>

                {/* Exit Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Exit Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedCase.exitType.replace('-', ' ')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="font-medium text-gray-900">{selectedCase.reason}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Joining Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedCase.joiningDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Last Working Day</p>
                    <p className="font-medium text-gray-900">{new Date(selectedCase.lastWorkingDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Clearance Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Clearance Status</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(selectedCase.clearanceStatus).map(([dept, cleared]) => (
                      <div 
                        key={dept}
                        className={`p-3 rounded-lg text-center ${
                          cleared ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        {cleared ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        )}
                        <p className={`text-xs font-medium ${cleared ? 'text-green-700' : 'text-gray-500'}`}>
                          {dept.toUpperCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* F&F Status */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Full & Final Settlement</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {selectedCase.fnfAmount ? `₹${selectedCase.fnfAmount.toLocaleString('en-IN')}` : 'Pending'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCase.fnfStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      selectedCase.fnfStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedCase.fnfStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Documents</h4>
                  <div className="flex gap-3">
                    <div className={`flex-1 p-3 rounded-lg ${selectedCase.relievingLetterIssued ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <FileText className={`w-5 h-5 mb-1 ${selectedCase.relievingLetterIssued ? 'text-green-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-900">Relieving Letter</p>
                      <p className={`text-xs ${selectedCase.relievingLetterIssued ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedCase.relievingLetterIssued ? 'Issued' : 'Pending'}
                      </p>
                    </div>
                    <div className={`flex-1 p-3 rounded-lg ${selectedCase.experienceLetterIssued ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <FileText className={`w-5 h-5 mb-1 ${selectedCase.experienceLetterIssued ? 'text-green-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-900">Experience Letter</p>
                      <p className={`text-xs ${selectedCase.experienceLetterIssued ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedCase.experienceLetterIssued ? 'Issued' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setSelectedCase(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Case
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
