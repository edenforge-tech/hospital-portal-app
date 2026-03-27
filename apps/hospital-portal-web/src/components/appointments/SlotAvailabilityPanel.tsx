'use client';

import { useState, useEffect } from 'react';
import { appointmentsApi, DoctorAvailability, TimeSlot } from '@/lib/api/appointments-enhanced.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Calendar, RefreshCw, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SlotAvailabilityPanelProps {
  doctorId: string;
  date: Date;
  onSlotSelect?: (slot: TimeSlot) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export function SlotAvailabilityPanel({
  doctorId,
  date,
  onSlotSelect,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: SlotAvailabilityPanelProps) {
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reservedSlots, setReservedSlots] = useState<Map<string, Date>>(new Map()); // slot start time -> expiry time

  useEffect(() => {
    loadAvailability();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAvailability();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [doctorId, date]);

  // Clean up expired reservations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newReservedSlots = new Map(reservedSlots);
      let hasExpired = false;

      for (const [slotTime, expiryTime] of reservedSlots.entries()) {
        if (now >= expiryTime) {
          newReservedSlots.delete(slotTime);
          hasExpired = true;
        }
      }

      if (hasExpired) {
        setReservedSlots(newReservedSlots);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [reservedSlots]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const result = await appointmentsApi.getDoctorAvailability(
        doctorId,
        format(date, 'yyyy-MM-dd')
      );
      setAvailability(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isAvailable || reservedSlots.has(slot.startTime)) {
      return;
    }

    setSelectedSlot(slot);
    
    // Reserve slot for 5 minutes
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    const newReservedSlots = new Map(reservedSlots);
    newReservedSlots.set(slot.startTime, expiryTime);
    setReservedSlots(newReservedSlots);

    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  const getRemainingTime = (slotTime: string): string | null => {
    const expiryTime = reservedSlots.get(slotTime);
    if (!expiryTime) return null;

    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();
    
    if (diff <= 0) return null;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSlotStatus = (slot: TimeSlot): {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    text: string;
  } => {
    const remainingTime = getRemainingTime(slot.startTime);
    
    if (remainingTime) {
      return {
        variant: 'outline',
        icon: <Clock className="h-3 w-3" />,
        text: `Reserved (${remainingTime})`
      };
    }
    
    if (!slot.isAvailable) {
      return {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        text: slot.conflictReason || 'Unavailable'
      };
    }

    return {
      variant: 'default',
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: 'Available'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!availability) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load availability. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">
            Slot Availability - {format(date, 'MMM dd, yyyy')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAvailability}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Working Hours */}
      {availability.workingHours && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Working Hours: {availability.workingHours.start} - {availability.workingHours.end}
          </AlertDescription>
        </Alert>
      )}

      {/* Availability Status */}
      <div className="flex items-center gap-2">
        {availability.isAvailable ? (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Doctor Available
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Doctor Unavailable
          </Badge>
        )}
        <Badge variant="outline">
          {availability.availableSlots.length} Available Slots
        </Badge>
        <Badge variant="secondary">
          {availability.unavailableSlots.length} Booked
        </Badge>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {availability.availableSlots.map((slot) => {
          const status = getSlotStatus(slot);
          const isReserved = reservedSlots.has(slot.startTime);
          const isSelected = selectedSlot?.startTime === slot.startTime;

          return (
            <button
              key={slot.startTime}
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.isAvailable || isReserved}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                ${slot.isAvailable && !isReserved ? 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                ${isReserved ? 'bg-amber-50 border-amber-300' : ''}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium text-sm">
                  {slot.startTime}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  {status.icon}
                  <span className={`
                    ${slot.isAvailable && !isReserved ? 'text-green-600' : ''}
                    ${!slot.isAvailable ? 'text-red-600' : ''}
                    ${isReserved ? 'text-amber-600' : ''}
                  `}>
                    {isReserved ? getRemainingTime(slot.startTime) : (
                      slot.isAvailable ? '✓' : '✗'
                    )}
                  </span>
                </div>
                {slot.duration && (
                  <span className="text-xs text-gray-500">
                    {slot.duration} min
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Booked Slots */}
      {availability.unavailableSlots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Booked Slots</h4>
          <div className="flex flex-wrap gap-2">
            {availability.unavailableSlots.map((slot) => (
              <Badge key={slot.startTime} variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                {slot.startTime} - {slot.endTime}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Break Times */}
      {availability.breakTimes && availability.breakTimes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Break Times</h4>
          <div className="flex flex-wrap gap-2">
            {availability.breakTimes.map((slot, index) => (
              <Badge key={index} variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {slot.startTime} - {slot.endTime}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 border-2 border-amber-500"></div>
          <span>Reserved (5 min)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
