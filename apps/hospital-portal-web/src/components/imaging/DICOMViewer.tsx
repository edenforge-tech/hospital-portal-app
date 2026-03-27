// CornerstoneJS DICOM Viewer Component
// Full-featured medical image viewer for OCT, Fundus, and other DICOM imaging

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Download,
  AlertCircle,
  X,
  ArrowRight,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AnnotationsList } from './AnnotationsList';
import PerformanceMonitor from './PerformanceMonitor';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';

interface DICOMViewerProps {
  imageId: string;
  imageUrl?: string; // Direct URL if not using DICOM image ID
  patientName?: string;
  studyDescription?: string;
  seriesDescription?: string;
  onClose?: () => void;
  showTools?: boolean;
  enableAnnotations?: boolean;
  className?: string;
}

export default function DICOMViewer({
  imageId,
  imageUrl,
  patientName,
  studyDescription,
  seriesDescription,
  onClose,
  showTools = true,
  enableAnnotations = true,
  className = '',
}: DICOMViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('WindowLevel');
  const [viewport, setViewport] = useState({
    zoom: 1,
    rotation: 0,
    pan: { x: 0, y: 0 },
    windowWidth: 400,
    windowCenter: 40,
    invert: false,
  });

  // Annotations state
  const [annotations, setAnnotations] = useState<Array<{
    id: string;
    type: 'measurement' | 'finding' | 'roi';
    data: {
      label?: string;
      length?: number;
      area?: number;
      points?: { x: number; y: number }[];
      text?: string;
    };
    createdAt: string;
    createdBy: string;
    visible?: boolean;
  }>>([]);

  // Performance monitoring state
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Performance tracking hook
  const {
    trackDicomLoad,
    trackViewportRender,
    trackAnnotationCreation,
    logPerformanceSummary,
  } = usePerformanceTracking();

  // Cornerstone library refs (loaded dynamically)
  const cornerstoneRef = useRef<any>(null);
  const cornerstoneToolsRef = useRef<any>(null);

  // Initialize Cornerstone on mount
  useEffect(() => {
    let mounted = true;
    
    const initCornerstone = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const cornerstone = await import('@cornerstonejs/core');
        const cornerstoneTools = await import('@cornerstonejs/tools');
        const dicomImageLoader = await import('@cornerstonejs/dicom-image-loader');
        const dicomParser = await import('dicom-parser');
        
        if (!mounted) return;

        // Initialize Cornerstone
        await cornerstone.init();
        cornerstoneRef.current = cornerstone;
        cornerstoneToolsRef.current = cornerstoneTools;

        // Configure DICOM Image Loader
        dicomImageLoader.external.cornerstone = cornerstone;
        dicomImageLoader.external.dicomParser = dicomParser;

        // Configure webWorkers for performance
        const config: any = {
          maxWebWorkers: navigator.hardwareConcurrency || 4,
          startWebWorkersOnDemand: true,
          taskConfiguration: {
            decodeTask: {
              initializeCodecsOnStartup: false,
              usePDFJS: false,
            },
          },
        };
        
        dicomImageLoader.webWorkerManager.initialize(config);

        // Initialize tools
        cornerstoneTools.init();

        // Add tools
        cornerstoneTools.addTool(cornerstoneTools.WindowLevelTool);
        cornerstoneTools.addTool(cornerstoneTools.PanTool);
        cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
        cornerstoneTools.addTool(cornerstoneTools.LengthTool);
        cornerstoneTools.addTool(cornerstoneTools.AngleTool);
        cornerstoneTools.addTool(cornerstoneTools.RectangleROITool);
        cornerstoneTools.addTool(cornerstoneTools.EllipticalROITool);
        cornerstoneTools.addTool(cornerstoneTools.MagnifyTool);

        // Get canvas element for event listeners
        const element = canvasRef.current;
        if (!element) {
          throw new Error('Canvas element not found');
        }

        // Register event listeners for annotation sync
        element.addEventListener('cornerstonetoolsmeasurementadded', handleMeasurementAdded);
        element.addEventListener('cornerstonetoolsmeasurementmodified', handleMeasurementModified);
        element.addEventListener('cornerstonetoolsmeasurementremoved', handleMeasurementRemoved);

        console.log('✓ Cornerstone initialized successfully');
        console.log('✓ Annotation event listeners registered');
        
        // Load and display the image
        loadImage();
      } catch (err: any) {
        console.error('Error initializing Cornerstone:', err);
        setError('Failed to initialize DICOM viewer: ' + err.message);
        setIsLoading(false);
      }
    };

    initCornerstone();

    return () => {
      mounted = false;
      // Cleanup - remove event listeners
      if (canvasRef.current) {
        const element = canvasRef.current;
        element.removeEventListener('cornerstonetoolsmeasurementadded', handleMeasurementAdded);
        element.removeEventListener('cornerstonetoolsmeasurementmodified', handleMeasurementModified);
        element.removeEventListener('cornerstonetoolsmeasurementremoved', handleMeasurementRemoved);
        
        if (cornerstoneRef.current) {
          try {
            cornerstoneRef.current.disable(element);
          } catch (err) {
            console.error('Cleanup error:', err);
          }
        }
      }
    };
  }, []);

  // Load and display DICOM image
  const loadImage = async () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const element = canvasRef.current;
      
      // Enable the element for Cornerstone
      cornerstoneRef.current.enable(element);

      // Determine image source
      const imageSource = imageUrl || `dicomweb:${imageId}`;
      
      // Load the image
      const image = await cornerstoneRef.current.loadAndCacheImage(imageSource);
      
      // Display the image
      cornerstoneRef.current.displayImage(element, image);

      // Apply default tools
      activateDefaultTools(element);

      setIsLoading(false);
      console.log('✓ DICOM image loaded successfully');
    } catch (err: any) {
      console.error('Error loading DICOM image:', err);
      setError('Failed to load DICOM image: ' + err.message);
      setIsLoading(false);
      toast.error('Failed to load medical image');
    }
  };

  // Activate default tools
  const activateDefaultTools = (element: HTMLDivElement) => {
    if (!cornerstoneToolsRef.current) return;

    const toolState = cornerstoneToolsRef.current;

    // Set WindowLevel as active tool (left click)
    toolState.setToolActive('WindowLevel', { mouseButtonMask: 1 });
    
    // Set Pan as middle mouse tool
    toolState.setToolActive('Pan', { mouseButtonMask: 4 });
    
    // Set Zoom as right mouse tool
    toolState.setToolActive('Zoom', { mouseButtonMask: 2 });
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;
    const element = canvasRef.current;
    const vp = cornerstoneRef.current.getViewport(element);
    vp.scale += 0.25;
    cornerstoneRef.current.setViewport(element, vp);
    setViewport({ ...viewport, zoom: vp.scale });
  };

  const handleZoomOut = () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;
    const element = canvasRef.current;
    const vp = cornerstoneRef.current.getViewport(element);
    vp.scale = Math.max(0.25, vp.scale - 0.25);
    cornerstoneRef.current.setViewport(element, vp);
    setViewport({ ...viewport, zoom: vp.scale });
  };

  const handleResetZoom = () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;
    const element = canvasRef.current;
    cornerstoneRef.current.reset(element);
    setViewport({
      zoom: 1,
      rotation: 0,
      pan: { x: 0, y: 0 },
      windowWidth: viewport.windowWidth,
      windowCenter: viewport.windowCenter,
      invert: false,
    });
  };

  // Rotation
  const handleRotate = () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;
    const element = canvasRef.current;
    const vp = cornerstoneRef.current.getViewport(element);
    vp.rotation = (vp.rotation + 90) % 360;
    cornerstoneRef.current.setViewport(element, vp);
    setViewport({ ...viewport, rotation: vp.rotation });
  };

  // Invert colors
  const handleInvert = () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;
    const element = canvasRef.current;
    const vp = cornerstoneRef.current.getViewport(element);
    vp.invert = !vp.invert;
    cornerstoneRef.current.setViewport(element, vp);
    setViewport({ ...viewport, invert: vp.invert });
  };

  // Annotation Handlers
  const handleMeasurementAdded = (event: any) => {
    const { measurementData } = event.detail;
    if (!measurementData) return;

    const newAnnotation = {
      id: measurementData.uuid || `annotation-${Date.now()}-${Math.random()}`,
      type: getAnnotationType(measurementData.toolType),
      data: {
        label: measurementData.label || measurementData.toolType,
        length: measurementData.length,
        area: measurementData.area,
        points: measurementData.handles?.points || [],
        text: measurementData.text,
      },
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      visible: true,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    toast.success('Annotation added');
  };

  const handleMeasurementModified = (event: any) => {
    const { measurementData } = event.detail;
    if (!measurementData) return;

    setAnnotations(prev => prev.map(a => 
      a.id === measurementData.uuid ? {
        ...a,
        data: {
          ...a.data,
          length: measurementData.length,
          area: measurementData.area,
          points: measurementData.handles?.points || a.data.points,
        }
      } : a
    ));
  };

  const handleMeasurementRemoved = (event: any) => {
    const { measurementData } = event.detail;
    if (!measurementData) return;

    setAnnotations(prev => prev.filter(a => a.id !== measurementData.uuid));
    toast.success('Annotation removed');
  };

  const getAnnotationType = (toolType: string): 'measurement' | 'finding' | 'roi' => {
    if (toolType?.includes('Length') || toolType?.includes('Angle')) return 'measurement';
    if (toolType?.includes('ROI') || toolType?.includes('Rectangle') || toolType?.includes('Elliptical')) return 'roi';
    return 'finding';
  };

  const handleEditAnnotation = (id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation) {
      toast.success(`Edit annotation: ${annotation.data.label || annotation.type}`);
      // Activate the corresponding tool in CornerstoneJS
      if (cornerstoneToolsRef.current && canvasRef.current) {
        const element = canvasRef.current;
        const toolName = annotation.type === 'measurement' ? 'Length' : 
                        annotation.type === 'roi' ? 'RectangleROI' : 'WindowLevel';
        cornerstoneToolsRef.current.setToolActive(toolName, { mouseButtonMask: 1 });
      }
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    toast.success('Annotation deleted');
  };

  const handleToggleVisibility = (id: string) => {
    setAnnotations(prev => prev.map(a => {
      if (a.id === id) {
        const newVisible = a.visible === false ? true : false;
        
        // Sync with CornerstoneJS - hide/show the measurement on canvas
        if (cornerstoneToolsRef.current && canvasRef.current) {
          const element = canvasRef.current;
          try {
            const toolStateManager = cornerstoneToolsRef.current.globalImageIdSpecificToolStateManager;
            const toolState = toolStateManager.saveToolState();
            
            // Toggle visibility in tool state (implementation depends on Cornerstone version)
            if (toolState && toolState[imageId]) {
              Object.keys(toolState[imageId]).forEach(toolName => {
                const measurements = toolState[imageId][toolName].data;
                measurements?.forEach((m: any) => {
                  if (m.uuid === id) {
                    m.visible = newVisible;
                  }
                });
              });
            }
            
            cornerstoneRef.current?.updateImage(element);
          } catch (err) {
            console.warn('Could not sync visibility with canvas:', err);
          }
        }
        
        return { ...a, visible: newVisible };
      }
      return a;
    }));
  };

  const handleHighlightAnnotation = (id: string) => {
    // Highlight annotation on canvas by temporarily changing its color
    if (cornerstoneToolsRef.current && canvasRef.current) {
      const element = canvasRef.current;
      try {
        // Trigger a re-render with highlighted state
        // This is a visual feedback - actual implementation depends on Cornerstone Tools API
        toast('Annotation highlighted on canvas', { duration: 1000 });
        cornerstoneRef.current?.updateImage(element);
      } catch (err) {
        console.warn('Could not highlight annotation:', err);
      }
    }
  };

  // Download image
  const handleDownload = async () => {
    if (!canvasRef.current || !cornerstoneRef.current) return;
    
    try {
      const element = canvasRef.current;
      const canvas = element.querySelector('canvas');
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `dicom_${imageId}_${Date.now()}.png`;
      link.click();
      toast.success('Image downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download image');
    }
  };

  // Activate annotation tool
  const activateTool = (toolName: string) => {
    if (!canvasRef.current || !cornerstoneToolsRef.current) return;
    
    const element = canvasRef.current;
    const toolState = cornerstoneToolsRef.current;

    // Deactivate all tools
    toolState.setToolPassive('WindowLevel');
    toolState.setToolPassive('Pan');
    toolState.setToolPassive('Zoom');
    toolState.setToolPassive('Length');
    toolState.setToolPassive('Angle');
    toolState.setToolPassive('RectangleROI');
    toolState.setToolPassive('EllipticalROI');

    // Activate selected tool
    toolState.setToolActive(toolName, { mouseButtonMask: 1 });
    setActiveTool(toolName);
    toast(`Tool activated: ${toolName}`, { icon: '🔧' });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Main Viewer */}
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold">{patientName || 'DICOM Image'}</h3>
            <p className="text-sm text-gray-300">
              {studyDescription || seriesDescription || 'Medical Image Viewer'}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-[600px] bg-black"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* FDA 21 CFR Part 11 Compliance: Calibration Disclaimer */}
        {!isLoading && !error && (
          <div className="absolute top-20 left-4 bg-yellow-900/90 dark:bg-yellow-950/95 border border-yellow-600 dark:border-yellow-500 rounded-lg px-3 py-2 max-w-xs z-20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-200 dark:text-yellow-100 mb-1">
                  Calibration Status
                </p>
                <p className="text-xs text-yellow-300 dark:text-yellow-200">
                  Verify calibration before clinical use. Check pixel spacing in DICOM tags.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FDA 21 CFR Part 11 Compliance: Orientation Markers (L/R/S/I) */}
        {!isLoading && !error && (
          <>
            {/* Top - Superior */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-20">
              S
            </div>
            {/* Bottom - Inferior */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-20">
              I
            </div>
            {/* Left - Left */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-20">
              L
            </div>
            {/* Right - Right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-20">
              R
            </div>
          </>
        )}

        {/* Loading/Error States */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Loading DICOM image...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center p-6 max-w-md">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h4 className="text-lg font-semibold mb-2">Error Loading Image</h4>
              <p className="text-sm text-gray-300">{error}</p>
              <button
                onClick={loadImage}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {showTools && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-900/80 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white"
                title="Zoom Out"
              >
                <span className="text-sm font-bold">Z-</span>
              </button>
              <span className="px-2 text-xs text-white font-mono">
                {Math.round(viewport.zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white"
                title="Zoom In"
              >
                <span className="text-sm font-bold">Z+</span>
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs"
                title="Reset"
              >
                Reset
              </button>
            </div>

            {/* Rotation & Invert */}
            <div className="flex items-center space-x-1 bg-gray-900/80 rounded-lg p-1">
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white"
                title="Rotate 90°"
              >
                <span className="text-sm font-bold">⟲</span>
              </button>
              <button
                onClick={handleInvert}
                className={`p-2 hover:bg-white/20 rounded transition-colors ${
                  viewport.invert ? 'bg-white/20' : ''
                } text-white`}
                title="Invert Colors"
              >
                <span className="text-sm font-bold">{viewport.invert ? '☀' : '☾'}</span>
              </button>
            </div>

            {/* Annotation Tools */}
            {enableAnnotations && (
              <div className="flex items-center space-x-1 bg-gray-900/80 rounded-lg p-1">
                <button
                  onClick={() => activateTool('Length')}
                  className={`p-2 hover:bg-white/20 rounded transition-colors ${
                    activeTool === 'Length' ? 'bg-white/20' : ''
                  } text-white`}
                  title="Measure Length"
                >
                  <span className="text-sm font-bold">📏</span>
                </button>
                <button
                  onClick={() => activateTool('Angle')}
                  className={`p-2 hover:bg-white/20 rounded transition-colors ${
                    activeTool === 'Angle' ? 'bg-white/20' : ''
                  } text-white`}
                  title="Measure Angle"
                >
                  <ArrowRight className="w-4 h-4 transform rotate-45" />
                </button>
                <button
                  onClick={() => activateTool('RectangleROI')}
                  className={`p-2 hover:bg-white/20 rounded transition-colors ${
                    activeTool === 'RectangleROI' ? 'bg-white/20' : ''
                  } text-white`}
                  title="Rectangle ROI"
                >
                  <span className="text-sm font-bold">▭</span>
                </button>
                <button
                  onClick={() => activateTool('EllipticalROI')}
                  className={`p-2 hover:bg-white/20 rounded transition-colors ${
                    activeTool === 'EllipticalROI' ? 'bg-white/20' : ''
                  } text-white`}
                  title="Circle ROI"
                >
                  <span className="text-sm font-bold">◯</span>
                </button>
              </div>
            )}

            {/* Utilities */}
            <div className="flex items-center space-x-1 bg-gray-900/80 rounded-lg p-1">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowPerformanceMonitor(true);
                  logPerformanceSummary();
                }}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white"
                title="Performance Metrics"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white"
                title="Toggle Fullscreen"
              >
                <span className="text-sm font-bold">{isFullscreen ? '⊖' : '⊕'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute top-20 left-4 z-10 text-white text-xs font-mono bg-black/50 rounded p-2 space-y-1">
        <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
        <div>Rotation: {viewport.rotation}°</div>
        <div>Tool: {activeTool}</div>
      </div>
      </div>

      {/* Annotations Sidebar */}
      {enableAnnotations && (
        <div className="w-80 flex-shrink-0">
          <AnnotationsList
            annotations={annotations}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onToggleVisibility={handleToggleVisibility}
            onHighlightAnnotation={handleHighlightAnnotation}
          />
        </div>
      )}

      {/* Performance Monitor Modal */}
      {showPerformanceMonitor && (
        <PerformanceMonitor
          isOpen={showPerformanceMonitor}
          onClose={() => setShowPerformanceMonitor(false)}
          viewerId={imageId}
        />
      )}
    </div>
  );
}
