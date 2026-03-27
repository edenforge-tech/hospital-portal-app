// TimelineScrubber - Navigate through comparison history with timeline visualization
'use client';

import { useEffect, useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimelineComparison {
  id: string;
  baselineImageId: string;
  followupImageId: string;
  comparisonType: string;
  findings: string;
  clinicalSignificance: 'none' | 'mild' | 'moderate' | 'significant' | 'critical';
  reviewedAt: string;
  timeIntervalDays: number;
  changePercentage?: number;
  baselineImage?: {
    id: string;
    imageUrl: string;
    uploadedAt: string;
  };
  followupImage?: {
    id: string;
    imageUrl: string;
    uploadedAt: string;
  };
}

interface TimelineScrubberProps {
  patientId: string;
  currentComparisonId?: string;
  onComparisonSelect: (comparison: TimelineComparison) => void;
  className?: string;
}

export default function TimelineScrubber({
  patientId,
  currentComparisonId,
  onComparisonSelect,
  className = '',
}: TimelineScrubberProps) {
  const [comparisons, setComparisons] = useState<TimelineComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // desc = newest first

  useEffect(() => {
    fetchComparisonTimeline();
  }, [patientId]);

  useEffect(() => {
    // Update current index when comparison ID changes
    if (currentComparisonId && comparisons.length > 0) {
      const index = comparisons.findIndex((c) => c.id === currentComparisonId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [currentComparisonId, comparisons]);

  const fetchComparisonTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const api = (await import('@/lib/api')).getApi();
      const response = await api.get<TimelineComparison[]>(
        `/Imaging/patients/${patientId}/comparisons`
      );

      const sortedComparisons = response.data.sort((a, b) => {
        const dateA = new Date(a.reviewedAt).getTime();
        const dateB = new Date(b.reviewedAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      setComparisons(sortedComparisons);

      // Auto-select first comparison if none selected
      if (sortedComparisons.length > 0 && !currentComparisonId) {
        onComparisonSelect(sortedComparisons[0]);
        setCurrentIndex(0);
      }
    } catch (err: any) {
      console.error('Failed to fetch comparison timeline:', err);
      setError(err.response?.data?.message || 'Failed to load comparison history');
      toast.error('Failed to load comparison history');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onComparisonSelect(comparisons[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < comparisons.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onComparisonSelect(comparisons[newIndex]);
    }
  };

  const handleTimelineClick = (index: number) => {
    setCurrentIndex(index);
    onComparisonSelect(comparisons[index]);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    const reversed = [...comparisons].reverse();
    setComparisons(reversed);
    setCurrentIndex(comparisons.length - 1 - currentIndex); // Maintain position
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSignificanceColor = (significance: string): string => {
    switch (significance) {
      case 'critical':
        return 'bg-red-500';
      case 'significant':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'mild':
        return 'bg-blue-500';
      case 'none':
      default:
        return 'bg-gray-500';
    }
  };

  const getChangeIcon = (changePercentage?: number) => {
    if (!changePercentage) return <span className="text-sm">−</span>;
    if (changePercentage > 5) return <span className="text-sm">↗</span>;
    if (changePercentage < -5) return <span className="text-sm">↘</span>;
    return <span className="text-sm">−</span>;
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg p-4 border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-600 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <span className="text-sm">Loading comparison timeline...</span>
        </div>
      </div>
    );
  }

  if (error || comparisons.length === 0) {
    return (
      <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg p-4 border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">
            {error || 'No comparison history available'}
          </span>
        </div>
      </div>
    );
  }

  const currentComparison = comparisons[currentIndex];

  return (
    <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg p-4 space-y-4 border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400 dark:text-blue-300" />
          <h3 className="text-sm font-semibold text-white dark:text-gray-100">
            Comparison Timeline
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ({comparisons.length} {comparisons.length === 1 ? 'comparison' : 'comparisons'})
          </span>
        </div>

        {/* Sort Toggle */}
        <button
          onClick={toggleSortOrder}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-100 transition-colors"
          title={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
        >
          {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
        </button>
      </div>

      {/* Current Comparison Info */}
      <div className="bg-gray-700 dark:bg-gray-800/80 rounded-lg p-3 space-y-2 border border-gray-600/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getSignificanceColor(currentComparison.clinicalSignificance)}`}></div>
            <span className="text-sm font-medium text-white dark:text-gray-100 capitalize">
              {currentComparison.comparisonType.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(currentComparison.reviewedAt)}
          </span>
        </div>

        {currentComparison.timeIntervalDays > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>Interval: {currentComparison.timeIntervalDays} days</span>
            {currentComparison.changePercentage !== undefined && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {getChangeIcon(currentComparison.changePercentage)}
                  <span>{Math.abs(currentComparison.changePercentage).toFixed(1)}% change</span>
                </div>
              </>
            )}
          </div>
        )}

        {currentComparison.findings && (
          <p className="text-xs text-gray-300 dark:text-gray-400 line-clamp-2">
            {currentComparison.findings}
          </p>
        )}
      </div>

      {/* Timeline Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 disabled:bg-gray-800 dark:disabled:bg-gray-900 disabled:cursor-not-allowed text-white dark:text-gray-100 transition-colors"
          title="Previous comparison"
        >
          <span className="text-lg">‹</span>
        </button>

        {/* Timeline Dots */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {comparisons.map((comparison, index) => (
            <button
              key={comparison.id}
              onClick={() => handleTimelineClick(index)}
              className={`relative flex-shrink-0 transition-all ${
                index === currentIndex
                  ? 'w-12 h-3 rounded-full'
                  : 'w-8 h-2 rounded-full hover:h-3'
              } ${
                index === currentIndex
                  ? getSignificanceColor(comparison.clinicalSignificance)
                  : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600'
              }`}
              title={`${formatDate(comparison.reviewedAt)} - ${comparison.comparisonType}`}
            >
              {/* Indicator for current */}
              {index === currentIndex && (
                <div className="absolute inset-0 rounded-full bg-white/30 dark:bg-white/20 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === comparisons.length - 1}
          className="p-2 rounded-lg bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 disabled:bg-gray-800 dark:disabled:bg-gray-900 disabled:cursor-not-allowed text-white dark:text-gray-100 transition-colors"
          title="Next comparison"
        >
          <span className="text-lg">›</span>
        </button>
      </div>

      {/* Position Indicator */}
      <div className="text-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {currentIndex + 1} of {comparisons.length}
        </span>
      </div>
    </div>
  );
}
