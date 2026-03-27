'use client';

import React from 'react';
import { Image, Eye, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ImagingWidgetProps {
  patientId: string;
  onViewImaging?: () => void;
}

// Mock data - Replace with ImagingController when available
const mockImagingData = {
  recent: [
    { id: '1', type: 'OCT', date: '2026-02-10', eye: 'OD' },
    { id: '2', type: 'Fundus Photo', date: '2026-02-10', eye: 'OS' },
    { id: '3', type: 'Visual Field', date: '2026-01-15', eye: 'OU' },
  ],
  total: 15,
};

export const ImagingWidget: React.FC<ImagingWidgetProps> = ({ patientId, onViewImaging }) => {
  // TODO: Fetch from ImagingController when available
  const data = mockImagingData;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Image className="w-5 h-5 text-cyan-600" />
            Imaging & Scans
          </span>
          <Badge variant="secondary">{data.total} Total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Scans */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Scans</h4>
          {data.recent.length > 0 ? (
            <div className="space-y-2">
              {data.recent.map((scan) => (
                <div key={scan.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-cyan-600" />
                    <div>
                      <p className="text-sm font-medium">{scan.type}</p>
                      <p className="text-xs text-gray-500">{new Date(scan.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    {scan.eye}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No imaging history</p>
          )}
        </div>

        {onViewImaging && (
          <Button variant="outline" size="sm" className="w-full" onClick={onViewImaging}>
            View All Imaging
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
