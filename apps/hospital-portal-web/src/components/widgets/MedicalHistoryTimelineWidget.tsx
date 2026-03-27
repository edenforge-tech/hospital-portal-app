/**
 * Medical History Timeline Widget
 * Visual chronological timeline of patient's medical journey
 */

'use client';

import React, { useState, useEffect } from 'react';
import { History, FileText, Stethoscope, Pill, AlertCircle, Filter } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { TimelineEvent } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const MedicalHistoryTimelineWidget: React.FC<WidgetProps> = ({ patientId, size }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (patientId) loadTimeline();
  }, [patientId, filterType]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getMedicalHistoryTimeline(
        patientId!,
        filterType === 'all' ? undefined : { type: filterType }
      );
      setTimeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'diagnosis': return { icon: AlertCircle, color: 'text-red-600 bg-red-100' };
      case 'examination': return { icon: Stethoscope, color: 'text-blue-600 bg-blue-100' };
      case 'prescription': return { icon: Pill, color: 'text-green-600 bg-green-100' };
      case 'surgery': return { icon: FileText, color: 'text-purple-600 bg-purple-100' };
      default: return { icon: FileText, color: 'text-gray-600 bg-gray-100' };
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const eventTypes = ['all', 'diagnosis', 'examination', 'prescription', 'surgery', 'follow-up'];

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <History className="w-5 h-5 mr-2 text-blue-600" />
          Medical History Timeline
        </h3>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {eventTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {timeline.map((event, index) => {
            const { icon: Icon, color } = getEventIcon(event.type);
            
            return (
              <div key={event.id} className="relative pl-14">
                {/* Icon */}
                <div className={`absolute left-0 w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {event.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{event.description}</p>

                  {event.relatedDoctorName && (
                    <p className="text-xs text-gray-600">
                      Provider: {event.relatedDoctorName}
                    </p>
                  )}

                  {event.documents && event.documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.documents.map(doc => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {timeline.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No medical history events found
        </div>
      )}

      <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
        Export Timeline as PDF
      </button>
    </div>
  );
};

export default MedicalHistoryTimelineWidget;
