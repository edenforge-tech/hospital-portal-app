// AIProgressionAnalysis - Display AI-powered progression detection results
'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProgressionAnalysisProps {
  baselineImageId: string;
  followupImageId: string;
  patientId: string;
  onAnalysisComplete?: (analysis: AIAnalysisResult) => void;
  autoAnalyze?: boolean; // Auto-trigger analysis on mount
  className?: string;
}

interface AIAnalysisResult {
  id: string;
  progressionDetected: boolean;
  confidenceScore: number;
  clinicalSignificance: 'none' | 'mild' | 'moderate' | 'significant' | 'critical';
  detectedRegions: DetectedRegion[];
  progressionMetrics: ProgressionMetrics;
  modelVersion: string;
  processingTimeMs: number;
  analyzedAt: string;
}

interface DetectedRegion {
  regionName: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  changeType: string;
  confidence: number;
  areaChangePixels: number;
}

interface ProgressionMetrics {
  TotalAreaChangedPixels: number;
  AffectedRegionsCount: number;
  ChangeTypesDistribution: Record<string, number>;
  SeverityScore: number;
}

export default function AIProgressionAnalysis({
  baselineImageId,
  followupImageId,
  patientId,
  onAnalysisComplete,
  autoAnalyze = false,
  className = '',
}: AIProgressionAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (autoAnalyze) {
      handleAnalyze();
    }
  }, [autoAnalyze, baselineImageId, followupImageId]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const api = (await import('@/lib/api')).getApi();
      const response = await api.post('/ImagingAI/analyze-progression', {
        patientId,
        baselineImageId,
        followupImageId,
        analysisType: 'progression',
      });

      const result = response.data.analysis as AIAnalysisResult;
      setAnalysis(result);
      onAnalysisComplete?.(result);

      toast.success(
        result.progressionDetected
          ? `Progression detected (${(result.confidenceScore * 100).toFixed(0)}% confidence)`
          : 'No significant progression detected'
      );
    } catch (err: any) {
      console.error('Failed to analyze progression:', err);
      const errorMsg = err.response?.data?.details || 'Failed to analyze progression';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical':
        return 'text-red-400 dark:text-red-300 bg-red-900/30 dark:bg-red-950/50 border-red-500/50';
      case 'significant':
        return 'text-orange-400 dark:text-orange-300 bg-orange-900/30 dark:bg-orange-950/50 border-orange-500/50';
      case 'moderate':
        return 'text-yellow-400 dark:text-yellow-300 bg-yellow-900/30 dark:bg-yellow-950/50 border-yellow-500/50';
      case 'mild':
        return 'text-blue-400 dark:text-blue-300 bg-blue-900/30 dark:bg-blue-950/50 border-blue-500/50';
      case 'none':
      default:
        return 'text-gray-400 dark:text-gray-500 bg-gray-800/30 dark:bg-gray-900/50 border-gray-600/50';
    }
  };

  const getConfidenceMeter = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let colorClass = 'bg-gray-500';

    if (percentage >= 90) colorClass = 'bg-green-500 dark:bg-green-400';
    else if (percentage >= 75) colorClass = 'bg-blue-500 dark:bg-blue-400';
    else if (percentage >= 60) colorClass = 'bg-yellow-500 dark:bg-yellow-400';
    else colorClass = 'bg-orange-500 dark:bg-orange-400';

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>Confidence</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="h-2 bg-gray-700 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (!analysis && !isAnalyzing) {
    return (
      <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg p-6 border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Activity className="w-12 h-12 text-blue-400 dark:text-blue-300" />
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-2">
              AI-Powered Progression Detection
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Analyze images using advanced machine learning to detect retinal disease progression
            </p>
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Start AI Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg p-6 border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <Activity className="w-12 h-12 text-blue-400 dark:text-blue-300 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-400/10 animate-ping"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-2">
              Analyzing Images...
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              AI model processing baseline and follow-up images
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg p-6 border border-red-700/30 dark:border-red-800/40 ${className}`}>
        <div className="flex items-center gap-3 text-red-400 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{error}</p>
          </div>
          <button
            onClick={handleAnalyze}
            className="ml-auto px-3 py-1 bg-red-900/50 hover:bg-red-900/70 text-red-300 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const metrics = analysis.progressionMetrics;
  const regions = analysis.detectedRegions || [];

  return (
    <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg overflow-hidden border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gray-700/50 dark:bg-gray-800/50 border-b border-gray-700/30 dark:border-gray-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400 dark:text-blue-300" />
            <div>
              <h3 className="text-base font-semibold text-white dark:text-gray-100">
                AI Progression Analysis
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Model: {analysis.modelVersion} • {analysis.processingTimeMs}ms
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-100 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Main Result */}
      <div className="p-4 space-y-4">
        {/* Progression Status */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${getSignificanceColor(analysis.clinicalSignificance)}`}>
          {analysis.progressionDetected ? (
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold capitalize">
              {analysis.progressionDetected ? `${analysis.clinicalSignificance} Progression Detected` : 'No Significant Progression'}
            </p>
            <p className="text-xs opacity-80">
              {analysis.progressionDetected
                ? `${regions.length} region${regions.length !== 1 ? 's' : ''} affected`
                : 'Retinal structure remains stable'}
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        {getConfidenceMeter(analysis.confidenceScore)}

        {/* Key Metrics */}
        {analysis.progressionDetected && metrics && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/30 dark:bg-gray-800/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Area Changed</p>
              <p className="text-lg font-semibold text-white dark:text-gray-100">
                {metrics.TotalAreaChangedPixels || 0} px
              </p>
            </div>
            <div className="bg-gray-700/30 dark:bg-gray-800/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Severity Score</p>
              <p className="text-lg font-semibold text-white dark:text-gray-100">
                {metrics.SeverityScore?.toFixed(1) || 0}/100
              </p>
            </div>
          </div>
        )}

        {/* Detected Regions (Details) */}
        {showDetails && regions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white dark:text-gray-100">Detected Regions</h4>
            {regions.map((region, idx) => (
              <div
                key={idx}
                className="bg-gray-700/30 dark:bg-gray-800/30 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white dark:text-gray-100">
                    {region.regionName}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {Math.round(region.confidence * 100)}% confident
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-gray-600/50 dark:bg-gray-700/50 rounded text-gray-300 dark:text-gray-400">
                    {region.changeType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {region.areaChangePixels} px changed
                  </span>
                </div>
                {/* Confidence bar */}
                <div className="h-1 bg-gray-600 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 dark:bg-blue-400 transition-all"
                    style={{ width: `${region.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-700/30 dark:border-gray-800/40">
          <Clock className="w-3.5 h-3.5" />
          <span>Analyzed {new Date(analysis.analyzedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Re-analyze button */}
      <div className="p-3 bg-gray-700/30 dark:bg-gray-800/30 border-t border-gray-700/30 dark:border-gray-800/40">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 disabled:bg-gray-800 dark:disabled:bg-gray-900 disabled:cursor-not-allowed text-white dark:text-gray-100 text-sm rounded transition-colors"
        >
          Re-analyze with Latest Model
        </button>
      </div>
    </div>
  );
}
