'use client';

import React from 'react';
import { ClipboardCheck, TestTube, Heart, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PreOpTabProps {
  patientId: string;
}

export const PreOpTab: React.FC<PreOpTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-Op Tests & Clearances</h3>
      <p className="text-gray-600 mb-4">
        Pre-operative investigations, physician clearances, and surgical prep checklists
      </p>
      <Badge variant="secondary">Coming Soon - PreOpController Integration</Badge>
      <div className="mt-6">
        <Button variant="outline">
          View Pre-Op Checklist
        </Button>
      </div>
    </div>
  );
};
