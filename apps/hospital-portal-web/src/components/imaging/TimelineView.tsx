// Timeline View - Phase 5: Progression Tracking
// Horizontal timeline showing all imaging studies for patient with filtering

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Filter, Eye, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimelineStudy {
  id: string;
  date: Date;
  modality: 'Fundus' | 'OCT' | 'Visual Field' | 'Scheimpflug' | 'IOL' | 'UBM' | 'FFA';
  thumbnailUrl?: string;
  imageCount: number;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface TimelineViewProps {
  patientId: string;
  onStudySelect?: (study: TimelineStudy) => void;
  onCompare?: (baseline: TimelineStudy, followup: TimelineStudy) => void;
  className?: string;
}

const modalityIcons: Record<string, string> = {
  Fundus: '📷',
  OCT: '🔬',
  'Visual Field': '👁',
  Scheimpflug: '🔍',
  IOL: '🔭',
  UBM: '📡',
  FFA: '💉',
};

const modalityColors: Record<string, string> = {
  Fundus: 'bg-blue-500',
  OCT: 'bg-purple-500',
  'Visual Field': 'bg-green-500',
  Scheimpflug: 'bg-yellow-500',
  IOL: 'bg-pink-500',
  UBM: 'bg-cyan-500',
  FFA: 'bg-orange-500',
};

export default function TimelineView({
  patientId,
  onStudySelect,
  onCompare,
  className = '',
}: TimelineViewProps) {
  const [studies, setStudies] = useState<TimelineStudy[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<TimelineStudy[]>([]);
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<TimelineStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch patient's imaging studies
  useEffect(() => {
    fetchStudies();
  }, [patientId]);

  // Filter studies when modality changes
  useEffect(() => {
    if (selectedModality === 'all') {
      setFilteredStudies(studies);
    } else {
      setFilteredStudies(studies.filter(s => s.modality === selectedModality));
    }
  }, [selectedModality, studies]);

  const fetchStudies = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/api/Imaging/patient/${patientId}`);
      
      // Mock data for now
      const mockStudies: TimelineStudy[] = [
        {
          id: '1',
          date: new Date('2025-11-15'),
          modality: 'OCT',
          imageCount: 4,
          description: 'Baseline Macular OCT',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date('2026-01-10'),
          modality: 'OCT',
          imageCount: 4,
          description: 'Follow-up OCT - 2 months',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date('2026-02-22'),
          modality: 'OCT',
          imageCount: 4,
          description: 'Current Visit OCT',
          status: 'completed',
        },
        {
          id: '4',
          date: new Date('2025-12-01'),
          modality: 'Fundus',
          imageCount: 2,
          description: 'Fundus Photography',
          status: 'completed',
        },
        {
          id: '5',
          date: new Date('2026-01-20'),
          modality: 'Visual Field',
          imageCount: 2,
          description: '24-2 Visual Field Test',
          status: 'completed',
        },
      ];

      setStudies(mockStudies);
      setFilteredStudies(mockStudies);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch imaging studies:', error);
      toast.error('Failed to load imaging timeline');
      setIsLoading(false);
    }
  };

  const handleStudyClick = (study: TimelineStudy) => {
    if (selectedForComparison.length === 0) {
      // Regular study selection
      onStudySelect?.(study);
    } else {
      // Comparison mode - select second study
      if (selectedForComparison[0].id !== study.id) {
        setSelectedForComparison([...selectedForComparison, study]);
        // Trigger comparison
        onCompare?.(selectedForComparison[0], study);
        toast.success(`Comparing ${selectedForComparison[0].modality} studies`);
        // Reset selection
        setSelectedForComparison([]);
      } else {
        toast.error('Please select a different study for comparison');
      }
    }
  };

  const startComparisonMode = (study: TimelineStudy) => {
    setSelectedForComparison([study]);
    toast('Select another study to compare', { icon: '🔄', duration: 5000 });
  };

  const cancelComparison = () => {
    setSelectedForComparison([]);
    toast('Comparison cancelled', { icon: '❌' });
  };

  const modalities = Array.from(new Set(studies.map(s => s.modality)));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Imaging Timeline</h3>
          {selectedForComparison.length > 0 && (
            <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Comparison Mode - Select 2nd study
            </span>
          )}
        </div>

        {/* Modality Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Modalities</option>
            {modalities.map(modality => (
              <option key={modality} value={modality}>
                {modalityIcons[modality]} {modality}
              </option>
            ))}
          </select>
          {selectedForComparison.length > 0 && (
            <button
              onClick={cancelComparison}
              className="ml-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && filteredStudies.length > 0 && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300"></div>

          {/* Timeline Nodes */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredStudies
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((study, index) => {
                const isSelected = selectedForComparison.some(s => s.id === study.id);
                const modalityColor = modalityColors[study.modality] || 'bg-gray-500';

                return (
                  <div key={study.id} className="relative">
                    {/* Date Label */}
                    <div className="text-xs text-gray-500 text-center mb-2">
                      {study.date.toLocaleDateString()}
                    </div>

                    {/* Timeline Node */}
                    <div className="flex flex-col items-center">
                      {/* Node Circle */}
                      <div
                        className={`w-4 h-4 rounded-full border-4 border-white ${modalityColor} shadow-md z-10 mb-3`}
                      ></div>

                      {/* Study Card */}
                      <button
                        onClick={() => handleStudyClick(study)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          startComparisonMode(study);
                        }}
                        className={`w-full max-w-[200px] bg-white border-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-all text-left ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-indigo-400'
                        }`}
                      >
                        {/* Thumbnail or Icon */}
                        <div className={`w-full h-24 ${modalityColor} rounded mb-2 flex items-center justify-center text-3xl`}>
                          {study.thumbnailUrl ? (
                            <img
                              src={study.thumbnailUrl}
                              alt={study.description}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span>{modalityIcons[study.modality]}</span>
                          )}
                        </div>

                        {/* Study Info */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 ${modalityColor} text-white text-xs rounded font-medium`}>
                              {study.modality}
                            </span>
                            <span className="text-xs text-gray-500">{study.imageCount} imgs</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {study.description}
                          </p>
                        </div>

                        {/* Compare Hint */}
                        {!isSelected && selectedForComparison.length > 0 && (
                          <div className="mt-2 text-xs text-center text-orange-600 font-medium">
                            Click to compare
                          </div>
                        )}
                      </button>

                      {/* Right-click hint */}
                      {index === 0 && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                          Right-click to compare
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStudies.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Studies Found
          </h3>
          <p className="text-gray-500">
            {selectedModality === 'all'
              ? 'No imaging studies available for this patient'
              : `No ${selectedModality} studies found. Try selecting a different modality.`}
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 How to Use</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Click</strong> any study to view details</li>
          <li>• <strong>Right-click</strong> a study to start comparison mode</li>
          <li>• <strong>Filter by modality</strong> using the dropdown above</li>
        </ul>
      </div>
    </div>
  );
}
