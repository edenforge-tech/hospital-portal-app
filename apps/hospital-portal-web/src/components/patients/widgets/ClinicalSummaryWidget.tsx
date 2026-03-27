'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, AlertTriangle, Pill, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { examinationApi } from '@/lib/api';
import { patientAllergiesApi } from '@/lib/api/patient-allergies.api';
import { prescriptionsApi } from '@/lib/api';

interface ClinicalSummaryWidgetProps {
  patientId: string;
  onViewDetails?: () => void;
}

export const ClinicalSummaryWidget: React.FC<ClinicalSummaryWidgetProps> = ({ patientId, onViewDetails }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const [examsRes, allergiesRes, prescriptionsRes] = await Promise.allSettled([
          examinationApi.getByPatient(patientId),
          patientAllergiesApi.getByPatient(patientId),
          prescriptionsApi.getByPatient(patientId),
        ]);

        const activeDiagnoses = examsRes.status === 'fulfilled' && examsRes.value.data
          ? examsRes.value.data
              .filter((e: any) => e.diagnosis)
              .slice(0, 3)
              .map((e: any) => e.diagnosis)
          : [];

        const allergies = allergiesRes.status === 'fulfilled' && allergiesRes.value.data
          ? allergiesRes.value.data
          : [];

        const activeMeds = prescriptionsRes.status === 'fulfilled' && prescriptionsRes.value.data
          ? prescriptionsRes.value.data.filter((p: any) => p.status === 'active').length
          : 0;

        setData({ activeDiagnoses, allergies, activeMeds });
      } catch (error) {
        console.error('Error fetching clinical summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Clinical Summary
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
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Clinical Summary
          </span>
          <Badge variant="secondary">{data?.activeDiagnoses.length || 0} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Diagnoses */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Active Diagnoses
          </h4>
          {data?.activeDiagnoses.length > 0 ? (
            <div className="space-y-1">
              {data.activeDiagnoses.map((diagnosis: string, idx: number) => (
                <p key={idx} className="text-sm text-gray-600 pl-5">• {diagnosis}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 pl-5">No active diagnoses</p>
          )}
        </div>

        {/* Allergies */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Allergies
          </h4>
          {data?.allergies.length > 0 ? (
            <div className="space-y-1">
              {data.allergies.slice(0, 3).map((allergy: any) => (
                <div key={allergy.id} className="flex items-center gap-2 pl-5">
                  <Badge variant="destructive" className="text-xs">{allergy.severity}</Badge>
                  <span className="text-sm text-gray-600">{allergy.allergen}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 pl-5">No known allergies</p>
          )}
        </div>

        {/* Active Medications */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Pill className="w-4 h-4 text-green-600" />
            Active Medications
          </h4>
          <p className="text-2xl font-bold text-gray-900 pl-5">{data?.activeMeds || 0}</p>
        </div>

        {onViewDetails && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewDetails}>
            View Full Clinical Record
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
