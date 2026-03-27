'use client';

import React, { useState, useEffect } from 'react';
import { Pill, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { prescriptionsApi } from '@/lib/api';

interface MedicationsWidgetProps {
  patientId: string;
  onViewMedications?: () => void;
}

export const MedicationsWidget: React.FC<MedicationsWidgetProps> = ({ patientId, onViewMedications }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedications = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const response = await prescriptionsApi.getByPatient(patientId);
        const prescriptions = response.data || [];
        
        const active = prescriptions.filter((p: any) => p.status === 'active');
        const needsRefill = prescriptions.filter((p: any) => p.status === 'active' && p.refillsRemaining === 0);
        
        setData({ active, needsRefill, total: prescriptions.length });
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-green-600" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-green-600" />
            Medications
          </span>
          <Badge variant="secondary">{data?.active.length || 0} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Medications */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-900">Active Medications</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{data?.active.length || 0}</p>
        </div>

        {/* Needs Refill Alert */}
        {data?.needsRefill.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-sm text-orange-900">
                {data.needsRefill.length} Medication(s) Need Refill
              </span>
            </div>
          </div>
        )}

        {/* Recent Prescriptions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Prescriptions</h4>
          {data?.active.length > 0 ? (
            <div className="space-y-2">
              {data.active.slice(0, 3).map((rx: any) => (
                <div key={rx.id} className="p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium">{rx.medicationName || 'Prescription'}</p>
                  <p className="text-xs text-gray-500">
                    Prescribed: {new Date(rx.prescribedDate || rx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active medications</p>
          )}
        </div>

        {onViewMedications && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewMedications}>
            View All Medications
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
