'use client';

import React from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FeedbackTabProps {
  patientId: string;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({ patientId }) => {
  return (
    <div className="text-center py-12">
      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Feedback & Satisfaction</h3>
      <p className="text-gray-600 mb-4">
        Patient satisfaction surveys, ratings, and feedback history
      </p>
      <Badge variant="secondary">Coming Soon - FeedbackController Integration</Badge>
      <div className="mt-6">
        <Button variant="outline">
          View Feedback History
        </Button>
      </div>
    </div>
  );
};
