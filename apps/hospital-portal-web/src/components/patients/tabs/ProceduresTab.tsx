'use client';

import React from 'react';
import { Stethoscope, Scissors, Syringe, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProceduresTabProps {
  patientId: string;
}

export const ProceduresTab: React.FC<ProceduresTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Procedures & Treatments</h3>
      <p className="text-gray-600 mb-4">
        Surgical and diagnostic procedures performed on this patient
      </p>
      <Badge variant="secondary">Coming Soon - ProceduresController Integration</Badge>
      <div className="mt-6">
        <Button variant="outline">
          Open in Procedures Module
        </Button>
      </div>
    </div>
  );
};
