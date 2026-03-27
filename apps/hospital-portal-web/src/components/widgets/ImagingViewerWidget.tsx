/**
 * Imaging Viewer Widget
 * View and navigate medical imaging studies (DICOM, OCT, Fundus, etc.)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Image, Eye, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { ImagingStudy } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const ImagingViewerWidget: React.FC<WidgetProps> = ({ patientId }) => {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) loadStudies();
  }, [patientId]);

  const loadStudies = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getImagingStudies(patientId!);
      setStudies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getModalityColor = (modality: string) => {
    const colors: Record<string, string> = {
      'OCT': 'bg-blue-100 text-blue-700',
      'FUNDUS': 'bg-green-100 text-green-700',
      'X-RAY': 'bg-gray-100 text-gray-700',
      'CT': 'bg-purple-100 text-purple-700',
      'MRI': 'bg-red-100 text-red-700',
    };
    return colors[modality] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin roundedfull h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <Image className="w-5 h-5 mr-2 text-blue-600" />
        Medical Imaging
      </h3>

      {studies.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No imaging studies available
        </div>
      ) : (
        <div className="space-y-3">
          {studies.map(study => (
            <div key={study.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{study.studyType}</h4>
                  <p className="text-sm text-gray-600 mt-1">{study.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{study.bodyPart}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModalityColor(study.modality)}`}>
                  {study.modality}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <span>Date: {new Date(study.studyDate).toLocaleDateString()}</span>
                <span>{study.imageCount} images</span>
                <span className="capitalize">{study.status}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(study.viewerUrl, '_blank')}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Images
                </button>
                {study.reportUrl && (
                  <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Report
                  </button>
                )}
                <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
        Order  New Imaging
      </button>
    </div>
  );
};

export default ImagingViewerWidget;
