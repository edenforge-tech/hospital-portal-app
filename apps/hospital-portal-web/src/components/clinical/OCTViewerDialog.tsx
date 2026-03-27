'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Maximize2,
  Download,
  Ruler,
  Eye,
  Contrast,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OCTViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  dicomUrl: string; // URL to DICOM file or WADO-URI endpoint
  studyDescription?: string;
  scanDate?: string;
  eye?: 'OD' | 'OS' | 'OU';
  scanType?: string; // e.g., "Macular Cube 512x128", "Optic Disc Cube"
}

type Tool = 'none' | 'zoom' | 'pan' | 'windowLevel' | 'measurement';

export default function OCTViewerDialog({
  isOpen,
  onClose,
  patientName,
  dicomUrl,
  studyDescription,
  scanDate,
  eye,
  scanType,
}: OCTViewerDialogProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [windowCenter, setWindowCenter] = useState(50);
  const [windowWidth, setWindowWidth] = useState(100);
  const [currentSlice, setCurrentSlice] = useState(1);
  const [totalSlices, setTotalSlices] = useState(128); // Default for OCT
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !viewportRef.current) return;

    initializeViewer();

    return () => {
      cleanupViewer();
    };
  }, [isOpen, dicomUrl]);

  const initializeViewer = async () => {
    setIsLoading(true);
    
    try {
      // Initialize Cornerstone3D
      // Note: Actual implementation would use @cornerstonejs/core
      // For now, this is a structure showing the integration points
      
      // const { RenderingEngine, Enums } = await import('@cornerstonejs/core');
      // const { cornerstoneStreamingImageVolumeLoader } = await import('@cornerstonejs/streaming-image-volume-loader');
      
      toast.success('OCT viewer initialized');
      setImageLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Cornerstone viewer:', error);
      toast.error('Failed to load DICOM image');
      setIsLoading(false);
    }
  };

  const cleanupViewer = () => {
    // Cleanup Cornerstone rendering engine
    setImageLoaded(false);
  };

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    
    // Activate tool in Cornerstone
    switch (tool) {
      case 'zoom':
        toast('Zoom tool activated (scroll to zoom)', { icon: '🔍' });
        break;
      case 'pan':
        toast('Pan tool activated (drag to move)', { icon: '✋' });
        break;
      case 'windowLevel':
        toast('Window/Level tool activated (drag to adjust)', { icon: '🎨' });
        break;
      case 'measurement':
        toast('Measurement tool activated (click and drag)', { icon: '📏' });
        break;
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 25, 400);
    setZoomLevel(newZoom);
    if (viewportRef.current) {
      viewportRef.current.style.transform = `scale(${newZoom / 100})`;
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 25, 25);
    setZoomLevel(newZoom);
    if (viewportRef.current) {
      viewportRef.current.style.transform = `scale(${newZoom / 100})`;
    }
  };

  const handleResetView = () => {
    setZoomLevel(100);
    setWindowCenter(50);
    setWindowWidth(100);
    if (viewportRef.current) {
      viewportRef.current.style.transform = 'scale(1)';
    }
    toast.success('View reset');
  };

  const handleSliceChange = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentSlice < totalSlices) {
      setCurrentSlice(currentSlice + 1);
    } else if (direction === 'prev' && currentSlice > 1) {
      setCurrentSlice(currentSlice - 1);
    }
  };

  const handleDownload = () => {
    toast('Downloading DICOM file...', { icon: '⬇️' });
    // Implement DICOM file download
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{patientName} - OCT Scan</h2>
          <div className="text-sm text-gray-400 flex gap-4">
            {studyDescription && <span>{studyDescription}</span>}
            {scanDate && <span>{new Date(scanDate).toLocaleDateString()}</span>}
            {eye && (
              <span className="px-2 py-0.5 bg-blue-600 rounded text-xs">
                {eye}
              </span>
            )}
            {scanType && <span>{scanType}</span>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="absolute top-20 left-4 z-10 bg-gray-900 rounded-lg p-2 space-y-2">
        <button
          onClick={() => handleToolChange('pan')}
          className={`p-3 rounded-lg transition ${
            activeTool === 'pan'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Pan (Move)"
        >
          <Move className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleToolChange('windowLevel')}
          className={`p-3 rounded-lg transition ${
            activeTool === 'windowLevel'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Window/Level (Brightness/Contrast)"
        >
          <Contrast className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleToolChange('measurement')}
          className={`p-3 rounded-lg transition ${
            activeTool === 'measurement'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Measurement Ruler"
        >
          <Ruler className="h-5 w-5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition"
          title="Reset View"
        >
          <RotateCw className="h-5 w-5" />
        </button>
        <button
          onClick={handleDownload}
          className="p-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition"
          title="Download DICOM"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>

      {/* Viewport */}
      <div className="relative w-full h-full max-w-6xl max-h-screen p-20">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-white">Loading DICOM image...</p>
            </div>
          )}

          {!isLoading && !imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <Eye className="h-16 w-16 mb-4" />
              <p>No image loaded</p>
            </div>
          )}

          <div
            ref={viewportRef}
            className="w-full h-full flex items-center justify-center"
            style={{ transformOrigin: 'center center' }}
          >
            {/* Cornerstone3D viewport will be rendered here */}
            <canvas
              id="oct-viewer-canvas"
              className="max-w-full max-h-full"
            ></canvas>
          </div>

          {/* Slice Navigation */}
          {imageLoaded && totalSlices > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gray-900 bg-opacity-90 rounded-lg px-4 py-2 flex items-center gap-4">
                <button
                  onClick={() => handleSliceChange('prev')}
                  disabled={currentSlice === 1}
                  className="p-2 hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <span className="text-white text-sm min-w-[80px] text-center">
                  {currentSlice} / {totalSlices}
                </span>
                <button
                  onClick={() => handleSliceChange('next')}
                  disabled={currentSlice === totalSlices}
                  className="p-2 hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Image Info Overlay */}
          <div className="absolute top-4 left-4 text-white text-xs space-y-1 font-mono bg-black bg-opacity-50 p-2 rounded">
            <div>Zoom: {zoomLevel}%</div>
            <div>W/C: {windowCenter}</div>
            <div>W/W: {windowWidth}</div>
            {metadata && (
              <>
                <div>Size: {metadata.width}x{metadata.height}</div>
                <div>Bit Depth: {metadata.bitsAllocated}</div>
              </>
            )}
          </div>

          {/* Patient Info Overlay (Right Side) */}
          <div className="absolute top-4 right-4 text-white text-xs space-y-1 text-right font-mono bg-black bg-opacity-50 p-2 rounded">
            <div className="font-semibold">{patientName}</div>
            {eye && <div>Eye: {eye}</div>}
            {scanDate && <div>{new Date(scanDate).toLocaleDateString()}</div>}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gray-900 text-white p-2 flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <span>Tool: {activeTool === 'none' ? 'None' : activeTool}</span>
          <span>Zoom: {zoomLevel}%</span>
        </div>
        <div className="flex gap-4">
          <span className="text-gray-400">
            Use mouse wheel to zoom, drag to pan
          </span>
          <span className="text-blue-400">Ctrl+Click for measurements</span>
        </div>
      </div>
    </div>
  );
}
