'use client';

import React, { useState, useEffect } from 'react';
import { TestTube, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { labReportsApi } from '@/lib/api/lab-reports.api';
import { format } from 'date-fns';

interface LabResultsWidgetProps {
  patientId: string;
  onViewLabs?: () => void;
}

export const LabResultsWidget: React.FC<LabResultsWidgetProps> = ({ patientId, onViewLabs }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const response = await labReportsApi.getByPatient(patientId);
        const labs = response.data || [];
        
        const pending = labs.filter((l: any) => l.status === 'ordered' || l.status === 'sample_collected' || l.status === 'in_progress');
        const recent = labs.filter((l: any) => l.status === 'completed').slice(0, 3);
        const abnormal = recent.filter((l: any) => 
          l.results?.some((r: any) => r.status === 'high' || r.status === 'low' || r.status === 'critical')
        );
        
        setData({ pending, recent, abnormal });
      } catch (error) {
        console.error('Error fetching lab results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            Lab Results
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
            <TestTube className="w-5 h-5 text-purple-600" />
            Lab Results
          </span>
          {data?.pending.length > 0 && (
            <Badge variant="secondary">{data.pending.length} Pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Tests */}
        {data?.pending.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-sm text-yellow-900">
                {data.pending.length} Test(s) Pending
              </span>
            </div>
            {data.pending.slice(0, 2).map((lab: any) => (
              <p key={lab.id} className="text-sm text-yellow-800 pl-7">
                • {lab.testName} ({lab.status})
              </p>
            ))}
          </div>
        )}

        {/* Recent Results */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Results</h4>
          {data?.recent.length > 0 ? (
            <div className="space-y-2">
              {data.recent.map((lab: any) => {
                const hasAbnormal = lab.results?.some((r: any) => r.status !== 'normal');
                
                return (
                  <div key={lab.id} className="p-2 bg-gray-50 rounded flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {hasAbnormal ? (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-sm font-medium">{lab.testName}</span>
                      </div>
                      <p className="text-xs text-gray-500 pl-6">
                        {format(new Date(lab.reportDate || lab.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge variant={hasAbnormal ? 'destructive' : 'default'} className="text-xs">
                      {hasAbnormal ? 'Abnormal' : 'Normal'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent results</p>
          )}
        </div>

        {onViewLabs && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewLabs}>
            View All Lab Reports
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
