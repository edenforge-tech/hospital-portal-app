'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  RefreshCw
} from 'lucide-react';
import { appointmentsApi, DoctorAvailability, TimeSlot } from '@/lib/api/appointments-enhanced.api';
import { getApi } from '@/lib/api';

interface DoctorAvailabilityManagerProps {
  doctorId?: string;
  date?: Date;
  onAvailabilityUpdate?: () => void;
}

interface WorkingHours {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

interface BreakTime {
  id?: string;
  startTime: string;
  endTime: string;
  title: string;
  isRecurring: boolean;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  departmentName?: string;
}

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function DoctorAvailabilityManager({ 
  doctorId, 
  date = new Date(),
  onAvailabilityUpdate
}: DoctorAvailabilityManagerProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId || '');
  const [selectedDate, setSelectedDate] = useState(date);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [editingBreak, setEditingBreak] = useState<BreakTime | null>(null);

  useEffect(() => {
    loadDoctors();
    initializeWorkingHours();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      loadAvailability();
      loadWorkingHours();
    }
  }, [selectedDoctorId, selectedDate]);

  const loadDoctors = async () => {
    try {
      const response = await getApi().get<{ items: Doctor[] }>('/users/doctors');
      setDoctors(response.data?.items || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadAvailability = async () => {
    if (!selectedDoctorId) return;

    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await appointmentsApi.getDoctorAvailability(selectedDoctorId, dateStr);
      setAvailability(response.data);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load doctor availability');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkingHours = async () => {
    if (!selectedDoctorId) return;

    try {
      // This would typically load from a doctor schedule API
      const response = await getApi().get(`/users/doctors/${selectedDoctorId}/schedule`);
      setWorkingHours(response.data?.workingHours || []);
      setBreakTimes(response.data?.breakTimes || []);
    } catch (err) {
      console.error('Error loading working hours:', err);
      // Initialize with default working hours if none exist
      initializeWorkingHours();
    }
  };

  const initializeWorkingHours = () => {
    const defaultHours: WorkingHours[] = daysOfWeek.map((_, index) => ({
      dayOfWeek: index,
      startTime: '09:00',
      endTime: '17:00',
      isWorking: index >= 1 && index <= 5 // Monday-Friday
    }));
    setWorkingHours(defaultHours);
  };

  const saveWorkingHours = async () => {
    if (!selectedDoctorId) return;

    try {
      setSaving(true);
      setError('');
      
      const data = {
        workingHours,
        breakTimes: breakTimes.map(bt => ({ ...bt, id: undefined })) // Remove temp IDs
      };

      await getApi().put(`/users/doctors/${selectedDoctorId}/schedule`, data);
      
      setSuccess('Working hours updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      if (onAvailabilityUpdate) {
        onAvailabilityUpdate();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update working hours');
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHours = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setWorkingHours(prev => prev.map((wh, index) => 
      index === dayIndex ? { ...wh, [field]: value } : wh
    ));
  };

  const addBreakTime = () => {
    setEditingBreak({
      startTime: '12:00',
      endTime: '13:00',
      title: 'Lunch Break',
      isRecurring: true
    });
    setShowBreakModal(true);
  };

  const editBreakTime = (breakTime: BreakTime) => {
    setEditingBreak(breakTime);
    setShowBreakModal(true);
  };

  const saveBreakTime = () => {
    if (!editingBreak) return;

    if (editingBreak.id) {
      // Update existing
      setBreakTimes(prev => prev.map(bt => 
        bt.id === editingBreak.id ? editingBreak : bt
      ));
    } else {
      // Add new
      setBreakTimes(prev => [...prev, { ...editingBreak, id: Date.now().toString() }]);
    }

    setShowBreakModal(false);
    setEditingBreak(null);
  };

  const deleteBreakTime = (breakId: string) => {
    setBreakTimes(prev => prev.filter(bt => bt.id !== breakId));
  };

  const blockTimeSlot = async (startTime: string, endTime: string, reason: string) => {
    if (!selectedDoctorId) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await getApi().post(`/appointments/block-slot`, {
        doctorId: selectedDoctorId,
        date: dateStr,
        startTime,
        endTime,
        reason
      });

      await loadAvailability();
      setSuccess('Time slot blocked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block time slot');
    }
  };

  const unblockTimeSlot = async (startTime: string, endTime: string) => {
    if (!selectedDoctorId) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await getApi().delete(`/appointments/block-slot`, {
        data: {
          doctorId: selectedDoctorId,
          date: dateStr,
          startTime,
          endTime
        }
      });

      await loadAvailability();
      setSuccess('Time slot unblocked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unblock time slot');
    }
  };

  const generateTimeSlots = useCallback(() => {
    if (!selectedDoctorId || !availability) return [];

    const slots: (TimeSlot & { type: 'available' | 'booked' | 'blocked' | 'break' })[] = [];
    const dayOfWeek = selectedDate.getDay();
    const workingDay = workingHours[dayOfWeek];

    if (!workingDay?.isWorking) {
      return [];
    }

    // Generate 15-minute slots throughout the day
    const start = new Date(`2000-01-01T${workingDay.startTime}:00`);
    const end = new Date(`2000-01-01T${workingDay.endTime}:00`);
    
    while (start < end) {
      const timeStr = start.toTimeString().substring(0, 5);
      const endTimeStr = new Date(start.getTime() + 15 * 60000).toTimeString().substring(0, 5);
      
      let slotType: 'available' | 'booked' | 'blocked' | 'break' = 'available';
      
      // Check if slot is booked
      const isBooked = availability.unavailableSlots.some(slot => 
        timeStr >= slot.startTime && timeStr < slot.endTime && slot.appointmentId
      );
      
      // Check if slot is blocked
      const isBlocked = availability.unavailableSlots.some(slot => 
        timeStr >= slot.startTime && timeStr < slot.endTime && !slot.appointmentId
      );
      
      // Check if slot is during break time
      const isBreak = availability.breakTimes.some(breakTime => 
        timeStr >= breakTime.startTime && timeStr < breakTime.endTime
      );

      if (isBreak) slotType = 'break';
      else if (isBlocked) slotType = 'blocked';
      else if (isBooked) slotType = 'booked';

      slots.push({
        startTime: timeStr,
        endTime: endTimeStr,
        duration: 15,
        isAvailable: slotType === 'available',
        type: slotType
      });

      start.setMinutes(start.getMinutes() + 15);
    }

    return slots;
  }, [selectedDoctorId, availability, selectedDate, workingHours]);

  const timeSlots = generateTimeSlots();
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Availability</h2>
          <p className="text-gray-600">Manage doctor schedules and availability</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'day' | 'week')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="day">Day View</option>
            <option value="week">Week View</option>
          </select>
          
          <button
            onClick={loadAvailability}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Selection & Date */}
        <div className="lg:col-span-1 space-y-6">
          {/* Doctor Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <User className="inline h-5 w-5 mr-2" />
              Select Doctor
            </h3>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} 
                  {doctor.specialization && ` (${doctor.specialization})`}
                </option>
              ))}
            </select>

            {selectedDoctor && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p><strong>Department:</strong> {selectedDoctor.departmentName || 'Not assigned'}</p>
                <p><strong>Specialization:</strong> {selectedDoctor.specialization || 'General'}</p>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="inline h-5 w-5 mr-2" />
              Select Date
            </h3>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Day:</strong> {daysOfWeek[selectedDate.getDay()]}</p>
              <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                <Clock className="inline h-5 w-5 mr-2" />
                Working Hours
              </h3>
              <button
                onClick={saveWorkingHours}
                disabled={saving || !selectedDoctorId}
                className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>

            <div className="space-y-3">
              {workingHours.map((wh, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={wh.isWorking}
                      onChange={(e) => updateWorkingHours(index, 'isWorking', e.target.checked)}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm font-medium w-20">
                      {daysOfWeek[index].substring(0, 3)}
                    </span>
                  </label>
                  
                  {wh.isWorking && (
                    <>
                      <input
                        type="time"
                        value={wh.startTime}
                        onChange={(e) => updateWorkingHours(index, 'startTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <input
                        type="time"
                        value={wh.endTime}
                        onChange={(e) => updateWorkingHours(index, 'endTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Break Times */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Break Times</h3>
              <button
                onClick={addBreakTime}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2">
              {breakTimes.map(breakTime => (
                <div key={breakTime.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{breakTime.title}</p>
                    <p className="text-xs text-gray-600">
                      {breakTime.startTime} - {breakTime.endTime}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => editBreakTime(breakTime)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBreakTime(breakTime.id!)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Schedule - {selectedDate.toDateString()}
            </h3>

            {selectedDoctorId ? (
              loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs text-center border cursor-pointer ${
                        slot.type === 'available' ? 'bg-green-100 border-green-300 hover:bg-green-200' :
                        slot.type === 'booked' ? 'bg-red-100 border-red-300' :
                        slot.type === 'blocked' ? 'bg-gray-100 border-gray-300' :
                        'bg-yellow-100 border-yellow-300'
                      }`}
                      onClick={() => {
                        if (slot.type === 'available') {
                          const reason = prompt('Reason for blocking this slot:');
                          if (reason) blockTimeSlot(slot.startTime, slot.endTime, reason);
                        } else if (slot.type === 'blocked') {
                          if (confirm('Unblock this time slot?')) {
                            unblockTimeSlot(slot.startTime, slot.endTime);
                          }
                        }
                      }}
                    >
                      <div className="font-medium">{slot.startTime}</div>
                      <div className="capitalize text-xs mt-1">{slot.type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No working hours set for this day</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4" />
                <p>Select a doctor to view availability</p>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Blocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Break</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Break Time Modal */}
      {showBreakModal && editingBreak && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingBreak.id ? 'Edit' : 'Add'} Break Time
              </h3>
              <button
                onClick={() => setShowBreakModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingBreak.title}
                  onChange={(e) => setEditingBreak({ ...editingBreak, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingBreak.startTime}
                    onChange={(e) => setEditingBreak({ ...editingBreak, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingBreak.endTime}
                    onChange={(e) => setEditingBreak({ ...editingBreak, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingBreak.isRecurring}
                  onChange={(e) => setEditingBreak({ ...editingBreak, isRecurring: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Recurring daily</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBreakModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveBreakTime}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}