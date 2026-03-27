'use client';

import { useState, useEffect } from 'react';
import { Calendar, Repeat, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export interface RecurringFormData {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  reason: string;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  pattern: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // For monthly: 1-31
  occurrences?: number; // Number of appointments to create
  endDate?: string; // Alternative to occurrences
  excludeDates?: string[]; // Dates to skip (exceptions)
}

interface RecurringAppointmentFormProps {
  initialData?: Partial<RecurringFormData>;
  onSubmit: (data: RecurringFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function RecurringAppointmentForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: RecurringAppointmentFormProps) {
  const [formData, setFormData] = useState<RecurringFormData>({
    patientId: initialData?.patientId || '',
    doctorId: initialData?.doctorId || '',
    departmentId: initialData?.departmentId,
    reason: initialData?.reason || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    startTime: initialData?.startTime || '09:00',
    durationMinutes: initialData?.durationMinutes || 30,
    pattern: initialData?.pattern || 'weekly',
    interval: initialData?.interval || 1,
    daysOfWeek: initialData?.daysOfWeek || [],
    dayOfMonth: initialData?.dayOfMonth,
    occurrences: initialData?.occurrences || 10,
    endDate: initialData?.endDate,
    excludeDates: initialData?.excludeDates || []
  });

  const [endType, setEndType] = useState<'occurrences' | 'endDate'>(
    initialData?.endDate ? 'endDate' : 'occurrences'
  );
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Generate preview dates
  useEffect(() => {
    if (!formData.startDate || !formData.pattern) return;

    const dates: string[] = [];
    let currentDate = new Date(formData.startDate);
    const maxDates = formData.occurrences || 10;
    const endDate = formData.endDate ? new Date(formData.endDate) : null;

    while (dates.length < maxDates && (!endDate || currentDate <= endDate)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if date should be excluded
      if (!formData.excludeDates?.includes(dateStr)) {
        dates.push(dateStr);
      }

      // Move to next occurrence based on pattern
      switch (formData.pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + (formData.interval || 1));
          break;
        case 'weekly':
          // If specific days selected, find next matching day
          if (formData.daysOfWeek && formData.daysOfWeek.length > 0) {
            let found = false;
            for (let i = 1; i <= 7 * (formData.interval || 1); i++) {
              currentDate.setDate(currentDate.getDate() + 1);
              if (formData.daysOfWeek.includes(currentDate.getDay())) {
                found = true;
                break;
              }
            }
            if (!found) break; // Safety break
          } else {
            currentDate.setDate(currentDate.getDate() + (7 * (formData.interval || 1)));
          }
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + (formData.interval || 1));
          if (formData.dayOfMonth) {
            currentDate.setDate(Math.min(formData.dayOfMonth, new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()));
          }
          break;
      }

      // Safety limit
      if (dates.length > 100) break;
    }

    setPreviewDates(dates);
  }, [formData.startDate, formData.pattern, formData.interval, formData.daysOfWeek, formData.dayOfMonth, formData.occurrences, formData.endDate, formData.excludeDates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: RecurringFormData = {
      ...formData,
      occurrences: endType === 'occurrences' ? formData.occurrences : undefined,
      endDate: endType === 'endDate' ? formData.endDate : undefined
    };

    await onSubmit(submitData);
  };

  const toggleDayOfWeek = (day: number) => {
    const current = formData.daysOfWeek || [];
    if (current.includes(day)) {
      setFormData({
        ...formData,
        daysOfWeek: current.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        daysOfWeek: [...current, day].sort()
      });
    }
  };

  const addExcludeDate = (date: string) => {
    if (!formData.excludeDates?.includes(date)) {
      setFormData({
        ...formData,
        excludeDates: [...(formData.excludeDates || []), date].sort()
      });
    }
  };

  const removeExcludeDate = (date: string) => {
    setFormData({
      ...formData,
      excludeDates: (formData.excludeDates || []).filter(d => d !== date)
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pattern Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Repeat className="inline h-4 w-4 mr-1" />
          Recurrence Pattern
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['daily', 'weekly', 'monthly'] as const).map((pattern) => (
            <button
              key={pattern}
              type="button"
              onClick={() => setFormData({ ...formData, pattern })}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                formData.pattern === pattern
                  ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interval */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repeat Every
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="12"
            value={formData.interval}
            onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 1 })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-gray-600">
            {formData.pattern === 'daily' && 'day(s)'}
            {formData.pattern === 'weekly' && 'week(s)'}
            {formData.pattern === 'monthly' && 'month(s)'}
          </span>
        </div>
      </div>

      {/* Weekly: Days of Week */}
      {formData.pattern === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            On These Days
          </label>
          <div className="flex gap-2">
            {dayNames.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDayOfWeek(index)}
                className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                  formData.daysOfWeek?.includes(index)
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly: Day of Month */}
      {formData.pattern === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Day of Month
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={formData.dayOfMonth || ''}
            onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || undefined })}
            placeholder="Same day as start date"
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to use start date's day</p>
        </div>
      )}

      {/* Start Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Start Time
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes)
        </label>
        <select
          value={formData.durationMinutes}
          onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>1 hour</option>
          <option value={90}>1.5 hours</option>
          <option value={120}>2 hours</option>
        </select>
      </div>

      {/* End Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ends
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="endOccurrences"
              checked={endType === 'occurrences'}
              onChange={() => setEndType('occurrences')}
              className="w-4 h-4 text-teal-600"
            />
            <label htmlFor="endOccurrences" className="flex-1 flex items-center gap-2">
              <span>After</span>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.occurrences || ''}
                onChange={(e) => setFormData({ ...formData, occurrences: parseInt(e.target.value) || undefined })}
                disabled={endType !== 'occurrences'}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
              <span>occurrences</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="endDate"
              checked={endType === 'endDate'}
              onChange={() => setEndType('endDate')}
              className="w-4 h-4 text-teal-600"
            />
            <label htmlFor="endDate" className="flex-1 flex items-center gap-2">
              <span>On</span>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={endType !== 'endDate'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
        >
          <Calendar className="h-4 w-4" />
          {showPreview ? 'Hide' : 'Show'} Preview ({previewDates.length} appointments)
        </button>
        {showPreview && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {previewDates.slice(0, 20).map((date, index) => (
                <div key={index} className="px-3 py-2 bg-white rounded border border-gray-200 text-sm">
                  <div className="font-medium">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-xs text-gray-500">{formData.startTime}</div>
                </div>
              ))}
            </div>
            {previewDates.length > 20 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                ... and {previewDates.length - 20} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <strong>Note:</strong> Creating {previewDates.length} appointments. Each will be checked for conflicts.
          This may take a few moments.
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || previewDates.length === 0}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Create {previewDates.length} Appointments
            </>
          )}
        </button>
      </div>
    </form>
  );
}
