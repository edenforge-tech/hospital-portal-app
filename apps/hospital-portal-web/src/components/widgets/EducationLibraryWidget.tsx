/**
 * Education Library Widget
 * Searchable library of educational content for patients
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Play, CheckCircle2, Clock } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { EducationLibraryData } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const EducationLibraryWidget: React.FC<WidgetProps> = ({ patientId }) => {
  const [libraryData, setLibraryData] = useState<EducationLibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (patientId) loadLibrary();
  }, [patientId, selectedCategory]);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getEducationLibrary(
        patientId!,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setLibraryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <BookOpen className="w-5 h-5 text-green-500" />;
    }
  };

  if (loading || !libraryData) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const categories = ['all', ...Array.from(new Set(libraryData.content.map(c => c.category)))];

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Education Library</h3>
          <p className="text-sm text-gray-500">{libraryData.procedureType}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">Completion</div>
          <div className="text-2xl font-bold text-blue-600">{libraryData.completionRate}%</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {libraryData.content.map(item => (
          <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span>{item.category}</span>
                      {item.duration && <span><Clock className="w-3 h-3 inline mr-1" />{item.duration} min</span>}
                      <span>{item.language}</span>
                    </div>
                  </div>
                  {item.viewed && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                </div>
                <button className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  {item.type === 'video' ? 'Watch' : 'Read'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationLibraryWidget;
