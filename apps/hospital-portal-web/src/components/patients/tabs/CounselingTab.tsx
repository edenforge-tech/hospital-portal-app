'use client';

import React from 'react';
import { MessageCircle, Package, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CounselingTabProps {
  patientId: string;
}

export const CounselingTab: React.FC<CounselingTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Counseling Sessions</h3>
      <p className="text-gray-600 mb-4">
        Pre-surgery counseling, package discussions, and consent management
      </p>
      <Badge variant="secondary">Coming Soon - CounselingController Integration</Badge>
      <div className="mt-6">
        <Button variant="outline">
          Open in Counselor Module
        </Button>
      </div>
    </div>
  );
};
