// Todo #4: Complete Audit Log Viewer - Details Modal with Before/After Diff
'use client';

import { useState } from 'react';
import { X, FileText, User, Clock, Shield, AlertTriangle, Download } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface AuditLogDetailsModalProps {
  log: {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    oldValues?: string;
    newValues?: string;
    ipAddress: string;
    severity: string;
    success: boolean;
    details?: string;
    phiAccessed?: boolean;
    patientId?: string;
    patientName?: string;
    complianceFlags?: string[];
  };
  onClose: () => void;
}

export default function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'diff' | 'compliance'>('details');

  const formatJson = (jsonString?: string) => {
    if (!jsonString) return '';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      Critical: 'bg-red-100 text-red-800 border-red-300',
      High: 'bg-orange-100 text-orange-800 border-orange-300',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Low: 'bg-blue-100 text-blue-800 border-blue-300',
      Info: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[severity as keyof typeof colors] || colors.Info;
  };

  const exportToPdf = () => {
    // In production, use a library like jsPDF
    const printContent = document.getElementById('audit-log-details');
    if (printContent) {
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Audit Log ${log.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .value { margin-left: 10px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Audit Log Details</h2>
              <p className="text-sm opacity-90">ID: {log.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPdf}
              className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md flex items-center gap-2 text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 font-medium text-sm transition-all ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-4 py-3 font-medium text-sm transition-all ${
                activeTab === 'diff'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={!log.oldValues && !log.newValues}
            >
              Before/After Diff
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-4 py-3 font-medium text-sm transition-all ${
                activeTab === 'compliance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compliance
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]" id="audit-log-details">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Severity Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getSeverityColor(log.severity)}`}>
                  {log.severity} Severity
                </span>
                {log.phiAccessed && (
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold border-2 border-purple-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    PHI Accessed
                  </span>
                )}
                {!log.success && (
                  <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold border-2 border-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Failed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">User Information</span>
                  </div>
                  <p className="text-sm"><span className="font-semibold">User:</span> {log.userName}</p>
                  <p className="text-sm"><span className="font-semibold">User ID:</span> {log.userId}</p>
                  <p className="text-sm"><span className="font-semibold">IP Address:</span> {log.ipAddress}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Timestamp</span>
                  </div>
                  <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toISOString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Action Details</span>
                </div>
                <p className="text-sm mb-2"><span className="font-semibold">Action:</span> {log.action}</p>
                <p className="text-sm mb-2"><span className="font-semibold">Entity Type:</span> {log.entityType}</p>
                <p className="text-sm mb-2"><span className="font-semibold">Entity ID:</span> {log.entityId}</p>
                <p className="text-sm"><span className="font-semibold">Description:</span> {log.description}</p>
              </div>

              {log.phiAccessed && (
                <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">PHI Access Details</span>
                  </div>
                  <p className="text-sm mb-1"><span className="font-semibold">Patient ID:</span> {log.patientId}</p>
                  <p className="text-sm"><span className="font-semibold">Patient Name:</span> {log.patientName}</p>
                  <p className="text-xs text-purple-700 mt-2">
                    ⚠️ This action accessed Protected Health Information (PHI)
                  </p>
                </div>
              )}

              {log.details && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Additional Details:</p>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                    {formatJson(log.details)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'diff' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                View changes made to the entity. Red indicates removed values, green indicates added values.
              </p>
              <ReactDiffViewer
                oldValue={formatJson(log.oldValues)}
                newValue={formatJson(log.newValues)}
                splitView={true}
                leftTitle="Before"
                rightTitle="After"
                showDiffOnly={false}
                useDarkTheme={false}
                styles={{
                  diffContainer: {
                    fontSize: '12px',
                  },
                }}
              />
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">HIPAA Compliance Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Action {log.success ? 'Successful' : 'Failed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${log.phiAccessed ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm">PHI {log.phiAccessed ? 'Accessed' : 'Not Accessed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Audit Trail Complete</span>
                  </div>
                </div>
              </div>

              {log.complianceFlags && log.complianceFlags.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Compliance Flags
                  </h3>
                  <ul className="space-y-1">
                    {log.complianceFlags.map((flag, index) => (
                      <li key={index} className="text-sm text-yellow-800">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Audit Retention</h3>
                <p className="text-sm text-gray-600">
                  This audit log will be retained for <span className="font-semibold">7 years</span> as required by HIPAA regulations.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Log ID: <code className="bg-white px-2 py-1 rounded text-xs">{log.id}</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
