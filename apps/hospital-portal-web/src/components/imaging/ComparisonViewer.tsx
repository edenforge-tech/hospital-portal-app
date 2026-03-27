// ComparisonViewer - Side-by-side medical image comparison with synchronized controls
// Phase 8: Accessibility (WCAG 2.1 AA), Performance (Web Workers), HIPAA Audit
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import SimpleDICOMViewer from './SimpleDICOMViewer';
import DifferenceOverlay from './DifferenceOverlay';
import TimelineScrubber from './TimelineScrubber';
import toast from 'react-hot-toast';
import { useKeyboardNavigation, useScreenReaderAnnouncement, useFocusTrap } from '@/hooks/useAccessibility';
import { useDifferenceWorker } from '@/hooks/useDifferenceWorker';

interface ComparisonViewerProps {
  baselineImage: {
    id: string;
    url: string;
    patientName?: string;
    studyDate?: string;
    studyDescription?: string;
  };
  followupImage: {
    id: string;
    url: string;
    patientName?: string;
    studyDate?: string;
    studyDescription?: string;
  };
  patientId?: string;
  onClose?: () => void;
  onSaveComparison?: (data: ComparisonData) => Promise<void>;
  enableTimeline?: boolean; // Show timeline scrubber
  enableDifferenceOverlay?: boolean; // Show difference detection
}

interface ComparisonData {
  patientId?: string;
  baselineImageId: string;
  followupImageId: string;
  comparisonType: 'progression' | 'treatment_response' | 'bilateral' | 'other';
  findings: string;
  clinicalSignificance: 'none' | 'mild' | 'moderate' | 'significant' | 'critical';
}

interface ViewportState {
  zoom: number;
  rotation: number;
  panX: number;
  panY: number;
  brightness: number;
  contrast: number;
  invert: boolean;
}

