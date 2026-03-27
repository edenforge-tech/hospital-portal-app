'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Edit, Save, X, Users, Calendar, DollarSign, 
  MapPin, User, Award, Clock, CheckCircle, XCircle, Plus
} from 'lucide-react';
import { 
  trainingApi, TrainingProgram, TrainingEnrollment
} from '@/lib/api/training.api';
import { getApi } from '@/lib/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
}

export default function TrainingProgramDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'enrollments'>('details');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [programId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [programRes, enrollmentsRes, employeesRes] = await Promise.all([
        trainingApi.getProgramById(programId),
        trainingApi.getEnrollments({ programId }),
        getApi().get<Employee[]>('/employees')
      ]);

      setProgram(programRes.data);
      setEnrollments(enrollmentsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to load program:', error);
      alert('Failed to load training program');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!program) return;

    try {
      await trainingApi.updateProgram(programId, program);
      alert('Program updated successfully!');
      setIsEditing(false);
      loadData();
    } catch (error) {
      console.error('Failed to update program:', error);
      alert('Failed to update program');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this training program?')) return;

    try {
      await trainingApi.deleteProgram(programId);
      alert('Program deleted successfully!');
      router.push('/dashboard/admin/training');
    } catch (error) {
      console.error('Failed to delete program:', error);
      alert('Failed to delete program');
    }
  };

  const handleCompleteEnrollment = async (enrollmentId: string) => {
    const score = prompt('Enter final score (0-100):');
    if (!score) return;

    const certificateNumber = prompt('Enter certificate number (optional):');

    try {
      await trainingApi.completeEnrollment(enrollmentId, {
        completionDate: new Date().toISOString(),
        score: parseInt(score),
        certificateNumber: certificateNumber || undefined,
        feedback: '',
        attendancePercentage: 100
      });
      alert('Enrollment marked as completed!');
      loadData();
    } catch (error) {
      console.error('Failed to complete enrollment:', error);
      alert('Failed to complete enrollment');
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      await trainingApi.cancelEnrollment(enrollmentId, reason);
      alert('Enrollment cancelled!');
      loadData();
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      alert('Failed to cancel enrollment');
    }
  };

  if (loading || !program) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{program.programName}</h1>
            <p className="text-gray-600 mt-1">{program.programCode}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Save className="h-5 w-5" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadData();
                }}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-5 w-5" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <XCircle className="h-5 w-5" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Program Details
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'enrollments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Enrollments ({enrollments.length})
          </button>
        </nav>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={program.programName}
                    onChange={(e) => setProgram({ ...program, programName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{program.programName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={program.programCode}
                    onChange={(e) => setProgram({ ...program, programCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{program.programCode}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={program.description}
                    onChange={(e) => setProgram({ ...program, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{program.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {isEditing ? (
                  <select
                    value={program.category}
                    onChange={(e) => setProgram({ ...program, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Safety">Safety</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{program.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                  program.status === 'active' ? 'bg-green-100 text-green-800' :
                  program.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  program.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {program.status}
                </span>
              </div>
            </div>
          </div>

          {/* Program Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Details</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{program.durationHours} hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="text-lg font-semibold text-gray-900">${program.cost?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Max Participants</p>
                  <p className="text-lg font-semibold text-gray-900">{program.maxParticipants || 'Unlimited'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Certificate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {program.certificateIssued ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {program.provider && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Provider</p>
                    <p className="text-lg font-semibold text-gray-900">{program.provider}</p>
                  </div>
                </div>
              )}

              {program.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{program.location}</p>
                  </div>
                </div>
              )}

              {program.instructor && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="text-lg font-semibold text-gray-900">{program.instructor}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Enrolled Employees</h2>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Enroll Employee
            </button>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No enrollments yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map(enrollment => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{enrollment.employeeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          enrollment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                          enrollment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          enrollment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {enrollment.completionDate && (
                          <div>
                            <div>Completed: {new Date(enrollment.completionDate).toLocaleDateString()}</div>
                            {enrollment.score !== undefined && <div>Score: {enrollment.score}/100</div>}
                            {enrollment.certificateNumber && <div>Cert: {enrollment.certificateNumber}</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {enrollment.status === 'Enrolled' || enrollment.status === 'InProgress' ? (
                          <>
                            <button
                              onClick={() => handleCompleteEnrollment(enrollment.id!)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleCancelEnrollment(enrollment.id!)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enroll Employee Modal */}
      {showEnrollModal && (
        <EnrollEmployeeModal
          programId={programId}
          employees={employees}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={() => {
            setShowEnrollModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Enroll Employee Modal
function EnrollEmployeeModal({ 
  programId, 
  employees, 
  onClose, 
  onSuccess 
}: { 
  programId: string;
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }

    try {
      await trainingApi.enrollEmployee(programId, {
        employeeId: selectedEmployeeId,
        notes
      });
      alert('Employee enrolled successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to enroll employee:', error);
      alert('Failed to enroll employee');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enroll Employee</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this enrollment..."
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
              Enroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
