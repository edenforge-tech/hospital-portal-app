/**
 * Performance Monitoring Component
 * Real-time metrics for DICOM file processing and viewer performance
 * Technologies: Performance API, Web Workers, Memory API
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Zap, TrendingUp, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PerformanceMetrics {
  dicom: {
    fileName: string;
    fileSize: number;
    loadTime: number;
    parseTime: number;
    renderTime: number;
  };
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  webWorkers: {
    count: number;
    tasksProcessed: number;
    avgProcessingTime: number;
  };
  viewport: {
    fps: number;
    renderCalls: number;
    avgRenderTime: number;
  };
}

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  viewerId?: string;
}

export default function PerformanceMonitor({
  isOpen,
  onClose,
  viewerId = 'default',
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    dicom: {
      fileName: '',
      fileSize: 0,
      loadTime: 0,
      parseTime: 0,
      renderTime: 0,
    },
    memory: {
      used: 0,
      limit: 0,
      percentage: 0,
    },
    webWorkers: {
      count: 0,
      tasksProcessed: 0,
      avgProcessingTime: 0,
    },
    viewport: {
      fps: 0,
      renderCalls: 0,
      avgRenderTime: 0,
    },
  });

  const [history, setHistory] = useState<Array<{ timestamp: number; metrics: PerformanceMetrics }>>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Collect performance metrics
  const collectMetrics = useCallback(() => {
    // Memory metrics (if available)
    const memoryMetrics = (performance as any).memory;
    const memoryData = memoryMetrics
      ? {
          used: memoryMetrics.usedJSHeapSize / 1024 / 1024, // MB
          limit: memoryMetrics.jsHeapSizeLimit / 1024 / 1024, // MB
          percentage: (memoryMetrics.usedJSHeapSize / memoryMetrics.jsHeapSizeLimit) * 100,
        }
      : { used: 0, limit: 0, percentage: 0 };

    // DICOM load metrics from Performance API
    const perfEntries = performance.getEntriesByType('resource');
    const dicomEntries = perfEntries.filter(
      (entry: any) => entry.name.includes('.dcm') || entry.name.includes('dicom')
    );

    const latestDicom = dicomEntries[dicomEntries.length - 1] as any;
    const dicomData = latestDicom
      ? {
          fileName: latestDicom.name.split('/').pop() || 'Unknown',
          fileSize: latestDicom.transferSize || 0,
          loadTime: latestDicom.duration || 0,
          parseTime: (latestDicom.responseEnd - latestDicom.responseStart) || 0,
          renderTime: (latestDicom.loadEventEnd - latestDicom.responseEnd) || 0,
        }
      : metrics.dicom;

    // Web Worker metrics (custom measurement)
    const workerMarks = performance.getEntriesByName('worker-process', 'measure');
    const workerData = workerMarks.length > 0
      ? {
          count: 4, // Default: 4 web workers for DICOM decoding
          tasksProcessed: workerMarks.length,
          avgProcessingTime: workerMarks.reduce((sum, mark: any) => sum + mark.duration, 0) / workerMarks.length,
        }
      : metrics.webWorkers;

    // Viewport FPS (custom measurement)
    const renderMarks = performance.getEntriesByName('viewport-render', 'measure');
    const renderData = renderMarks.length > 0
      ? {
          fps: Math.round(1000 / (renderMarks[renderMarks.length - 1] as any).duration),
          renderCalls: renderMarks.length,
          avgRenderTime: renderMarks.reduce((sum, mark: any) => sum + mark.duration, 0) / renderMarks.length,
        }
      : metrics.viewport;

    const newMetrics = {
      dicom: dicomData,
      memory: memoryData,
      webWorkers: workerData,
      viewport: renderData,
    };

    setMetrics(newMetrics);

    if (isRecording) {
      setHistory(prev => [...prev, { timestamp: Date.now(), metrics: newMetrics }]);
    }

    // Alert on high memory usage
    if (memoryData.percentage > 90) {
      toast.error('High memory usage detected! Consider closing unused tabs.');
    }
  }, [metrics, isRecording]);

  // Poll metrics every second
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(collectMetrics, 1000);
    return () => clearInterval(interval);
  }, [isOpen, collectMetrics]);

  // Export metrics to JSON
  const handleExport = () => {
    const data = {
      viewerId,
      recordingStart: history[0]?.timestamp || Date.now(),
      recordingEnd: history[history.length - 1]?.timestamp || Date.now(),
      duration: history.length > 0
        ? (history[history.length - 1].timestamp - history[0].timestamp) / 1000
        : 0,
      metrics: history,
      summary: {
        avgMemoryUsage: history.reduce((sum, h) => sum + h.metrics.memory.percentage, 0) / history.length,
        avgFPS: history.reduce((sum, h) => sum + h.metrics.viewport.fps, 0) / history.length,
        totalRenders: metrics.viewport.renderCalls,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Performance metrics exported');
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Format milliseconds
  const formatMs = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Performance Monitoring</h2>
              <p className="text-sm text-gray-400">Real-time metrics for DICOM viewer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* DICOM File Metrics */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>DICOM File Performance</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">File Name</div>
                <div className="text-sm text-white font-mono truncate">
                  {metrics.dicom.fileName || 'No file loaded'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">File Size</div>
                <div className="text-sm text-white font-mono">
                  {formatBytes(metrics.dicom.fileSize)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Load Time</div>
                <div className={`text-sm font-mono ${metrics.dicom.loadTime > 5000 ? 'text-red-400' : 'text-green-400'}`}>
                  {formatMs(metrics.dicom.loadTime)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Parse Time</div>
                <div className={`text-sm font-mono ${metrics.dicom.parseTime > 2000 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {formatMs(metrics.dicom.parseTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Memory Metrics */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Memory Usage</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Heap Used</span>
                <span className="text-white font-mono">{metrics.memory.used.toFixed(2)} MB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.memory.percentage > 90
                      ? 'bg-red-500'
                      : metrics.memory.percentage > 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Heap Limit</span>
                <span className="text-white font-mono">{metrics.memory.limit.toFixed(2)} MB</span>
              </div>
              {metrics.memory.percentage > 90 && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>High memory usage detected! Consider closing other applications.</span>
                </div>
              )}
            </div>
          </div>

          {/* Web Worker Metrics */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Web Worker Performance</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Active Workers</div>
                <div className="text-2xl text-white font-mono">{metrics.webWorkers.count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Tasks Processed</div>
                <div className="text-2xl text-white font-mono">{metrics.webWorkers.tasksProcessed}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Avg Processing</div>
                <div className="text-2xl text-white font-mono">
                  {formatMs(metrics.webWorkers.avgProcessingTime || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Viewport Metrics */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Viewport Rendering</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">FPS</div>
                <div className={`text-2xl font-mono ${
                  metrics.viewport.fps >= 30
                    ? 'text-green-400'
                    : metrics.viewport.fps >= 15
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {metrics.viewport.fps}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Render Calls</div>
                <div className="text-2xl text-white font-mono">{metrics.viewport.renderCalls}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Avg Render Time</div>
                <div className="text-2xl text-white font-mono">
                  {formatMs(metrics.viewport.avgRenderTime || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300">
                Performance Recording
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                {history.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Export Metrics
                  </button>
                )}
              </div>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording... {history.length} data points collected</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div>
              Metrics update every second • Viewer ID: {viewerId}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
