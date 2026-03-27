'use client';

import { useState, useEffect } from 'react';
import { appointmentsApi, AppointmentConflict } from '@/lib/api/appointments-enhanced.api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Clock, Calendar, MapPin, Lightbulb } from 'lucide-react';

interface ConflictDetectionProps {
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  excludeAppointmentId?: string;
  onConflictResolved?: () => void;
}

export function ConflictDetection({
  doctorId,
  patientId,
  appointmentDate,
  startTime,
  duration,
  excludeAppointmentId,
  onConflictResolved
}: ConflictDetectionProps) {
  const [conflicts, setConflicts] = useState<AppointmentConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (doctorId && patientId && appointmentDate && startTime && duration) {
      checkConflicts();
    }
  }, [doctorId, patientId, appointmentDate, startTime, duration]);

  const checkConflicts = async () => {
    try {
      setLoading(true);
      setChecked(false);
      
      const response = await appointmentsApi.checkConflicts({
        doctorId,
        patientId,
        appointmentDate,
        startTime,
        duration,
        excludeAppointmentId
      });

      setConflicts(response.conflicts || []);
      setChecked(true);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setConflicts([]);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'doctor_busy':
        return <Clock className="h-4 w-4" />;
      case 'patient_busy':
        return <Calendar className="h-4 w-4" />;
      case 'room_unavailable':
        return <MapPin className="h-4 w-4" />;
      case 'outside_hours':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConflictSeverity = (type: string): 'default' | 'destructive' => {
    if (type === 'doctor_busy' || type === 'patient_busy') {
      return 'destructive';
    }
    return 'default';
  };

  if (loading) {
    return (
      <Alert>
        <Clock className="h-4 w-4 animate-spin" />
        <AlertDescription>Checking for conflicts...</AlertDescription>
      </Alert>
    );
  }

  if (!checked) {
    return null;
  }

  if (conflicts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Badge variant="default" className="bg-green-500 mr-2">
          ✓
        </Badge>
        <AlertDescription className="text-green-800">
          No conflicts detected. This time slot is available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, index) => (
        <Alert key={index} variant={getConflictSeverity(conflict.type)}>
          <div className="flex items-start gap-3">
            {getConflictIcon(conflict.type)}
            <div className="flex-1">
              <AlertTitle className="text-base font-semibold mb-1">
                {conflict.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </AlertTitle>
              <AlertDescription>{conflict.message}</AlertDescription>

              {/* Suggested Alternatives */}
              {conflict.suggestedAlternatives && conflict.suggestedAlternatives.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Suggested Alternative Times:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conflict.suggestedAlternatives.slice(0, 5).map((slot, slotIndex) => (
                      <Button
                        key={slotIndex}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Trigger callback to update parent component with new time
                          if (onConflictResolved) {
                            onConflictResolved();
                          }
                        }}
                        className="hover:bg-blue-50"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.startTime} - {slot.endTime}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflicting Appointment Link */}
              {conflict.conflictingAppointmentId && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-sm"
                    onClick={() => {
                      // Open conflicting appointment in modal or navigate
                      console.log('View conflicting appointment:', conflict.conflictingAppointmentId);
                    }}
                  >
                    View conflicting appointment →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Alert>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={checkConflicts}
        className="w-full"
      >
        Re-check for Conflicts
      </Button>
    </div>
  );
}
