'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFollowUps, useCompleteFollowUp, useRescheduleFollowUp, useDeleteFollowUp } from '@/hooks/use-follow-ups';
import FollowUpCalendar from '@/components/counselor/follow-ups/FollowUpCalendar';
import FollowUpForm from '@/components/counselor/follow-ups/FollowUpForm';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  CalendarCheck,
  Filter,
} from 'lucide-react';

export default function FollowUpsPage() {
  const router = useRouter();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<string | null>(null);

  // Get current month date range
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Fetch follow-ups
  const { data, isLoading, error, refetch } = useFollowUps({
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    fromDate,
    toDate,
  });

  // Mutations
  const completeFollowUpMutation = useCompleteFollowUp();
  const rescheduleFollowUpMutation = useRescheduleFollowUp();
  const deleteFollowUpMutation = useDeleteFollowUp();

  const followUps = data?.followUps || [];

  const handleComplete = async (id: string) => {
    const outcome = prompt('Enter follow-up outcome:');
    if (!outcome) return;

    try {
      await completeFollowUpMutation.mutateAsync({ id, outcome });
      toast.success('Follow-up marked as completed');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete follow-up');
    }
  };

  const handleReschedule = async (id: string) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (!newDate) return;

    try {
      await rescheduleFollowUpMutation.mutateAsync({ id, newDate });
      toast.success('Follow-up rescheduled successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reschedule follow-up');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return;

    try {
      await deleteFollowUpMutation.mutateAsync(id);
      toast.success('Follow-up deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete follow-up');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      missed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.scheduled;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      routine: 'bg-blue-100 text-blue-700 border-blue-200',
      low: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[priority as keyof typeof styles] || styles.routine;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
      case 'missed':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const filteredFollowUps = followUps.filter((followUp) => {
    const matchesSearch =
      !searchQuery ||
      followUp.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      followUp.patientMRN?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <ProtectedRoute requiredPermissions={['follow_ups.read']}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/counselor')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Follow-Up Appointments</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Follow-Up
          </Button>
        </div>

        {/* Filters & View Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by patient name or MRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={view === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                <p className="text-gray-600">Loading follow-ups...</p>
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
                <p className="text-red-600 font-semibold mb-2">Error loading follow-ups</p>
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

        {/* Calendar View */}
        {!isLoading && !error && view === 'calendar' && (
          <FollowUpCalendar
            followUps={filteredFollowUps}
            onComplete={handleComplete}
            onReschedule={handleReschedule}
            onEdit={(id) => setEditingFollowUp(id)}
            onDelete={handleDelete}
          />
        )}

        {/* List View */}
        {!isLoading && !error && view === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>Follow-Ups ({filteredFollowUps.length})</CardTitle>
              <CardDescription>
                {filteredFollowUps.length} follow-up{filteredFollowUps.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFollowUps.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No follow-ups found</p>
                  </div>
                ) : (
                  filteredFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Patient Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{followUp.patientName}</h3>
                            <span className="text-sm text-gray-500">{followUp.patientMRN}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{followUp.followUpType}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {new Date(followUp.scheduledDate).toLocaleDateString()} {followUp.scheduledTime}
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityBadge(
                                followUp.priority
                              )}`}
                            >
                              {followUp.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor & Department */}
                      <div className="hidden lg:block flex-1 px-4">
                        <p className="text-sm font-medium text-gray-900">{followUp.assignedDoctorName}</p>
                        <p className="text-sm text-gray-500 mt-1">{followUp.departmentName}</p>
                        {followUp.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{followUp.notes}</p>
                        )}
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                            followUp.status
                          )}`}
                        >
                          {getStatusIcon(followUp.status)}
                          {followUp.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingFollowUp(followUp.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {followUp.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleComplete(followUp.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReschedule(followUp.id)}
                              >
                                <CalendarCheck className="h-4 w-4 mr-1" />
                                Reschedule
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleDelete(followUp.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Create/Edit Form Modal */}
      <FollowUpForm
        isOpen={showCreateForm || !!editingFollowUp}
        onClose={() => {
          setShowCreateForm(false);
          setEditingFollowUp(null);
        }}
        onSuccess={() => {
          toast.success(editingFollowUp ? 'Follow-up updated successfully' : 'Follow-up scheduled successfully');
          refetch();
          setShowCreateForm(false);
          setEditingFollowUp(null);
        }}
        followUpId={editingFollowUp || undefined}
      />
    </ProtectedRoute>
  );
}
