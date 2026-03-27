/**
 * Vitals Monitoring Widget
 * Real-time vitals tracking during counseling/pre-op
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { VitalsReading } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const VitalsMonitoringWidget: React.FC<WidgetProps> = ({ patientId }) => {
  const [vitals, setVitals] = useState<VitalsReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVitals, setNewVitals] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    temp: '',
    glucose: '',
    spo2: ''
  });

  useEffect(() => {
    if (patientId) loadVitals();
  }, [patientId]);

  const loadVitals = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getVitalsHistory(patientId!, 5);
      setVitals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await widgetsApi.recordVitals(patientId!, {
        measuredAt: new Date().toISOString(),
        bloodPressure: {
          systolic: parseInt(newVitals.systolic),
          diastolic: parseInt(newVitals.diastolic)
        },
        pulseRate: parseInt(newVitals.pulse),
        temperature: parseFloat(newVitals.temp),
        bloodGlucose: newVitals.glucose ? parseInt(newVitals.glucose) : undefined,
        oxygenSaturation: newVitals.spo2 ? parseInt(newVitals.spo2) : undefined,
        notes: '',
        flagged: false
      });
      loadVitals();
      // Reset form
      setNewVitals({ systolic: '', diastolic: '', pulse: '', temp: '', glucose: '', spo2: '' });
    } catch (err) {
      alert('Failed to save vitals');
    }
  };

  const latestVitals = vitals[0];

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <Activity className="w-5 h-5 mr-2 text-red-600" />
        Vital Signs
      </h3>

      {/* Latest Reading */}
      {latestVitals && (
        <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="text-xs text-gray-600 mb-2">
            Latest: {new Date(latestVitals.measuredAt).toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-600">Blood Pressure</div>
              <div className="text-lg font-bold">
                {latestVitals.bloodPressure.systolic}/{latestVitals.bloodPressure.diastolic}
                <span className="text-sm font-normal text-gray-600 ml-1">mmHg</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Pulse Rate</div>
              <div className="text-lg font-bold">
                {latestVitals.pulseRate}
                <span className="text-sm font-normal text-gray-600 ml-1">bpm</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Temperature</div>
              <div className="text-lg font-bold">
                {latestVitals.temperature}
                <span className="text-sm font-normal text-gray-600 ml-1">°F</span>
              </div>
            </div>
            {latestVitals.oxygenSaturation && (
              <div>
                <div className="text-xs text-gray-600">SpO2</div>
                <div className="text-lg font-bold">
                  {latestVitals.oxygenSaturation}
                  <span className="text-sm font-normal text-gray-600 ml-1">%</span>
                </div>
              </div>
            )}
          </div>
          {latestVitals.flagged && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-700 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-yellow-800">{latestVitals.flagReason}</span>
            </div>
          )}
        </div>
      )}

      {/* New Reading Form */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Record New Vitals</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">BP (Systolic)</label>
            <input
              type="number"
              value={newVitals.systolic}
              onChange={e => setNewVitals({...newVitals, systolic: e.target.value})}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="120"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">BP (Diastolic)</label>
            <input
              type="number"
              value={newVitals.diastolic}
              onChange={e => setNewVitals({...newVitals, diastolic: e.target.value})}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="80"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Pulse (bpm)</label>
            <input
              type="number"
              value={newVitals.pulse}
              onChange={e => setNewVitals({...newVitals, pulse: e.target.value})}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="72"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Temp (°F)</label>
            <input
              type="number"
              step="0.1"
              value={newVitals.temp}
              onChange={e => setNewVitals({...newVitals, temp: e.target.value})}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="98.6"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Glucose (mg/dL)</label>
            <input
              type="number"
              value={newVitals.glucose}
              onChange={e => setNewVitals({...newVitals, glucose: e.target.value})}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">SpO2 (%)</label>
            <input
              type="number"
              value={newVitals.spo2}
              onChange={e => setNewVitals({...newVitals, spo2: e.target.value})}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="98"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Vitals
        </button>
      </div>

      {/* Trend Button */}
      <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center">
        <TrendingUp className="w-4 h-4 mr-2" />
        View Trends
      </button>
    </div>
  );
};

export default VitalsMonitoringWidget;
