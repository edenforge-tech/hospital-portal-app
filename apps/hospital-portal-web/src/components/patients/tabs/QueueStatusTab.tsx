'use client';

import React from 'react';
import { Clock, Users, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QueueStatusTabProps {
  patientId: string;
}

export const QueueStatusTab: React.FC<QueueStatusTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Queue Status</h3>
      <p className="text-gray-600 mb-4">
        Real-time queue position, token number, and wait time estimates
      </p>
      <Badge variant="secondary">Partially Available - Extend QueueController</Badge>
      <div className="mt-6">
        <Button variant="outline">
          View Current Queue Status
        </Button>
      </div>
    </div>
  );
};
