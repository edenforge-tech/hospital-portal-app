'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { patientCommunicationsApi } from '@/lib/api/patient-communications.api';
import { format } from 'date-fns';

interface CommunicationsWidgetProps {
  patientId: string;
  onViewCommunications?: () => void;
}

export const CommunicationsWidget: React.FC<CommunicationsWidgetProps> = ({ patientId, onViewCommunications }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunications = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const response = await patientCommunicationsApi.getByPatient(patientId);
        const comms = response.data || [];
        
        const recent = comms.slice(0, 5);
        const byType = {
          sms: comms.filter((c: any) => c.communicationType === 'SMS').length,
          email: comms.filter((c: any) => c.communicationType === 'Email').length,
          phone: comms.filter((c: any) => c.communicationType === 'Phone').length,
        };
        
        setData({ recent, byType, total: comms.length });
      } catch (error) {
        console.error('Error fetching communications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, [patientId]);

  const getCommIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-green-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Communications
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
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Communications
          </span>
          <Badge variant="secondary">{data?.total || 0} Total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Communication Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
            <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{data?.byType.sms || 0}</p>
            <p className="text-xs text-gray-600">SMS</p>
          </div>
          <div className="p-2 bg-purple-50 border border-purple-200 rounded text-center">
            <Mail className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{data?.byType.email || 0}</p>
            <p className="text-xs text-gray-600">Email</p>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
            <Phone className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold">{data?.byType.phone || 0}</p>
            <p className="text-xs text-gray-600">Calls</p>
          </div>
        </div>

        {/* Recent Communications */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Messages</h4>
          {data?.recent.length > 0 ? (
            <div className="space-y-2">
              {data.recent.slice(0, 3).map((comm: any) => (
                <div key={comm.id} className="p-2 bg-gray-50 rounded flex items-start gap-2">
                  {getCommIcon(comm.communicationType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {comm.subject || comm.communicationType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(comm.sentAt || comm.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {comm.status === 'delivered' && (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No communication history</p>
          )}
        </div>

        {onViewCommunications && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewCommunications}>
            View All Communications
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
