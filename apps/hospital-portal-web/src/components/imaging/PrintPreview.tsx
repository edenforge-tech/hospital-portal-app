'use client';

import React, { useState } from 'react';
import { X, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface PrintPreviewProps {
  pdfBlob?: Blob;
  pdfUrl?: string;
  filename?: string;
  onClose: () => void;
  onDownload?: () => void;
  className?: string;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  pdfBlob,
  pdfUrl,
  filename = 'medical-image-report.pdf',
  onClose,
  onDownload,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  React.useEffect(() => {
    // Create object URL from blob or use provided URL
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (pdfUrl) {
      setObjectUrl(pdfUrl);
    }
  }, [pdfBlob, pdfUrl]);

  const handlePrint = () => {
    if (objectUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = objectUrl;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
      
      toast.success('Opening print dialog...');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (objectUrl) {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.click();
      toast.success('Download started');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              PDF Preview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filename}</p>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Pagination */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">←</span>
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">→</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom === 50}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">−</span>
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 px-2 min-w-[4rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom === 200}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">+</span>
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              title="Print"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm font-medium">Print</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
          {objectUrl ? (
            <div className="flex justify-center">
              <iframe
                src={`${objectUrl}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full bg-white shadow-2xl"
                style={{
                  minHeight: '800px',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
                onLoad={() => {
                  setIsLoading(false);
                  // Note: Actual page count extraction requires PDF.js library
                  // This is a simplified version
                  setTotalPages(1); // Default to 1 page
                }}
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>File Size: {pdfBlob ? `${(pdfBlob.size / 1024).toFixed(1)} KB` : 'Unknown'}</span>
              <span>Format: PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                Ready to Print
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
