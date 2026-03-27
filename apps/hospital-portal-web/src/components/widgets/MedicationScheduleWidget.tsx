/**
 * Medication Schedule Widget
 * Digital prescription with dosage reminders and adherence tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Pill, Clock, CheckCircle2, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { MedicationScheduleData, MedicationDose } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const MedicationScheduleWidget: React.FC<WidgetProps> = ({
  patientId,
  size,
}) => {
  const [scheduleData, setScheduleData] = useState<MedicationScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      loadSchedule();
    }
  }, [patientId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await widgetsApi.getMedicationSchedule(patientId!);
      setScheduleData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load medication schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (doseId: string) => {
    try {
      await widgetsApi.logDoseTaken(patientId!, doseId, true);
      loadSchedule(); // Reload data
    } catch (err) {
      alert('Failed to log dose');
    }
  };

  const handleSkipDose = async (doseId: string) => {
    try {
      await widgetsApi.logDoseTaken(patientId!, doseId, false, 'Skipped by user');
      loadSchedule();
    } catch (err) {
      alert('Failed to log skip');
    }
  };

  const getDoseStatus = (dose: MedicationDose, currentTime: string) => {
    if (dose.taken) return { label: 'Taken', color: 'text-green-600', icon: CheckCircle2 };
    if (dose.skipped) return { label: 'Skipped', color: 'text-gray-500', icon: XCircle };
    
    const doseTime = dose.time.split(':').map(Number);
    const nowTime = currentTime.split(':').map(Number);
    const doseMinutes = doseTime[0] * 60 + doseTime[1];
    const nowMinutes = nowTime[0] * 60 + nowTime[1];
    
    if (nowMinutes >= doseMinutes - 30 && nowMinutes <= doseMinutes + 30) {
      return { label: 'Due Now', color: 'text-blue-600', icon: Clock };
    }
    if (nowMinutes > doseMinutes) {
      return { label: 'Overdue', color: 'text-red-600', icon: AlertCircle };
    }
    return { label: 'Upcoming', color: 'text-gray-500', icon: Clock };
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !scheduleData) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || 'No medication schedule available'}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 p-4 overflow-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today's Medications</h3>
          <p className="text-sm text-gray-500">
            {new Date(scheduleData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Pill className="w-6 h-6 text-blue-600" />
      </div>

      {/* Adherence Summary */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Adherence Rate</span>
          <span className={`text-2xl font-bold ${getAdherenceColor(scheduleData.adherenceRate)}`}>
            {scheduleData.adherenceRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              scheduleData.adherenceRate >= 90
                ? 'bg-green-500'
                : scheduleData.adherenceRate >= 75
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${scheduleData.adherenceRate}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <span>{scheduleData.takenDoses}/{scheduleData.totalDoses} doses taken</span>
          {scheduleData.missedDoses > 0 && (
            <span className="text-red-600">{scheduleData.missedDoses} missed</span>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="space-y-3">
        {scheduleData.doses.map((dose) => {
          const status = getDoseStatus(dose, currentTime);
          const StatusIcon = status.icon;

          return (
            <div
              key={dose.id}
              className={`border rounded-lg p-4 ${
                status.label === 'Due Now' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Time */}
                <div className="flex-shrink-0 text-center">
                  <div className={`text-lg font-bold ${status.color}`}>{dose.time}</div>
                  <div className="text-xs text-gray-500">
                    {parseInt(dose.time) >= 12 ? 'PM' : 'AM'}
                  </div>
                </div>

                {/* Medication Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{dose.medicationName}</h4>
                      <p className="text-xs text-gray-600 mt-1">{dose.dosage}</p>
                      <p className="text-xs text-gray-500 mt-1">{dose.instructions}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-2">
                    {dose.taken ? (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Taken at {dose.takenAt}
                      </div>
                    ) : dose.skipped ? (
                      <div className="text-xs text-gray-500">
                        Skipped{dose.skipReason && ` - ${dose.skipReason}`}
                      </div>
                    ) : (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleMarkTaken(dose.id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Mark as Taken
                        </button>
                        <button
                          onClick={() => handleSkipDose(dose.id)}
                          className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refill Reminder */}
      {scheduleData.nextRefillDate && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Refill Reminder</p>
              <p className="text-sm text-yellow-700">
                Next refill due: {new Date(scheduleData.nextRefillDate).toLocaleDateString()} 
                ({Math.ceil((new Date(scheduleData.nextRefillDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 pt-2">
        <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          View History
        </button>
        <button className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Set Reminder
        </button>
      </div>
    </div>
  );
};

export default MedicationScheduleWidget;
