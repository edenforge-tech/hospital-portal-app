'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SessionForm from '@/components/counselor/sessions/SessionForm';
import { 
  useCounselingSessions,
  useStartCounselingSession,
  useCompleteCounselingSession
} from '@/hooks/use-counseling-sessions';
import type { CounselingSession } from '@/lib/api/counseling-sessions.api';
import type { RecommendedProcedureItem } from '@/lib/api/master-data.api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ArrowLeft,
  Eye,
  Edit,
  Download,
  X,
} from 'lucide-react';

/** Returns a compact per-eye procedure summary, e.g. "RE: Phaco  LE: Vit" */
function getProcedureSummary(session: CounselingSession): string {
  const raw = (session as any).recommendedProcedures as string | undefined;
  if (raw) {
    try {
      const procs = JSON.parse(raw) as RecommendedProcedureItem[];
      if (Array.isArray(procs) && procs.length > 0) {
        return procs
          .map(p => `${p.eye}: ${p.surgeryName || 'Procedure'}`)
          .join('  •  ');
      }
    } catch {
      // fall through to legacy field
    }
  }
  return session.recommendedSurgery || 'N/A';
}

export default function SessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFilter = searchParams.get('patientId') ?? undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch sessions from API
  const { 
    data: sessionsData, 
    isLoading, 
    error,
    refetch 
  } = useCounselingSessions({
    sessionStatus: statusFilter === 'all' ? undefined : statusFilter,
    sessionType: typeFilter === 'all' ? undefined : typeFilter,
    searchTerm: searchQuery || undefined,
    pageSize: 100,
  });

  // Mutation hooks
  const startSessionMutation = useStartCounselingSession();
  const completeSessionMutation = useCompleteCounselingSession();

  // Extract sessions from response (handles both camelCase and PascalCase)
  const sessions = sessionsData?.sessions || sessionsData?.Sessions || [];

  // Handle session start
  const handleStartSession = async (sessionId: string) => {
    try {
      await startSessionMutation.mutateAsync(sessionId);
      toast.success('Session started successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session');
    }
  };

  // Handle session complete
  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSessionMutation.mutateAsync(sessionId);
      toast.success('Session completed successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete session');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      inprogress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      noshow: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[statusLower as keyof typeof styles] || styles.scheduled;
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'in-progress':
      case 'inprogress':
        return <AlertCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
      case 'noshow':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchQuery || 
      session.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.patientMRN?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.sessionStatus?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || session.sessionType === typeFilter;
    const matchesPatient = !patientIdFilter || session.patientId === patientIdFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPatient;
  });

  return (
    <ProtectedRoute requiredPermissions={['counselor.view']}>
      <div className="p-4 space-y-4">
        {/* Top Bar - Back Button and Action */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/counselor')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowSessionForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>

        {/* Patient filter banner */}
        {patientIdFilter && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-800 font-medium flex-1">
              Showing sessions for patient ID: <span className="font-mono">{patientIdFilter}</span>
            </span>
            <button
              onClick={() => router.replace('/dashboard/counselor/sessions')}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by patient name or MRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Pre-Surgery">Pre-Surgery</option>
                <option value="Financial">Financial</option>
                <option value="Treatment Plan">Treatment Plan</option>
                <option value="Post-Op">Post-Op</option>
                <option value="General">General</option>
              </select>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                <p className="text-gray-600">Loading sessions...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error loading sessions</p>
                <p className="text-gray-600 text-sm mb-4">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Sessions ({filteredSessions.length})</CardTitle>
            <CardDescription>
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions found</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{session.patientName}</h3>
                          <span className="text-sm text-gray-500">{session.patientMRN}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{session.patientPhone}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {session.sessionTime || 'N/A'}
                          </div>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {session.sessionType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Procedure */}
                    <div className="hidden lg:block flex-1 px-4">
                      <p className="text-sm font-medium text-gray-900">{getProcedureSummary(session)}</p>
                      <p className="text-sm text-gray-500 mt-1">Counselor: {session.counseledByUserName || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {session.recommendedIol && (
                          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                            IOL: {session.recommendedIol}
                          </span>
                        )}
                        {session.selectedPackageId && (
                          <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                            Package selected
                          </span>
                        )}
                        {session.surgeryTentativeDate && (
                          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(session.surgeryTentativeDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {session.surgeryTentativeSurgeonName && (
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {session.surgeryTentativeSurgeonName}
                          </span>
                        )}
                      </div>
                      {session.additionalNotes && (
                        <p className="text-xs text-gray-500 mt-1 italic truncate">{session.additionalNotes}</p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(session.sessionStatus)}`}>
                        {getStatusIcon(session.sessionStatus)}
                        {session.sessionStatus.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/counselor/sessions/${session.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {session.sessionStatus?.toLowerCase() === 'scheduled' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStartSession(session.id)}
                            disabled={startSessionMutation.isPending}
                          >
                            {startSessionMutation.isPending ? 'Starting...' : 'Start'}
                          </Button>
                        )}
                        {session.sessionStatus?.toLowerCase() === 'inprogress' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCompleteSession(session.id)}
                            disabled={completeSessionMutation.isPending}
                          >
                            {completeSessionMutation.isPending ? 'Completing...' : 'Complete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Session Form Modal */}
      <SessionForm
        isOpen={showSessionForm}
        onClose={() => setShowSessionForm(false)}
        onSuccess={() => {
          toast.success('Session created successfully');
          refetch(); // Explicitly refresh sessions list
        }}
      />
    </ProtectedRoute>
  );
}
