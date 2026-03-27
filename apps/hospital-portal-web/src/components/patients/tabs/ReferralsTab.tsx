'use client';

import React from 'react';
import { Users, ArrowRight, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReferralsTabProps {
  patientId: string;
}

export const ReferralsTab: React.FC<ReferralsTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <ArrowRight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Referrals</h3>
      <p className="text-gray-600 mb-4">
        Internal and external referrals to/from other doctors and facilities
      </p>
      <Badge variant="secondary">Coming Soon - ReferralsController Integration</Badge>
      <div className="mt-6">
        <Button variant="outline">
          Manage Referrals
        </Button>
      </div>
    </div>
  );
};
