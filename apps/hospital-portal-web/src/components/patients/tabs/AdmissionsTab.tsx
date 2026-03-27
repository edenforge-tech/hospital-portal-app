'use client';

import React from 'react';
import { Bed, Hospital, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AdmissionsTabProps {
  patientId: string;
}

export const AdmissionsTab: React.FC<AdmissionsTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <Hospital className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">IPD Admissions</h3>
      <p className="text-gray-600 mb-4">
        Inpatient admission history, bed assignments, and discharge records
      </p>
      <Badge variant="secondary">Coming Soon - AdmissionsController Integration</Badge>
      <div className="mt-6">
        <Button variant="outline">
          Open in IPD Management Module
        </Button>
      </div>
    </div>
  );
};
