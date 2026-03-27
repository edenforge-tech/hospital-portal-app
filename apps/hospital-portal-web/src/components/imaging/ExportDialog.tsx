// ExportDialog - Export imaging orders and comparisons to PDF
'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PrintPreview } from './PrintPreview';

interface ExportDialogProps {
  orderId?: string;
  comparisonId?: string;
  exportType: 'order' | 'comparison';
  onClose: () => void;
}

interface ExportOptions {
  includeAnnotations: boolean;
  includeMeasurements: boolean;
  includeComparisons: boolean;
  includePatientDemographics: boolean;
  reportTemplate: 'standard' | 'summary' | 'detailed';
}

interface ExportResponse {
  reportId: string;
  reportUrl: string;
  fileName: string;
  generatedAt: string;
  fileSizeBytes: number;
}

export default function ExportDialog({
  orderId,
  comparisonId,
  exportType,
  onClose,
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeAnnotations: true,
    includeMeasurements: true,
    includeComparisons: true,
    includePatientDemographics: false, // HIPAA: false for de-identification
    reportTemplate: 'standard',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    if (exportType === 'order' && !orderId) {
      toast.error('Order ID is required');
      return;
    }

    if (exportType === 'comparison' && !comparisonId) {
      toast.error('Comparison ID is required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const api = (await import('@/lib/api')).getApi();

      const endpoint =
        exportType === 'order'
          ? `/Imaging/orders/${orderId}/export/pdf`
          : `/Imaging/comparisons/${comparisonId}/export/pdf`;

      const response = await api.post<ExportResponse>(endpoint, options);

      // Fetch the generated PDF to create preview
      if (response.data.reportUrl) {
        const pdfResponse = await fetch(response.data.reportUrl);
        const blob = await pdfResponse.blob();
        setPdfBlob(blob);
      }

      setGeneratedReport(response.data);
      toast.success('Report generated successfully');

      // Auto-download
      if (response.data.reportUrl) {
        window.open(response.data.reportUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Error generating report:', err);
      const errorMessage = err.response?.data?.message || 'Failed to generate report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Export {exportType === 'order' ? 'Imaging Report' : 'Comparison Report'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Generate a PDF report with selected options
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Report Template */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Report Template
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['standard', 'summary', 'detailed'] as const).map((template) => (
                <button
                  key={template}
                  onClick={() => setOptions({ ...options, reportTemplate: template })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    options.reportTemplate === template
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium capitalize">{template}</div>
                    <div className="text-xs mt-1">
                      {template === 'standard' && 'Complete report'}
                      {template === 'summary' && 'Images only'}
                      {template === 'detailed' && 'With graphs'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Include in Report
            </label>
            <div className="space-y-3">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.includeAnnotations}
                  onChange={(e) =>
                    setOptions({ ...options, includeAnnotations: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <div className="ml-3">
                  <div className="text-white group-hover:text-gray-200">Include Annotations</div>
                  <div className="text-xs text-gray-400">
                    Show all annotation markers and labels on images
                  </div>
                </div>
              </label>

              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.includeMeasurements}
                  onChange={(e) =>
                    setOptions({ ...options, includeMeasurements: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <div className="ml-3">
                  <div className="text-white group-hover:text-gray-200">
                    Include Measurements Table
                  </div>
                  <div className="text-xs text-gray-400">
                    Table with all measurement values, units, and dates
                  </div>
                </div>
              </label>

              {exportType === 'order' && (
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={options.includeComparisons}
                    onChange={(e) =>
                      setOptions({ ...options, includeComparisons: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <div className="ml-3">
                    <div className="text-white group-hover:text-gray-200">
                      Include Comparison Findings
                    </div>
                    <div className="text-xs text-gray-400">
                      Show progression analysis and comparison notes (if available)
                    </div>
                  </div>
                </label>
              )}

              {/* HIPAA De-identified Export - Enhanced */}
              <div className="space-y-3 pt-2 border-t border-gray-700">
                <div className="flex items-start gap-3 p-3 bg-blue-900/20 dark:bg-blue-950/30 border border-blue-600/30 dark:border-blue-500/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="includePatientDemographics"
                    checked={options.includePatientDemographics}
                    onChange={(e) =>
                      setOptions({ ...options, includePatientDemographics: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="includePatientDemographics"
                      className="block text-sm font-medium text-white dark:text-gray-100 cursor-pointer"
                    >
                      Include Patient Demographics
                      <span className="ml-2 text-xs bg-yellow-900/70 text-yellow-200 px-2 py-0.5 rounded font-semibold">
                        PHI
                      </span>
                    </label>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      <strong className="text-yellow-400 dark:text-yellow-300">HIPAA:</strong> Unchecked = De-identified export (Name, MRN, DOB removed). 
                      Check only if recipient is authorized to view PHI.
                    </p>
                  </div>
                </div>

                {!options.includePatientDemographics && (
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 dark:bg-green-950/30 border border-green-600/30 dark:border-green-500/30 rounded">
                    <CheckCircle className="w-4 h-4 text-green-400 dark:text-green-300" />
                    <p className="text-xs text-green-300 dark:text-green-200">
                      ✓ Export will be de-identified (HIPAA compliant for research/teaching)
                    </p>
                  </div>
                )}
              </div>

              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="mt-1 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 opacity-50"
                />
                <div className="ml-3 opacity-50">
                  <div className="text-white group-hover:text-gray-200">
                    Legacy Option (Deprecated)
                  </div>
                  <div className="text-xs text-gray-400">
                    Use enhanced option above for HIPAA compliance
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Generated Report */}
          {generatedReport && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-400">Report Generated Successfully</div>
                  <div className="text-sm text-gray-300 mt-1 space-y-1">
                    <div>File: {generatedReport.fileName}</div>
                    <div>Size: {formatFileSize(generatedReport.fileSizeBytes)}</div>
                    <div>
                      Generated: {new Date(generatedReport.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  <a
                    href={generatedReport.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Download Report
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-red-400">Generation Failed</div>
                  <div className="text-sm text-gray-300 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Reports are stored securely in Azure Blob Storage
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            {generatedReport && pdfBlob && (
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview PDF</span>
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Generate PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPreview && pdfBlob && generatedReport && (
        <PrintPreview
          pdfBlob={pdfBlob}
          filename={generatedReport.fileName}
          onClose={() => setShowPreview(false)}
          onDownload={async () => {
            const link = document.createElement('a');
            link.href = generatedReport.reportUrl;
            link.download = generatedReport.fileName;
            link.click();
            toast.success('Download started');
          }}
        />
      )}
    </div>
  );
}
