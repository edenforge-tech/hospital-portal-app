// Simplified DICOM/Medical Image Viewer with Annotations
// Lightweight viewer without CornerstoneJS dependencies

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SimpleDICOMViewerProps {
  imageId: string;
  imageUrl?: string;
  patientName?: string;
  studyDescription?: string;
  seriesDescription?: string;
  onClose?: () => void;
  showTools?: boolean;
  enableAnnotations?: boolean;
  className?: string;
}

interface Annotation {
  id: string;
  type: 'line' | 'angle' | 'rectangle' | 'ellipse' | 'arrow' | 'text' | 'freehand';
  coordinates: any;
  measurementValue?: number;
  measurementUnit?: string;
  textContent?: string;
  color?: string;
  lineWidth?: number;
  fontSize?: number;
}

interface Point {
  x: number;
  y: number;
}

export default function SimpleDICOMViewer({
  imageId,
  imageUrl,
  patientName,
  studyDescription,
  seriesDescription,
  onClose,
  showTools = true,
  enableAnnotations = true,
  className = '',
}: SimpleDICOMViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('Pan');
  
  // Viewport state
  const [viewport, setViewport] = useState({
    zoom: 1,
    rotation: 0,
    panX: 0,
    panY: 0,
    brightness: 100,
    contrast: 100,
    invert: false,
  });
  
  const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Point[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [annotationColor, setAnnotationColor] = useState('#00ff00');
  const [annotationLineWidth, setAnnotationLineWidth] = useState(2);
  const [pixelSpacing] = useState(0.1); // mm per pixel (default for demo)

  // Load image
  useEffect(() => {
    const loadImage = () => {
      setIsLoading(true);
      setError(null);

      // If no imageUrl provided, generate a demo placeholder
      if (!imageUrl) {
        generateDemoImage();
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        setImageData(img);
        setIsLoading(false);
        drawImage(img);
      };

      img.onerror = () => {
        // If external image fails, generate demo image
        console.warn('Failed to load external image, generating demo image');
        generateDemoImage();
      };

      img.src = imageUrl;
    };

    // Generate a demo medical imaging placeholder
    const generateDemoImage = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setError('Canvas not supported');
        setIsLoading(false);
        return;
      }

      // Draw dark background (typical medical image)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add gradient for depth
      const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
      gradient.addColorStop(0, '#2a2a2a');
      gradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add grid lines (like medical imaging grid)
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Add center cross
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(256, 100);
      ctx.lineTo(256, 412);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(100, 256);
      ctx.lineTo(412, 256);
      ctx.stroke();

      // Add measurement markers
      ctx.fillStyle = '#555';
      ctx.font = '12px monospace';
      ctx.fillText('L', 20, 260);
      ctx.fillText('R', 480, 260);
      ctx.fillText('S', 250, 30);
      ctx.fillText('I', 250, 500);

      // Add demo anatomical visualization (circular region)
      const centerGradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 150);
      centerGradient.addColorStop(0, '#4a4a4a');
      centerGradient.addColorStop(0.5, '#3a3a3a');
      centerGradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(256, 256, 120, 0, Math.PI * 2);
      ctx.fill();

      // Add scan details text
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.fillText('DEMO MEDICAL IMAGE', 20, canvas.height - 60);
      ctx.fillText(patientName || 'Demo Patient', 20, canvas.height - 40);
      ctx.fillText(studyDescription || 'Sample Study', 20, canvas.height - 20);

      // Convert canvas to image
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to generate demo image');
          setIsLoading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          setImageData(img);
          setIsLoading(false);
          drawImage(img);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      });
    };

    loadImage();
  }, [imageUrl, imageId, patientName, studyDescription]);

  // Load annotations from API
  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        const api = (await import('@/lib/api')).getApi();
        const response = await api.get(`/Imaging/images/${imageId}/annotations`);
        const loadedAnnotations = response.data.map((ann: any) => ({
          id: ann.id,
          type: ann.toolName.toLowerCase(),
          coordinates: typeof ann.coordinates === 'string' ? JSON.parse(ann.coordinates) : ann.coordinates,
          measurementValue: ann.measurementValue,
          measurementUnit: ann.measurementUnit,
          textContent: ann.textContent,
          color: ann.color || '#00ff00',
          lineWidth: ann.lineWidth || 2,
          fontSize: ann.fontSize || 14,
        }));
        setAnnotations(loadedAnnotations);
      } catch (err) {
        console.error('Failed to load annotations:', err);
      }
    };

    if (enableAnnotations && imageId) {
      loadAnnotations();
    }
  }, [imageId, enableAnnotations]);

  // Draw image on canvas
  const drawImage = useCallback((img?: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = img || imageData;
    if (!image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2 + viewport.panX, canvas.height / 2 + viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);
    ctx.rotate((viewport.rotation * Math.PI) / 180);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Apply filters
    ctx.filter = `brightness(${viewport.brightness}%) contrast(${viewport.contrast}%) ${
      viewport.invert ? 'invert(1)' : ''
    }`;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Restore context
    ctx.restore();
  }, [imageData, viewport]);

  // Draw annotations on separate canvas
  const drawAnnotations = useCallback(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved annotations
    annotations.forEach((annotation) => {
      drawSingleAnnotation(ctx, annotation, annotation.id === selectedAnnotation);
    });

    // Draw current annotation being drawn
    if (currentAnnotation && drawPoints.length > 0) {
      const tempAnnotation: Annotation = {
        id: 'temp',
        type: currentAnnotation.type || 'line',
        coordinates: { points: drawPoints },
        color: annotationColor,
        lineWidth: annotationLineWidth,
      };
      drawSingleAnnotation(ctx, tempAnnotation, false);
    }
  }, [annotations, currentAnnotation, drawPoints, selectedAnnotation, annotationColor, annotationLineWidth]);

  // Draw individual annotation
  const drawSingleAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation, isSelected: boolean) => {
    ctx.strokeStyle = isSelected ? '#ffff00' : (annotation.color || '#00ff00');
    ctx.fillStyle = isSelected ? '#ffff00' : (annotation.color || '#00ff00');
    ctx.lineWidth = annotation.lineWidth || 2;
    ctx.font = `${annotation.fontSize || 14}px Arial`;

    const coords = annotation.coordinates;

    switch (annotation.type) {
      case 'line':
        if (coords.points && coords.points.length >= 2) {
          const [p1, p2] = coords.points;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Draw measurement
          if (annotation.measurementValue) {
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.fillText(
              `${annotation.measurementValue.toFixed(2)} ${annotation.measurementUnit || 'mm'}`,
              midX + 5,
              midY - 5
            );
          }

          // Draw handles if selected
          if (isSelected) {
            [p1, p2].forEach((p) => {
              ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            });
          }
        }
        break;

      case 'angle':
        if (coords.points && coords.points.length >= 3) {
          const [p1, p2, p3] = coords.points;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();

          // Draw measurement
          if (annotation.measurementValue) {
            ctx.fillText(
              `${annotation.measurementValue.toFixed(1)}°`,
              p2.x + 10,
              p2.y - 10
            );
          }

          if (isSelected) {
            [p1, p2, p3].forEach((p) => {
              ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            });
          }
        }
        break;

      case 'rectangle':
        if (coords.x !== undefined && coords.y !== undefined && coords.width && coords.height) {
          ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);

          // Draw measurement (area)
          if (annotation.measurementValue) {
            ctx.fillText(
              `${annotation.measurementValue.toFixed(2)} mm²`,
              coords.x + 5,
              coords.y - 5
            );
          }

          if (isSelected) {
            // Draw corner handles
            [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([xm, ym]) => {
              ctx.fillRect(
                coords.x + coords.width * xm - 3,
                coords.y + coords.height * ym - 3,
                6,
                6
              );
            });
          }
        }
        break;

      case 'ellipse':
        if (coords.cx !== undefined && coords.cy !== undefined && coords.rx && coords.ry) {
          ctx.beginPath();
          ctx.ellipse(coords.cx, coords.cy, coords.rx, coords.ry, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Draw measurement (area)
          if (annotation.measurementValue) {
            ctx.fillText(
              `${annotation.measurementValue.toFixed(2)} mm²`,
              coords.cx - coords.rx + 5,
              coords.cy - coords.ry - 5
            );
          }

          if (isSelected) {
            // Draw handles at cardinal points
            [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([xm, ym]) => {
              ctx.fillRect(
                coords.cx + coords.rx * xm - 3,
                coords.cy + coords.ry * ym - 3,
                6,
                6
              );
            });
          }
        }
        break;

      case 'arrow':
        if (coords.points && coords.points.length >= 2) {
          const [p1, p2] = coords.points;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          const headLength = 15;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(
            p2.x - headLength * Math.cos(angle - Math.PI / 6),
            p2.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(
            p2.x - headLength * Math.cos(angle + Math.PI / 6),
            p2.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();

          if (isSelected) {
            [p1, p2].forEach((p) => {
              ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            });
          }
        }
        break;

      case 'freehand':
        if (coords.points && coords.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(coords.points[0].x, coords.points[0].y);
          coords.points.forEach((p: Point) => {
            ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();

          if (isSelected) {
            coords.points.forEach((p: Point) => {
              ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            });
          }
        }
        break;

      case 'text':
        if (coords.x !== undefined && coords.y !== undefined && annotation.textContent) {
          ctx.fillText(annotation.textContent, coords.x, coords.y);

          if (isSelected) {
            ctx.fillRect(coords.x - 3, coords.y - 3, 6, 6);
          }
        }
        break;
    }
  };

  // Calculate measurement from annotation
  const calculateMeasurement = (type: string, coords: any): { value: number; unit: string } => {
    switch (type) {
      case 'line':
        if (coords.points && coords.points.length >= 2) {
          const [p1, p2] = coords.points;
          const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
          return { value: distance * pixelSpacing, unit: 'mm' };
        }
        break;

      case 'angle':
        if (coords.points && coords.points.length >= 3) {
          const [p1, p2, p3] = coords.points;
          const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
          const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
          let angle = Math.abs((angle2 - angle1) * (180 / Math.PI));
          if (angle > 180) angle = 360 - angle;
          return { value: angle, unit: 'degrees' };
        }
        break;

      case 'rectangle':
        if (coords.width && coords.height) {
          const area = coords.width * coords.height * pixelSpacing * pixelSpacing;
          return { value: area, unit: 'mm²' };
        }
        break;

      case 'ellipse':
        if (coords.rx && coords.ry) {
          const area = Math.PI * coords.rx * coords.ry * pixelSpacing * pixelSpacing;
          return { value: area, unit: 'mm²' };
        }
        break;
    }
    return { value: 0, unit: '' };
  };

  // Save annotation to API
  const saveAnnotation = async (annotation: Annotation) => {
    try {
      const api = (await import('@/lib/api')).getApi();
      
      const measurement = calculateMeasurement(annotation.type, annotation.coordinates);
      
      await api.post(`/Imaging/images/${imageId}/annotations`, {
        annotationType: annotation.type,
        toolName: annotation.type,
        coordinates: JSON.stringify(annotation.coordinates),
        measurementValue: measurement.value || null,
        measurementUnit: measurement.unit || null,
        textContent: annotation.textContent || null,
        color: annotation.color,
        lineWidth: annotation.lineWidth,
        fontSize: annotation.fontSize,
      });

      toast.success('Annotation saved');
    } catch (err: any) {
      console.error('Failed to save annotation:', err);
      toast.error('Failed to save annotation');
    }
  };

  // Redraw when viewport or annotations change
  useEffect(() => {
    drawImage();
  }, [viewport, imageData, drawImage]);

  useEffect(() => {
    drawAnnotations();
  }, [drawAnnotations]);

  // Mouse handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = annotationCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'Pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
      return;
    }

    // Annotation tools
    if (['line', 'angle', 'rectangle', 'ellipse', 'arrow', 'freehand', 'text'].includes(activeTool)) {
      setIsDrawing(true);
      setDrawPoints([{ x, y }]);
      setCurrentAnnotation({ type: activeTool as any, color: annotationColor, lineWidth: annotationLineWidth });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = annotationCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && activeTool === 'Pan') {
      setViewport({
        ...viewport,
        panX: e.clientX - dragStart.x,
        panY: e.clientY - dragStart.y,
      });
      return;
    }

    if (isDrawing && currentAnnotation) {
      if (currentAnnotation.type === 'freehand') {
        setDrawPoints([...drawPoints, { x, y }]);
      } else if (drawPoints.length === 1) {
        setDrawPoints([drawPoints[0], { x, y }]);
      } else if (currentAnnotation.type === 'angle' && drawPoints.length === 2) {
        setDrawPoints([...drawPoints.slice(0, 2), { x, y }]);
      }
    }
  };

  const handleMouseUp = async () => {
    setIsDragging(false);

    if (isDrawing && currentAnnotation && drawPoints.length > 0) {
      let coordinates: any = {};
      let shouldSave = false;

      switch (currentAnnotation.type) {
        case 'line':
        case 'arrow':
          if (drawPoints.length >= 2) {
            coordinates = { points: drawPoints.slice(0, 2) };
            shouldSave = true;
          }
          break;

        case 'angle':
          if (drawPoints.length >= 3) {
            coordinates = { points: drawPoints.slice(0, 3) };
            shouldSave = true;
          } else {
            // Wait for third point
            return;
          }
          break;

        case 'rectangle':
          if (drawPoints.length >= 2) {
            const [p1, p2] = drawPoints;
            coordinates = {
              x: Math.min(p1.x, p2.x),
              y: Math.min(p1.y, p2.y),
              width: Math.abs(p2.x - p1.x),
              height: Math.abs(p2.y - p1.y),
            };
            shouldSave = true;
          }
          break;

        case 'ellipse':
          if (drawPoints.length >= 2) {
            const [p1, p2] = drawPoints;
            coordinates = {
              cx: (p1.x + p2.x) / 2,
              cy: (p1.y + p2.y) / 2,
              rx: Math.abs(p2.x - p1.x) / 2,
              ry: Math.abs(p2.y - p1.y) / 2,
            };
            shouldSave = true;
          }
          break;

        case 'freehand':
          if (drawPoints.length > 2) {
            coordinates = { points: drawPoints };
            shouldSave = true;
          }
          break;

        case 'text':
          if (drawPoints.length >= 1) {
            const text = prompt('Enter text:');
            if (text) {
              coordinates = { x: drawPoints[0].x, y: drawPoints[0].y };
              const newAnnotation: Annotation = {
                id: Date.now().toString(),
                type: 'text',
                coordinates,
                textContent: text,
                color: annotationColor,
                lineWidth: annotationLineWidth,
                fontSize: 14,
              };
              setAnnotations([...annotations, newAnnotation]);
              await saveAnnotation(newAnnotation);
            }
            shouldSave = false;
            setIsDrawing(false);
            setDrawPoints([]);
            setCurrentAnnotation(null);
            return;
          }
          break;
      }

      if (shouldSave) {
        const measurement = calculateMeasurement(currentAnnotation.type!, coordinates);
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: currentAnnotation.type!,
          coordinates,
          measurementValue: measurement.value,
          measurementUnit: measurement.unit,
          color: annotationColor,
          lineWidth: annotationLineWidth,
        };
        setAnnotations([...annotations, newAnnotation]);
        await saveAnnotation(newAnnotation);
      }

      setIsDrawing(false);
      setDrawPoints([]);
      setCurrentAnnotation(null);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.1, Math.min(5, viewport.zoom + delta));
    setViewport({ ...viewport, zoom: newZoom });
  };

  // Tool functions
  const handleZoomIn = () => {
    setViewport({ ...viewport, zoom: Math.min(5, viewport.zoom + 0.25) });
  };

  const handleZoomOut = () => {
    setViewport({ ...viewport, zoom: Math.max(0.25, viewport.zoom - 0.25) });
  };

  const handleResetZoom = () => {
    setViewport({ ...viewport, zoom: 1, panX: 0, panY: 0, rotation: 0 });
  };

  const handleRotate = () => {
    setViewport({ ...viewport, rotation: (viewport.rotation + 90) % 360 });
  };

  const handleInvert = () => {
    setViewport({ ...viewport, invert: !viewport.invert });
  };

  const handleBrightnessUp = () => {
    setViewport({ ...viewport, brightness: Math.min(200, viewport.brightness + 10) });
  };

  const handleBrightnessDown = () => {
    setViewport({ ...viewport, brightness: Math.max(0, viewport.brightness - 10) });
  };

  const handleContrastUp = () => {
    setViewport({ ...viewport, contrast: Math.min(200, viewport.contrast + 10) });
  };

  const handleContrastDown = () => {
    setViewport({ ...viewport, contrast: Math.max(0, viewport.contrast - 10) });
  };

  const activateTool = (tool: string) => {
    setActiveTool(tool);
    setIsDragging(false);
    setIsDrawing(false);
    setDrawPoints([]);
    setCurrentAnnotation(null);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${patientName || 'study'}_${imageId}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{patientName || 'Medical Image'}</h3>
            <p className="text-sm text-gray-300">
              {studyDescription} {seriesDescription && `• ${seriesDescription}`}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Layers */}
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        <canvas
          ref={annotationCanvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* FDA 21 CFR Part 11 Compliance: Calibration Disclaimer */}
      {!pixelSpacing && imageData && (
        <div className="absolute top-20 left-4 bg-yellow-900/90 dark:bg-yellow-950/95 border border-yellow-600 dark:border-yellow-500 rounded-lg px-3 py-2 max-w-xs z-20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-yellow-200 dark:text-yellow-100 mb-1">
                Not Calibrated for Diagnostic Use
              </p>
              <p className="text-xs text-yellow-300 dark:text-yellow-200">
                Measurements are for reference only. Pixel spacing not available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FDA 21 CFR Part 11 Compliance: Orientation Markers (L/R/S/I) */}
      {imageData && (
        <>
          {/* Top - Superior */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-10">
            S
          </div>
          {/* Bottom - Inferior */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-10">
            I
          </div>
          {/* Left - Left */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-10">
            L
          </div>
          {/* Right - Right */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600/80 dark:bg-blue-700/90 px-2 py-1 rounded text-xs font-bold text-white shadow-lg z-10">
            R
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading image...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 bg-gray-800/90 rounded-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Image</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Annotation Toolbar */}
      {showTools && enableAnnotations && !isLoading && !error && (
        <div className="absolute top-20 left-4 z-10 bg-gray-900/90 rounded-lg p-2 space-y-1">
          <div className="text-xs text-gray-400 px-2 py-1">Annotation Tools</div>
          {[
            { tool: 'line', label: 'Line', icon: '📏' },
            { tool: 'angle', label: 'Angle', icon: '📐' },
            { tool: 'rectangle', label: 'Rectangle', icon: '▭' },
            { tool: 'ellipse', label: 'Ellipse', icon: '⬭' },
            { tool: 'arrow', label: 'Arrow', icon: '➡️' },
            { tool: 'freehand', label: 'Freehand', icon: '✏️' },
            { tool: 'text', label: 'Text', icon: 'T' },
          ].map(({ tool, label, icon }) => (
            <button
              key={tool}
              onClick={() => activateTool(tool)}
              className={`w-full px-3 py-2 rounded transition-colors text-left flex items-center gap-2 ${
                activeTool === tool
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              title={label}
            >
              <span>{icon}</span>
              <span className="text-xs">{label}</span>
            </button>
          ))}
          <div className="border-t border-gray-700 my-1"></div>
          <div className="px-2 py-1">
            <label className="text-xs text-gray-400">Color</label>
            <input
              type="color"
              value={annotationColor}
              onChange={(e) => setAnnotationColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tools Overlay */}
      {showTools && !isLoading && !error && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-2">
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

            {/* Pan Tool */}
            <div className="flex items-center space-x-1 bg-gray-900/80 rounded-lg p-1">
              <button
                onClick={() => activateTool('Pan')}
                className={`p-2 hover:bg-white/20 rounded transition-colors ${
                  activeTool === 'Pan' ? 'bg-white/20' : ''
                } text-white`}
                title="Pan Tool"
              >
                <span className="text-sm font-bold">✋</span>
              </button>
            </div>

            {/* Window/Level (Brightness/Contrast) */}
            <div className="flex items-center space-x-1 bg-gray-900/80 rounded-lg p-1">
              <button
                onClick={handleBrightnessUp}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs"
                title="Brightness Up"
              >
                B+
              </button>
              <button
                onClick={handleBrightnessDown}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs"
                title="Brightness Down"
              >
                B-
              </button>
              <button
                onClick={handleContrastUp}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs"
                title="Contrast Up"
              >
                C+
              </button>
              <button
                onClick={handleContrastDown}
                className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs"
                title="Contrast Down"
              >
                C-
              </button>
            </div>

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
      <div className="absolute top-20 right-4 bg-gray-900/80 rounded-lg p-3 text-white text-xs space-y-1">
        <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
        <div>Rotation: {viewport.rotation}°</div>
        <div>Brightness: {viewport.brightness}%</div>
        <div>Contrast: {viewport.contrast}%</div>
        <div>Tool: {activeTool}</div>
        {enableAnnotations && <div>Annotations: {annotations.length}</div>}
      </div>
    </div>
  );
}
