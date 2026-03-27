'use client';

import React from 'react';
import { Image, FileImage, Eye, Camera, Scan, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ImagingTabProps {
  patientId: string;
}

export const ImagingTab: React.FC<ImagingTabProps> = ({ patientId }) => {
  // TODO: Fetch from ImagingController when available
  
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Imaging & Scans</h3>
        <p className="text-gray-600 mb-4">
          View OCT scans, fundus photography, visual field tests, topography, and other imaging
        </p>
        <Badge variant="secondary" className="mb-4">Coming Soon - ImagingController Integration</Badge>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <p className="text-sm font-medium">OCT Scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Fundus Photo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Scan className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Visual Field</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Topography</p>
            </CardContent>
          </Card>
        </div>
        <Button variant="outline" className="mt-6">
          Open in Imaging Module
        </Button>
      </div>
    </div>
  );
};
