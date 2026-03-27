'use client';

import { useState } from 'react';
import { Image, Upload, Trash2, Eye } from 'lucide-react';

interface FundusImageGalleryProps {
  patientId: string;
  canEdit: boolean;
}

export default function FundusImageGallery({ patientId, canEdit }: FundusImageGalleryProps) {
  const [images, setImages] = useState<any[]>([
    {
      id: '1',
      url: '/placeholder-fundus.jpg',
      eye: 'OD',
      date: '2026-01-15',
      type: 'Color Fundus',
      findings: 'Moderate NPDR with microaneurysms',
    },
    {
      id: '2',
      url: '/placeholder-fundus.jpg',
      eye: 'OS',
      date: '2026-01-15',
      type: 'Color Fundus',
      findings: 'Severe NPDR with hemorrhages',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Image className="w-6 h-6 mr-2 text-blue-600" />
          Fundus Photography Gallery
        </h3>
        {canEdit && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              <Eye className="w-16 h-16 text-gray-400" />
              <p className="text-gray-500 text-sm ml-2">Fundus Image Placeholder</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  image.eye === 'OD' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {image.eye}
                </span>
                <p className="text-xs text-gray-500">{new Date(image.date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{image.type}</p>
              <p className="text-xs text-gray-600">{image.findings}</p>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No fundus images available</p>
        </div>
      )}
    </div>
  );
}
