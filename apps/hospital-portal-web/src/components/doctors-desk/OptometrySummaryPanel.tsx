'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Edit, CheckCircle } from 'lucide-react';

export interface OptometryData {
  visualAcuity?: {
    odDistance?: string;
    osDistance?: string;
    odNear?: string;
    osNear?: string;
  };
  iop?: {
    od?: number;
    os?: number;
    method?: string;
  };
  refraction?: {
    od?: {
      sphere?: string;
      cylinder?: string;
      axis?: string;
    };
    os?: {
      sphere?: string;
      cylinder?: string;
      axis?: string;
    };
  };
  keratometry?: {
    odK1?: string;
    odK2?: string;
    osK1?: string;
    osK2?: string;
  };
  autoRefraction?: {
    od?: string;
    os?: string;
  };
  examinedBy?: string;
  examinedAt?: string;
  notes?: string;
}

interface OptometrySummaryPanelProps {
  data: OptometryData | null;
  onEdit?: () => void;
  editable?: boolean;
  loading?: boolean;
}

export default function OptometrySummaryPanel({
  data,
  onEdit,
  editable = true,
  loading = false,
}: OptometrySummaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-indigo-900 font-semibold">Fetching optometry data...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600">No optometry examination found for this patient</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-indigo-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-bold text-indigo-900">Optometry Data Available</h3>
            <p className="text-sm text-indigo-700">
              {data.examinedBy && `Examined by ${data.examinedBy}`}
              {data.examinedAt && ` • ${new Date(data.examinedAt).toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {editable && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Override Values</span>
            </button>
          )}
          
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-indigo-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-indigo-600" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t-2 border-indigo-200 bg-white p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Acuity */}
            {data.visualAcuity && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Visual Acuity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">OD Distance:</span>
                    <span className="font-semibold">{data.visualAcuity.odDistance || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OS Distance:</span>
                    <span className="font-semibold">{data.visualAcuity.osDistance || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OD Near:</span>
                    <span className="font-semibold">{data.visualAcuity.odNear || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OS Near:</span>
                    <span className="font-semibold">{data.visualAcuity.osNear || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* IOP */}
            {data.iop && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Intraocular Pressure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">OD:</span>
                    <span className={`font-semibold ${data.iop.od && data.iop.od > 21 ? 'text-red-600' : ''}`}>
                      {data.iop.od ? `${data.iop.od} mmHg` : 'N/A'}
                      {data.iop.od && data.iop.od > 21 && ' ⚠️'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OS:</span>
                    <span className={`font-semibold ${data.iop.os && data.iop.os > 21 ? 'text-red-600' : ''}`}>
                      {data.iop.os ? `${data.iop.os} mmHg` : 'N/A'}
                      {data.iop.os && data.iop.os > 21 && ' ⚠️'}
                    </span>
                  </div>
                  {data.iop.method && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-semibold">{data.iop.method}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refraction */}
            {data.refraction && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Refraction</h4>
                <div className="space-y-3 text-sm">
                  {data.refraction.od && (
                    <div>
                      <div className="text-gray-600 mb-1">OD:</div>
                      <div className="font-semibold">
                        {data.refraction.od.sphere || '0.00'} / {data.refraction.od.cylinder || '0.00'} × {data.refraction.od.axis || '0'}°
                      </div>
                    </div>
                  )}
                  {data.refraction.os && (
                    <div>
                      <div className="text-gray-600 mb-1">OS:</div>
                      <div className="font-semibold">
                        {data.refraction.os.sphere || '0.00'} / {data.refraction.os.cylinder || '0.00'} × {data.refraction.os.axis || '0'}°
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Keratometry */}
            {data.keratometry && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Keratometry</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">OD K1:</span>
                    <span className="font-semibold">{data.keratometry.odK1 || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OD K2:</span>
                    <span className="font-semibold">{data.keratometry.odK2 || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OS K1:</span>
                    <span className="font-semibold">{data.keratometry.osK1 || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OS K2:</span>
                    <span className="font-semibold">{data.keratometry.osK2 || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Optometrist Notes</h4>
              <p className="text-sm text-gray-700">{data.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
