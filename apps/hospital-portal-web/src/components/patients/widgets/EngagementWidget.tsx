'use client';

import React from 'react';
import { Star, ThumbsUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EngagementWidgetProps {
  patientId: string;
  onViewEngagement?: () => void;
}

// Mock data - Replace with FeedbackController & PatientPortalController when available
const mockEngagementData = {
  feedbackScore: 4.5,
  totalFeedback: 3,
  portalLogins: 12,
  lastPortalLogin: '2026-02-10',
};

export const EngagementWidget: React.FC<EngagementWidgetProps> = ({ patientId, onViewEngagement }) => {
  // TODO: Fetch from FeedbackController & PatientPortalController when available
  const data = mockEngagementData;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Patient Engagement
          </span>
          <Badge variant="secondary">Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feedback Score */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-yellow-900">Satisfaction Score</span>
            <ThumbsUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-yellow-900">{data.feedbackScore}</p>
            <p className="text-sm text-yellow-700">/ 5.0</p>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Based on {data.totalFeedback} reviews</p>
        </div>

        {/* Portal Activity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{data.portalLogins}</p>
            <p className="text-xs text-gray-600">Portal Logins</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Last Login</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(data.lastPortalLogin).toLocaleDateString()}
            </p>
          </div>
        </div>

        {onViewEngagement && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewEngagement}>
            View Engagement History
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
