'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  XCircle,
  UserX,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  TrendingUp,
  Activity,
  Timer,
  UserPlus,
  Stethoscope,
  Eye,
  DollarSign,
  AlertTriangle,
  Calendar,
  Play
} from 'lucide-react';
import { 
  useCounselingQueue, 
  useCounselingQueueStats,
  useCallNextPatient, 
  useStartQueueSession,
  useMarkAsNoShow 
} from '@/hooks/use-counseling-sessions';
import { useQueueSignalR } from '@/hooks/use-queue-signalr';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import SessionForm from '@/components/counselor/sessions/SessionForm';
import type { CounselingQueueItem } from '@/lib/api/counseling-queue.api';

export default function QueueManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('Waiting');
  const [referralFilter, setReferralFilter] = useState<string>('all');
  const [selectedQueueItem, setSelectedQueueItem] = useState<string | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<CounselingQueueItem | null>(null);

  // Fetch counseling queue data with auto-refresh every 10 seconds
  const { 
    data: queueItems = [], 
    isLoading, 
    error, 
    refetch 
  } = useCounselingQueue(user?.branchId || '', {
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    referralSource: referralFilter !== 'all' ? referralFilter as any : undefined,
  }, {
    enabled: !!user?.branchId,
  });

  // Fetch queue statistics
  const { data: stats } = useCounselingQueueStats(user?.branchId || '', undefined, {
    enabled: !!user?.branchId,
  });

  // SignalR real-time updates
  const { connectionState, isConnected } = useQueueSignalR({
    branchId: user?.branchId || '',
    queueType: 'Counselor',
    enabled: !!user?.branchId,
    onQueueUpdate: (data) => {
      console.log('📥 Real-time queue update:', data);
      if (data.data.action === 'PatientCalled') {
        toast.info(`Patient called for counseling`, {
          duration: 3000,
        });
      } else if (data.data.action === 'PatientMarkedAbsent') {
        toast.warning('Patient marked as absent', {
          duration: 3000,
        });
      }
    },
    onPatientCalled: (data) => {
      console.log('📥 Real-time patient called:', data);
      toast.success(`${data.patientName} called for counseling`, {
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error('❌ SignalR error:', error);
    },
  });

  // Mutations
  const callNextMutation = useCallNextPatient();
  const startSessionMutation = useStartQueueSession();
  const markNoShowMutation = useMarkAsNoShow();

  // Filter items
  const filteredItems = queueItems.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.queueStatus === statusFilter;
    const matchesReferral = referralFilter === 'all' || item.referralSource === referralFilter;
    return matchesStatus && matchesReferral;
  });

  // Calculate local stats if backend stats not available
  const localStats = {
    totalWaiting: queueItems.filter(i => i.queueStatus === 'Waiting').length,
    totalCalled: queueItems.filter(i => i.queueStatus === 'Called').length,
    totalInProgress: queueItems.filter(i => i.queueStatus === 'InProgress').length,
    totalCompleted: stats?.totalCompletedToday || queueItems.filter(i => i.queueStatus === 'Completed').length,
    totalNoShow: queueItems.filter(i => i.queueStatus === 'NoShow').length,
    averageWaitTime: stats?.averageWaitTimeMinutes || 0,
    longestWait: stats?.longestWaitMinutes || 0,
  };

  // Handle call next patient
  const handleCallNext = async () => {
    if (!user?.id || !user?.branchId) {
      toast.error('User information not available');
      return;
    }

    try {
      const result = await callNextMutation.mutateAsync({
        branchId: user.branchId,
        counselorId: user.id,
        queueType: 'Counselor',
      });

      if (result.success && result.queueItem) {
        toast.success(`Called ${result.queueItem.patientName || 'patient'} - Token: ${result.tokenNumber}`);
        // Optionally auto-start session
        setSelectedPatient(result.queueItem);
      } else {
        toast.warning(result.message || 'No patients in queue');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to call next patient');
    }
  };

  // Handle call specific patient
  const handleCallPatient = async (queueItem: CounselingQueueItem) => {
    if (!user?.id || !user?.branchId) {
      toast.error('User information not available');
      return;
    }

    try {
      setSelectedQueueItem(queueItem.id);
      
      const result = await callNextMutation.mutateAsync({
        branchId: user.branchId,
        counselorId: user.id,
        queueType: 'Counselor',
        specificQueueItemId: queueItem.id,
      });

      if (result.success) {
        toast.success(`Called ${queueItem.patientName || 'patient'} - Token: ${queueItem.tokenNumber}`);
        setSelectedPatient(queueItem);
      } else {
        toast.error(result.message || 'Failed to call patient');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to call patient');
    } finally {
      setSelectedQueueItem(null);
    }
  };

  // Handle start session
  const handleStartSession = async (queueItem: CounselingQueueItem) => {
    if (!user?.id) {
      toast.error('User information not available');
      return;
    }

    try {
      setSelectedQueueItem(queueItem.id);
      
      const result = await startSessionMutation.mutateAsync({
        queueItemId: queueItem.id,
        request: {
          queueItemId: queueItem.id,
          counselorId: user.id,
          notes: `Started from queue - Token: ${queueItem.tokenNumber}`,
        },
      });

      if (result.success && result.sessionId) {
        toast.success('Session started successfully');
        // Navigate to session details
        router.push(`/dashboard/counselor/sessions/${result.sessionId}`);
      } else {
        // Fallback: show session form
        setSelectedPatient(queueItem);
        setShowSessionForm(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session');
      // Fallback: show session form
      setSelectedPatient(queueItem);
      setShowSessionForm(true);
    } finally {
      setSelectedQueueItem(null);
    }
  };

  // Handle mark as no-show
  const handleMarkNoShow = async (queueItemId: string, patientName?: string) => {
    try {
      setSelectedQueueItem(queueItemId);
      const result = await markNoShowMutation.mutateAsync(queueItemId);
      
      if (result.success) {
        toast.success(`Patient ${patientName || ''} marked as no-show`);
      } else {
        toast.error(result.message || 'Failed to mark as no-show');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark patient as no-show');
    } finally {
      setSelectedQueueItem(null);
    }
  };

  // Get urgency badge styling
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get referral source icon and styling
  const getReferralSourceDisplay = (source: string) => {
    switch (source) {
      case 'DoctorReferral':
        return {
          icon: <Stethoscope className="h-3 w-3" />,
          label: 'Doctor',
          className: 'bg-blue-100 text-blue-700',
        };
      case 'OptometryReferral':
        return {
          icon: <Eye className="h-3 w-3" />,
          label: 'Optometry',
          className: 'bg-purple-100 text-purple-700',
        };
      case 'Scheduled':
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Scheduled',
          className: 'bg-indigo-100 text-indigo-700',
        };
      case 'WalkIn':
        return {
          icon: <UserPlus className="h-3 w-3" />,
          label: 'Walk-in',
          className: 'bg-gray-100 text-gray-700',
        };
      case 'Emergency':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Emergency',
          className: 'bg-red-100 text-red-700',
        };
      default:
        return {
          icon: <Users className="h-3 w-3" />,
          label: source,
          className: 'bg-gray-100 text-gray-700',
        };
    }
  };

  // Format wait time
  const getWaitTime = (addedAt: string) => {
    const added = new Date(addedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - added.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  // Get priority score color
  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-600 font-bold';
    if (score >= 60) return 'text-orange-600 font-semibold';
    if (score >= 40) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  return (
    <ProtectedRoute requiredPermissions={['counselor.view']}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/counselor')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Counseling Queue</h1>
              <p className="text-sm text-gray-500">Manage patient queue and start counseling sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Call Next Button */}
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              onClick={handleCallNext}
              disabled={callNextMutation.isPending || localStats.totalWaiting === 0}
            >
              <Phone className="h-5 w-5 mr-2" />
              {callNextMutation.isPending ? 'Calling...' : 'Call Next Patient'}
            </Button>

            {/* Real-time Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm">
              {connectionState === 'connected' && (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">Live</span>
                </>
              )}
              {connectionState === 'connecting' && (
                <>
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-blue-700 font-medium">Connecting...</span>
                </>
              )}
              {connectionState === 'reconnecting' && (
                <>
                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                  <span className="text-yellow-700 font-medium">Reconnecting...</span>
                </>
              )}
              {(connectionState === 'disconnected' || connectionState === 'error') && (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-red-700 font-medium">Offline</span>
                </>
              )}
            </div>

            {/* Manual Refresh Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Waiting</p>
                  <p className="text-3xl font-bold text-blue-600">{localStats.totalWaiting}</p>
                  {localStats.averageWaitTime > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Timer className="h-3 w-3 inline mr-1" />
                      Avg: {Math.round(localStats.averageWaitTime)} min
                    </p>
                  )}
                </div>
                <div className="h-14 w-14 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Called</p>
                  <p className="text-3xl font-bold text-yellow-600">{localStats.totalCalled}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to start</p>
                </div>
                <div className="h-14 w-14 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-7 w-7 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-purple-600">{localStats.totalInProgress}</p>
                  <p className="text-xs text-gray-500 mt-1">Active sessions</p>
                </div>
                <div className="h-14 w-14 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{localStats.totalCompleted}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {localStats.totalNoShow > 0 && `${localStats.totalNoShow} No-show`}
                  </p>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Queue Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Waiting', 'Called', 'InProgress', 'Completed', 'NoShow'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="h-9"
                    >
                      {status === 'InProgress' ? 'In Progress' : status === 'NoShow' ? 'No Show' : status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Referral Source Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Referral Source
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Sources', icon: Users },
                    { value: 'Doctor', label: 'Doctor', icon: Stethoscope },
                    { value: 'Optometry', label: 'Optometry', icon: Eye },
                    { value: 'WalkIn', label: 'Walk-in', icon: UserPlus },
                    { value: 'Scheduled', label: 'Scheduled', icon: Calendar },
                    { value: 'Emergency', label: 'Emergency', icon: AlertTriangle }
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={referralFilter === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReferralFilter(value)}
                      className="h-9"
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Loading queue...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error loading queue</p>
                <p className="text-gray-600 text-sm mb-4">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Queue List */}
        {!isLoading && !error && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Patient Queue ({filteredItems.length})</span>
                {localStats.totalWaiting > 0 && filteredItems.length > 0 && (
                  <div className="text-sm font-normal text-gray-500">
                    Next: {filteredItems[0]?.tokenNumber || 'N/A'}
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {statusFilter === 'All' ? 'All patients' : `${statusFilter} patients`} 
                {referralFilter !== 'all' && ` from ${referralFilter}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No patients in queue</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {statusFilter === 'All' 
                        ? 'Patients will appear here when they are referred' 
                        : `No patients with status: ${statusFilter}`}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const referralDisplay = getReferralSourceDisplay(item.referralSource);
                    
                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                          item.urgencyLevel === 'Critical' ? 'border-red-500 bg-red-50' :
                          item.urgencyLevel === 'High' ? 'border-orange-500 bg-orange-50' :
                          'hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            {/* Header Row */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {/* Queue Position */}
                              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-bold text-white">#{index + 1}</span>
                              </div>

                              {/* Patient Name */}
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {item.patientName}
                              </h3>
                              <span className="text-sm text-gray-500">
                                ({item.mrn})
                              </span>

                              {/* Urgency Badge */}
                              <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                                item.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' :
                                item.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                                item.urgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                'bg-green-100 text-green-700 border-green-300'
                              }`}>
                                {item.urgencyLevel || 'Low'}
                              </span>

                              {/* Referral Source Badge */}
                              <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${referralDisplay.className}`}>
                                {referralDisplay.icon}
                                {referralDisplay.label}
                              </span>

                              {/* Priority Score */}
                              {item.priorityScore > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs font-medium">
                                  <TrendingUp className="h-3 w-3" style={{ 
                                    color: item.priorityScore >= 80 ? '#dc2626' : 
                                           item.priorityScore >= 60 ? '#ea580c' : 
                                           item.priorityScore >= 40 ? '#ca8a04' : '#16a34a' 
                                  }} />
                                  <span style={{ 
                                    color: item.priorityScore >= 80 ? '#dc2626' : 
                                           item.priorityScore >= 60 ? '#ea580c' : 
                                           item.priorityScore >= 40 ? '#ca8a04' : '#16a34a',
                                    fontWeight: item.priorityScore >= 60 ? 600 : 500
                                  }}>
                                    Priority: {item.priorityScore}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm mt-2">
                              <div className="flex items-center text-gray-600">
                                <Timer className="h-4 w-4 mr-2" />
                                <span>Wait: {getWaitTime(item.createdAt)}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Activity className="h-4 w-4 mr-2" />
                                <span>Token: {item.tokenNumber}</span>
                              </div>
                              {item.referredByUserName && (
                                <div className="flex items-center text-gray-600 col-span-2">
                                  <Stethoscope className="h-4 w-4 mr-2" />
                                  <span className="truncate">Referred by: {item.referredByUserName}</span>
                                </div>
                              )}
                              {item.referralDepartment && (
                                <div className="flex items-center text-gray-600 col-span-2">
                                  <Users className="h-4 w-4 mr-2" />
                                  <span className="truncate">From: {item.referralDepartment}</span>
                                </div>
                              )}
                            </div>

                            {/* Priority Notes */}
                            {item.referralNotes && item.priorityScore > 70 && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                {item.referralNotes}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCallPatient(item)}
                              disabled={callNextMutation.isPending || selectedQueueItem === item.id}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              {selectedQueueItem === item.id && callNextMutation.isPending ? 'Calling...' : 'Call'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 hover:text-green-800"
                              onClick={() => handleStartSession(item)}
                              disabled={startSessionMutation.isPending || selectedQueueItem === item.id}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {selectedQueueItem === item.id && startSessionMutation.isPending ? 'Starting...' : 'Start'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleMarkNoShow(item.id, item.patientName)}
                              disabled={markNoShowMutation.isPending || selectedQueueItem === item.id}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              {selectedQueueItem === item.id && markNoShowMutation.isPending ? 'Marking...' : 'No Show'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Session Form Modal - Opens when patient is called */}
      <SessionForm
        isOpen={showSessionForm}
        onClose={() => {
          setShowSessionForm(false);
          setSelectedPatient(null);
          refetch(); // Refresh queue after session created
        }}
      />
    </ProtectedRoute>
  );
}
