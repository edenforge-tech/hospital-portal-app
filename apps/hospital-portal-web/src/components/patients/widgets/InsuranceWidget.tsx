'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { patientInsuranceApi } from '@/lib/api/patient-insurance.api';
import { format, differenceInDays } from 'date-fns';

interface InsuranceWidgetProps {
  patientId: string;
  onViewInsurance?: () => void;
}

export const InsuranceWidget: React.FC<InsuranceWidgetProps> = ({ patientId, onViewInsurance }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsurance = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const response = await patientInsuranceApi.getByPatient(patientId);
        const policies = response.data || [];
        
        const active = policies.find((p: any) => p.status === 'active');
        
        setData({ active, total: policies.length });
      } catch (error) {
        console.error('Error fetching insurance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurance();
  }, [patientId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const daysUntilExpiry = data?.active?.expiryDate 
    ? differenceInDays(new Date(data.active.expiryDate), new Date())
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Insurance
          </span>
          {data?.active ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">None</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.active ? (
          <>
            {/* Active Policy */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-sm text-blue-900">Active Policy</span>
              </div>
              <p className="text-sm text-blue-900 mb-1">
                <strong>Provider:</strong> {data.active.insuranceProvider || 'Unknown'}
              </p>
              <p className="text-sm text-blue-900 mb-1">
                <strong>Policy #:</strong> {data.active.policyNumber || 'N/A'}
              </p>
              {data.active.expiryDate && (
                <p className="text-sm text-blue-900">
                  <strong>Expires:</strong> {format(new Date(data.active.expiryDate), 'MMM dd, yyyy')}
                  {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {daysUntilExpiry} days left
                    </Badge>
                  )}
                </p>
              )}
            </div>

            {/* Coverage Status */}
            {data.active.coverageAmount && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Coverage Amount</p>
                <p className="text-2xl font-bold text-green-900">
                  ₹{data.active.coverageAmount.toLocaleString()}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">No active insurance policy</p>
          </div>
        )}

        {onViewInsurance && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewInsurance}>
            {data?.active ? 'View Policy Details' : 'Add Insurance'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
