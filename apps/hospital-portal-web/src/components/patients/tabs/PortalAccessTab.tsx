'use client';

import React from 'react';
import { Globe, LogIn, Activity, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PortalAccessTabProps {
  patientId: string;
}

export const PortalAccessTab: React.FC<PortalAccessTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Portal Access</h3>
      <p className="text-gray-600 mb-4">
        Patient portal login activity, account preferences, and access logs
      </p>
      <Badge variant="secondary">Phase 5 Feature - PatientPortalController</Badge>
      <div className="mt-6 space-y-3">
        <Button variant="outline">
          View Login History
        </Button>
        <br />
        <Button variant="outline">
          Generate Portal Access Link
        </Button>
      </div>
    </div>
  );
};
