// Todo #9: Onboarding Workflow System
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Calendar, User, FileText, Mail } from 'lucide-react';

interface OnboardingTask {
  id: string;
  phase: 'Pre-Hire' | 'Day 1' | 'Week 1' | 'Week 2-4';
  taskName: string;
  description: string;
  assignedTo: 'HR' | 'Manager' | 'IT' | 'Employee' | 'Mentor';
  dueDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  completedAt?: string;
  completedBy?: string;
  dependencies?: string[];
  documentUrl?: string;
  notes?: string;
}

interface OnboardingChecklist {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  managerId: string;
  managerName: string;
  mentorId?: string;
  mentorName?: string;
  tasks: OnboardingTask[];
  overallProgress: number;
}

export default function OnboardingWorkflow() {
  const [checklists, setChecklists] = useState<OnboardingChecklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<OnboardingChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOnboardingChecklists();
  }, []);

  const loadOnboardingChecklists = async () => {
    // In production: const response = await onboardingApi.getAll();
    const mockChecklists: OnboardingChecklist[] = [
      {
        employeeId: 'EMP-0031',
        employeeName: 'Dr. Michael Chen',
        jobTitle: 'Ophthalmologist',
        department: 'Ophthalmology',
        startDate: '2026-02-01',
        managerId: 'user-001',
        managerName: 'Dr. Sarah Johnson',
        mentorId: 'user-002',
        mentorName: 'Dr. Robert Williams',
        overallProgress: 45,
        tasks: [
          {
            id: '1',
            phase: 'Pre-Hire',
            taskName: 'Background Check',
            description: 'Complete criminal background check and verification',
            assignedTo: 'HR',
            dueDate: '2026-01-25',
            status: 'Completed',
            completedAt: '2026-01-20',
            completedBy: 'HR Team',
          },
          {
            id: '2',
            phase: 'Pre-Hire',
            taskName: 'Reference Verification',
            description: 'Contact and verify 3 professional references',
            assignedTo: 'HR',
            dueDate: '2026-01-25',
            status: 'Completed',
            completedAt: '2026-01-22',
            completedBy: 'HR Team',
          },
          {
            id: '3',
            phase: 'Pre-Hire',
            taskName: 'Offer Letter Signed',
            description: 'Send and receive signed offer letter',
            assignedTo: 'HR',
            dueDate: '2026-01-28',
            status: 'Completed',
            completedAt: '2026-01-23',
            completedBy: 'Emily Davis (HR)',
          },
          {
            id: '4',
            phase: 'Day 1',
            taskName: 'System Account Creation',
            description: 'Create email, network login, and EHR access',
            assignedTo: 'IT',
            dueDate: '2026-02-01',
            status: 'In Progress',
          },
          {
            id: '5',
            phase: 'Day 1',
            taskName: 'ID Badge Issuance',
            description: 'Create and issue employee ID badge with photo',
            assignedTo: 'HR',
            dueDate: '2026-02-01',
            status: 'Pending',
            dependencies: ['4'],
          },
          {
            id: '6',
            phase: 'Day 1',
            taskName: 'Equipment Assignment',
            description: 'Assign laptop, pager, and medical instruments',
            assignedTo: 'IT',
            dueDate: '2026-02-01',
            status: 'Pending',
          },
          {
            id: '7',
            phase: 'Day 1',
            taskName: 'Orientation Session',
            description: 'Attend 4-hour hospital orientation and safety training',
            assignedTo: 'Employee',
            dueDate: '2026-02-01',
            status: 'Pending',
          },
          {
            id: '8',
            phase: 'Week 1',
            taskName: 'Mentor Introduction',
            description: 'Meet with assigned mentor and set weekly check-in schedule',
            assignedTo: 'Manager',
            dueDate: '2026-02-03',
            status: 'Pending',
          },
          {
            id: '9',
            phase: 'Week 1',
            taskName: 'EHR Training',
            description: 'Complete 8-hour Electronic Health Records training',
            assignedTo: 'Employee',
            dueDate: '2026-02-05',
            status: 'Pending',
          },
          {
            id: '10',
            phase: 'Week 1',
            taskName: 'Department Tour',
            description: 'Tour all clinical departments and meet key staff',
            assignedTo: 'Manager',
            dueDate: '2026-02-05',
            status: 'Pending',
          },
          {
            id: '11',
            phase: 'Week 2-4',
            taskName: 'HIPAA Compliance Training',
            description: 'Complete mandatory HIPAA training and certification',
            assignedTo: 'Employee',
            dueDate: '2026-02-15',
            status: 'Pending',
          },
          {
            id: '12',
            phase: 'Week 2-4',
            taskName: 'Clinical Shadowing',
            description: 'Shadow senior ophthalmologist for 2 weeks',
            assignedTo: 'Mentor',
            dueDate: '2026-02-28',
            status: 'Pending',
          },
          {
            id: '13',
            phase: 'Week 2-4',
            taskName: '30-Day Review',
            description: 'Conduct first performance review with manager',
            assignedTo: 'Manager',
            dueDate: '2026-03-01',
            status: 'Pending',
          },
        ],
      },
    ];
    setChecklists(mockChecklists);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Blocked':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Blocked: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.Pending;
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      'Pre-Hire': 'bg-purple-100 text-purple-800 border-purple-300',
      'Day 1': 'bg-blue-100 text-blue-800 border-blue-300',
      'Week 1': 'bg-green-100 text-green-800 border-green-300',
      'Week 2-4': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[phase as keyof typeof colors] || colors['Pre-Hire'];
  };

  const markTaskCompleted = (checklistId: string, taskId: string) => {
    // In production: await onboardingApi.updateTaskStatus(checklistId, taskId, 'Completed');
    const updatedChecklists = checklists.map((checklist) => {
      if (checklist.employeeId === checklistId) {
        const updatedTasks = checklist.tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              status: 'Completed' as const,
              completedAt: new Date().toISOString(),
              completedBy: 'Current User',
            };
          }
          return task;
        });
        const completedCount = updatedTasks.filter((t) => t.status === 'Completed').length;
        return {
          ...checklist,
          tasks: updatedTasks,
          overallProgress: Math.round((completedCount / updatedTasks.length) * 100),
        };
      }
      return checklist;
    });
    setChecklists(updatedChecklists);
  };

  const sendReminderEmail = (task: OnboardingTask) => {
    // In production: await onboardingApi.sendReminder(task.id);
    alert(`Reminder email sent for task: ${task.taskName}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Onboarding Workflow</h2>
          <p className="text-sm text-gray-600">Track new employee onboarding progress</p>
        </div>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 gap-4">
        {checklists.map((checklist) => (
          <div key={checklist.employeeId} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{checklist.employeeName}</h3>
                <p className="text-sm text-gray-600">{checklist.jobTitle} • {checklist.department}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Start Date: {new Date(checklist.startDate).toLocaleDateString()}
                  </span>
                  <span>Manager: {checklist.managerName}</span>
                  {checklist.mentorName && <span>Mentor: {checklist.mentorName}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{checklist.overallProgress}%</div>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${checklist.overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Tasks by Phase */}
            <div className="space-y-4">
              {['Pre-Hire', 'Day 1', 'Week 1', 'Week 2-4'].map((phase) => {
                const phaseTasks = checklist.tasks.filter((t) => t.phase === phase);
                const completedTasks = phaseTasks.filter((t) => t.status === 'Completed').length;

                return (
                  <div key={phase} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getPhaseColor(phase)}`}>
                        {phase}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {completedTasks} / {phaseTasks.length} completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {phaseTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                          <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900">{task.taskName}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                  {task.assignedTo}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                            {task.completedAt && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Completed on {new Date(task.completedAt).toLocaleDateString()} by {task.completedBy}
                              </p>
                            )}
                            {task.status !== 'Completed' && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => markTaskCompleted(checklist.employeeId, task.id)}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-all"
                                >
                                  Mark Completed
                                </button>
                                <button
                                  onClick={() => sendReminderEmail(task)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1 transition-all"
                                >
                                  <Mail className="w-3 h-3" />
                                  Send Reminder
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