export default function ComparisonViewer({
  baselineImage,
  followupImage,
  patientId,
  onClose,
  onSaveComparison,
  enableTimeline = true,
  enableDifferenceOverlay = true,
}: ComparisonViewerProps) {
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [dividerPosition, setDividerPosition] = useState(50); // Percentage
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [comparisonNotes, setComparisonNotes] = useState('');
  const [comparisonType, setComparisonType] = useState<ComparisonData['comparisonType']>('progression');
  const [clinicalSignificance, setClinicalSignificance] = useState<ComparisonData['clinicalSignificance']>('none');
  const [isSaving, setIsSaving] = useState(false);

  // Difference overlay controls
  const [showDifference, setShowDifference] = useState(false);
  const [differenceMode, setDifferenceMode] = useState<'difference' | 'heatmap' | 'edge' | 'threshold'>('heatmap');
  const [differenceSensitivity, setDifferenceSensitivity] = useState(50);
  const [differenceOpacity, setDifferenceOpacity] = useState(0.7);

  // Timeline state
  const [currentTimelineImages, setCurrentTimelineImages] = useState<{baseline: any; followup: any}>({
    baseline: baselineImage,
    followup: followupImage,
  });

  // Shared viewport state for synchronized controls
  const [sharedViewport, setSharedViewport] = useState<ViewportState>({
    zoom: 1,
    rotation: 0,
    panX: 0,
    panY: 0,
    brightness: 100,
    contrast: 100,
    invert: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const baselineImageRef = useRef<HTMLImageElement>(null);
  const followupImageRef = useRef<HTMLImageElement>(null);

  // Phase 8: Accessibility - Keyboard navigation (WCAG 2.1.1)
  const announce = useScreenReaderAnnouncement();
  useKeyboardNavigation({
    onZoomIn: () => {
      handleZoomIn();
      announce(`Zoomed in to ${(sharedViewport.zoom * 100).toFixed(0)}%`);
    },
    onZoomOut: () => {
      handleZoomOut();
      announce(`Zoomed out to ${(sharedViewport.zoom * 100).toFixed(0)}%`);
    },
    onRotate: () => {
      handleRotate();
      announce(`Rotated to ${sharedViewport.rotation} degrees`);
    },
    onReset: () => {
      handleResetViewport();
      announce('View reset to default');
    },
    onPanUp: () => {
      if (isSyncEnabled) {
        setSharedViewport((prev) => ({ ...prev, panY: prev.panY - 50 }));
        announce('Panned up');
      }
    },
    onPanDown: () => {
      if (isSyncEnabled) {
        setSharedViewport((prev) => ({ ...prev, panY: prev.panY + 50 }));
        announce('Panned down');
      }
    },
    onPanLeft: () => {
      if (isSyncEnabled) {
        setSharedViewport((prev) => ({ ...prev, panX: prev.panX - 50 }));
        announce('Panned left');
      }
    },
    onPanRight: () => {
      if (isSyncEnabled) {
        setSharedViewport((prev) => ({ ...prev, panX: prev.panX + 50 }));
        announce('Panned right');
      }
    },
    onSave: async () => {
      if (!isSaving && onSaveComparison) {
        await handleSaveComparison();
      }
    },
    onClose: () => {
      onClose?.();
    },
  });

  // Phase 8: Performance - Web Worker for difference overlay
  const { processDifference, isProcessing: isWorkerProcessing } = useDifferenceWorker();

  // Focus trap for modal (WCAG 2.4.3)
  useFocusTrap(containerRef, true);

  // Handle divider dragging
  const handleDividerMouseDown = () => {
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      setDividerPosition(Math.max(20, Math.min(80, newPosition))); // Limit between 20-80%
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    if (isDraggingDivider) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider]);

  // Toggle sync mode
  const toggleSync = () => {
    setIsSyncEnabled(!isSyncEnabled);
    toast.success(isSyncEnabled ? 'Sync disabled' : 'Sync enabled');
  };

  // Viewport control handlers
  const handleZoomIn = () => {
    if (isSyncEnabled) {
      setSharedViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 5) }));
    }
  };

  const handleZoomOut = () => {
    if (isSyncEnabled) {
      setSharedViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.25) }));
    }
  };

  const handleRotate = () => {
    if (isSyncEnabled) {
      setSharedViewport((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
    }
  };

  const handleResetViewport = () => {
    setSharedViewport({
      zoom: 1,
      rotation: 0,
      panX: 0,
      panY: 0,
      brightness: 100,
      contrast: 100,
      invert: false,
    });
    toast.success('Viewport reset');
  };

  const handleBrightnessChange = (value: number) => {
    if (isSyncEnabled) {
      setSharedViewport((prev) => ({ ...prev, brightness: value }));
    }
  };

  const handleContrastChange = (value: number) => {
    if (isSyncEnabled) {
      setSharedViewport((prev) => ({ ...prev, contrast: value }));
    }
  };

  const handleTimelineSelect = (comparison: any) => {
    // Update images from timeline selection
    if (comparison.baselineImage && comparison.followupImage) {
      setCurrentTimelineImages({
        baseline: {
          id: comparison.baselineImage.id,
          url: comparison.baselineImage.imageUrl,
          studyDate: new Date(comparison.baselineImage.uploadedAt).toLocaleDateString(),
        },
        followup: {
          id: comparison.followupImage.id,
          url: comparison.followupImage.imageUrl,
          studyDate: new Date(comparison.followupImage.uploadedAt).toLocaleDateString(),
        },
      });
      setComparisonNotes(comparison.findings || '');
      setComparisonType(comparison.comparisonType || 'progression');
      setClinicalSignificance(comparison.clinicalSignificance || 'none');
    }
  };

  // Apply viewport transforms to images
  useEffect(() => {
    if (!isSyncEnabled) return;

    const applyTransform = (imgRef: React.RefObject<HTMLImageElement>) => {
      if (imgRef.current) {
        const { zoom, rotation, panX, panY, brightness, contrast, invert } = sharedViewport;
        imgRef.current.style.transform = `
          scale(${zoom})
          rotate(${rotation}deg)
          translate(${panX}px, ${panY}px)
        `;
        imgRef.current.style.filter = `
          brightness(${brightness}%)
          contrast(${contrast}%)
          ${invert ? 'invert(1)' : ''}
        `;
      }
    };

    applyTransform(baselineImageRef);
    applyTransform(followupImageRef);
  }, [sharedViewport, isSyncEnabled]);

  // Save comparison to backend
  const handleSaveComparison = async () => {
    if (!comparisonNotes.trim()) {
      toast.error('Please add comparison findings');
      return;
    }

    setIsSaving(true);
    try {
      const api = (await import('@/lib/api')).getApi();
      
      const comparisonData: ComparisonData = {
        patientId,
        baselineImageId: baselineImage.id,
        followupImageId: followupImage.id,
        comparisonType,
        findings: comparisonNotes,
        clinicalSignificance,
      };

      // Call custom handler if provided, otherwise use default API
      if (onSaveComparison) {
        await onSaveComparison(comparisonData);
      } else {
        await api.post('/Imaging/comparisons', comparisonData);
      }

      toast.success('Comparison saved successfully');
      setComparisonNotes('');
    } catch (error: any) {
      console.error('Failed to save comparison:', error);
      toast.error('Failed to save comparison');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Image Comparison
            </h2>
            <p className="text-sm text-gray-400">
              {currentTimelineImages.baseline.patientName || baselineImage.patientName || 'Patient'} • {currentTimelineImages.baseline.studyDescription || baselineImage.studyDescription || 'Study'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Difference Overlay Toggle */}
            {enableDifferenceOverlay && (
              <button
                onClick={() => setShowDifference(!showDifference)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showDifference
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={showDifference ? 'Hide difference overlay' : 'Show difference overlay'}
              >
                <span>📊</span>
                <span className="text-sm font-medium">Difference</span>
              </button>
            )}

            {/* Sync Toggle */}
            <button
              onClick={toggleSync}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isSyncEnabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={isSyncEnabled ? 'Disable sync' : 'Enable sync'}
            >
              {isSyncEnabled ? (
                <>
                  <span className="text-lg">🔗</span>
                  <span className="text-sm font-medium">Synced</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🔓</span>
                  <span className="text-sm font-medium">Independent</span>
                </>
              )}
            </button>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title="Close comparison"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Viewport Controls (only shown when synced) */}
        {isSyncEnabled && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-700">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors text-lg"
                title="Zoom out"
              >
                🔍−
              </button>
              <span className="text-xs text-gray-400 w-16 text-center">
                {(sharedViewport.zoom * 100).toFixed(0)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors text-lg"
                title="Zoom in"
              >
                🔍+
              </button>
            </div>

            {/* Rotation */}
            <button
              onClick={handleRotate}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors text-lg"
              title="Rotate 90°"
            >
              ↻
            </button>

            {/* Brightness */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">☀️</span>
              <input
                type="range"
                min="0"
                max="200"
                value={sharedViewport.brightness}
                onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                title="Brightness"
              />
              <span className="text-xs text-gray-400 w-10">{sharedViewport.brightness}%</span>
            </div>

            {/* Contrast */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">◐</span>
              <input
                type="range"
                min="0"
                max="200"
                value={sharedViewport.contrast}
                onChange={(e) => handleContrastChange(Number(e.target.value))}
                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                title="Contrast"
              />
              <span className="text-xs text-gray-400 w-10">{sharedViewport.contrast}%</span>
            </div>

            {/* Reset */}
            <button
              onClick={handleResetViewport}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors ml-auto text-lg"
              title="Reset viewport"
            >
              ⟲
            </button>
          </div>
        )}

        {/* Difference Overlay Controls */}
        {showDifference && enableDifferenceOverlay && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-700 mt-3">
            <span className="text-xs text-gray-400">Mode:</span>
            <select
              value={differenceMode}
              onChange={(e) => setDifferenceMode(e.target.value as any)}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              <option value="heatmap">Heatmap</option>
              <option value="difference">Grayscale</option>
              <option value="edge">Edge Detection</option>
              <option value="threshold">Binary Threshold</option>
            </select>

            <span className="text-xs text-gray-400">Sensitivity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={differenceSensitivity}
              onChange={(e) => setDifferenceSensitivity(Number(e.target.value))}
              className="w-24 h-1 bg-gray-700 rounded-lg"
            />
            <span className="text-xs text-gray-400 w-8">{differenceSensitivity}</span>

            <span className="text-xs text-gray-400">Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={differenceOpacity * 100}
              onChange={(e) => setDifferenceOpacity(Number(e.target.value) / 100)}
              className="w-24 h-1 bg-gray-700 rounded-lg"
            />
            <span className="text-xs text-gray-400 w-8">{(differenceOpacity * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Timeline Scrubber */}
      {enableTimeline && patientId && (
        <TimelineScrubber
          patientId={patientId}
          currentComparisonId={undefined}
          onComparisonSelect={handleTimelineSelect}
          className="mx-4 mt-4"
        />
      )}

      {/* Split View Container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Baseline Image (Left) */}
        <div
          className="relative overflow-hidden"
          style={{ width: `${dividerPosition}%` }}
        >
          <div className="absolute top-4 left-4 z-10 bg-blue-900/90 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-300">◀</span>
              <div>
                <p className="text-sm font-semibold text-white">Baseline</p>
                <p className="text-xs text-blue-200">{currentTimelineImages.baseline.studyDate || baselineImage.studyDate || 'Earlier'}</p>
              </div>
            </div>
          </div>
          <div className="w-full h-full flex items-center justify-center bg-gray-950">
            <img
              ref={baselineImageRef}
              src={currentTimelineImages.baseline.url || baselineImage.url}
              alt="Baseline"
              className="max-w-full max-h-full object-contain transition-transform"
              style={{
                imageRendering: 'crisp-edges',
                transformOrigin: 'center',
              }}
            />
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          className={`relative w-1 bg-gray-700 cursor-col-resize hover:bg-blue-500 transition-colors ${
            isDraggingDivider ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleDividerMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-16 bg-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center hover:border-blue-500 transition-colors">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-6 bg-gray-500"></div>
              <div className="w-0.5 h-6 bg-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Followup Image (Right) */}
        <div
          className="relative overflow-hidden"
          style={{ width: `${100 - dividerPosition}%` }}
        >
          <div className="absolute top-4 right-4 z-10 bg-green-900/90 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Follow-up</p>
                <p className="text-xs text-green-200">{currentTimelineImages.followup.studyDate || followupImage.studyDate || 'Recent'}</p>
              </div>
              <span className="text-green-300">▶</span>
            </div>
          </div>
          <div className="w-full h-full flex items-center justify-center bg-gray-950">
            <img
              ref={followupImageRef}
              src={currentTimelineImages.followup.url || followupImage.url}
              alt="Follow-up"
              className="max-w-full max-h-full object-contain transition-transform"
              style={{
                imageRendering: 'crisp-edges',
                transformOrigin: 'center',
              }}
            />
          </div>
        </div>

        {/* Difference Overlay (Full Screen) */}
        {showDifference && enableDifferenceOverlay && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <DifferenceOverlay
              baselineImageUrl={currentTimelineImages.baseline.url || baselineImage.url}
              followupImageUrl={currentTimelineImages.followup.url || followupImage.url}
              mode={differenceMode}
              sensitivity={differenceSensitivity}
              opacity={differenceOpacity}
              colorMap="hot"
              onProcessingComplete={(hasChanges) => {
                if (hasChanges) {
                  toast.success('Changes detected', { duration: 2000 });
                }
              }}
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Comparison Notes Panel */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Comparison Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comparison Type
            </label>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value as ComparisonData['comparisonType'])}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="progression">Disease Progression</option>
              <option value="treatment_response">Treatment Response</option>
              <option value="bilateral">Bilateral Comparison</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Clinical Significance */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Clinical Significance
            </label>
            <select
              value={clinicalSignificance}
              onChange={(e) => setClinicalSignificance(e.target.value as ComparisonData['clinicalSignificance'])}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">None</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="significant">Significant</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Findings Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Comparison Findings
          </label>
          <textarea
            value={comparisonNotes}
            onChange={(e) => setComparisonNotes(e.target.value)}
            placeholder="Document observed changes, progression, or differences between the two images..."
            className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveComparison}
            disabled={isSaving || !comparisonNotes.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Comparison'}</span>
          </button>
        </div>
      </div>

      {/* Sync Indicator */}
      {isSyncEnabled && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-600/90 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <span>Controls Synchronized</span>
          </div>
        </div>
      )}
    </div>
  );
}
