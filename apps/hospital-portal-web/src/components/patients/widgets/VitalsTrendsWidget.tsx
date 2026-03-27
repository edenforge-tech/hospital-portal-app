'use client';

import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface VitalsTrendsWidgetProps {
  patientId: string;
  onViewVitals?: () => void;
}

// Mock data - Replace with actual API call when VitalsController is available
const mockVitalsData = {
  bp: [
    { date: '2026-01-01', systolic: 120, diastolic: 80 },
    { date: '2026-01-15', systolic: 125, diastolic: 82 },
    { date: '2026-02-01', systolic: 118, diastolic: 78 },
    { date: '2026-02-13', systolic: 122, diastolic: 80 },
  ],
  pulse: [70, 72, 68, 71],
  latest: {
    bp: '122/80',
    pulse: 71,
    temp: 98.6,
    spo2: 98,
  }
};

export const VitalsTrendsWidget: React.FC<VitalsTrendsWidgetProps> = ({ patientId, onViewVitals }) => {
  // TODO: Fetch actual vitals data from VitalsController when available
  const data = mockVitalsData;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Vitals Trends
          </span>
          <Badge variant="secondary">Last 3 months</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Latest Vitals Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Blood Pressure</p>
            <p className="text-xl font-bold text-gray-900">{data.latest.bp}</p>
            <p className="text-xs text-gray-500">mmHg</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Pulse</p>
            <p className="text-xl font-bold text-gray-900">{data.latest.pulse}</p>
            <p className="text-xs text-gray-500">bpm</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Temperature</p>
            <p className="text-xl font-bold text-gray-900">{data.latest.temp}</p>
            <p className="text-xs text-gray-500">°F</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">SpO2</p>
            <p className="text-xl font-bold text-gray-900">{data.latest.spo2}</p>
            <p className="text-xs text-gray-500">%</p>
          </div>
        </div>

        {/* BP Trend Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">BP Trend (Systolic)</h4>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data.bp}>
              <Tooltip />
              <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {onViewVitals && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewVitals}>
            View Full Vitals History
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
