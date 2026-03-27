'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Edit, Trash2, CalendarCheck, Clock, User } from 'lucide-react';
import type { FollowUpAppointment } from '@/lib/api/follow-up.api';

interface FollowUpCalendarProps {
  followUps: FollowUpAppointment[];
  onComplete: (id: string) => void;
  onReschedule: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FollowUpCalendar({
  followUps,
  onComplete,
  onReschedule,
  onEdit,
  onDelete,
}: FollowUpCalendarProps) {
  // Group follow-ups by date
  const groupedByDate = followUps.reduce((acc, followUp) => {
    const date = new Date(followUp.scheduledDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(followUp);
    return acc;
  }, {} as Record<string, FollowUpAppointment[]>);

  const dates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

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

  if (dates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No follow-ups scheduled this month</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <Card key={date}>
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {date}
                <span className="ml-auto text-sm font-normal text-gray-600">
                  {groupedByDate[date].length} appointment{groupedByDate[date].length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {groupedByDate[date].map((followUp) => (
                <div
                  key={followUp.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Time & Patient Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center min-w-[60px] h-16 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-medium text-blue-600">
                        {followUp.scheduledTime || 'All Day'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">{followUp.patientName}</h3>
                        <span className="text-xs text-gray-500">{followUp.patientMRN}</span>
                      </div>
                      <p className="text-sm text-gray-600">{followUp.followUpType}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityBadge(
                            followUp.priority
                          )}`}
                        >
                          {followUp.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          Dr. {followUp.assignedDoctorName}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{followUp.departmentName}</span>
                      </div>
                      {followUp.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">{followUp.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        followUp.status
                      )}`}
                    >
                      {followUp.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(followUp.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {followUp.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onComplete(followUp.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReschedule(followUp.id)}
                          >
                            <CalendarCheck className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => onDelete(followUp.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
