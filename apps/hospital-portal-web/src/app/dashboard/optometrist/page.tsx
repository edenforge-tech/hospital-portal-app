'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  AlertCircle,
  Clock,
  Activity,
  Eye,
  PlayCircle,
  SkipForward,
  CheckCircle2,
  Send,
  UserCheck,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { optometryQueueApi, type OptometryQueueItem, type OptometryQueueStats } from '@/lib/api/optometry.api';
import { toast } from 'react-hot-toast';

function OptometristDashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  const [patients, setPatients] = useState<OptometryQueueItem[]>([]);
  const [stats, setStats] = useState<OptometryQueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      // Try API call, fallback to mock data for development
      let queueData: OptometryQueueItem[];
      let statsData: OptometryQueueStats;
      try {
        const [q, s] = await Promise.all([
          optometryQueueApi.getQueue(),
          optometryQueueApi.getStats(),
        ]);
        queueData = q;
        statsData = s;
      } catch {
        // Mock data for development
        queueData = getMockQueueData();
        statsData = {
          totalWaiting: queueData.filter((p) => p.status === 'Waiting').length,
          inProgress: queueData.filter((p) => p.status === 'In Progress').length,
          completed: queueData.filter((p) => p.status === 'Completed').length,
          referred: queueData.filter((p) => p.status === 'Referred').length,
          emergencyCount: queueData.filter((p) => p.urgency === 'Emergency').length,
          urgentCount: queueData.filter((p) => p.urgency === 'Urgent').length,
          averageWaitTime: 18,
        };
      }
      setPatients(queueData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load optometry queue:', error);
      toast.error('Failed to load patient queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadQueue]);

  const handleCallNext = async () => {
    try {
      const nextPatient = await optometryQueueApi.callNext();
      toast.success(`Calling: ${nextPatient.patientName} (Token: ${nextPatient.tokenNumber})`);
      loadQueue();
    } catch {
      // Fallback: navigate to first waiting patient
      const nextWaiting = patients.find((p) => p.status === 'Waiting');
      if (nextWaiting) {
        handleStartExam(nextWaiting);
      } else {
        toast.error('No patients waiting in queue');
      }
    }
  };

  const handleStartExam = (patient: OptometryQueueItem) => {
    const complaint = patient.chiefComplaint ? `&complaint=${encodeURIComponent(patient.chiefComplaint)}` : '';
    router.push(`/dashboard/optometrist/exam?patientId=${patient.patientId}&tab=visual-acuity${complaint}`);
  };

  const handleSkip = async (patient: OptometryQueueItem) => {
    try {
      await optometryQueueApi.skipPatient(patient.id, 'Patient not available');
      toast.success(`Skipped: ${patient.patientName}`);
      loadQueue();
    } catch {
      toast.error('Failed to skip patient');
    }
  };

  const handleReferToDoctor = (patient: OptometryQueueItem) => {
    router.push(`/dashboard/optometrist/refer-doctor?patientId=${patient.patientId}`);
  };

  const handleViewEducation = (patient: OptometryQueueItem) => {
    router.push(`/dashboard/optometrist/patient-education?patientId=${patient.patientId}`);
  };

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || patient.urgency === urgencyFilter;
    const matchesSource = sourceFilter === 'All' || patient.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesUrgency && matchesSource;
  });

  // Sort: Emergency first, then Urgent, then by token number
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const statusOrder: Record<string, number> = { 'In Progress': 0, Waiting: 1, Completed: 2, Referred: 3, Skipped: 4 };
    const urgencyOrder: Record<string, number> = { Emergency: 0, Urgent: 1, Routine: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    return 0;
  });

  // Handle stat card click to filter patients
  const handleStatClick = (type: string) => {
    if (type === 'Emergency') {
      // Emergency is urgency-based
      setStatusFilter('All');
      setUrgencyFilter(urgencyFilter === 'Emergency' ? 'All' : 'Emergency');
    } else {
      // Waiting, In Progress, Completed, Referred are status-based
      setUrgencyFilter('All');
      setStatusFilter(statusFilter === type ? 'All' : type);
    }
  };

  const isStatActive = (type: string) => {
    if (type === 'Emergency') return urgencyFilter === 'Emergency';
    return statusFilter === type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Referred': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Skipped': return 'bg-gray-100 text-gray-500 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'Urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Routine': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'OPD': return 'bg-blue-50 text-blue-700';
      case 'Walk-in': return 'bg-teal-50 text-teal-700';
      case 'Post-Op': return 'bg-purple-50 text-purple-700';
      case 'Follow-up': return 'bg-indigo-50 text-indigo-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Stats Bar — flush to top, no gaps */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Stat Cards */}
          <div className="flex items-center gap-4 flex-1">
            <div
              onClick={() => handleStatClick('Waiting')}
              title="Click to filter by Waiting patients"
              className={`flex-1 flex items-center gap-3 rounded-lg px-5 py-3 cursor-pointer transition-all ${
                isStatActive('Waiting')
                  ? 'bg-amber-100 border-2 border-amber-400 ring-2 ring-amber-200 shadow-sm'
                  : 'bg-amber-50 border border-amber-200 hover:border-amber-300 hover:shadow-sm'
              }`}
            >
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">Waiting</p>
                <p className="text-2xl font-bold text-amber-900">{stats?.totalWaiting ?? 0}</p>
              </div>
            </div>
            <div
              onClick={() => handleStatClick('In Progress')}
              title="Click to filter by In Progress patients"
              className={`flex-1 flex items-center gap-3 rounded-lg px-5 py-3 cursor-pointer transition-all ${
                isStatActive('In Progress')
                  ? 'bg-blue-100 border-2 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                  : 'bg-blue-50 border border-blue-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">In Progress</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.inProgress ?? 0}</p>
              </div>
            </div>
            <div
              onClick={() => handleStatClick('Completed')}
              title="Click to filter by Completed patients"
              className={`flex-1 flex items-center gap-3 rounded-lg px-5 py-3 cursor-pointer transition-all ${
                isStatActive('Completed')
                  ? 'bg-emerald-100 border-2 border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
                  : 'bg-emerald-50 border border-emerald-200 hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-emerald-900">{stats?.completed ?? 0}</p>
              </div>
            </div>
            <div
              onClick={() => handleStatClick('Referred')}
              title="Click to filter by Referred patients"
              className={`flex-1 flex items-center gap-3 rounded-lg px-5 py-3 cursor-pointer transition-all ${
                isStatActive('Referred')
                  ? 'bg-violet-100 border-2 border-violet-400 ring-2 ring-violet-200 shadow-sm'
                  : 'bg-violet-50 border border-violet-200 hover:border-violet-300 hover:shadow-sm'
              }`}
            >
              <Send className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wide">Referred</p>
                <p className="text-2xl font-bold text-violet-900">{stats?.referred ?? 0}</p>
              </div>
            </div>
            <div
              onClick={() => handleStatClick('Emergency')}
              title="Click to filter by Emergency patients"
              className={`flex-1 flex items-center gap-3 rounded-lg px-5 py-3 cursor-pointer transition-all ${
                isStatActive('Emergency')
                  ? 'bg-red-100 border-2 border-red-400 ring-2 ring-red-200 shadow-sm'
                  : 'bg-red-50 border border-red-200 hover:border-red-300 hover:shadow-sm'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">Emergency</p>
                <p className="text-2xl font-bold text-red-900">{stats?.emergencyCount ?? 0}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
              <Timer className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Avg Wait</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.averageWaitTime ?? 0}<span className="text-sm font-medium ml-0.5">m</span></p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-5">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                autoRefresh ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? { animationDuration: '3s' } : {}} />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={handleCallNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlayCircle className="w-5 h-5" />
              Call Next Patient
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, MRN, or token..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Results Counter */}
          <div className="bg-white border border-gray-300 rounded-md px-4 py-2">
            <p className="text-sm font-semibold text-gray-700">
              <span className="text-blue-600">{sortedPatients.length}</span> 
              <span className="text-gray-500 mx-1">/</span> 
              <span className="text-gray-600">{patients.length}</span>
              <span className="text-gray-500 ml-1 font-normal">patients</span>
            </p>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Waiting">Waiting</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Referred">Referred</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Urgency</option>
            <option value="Emergency">Emergency</option>
            <option value="Urgent">Urgent</option>
            <option value="Routine">Routine</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Sources</option>
            <option value="OPD">OPD</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Post-Op">Post-Op</option>
            <option value="Follow-up">Follow-up</option>
          </select>
          <span className="text-xs text-gray-500 whitespace-nowrap">{sortedPatients.length} patient{sortedPatients.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Patient Queue List — scrollable area */}
      <div className="flex-1 overflow-auto px-5 py-3 space-y-2.5 bg-gray-50">
        {sortedPatients.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center mt-6">
            <Users className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-base font-medium">No patients in queue</p>
            <p className="text-gray-400 text-sm mt-1">Patients will appear here after OPD check-in</p>
          </div>
        ) : (
          sortedPatients.map((patient) => (
            <div
              key={patient.id}
              className={`bg-white border rounded-lg p-4 transition-all ${
                patient.status === 'In Progress'
                  ? 'border-blue-300 shadow-sm ring-1 ring-blue-100'
                  : patient.status === 'Completed'
                  ? 'border-gray-200 opacity-70'
                  : patient.hasRedFlags
                  ? 'border-red-200'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Patient Header */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-sm">
                        {patient.patientName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    {patient.status === 'In Progress' && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{patient.patientName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{patient.mrn}</span>
                      <span>{patient.age}y / {patient.gender}</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-0.5" />
                        {patient.appointmentTime}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getSourceBadge(patient.source)}`}>
                        {patient.source}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                    #{patient.tokenNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getUrgencyColor(patient.urgency)}`}>
                    {patient.urgency}
                  </span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="bg-gray-50 rounded px-3 py-2 mb-2">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold text-gray-800">Complaint:</span> {patient.chiefComplaint}
                </p>
              </div>

              {/* Red Flags */}
              {patient.hasRedFlags && patient.redFlags && patient.redFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-red-700 uppercase">Red Flags:</span>
                    <div className="flex flex-wrap gap-1">
                      {patient.redFlags.map((flag, i) => (
                        <span key={i} className="bg-red-100 text-red-700 text-[11px] px-1.5 py-0.5 rounded">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Completed exams + Optometry Summary (for completed/in-progress) */}
              {patient.completedExams.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Exams:</span>
                    {patient.completedExams.map((exam, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 text-[11px] px-1.5 py-0.5 rounded border border-emerald-200">
                        ✓ {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Optometry Quick Summary */}
              {(patient.visualAcuityOD || patient.iopOD) && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-blue-50 rounded px-2.5 py-2">
                    <p className="text-[10px] text-blue-600 font-semibold uppercase mb-0.5">Visual Acuity</p>
                    <p className="text-xs font-mono text-blue-900">OD: {patient.visualAcuityOD || 'N/A'}</p>
                    <p className="text-xs font-mono text-blue-900">OS: {patient.visualAcuityOS || 'N/A'}</p>
                  </div>
                  <div className={`rounded px-2.5 py-2 ${
                    (patient.iopOD && patient.iopOD > 21) || (patient.iopOS && patient.iopOS > 21) ? 'bg-red-50' : 'bg-emerald-50'
                  }`}>
                    <p className={`text-[10px] font-semibold uppercase mb-0.5 ${
                      (patient.iopOD && patient.iopOD > 21) || (patient.iopOS && patient.iopOS > 21) ? 'text-red-600' : 'text-emerald-600'
                    }`}>IOP (mmHg)</p>
                    <p className={`text-xs font-mono ${patient.iopOD && patient.iopOD > 21 ? 'text-red-900 font-bold' : 'text-emerald-900'}`}>
                      OD: {patient.iopOD ?? 'N/A'} {patient.iopOD && patient.iopOD > 21 && '⚠️'}
                    </p>
                    <p className={`text-xs font-mono ${patient.iopOS && patient.iopOS > 21 ? 'text-red-900 font-bold' : 'text-emerald-900'}`}>
                      OS: {patient.iopOS ?? 'N/A'} {patient.iopOS && patient.iopOS > 21 && '⚠️'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded px-2.5 py-2">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase mb-0.5">Refraction</p>
                    <p className="text-xs text-gray-800">
                      {patient.refractionCompleted ? '✅ Completed' : '⏳ Pending'}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                {patient.status === 'Waiting' && (
                  <>
                    <button
                      onClick={() => handleStartExam(patient)}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" />
                      Start Examination
                    </button>
                    <button
                      onClick={() => handleSkip(patient)}
                      className="flex items-center px-2.5 py-1.5 text-gray-500 text-xs rounded hover:bg-gray-100 transition-colors"
                    >
                      <SkipForward className="w-3.5 h-3.5 mr-1" />
                      Skip
                    </button>
                  </>
                )}
                {patient.status === 'In Progress' && (
                  <>
                    <button
                      onClick={() => handleStartExam(patient)}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Continue Exam
                    </button>
                    <button
                      onClick={() => handleViewEducation(patient)}
                      className="flex items-center px-2.5 py-1.5 bg-teal-50 text-teal-700 text-xs rounded hover:bg-teal-100 transition-colors border border-teal-200"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Educate
                    </button>
                    <button
                      onClick={() => handleReferToDoctor(patient)}
                      className="flex items-center px-2.5 py-1.5 bg-violet-50 text-violet-700 text-xs rounded hover:bg-violet-100 transition-colors border border-violet-200"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Refer to Doctor
                    </button>
                  </>
                )}
                {patient.status === 'Completed' && (
                  <div className="flex items-center text-emerald-600 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Complete
                    <button
                      onClick={() => handleReferToDoctor(patient)}
                      className="ml-2 flex items-center px-2.5 py-1.5 bg-violet-50 text-violet-700 text-xs rounded hover:bg-violet-100 transition-colors border border-violet-200"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Refer
                    </button>
                  </div>
                )}
                {patient.status === 'Referred' && (
                  <div className="flex items-center text-violet-600 text-xs font-medium">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Referred to Doctor
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// Mock Data for Development
// ==========================================
function getMockQueueData(): OptometryQueueItem[] {
  // Using UUID format for mock patient IDs to match backend expectations
  return [
    {
      id: '1',
      patientId: '550e8400-e29b-41d4-a716-446655440001',
      patientName: 'Ramesh Kumar',
      mrn: 'MRN001234',
      age: 65,
      gender: 'Male',
      tokenNumber: 'OPT-001',
      appointmentTime: '09:00 AM',
      chiefComplaint: 'Blurred vision, difficulty reading',
      source: 'OPD',
      status: 'In Progress',
      urgency: 'Routine',
      assignedOptometrist: 'Dr. Priya Sharma',
      waitingSince: '08:45 AM',
      completedExams: ['Visual Acuity', 'Auto-Refraction', 'Retinoscopy'],
      hasRedFlags: false,
      visualAcuityOD: '6/36',
      visualAcuityOS: '6/24',
      iopOD: 16,
      iopOS: 15,
      refractionCompleted: false,
    },
    {
      id: '2',
      patientId: '550e8400-e29b-41d4-a716-446655440002',
      patientName: 'Lakshmi Devi',
      mrn: 'MRN005678',
      age: 58,
      gender: 'Female',
      tokenNumber: 'OPT-002',
      appointmentTime: '09:15 AM',
      chiefComplaint: 'Sudden vision loss in left eye, floaters',
      source: 'OPD',
      status: 'Waiting',
      urgency: 'Emergency',
      waitingSince: '09:00 AM',
      completedExams: [],
      hasRedFlags: true,
      redFlags: ['Sudden vision loss', 'Floaters', 'Possible retinal detachment'],
    },
    {
      id: '3',
      patientId: '550e8400-e29b-41d4-a716-446655440003',
      patientName: 'Suresh Babu',
      mrn: 'MRN009012',
      age: 72,
      gender: 'Male',
      tokenNumber: 'OPT-003',
      appointmentTime: '09:30 AM',
      chiefComplaint: 'Eye pain, headache, halos around lights',
      source: 'OPD',
      status: 'Waiting',
      urgency: 'Urgent',
      waitingSince: '09:10 AM',
      completedExams: [],
      hasRedFlags: true,
      redFlags: ['Eye pain with headache', 'Halos - acute glaucoma suspect'],
    },
    {
      id: '4',
      patientId: '550e8400-e29b-41d4-a716-446655440004',
      patientName: 'Priya Sharma',
      mrn: 'MRN001122',
      age: 45,
      gender: 'Female',
      tokenNumber: 'OPT-004',
      appointmentTime: '09:45 AM',
      chiefComplaint: 'Routine checkup, diabetic patient',
      source: 'Follow-up',
      status: 'Waiting',
      urgency: 'Routine',
      waitingSince: '09:30 AM',
      completedExams: [],
      hasRedFlags: false,
    },
    {
      id: '5',
      patientId: '550e8400-e29b-41d4-a716-446655440005',
      patientName: 'Arun Nair',
      mrn: 'MRN003344',
      age: 8,
      gender: 'Male',
      tokenNumber: 'OPT-005',
      appointmentTime: '10:00 AM',
      chiefComplaint: 'Squint, head tilt',
      source: 'OPD',
      status: 'Waiting',
      urgency: 'Routine',
      waitingSince: '09:45 AM',
      completedExams: [],
      hasRedFlags: false,
    },
    {
      id: '6',
      patientId: '550e8400-e29b-41d4-a716-446655440006',
      patientName: 'Kavitha Menon',
      mrn: 'MRN007788',
      age: 55,
      gender: 'Female',
      tokenNumber: 'OPT-006',
      appointmentTime: '10:15 AM',
      chiefComplaint: 'Post-cataract surgery vision check',
      source: 'Post-Op',
      status: 'Completed',
      urgency: 'Routine',
      completedExams: ['Visual Acuity', 'Refraction', 'Tonometry', 'Keratometry'],
      hasRedFlags: false,
      visualAcuityOD: '6/6',
      visualAcuityOS: '6/9',
      iopOD: 14,
      iopOS: 13,
      refractionCompleted: true,
    },
    {
      id: '7',
      patientId: '550e8400-e29b-41d4-a716-446655440007',
      patientName: 'Mohan Das',
      mrn: 'MRN004455',
      age: 38,
      gender: 'Male',
      tokenNumber: 'OPT-007',
      appointmentTime: '08:30 AM',
      chiefComplaint: 'Contact lens fitting required',
      source: 'Walk-in',
      status: 'Referred',
      urgency: 'Routine',
      completedExams: ['Visual Acuity', 'Refraction', 'Keratometry', 'Tonometry', 'Contact Lens Trial'],
      hasRedFlags: false,
      visualAcuityOD: '6/12',
      visualAcuityOS: '6/9',
      iopOD: 15,
      iopOS: 14,
      refractionCompleted: true,
    },
  ];
}

export default function OptometristDashboardPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <OptometristDashboardContent />
    </ProtectedRoute>
  );
}
