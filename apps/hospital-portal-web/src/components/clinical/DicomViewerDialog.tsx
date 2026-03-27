'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Contrast,
  Download,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

interface DicomViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  dicomUrl?: string;
  metadata?: DicomMetadata;
}

interface DicomMetadata {
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
  seriesDescription?: string;
  imageNumber?: number;
  totalImages?: number;
  windowCenter?: number;
  windowWidth?: number;
}

export default function DicomViewerDialog({
  isOpen,
  onClose,
  imageUrl,
  dicomUrl,
  metadata,
}: DicomViewerDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [windowLevel, setWindowLevel] = useState({
    center: metadata?.windowCenter || 50,
    width: metadata?.windowWidth || 100,
  });
  const [showMetadata, setShowMetadata] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset view when image changes
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (dicomUrl) {
      window.open(dicomUrl, '_blank');
    } else {
      // Download the displayed image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `medical-image-${Date.now()}.jpg`;
      link.click();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-gray-900 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                  <div className="flex  items-center space-x-3">
                    <Dialog.Title className="text-lg font-semibold text-white">
                      DICOM Viewer
                    </Dialog.Title>
                    {metadata?.modality && (
                      <span className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">
                        {metadata.modality}
                      </span>
                    )}
                    {metadata?.seriesDescription && (
                      <span className="text-sm text-gray-400">
                        {metadata.seriesDescription}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {/* Zoom Controls */}
                    <button
                      onClick={handleZoomOut}
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="px-3 py-1 text-sm text-white bg-gray-700 rounded">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>

                    {/* Rotate */}
                    <button
                      onClick={handleRotate}
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>

                    {/* Pan Tool */}
                    <button
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Pan (Click and Drag)"
                    >
                      <Move className="w-5 h-5" />
                    </button>

                    {/* Window/Level (Contrast) */}
                    <button
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Window/Level Adjustment"
                    >
                      <Contrast className="w-5 h-5" />
                    </button>

                    {/* Reset */}
                    <button
                      onClick={handleReset}
                      className="px-3 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                    >
                      Reset View
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Metadata Toggle */}
                    <button
                      onClick={() => setShowMetadata(!showMetadata)}
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Show Metadata"
                    >
                      <Info className="w-5 h-5" />
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>

                    {/* Download */}
                    <button
                      onClick={handleDownload}
                      className="p-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Image Viewer */}
                <div
                  ref={containerRef}
                  className="relative bg-black"
                  style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div className="flex items-center justify-center h-full overflow-hidden cursor-move">
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Medical Image"
                      className="max-w-none transition-transform"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        filter: `contrast(${windowLevel.width / 100}) brightness(${windowLevel.center / 50})`,
                      }}
                      draggable={false}
                    />
                  </div>

                  {/* Metadata Overlay */}
                  {showMetadata && metadata && (
                    <div className="absolute top-4 left-4 p-4 bg-black bg-opacity-75 text-white text-sm rounded-lg space-y-1">
                      {metadata.patientName && (
                        <div>
                          <span className="text-gray-400">Patient:</span> {metadata.patientName}
                        </div>
                      )}
                      {metadata.patientId && (
                        <div>
                          <span className="text-gray-400">ID:</span> {metadata.patientId}
                        </div>
                      )}
                      {metadata.studyDate && (
                        <div>
                          <span className="text-gray-400">Study Date:</span> {metadata.studyDate}
                        </div>
                      )}
                      {metadata.modality && (
                        <div>
                          <span className="text-gray-400">Modality:</span> {metadata.modality}
                        </div>
                      )}
                      {metadata.seriesDescription && (
                        <div>
                          <span className="text-gray-400">Series:</span>{' '}
                          {metadata.seriesDescription}
                        </div>
                      )}
                      {metadata.imageNumber && metadata.totalImages && (
                        <div>
                          <span className="text-gray-400">Image:</span> {metadata.imageNumber} /{' '}
                          {metadata.totalImages}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="absolute bottom-4 right-4 p-3 bg-black bg-opacity-75 text-white text-xs rounded-lg">
                    <div>🖱️ Click and drag to pan</div>
                    <div>🔍 Use toolbar to zoom/rotate</div>
                    <div>⌨️ Mouse wheel to zoom (coming soon)</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {dicomUrl ? (
                      <span className="text-green-400">✓ DICOM file available</span>
                    ) : (
                      <span>Standard image view</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Note: Full DICOM viewer with advanced tools (measurements, annotations) coming soon
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
