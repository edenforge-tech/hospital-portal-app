// Audit Log Details Modal Component
// Displays comprehensive details for a selected audit log entry

'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, MapPin, Monitor, Clock, Database } from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { getApi } from '@/lib/api';

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
    requestHeaders?: string;
    requestBody?: string;
    responseStatus?: number;
    userAgent?: string;
    geolocation?: {
      city: string;
      region: string;
      country: string;
      latitude: number;
      longitude: number;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditLogDetailsModal({ log, isOpen, onClose }: AuditLogDetailsModalProps) {
  const [detailedLog, setDetailedLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && log?.id) {
      loadDetailedLog(log.id);
    }
  }, [isOpen, log?.id]);

  const loadDetailedLog = async (logId: string) => {
    try {
      setLoading(true);
      const api = getApi();
      const response = await api.get(`/audit-logs/${logId}/details`);
      setDetailedLog(response.data);
    } catch (err) {
      console.error('Error loading detailed log:', err);
      // Use the basic log data if detailed fetch fails
      setDetailedLog(log);
    } finally {
      setLoading(false);
    }
  };

  if (!log) return null;

  // Use detailed log if available, otherwise use basic log
  const displayLog = detailedLog || log;

  // Parse user agent
  const parseUserAgent = (ua?: string) => {
    if (!ua) return { device: 'Unknown', os: 'Unknown', browser: 'Unknown' };
    
    // Basic parsing (in production, use a library like ua-parser-js)
    const isWindows = ua.includes('Windows');
    const isMac = ua.includes('Mac OS');
    const isLinux = ua.includes('Linux');
    const isAndroid = ua.includes('Android');
    const isIOS = ua.includes('iPhone') || ua.includes('iPad');
    
    const isChrome = ua.includes('Chrome');
    const isFirefox = ua.includes('Firefox');
    const isSafari = ua.includes('Safari') && !isChrome;
    const isEdge = ua.includes('Edg');
    
    const os = isWindows ? 'Windows' : isMac ? 'macOS' : isLinux ? 'Linux' : isAndroid ? 'Android' : isIOS ? 'iOS' : 'Unknown';
    const browser = isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown';
    const device = isAndroid || isIOS ? 'Mobile' : 'Desktop';
    
    return { device, os, browser };
  };

  const agentInfo = parseUserAgent(displayLog.userAgent);

  // Parse old/new values for diff
  let oldValuesObj: any = {};
  let newValuesObj: any = {};
  
  try {
    oldValuesObj = displayLog.oldValues ? JSON.parse(displayLog.oldValues) : {};
  } catch (e) {
    oldValuesObj = { raw: displayLog.oldValues || '' };
  }
  
  try {
    newValuesObj = displayLog.newValues ? JSON.parse(displayLog.newValues) : {};
  } catch (e) {
    newValuesObj = { raw: displayLog.newValues || '' };
  }

  const oldValuesStr = JSON.stringify(oldValuesObj, null, 2);
  const newValuesStr = JSON.stringify(newValuesObj, null, 2);

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Audit Log Details
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {displayLog.action} • {displayLog.entityType} • {new Date(displayLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={24} />
                  </button>
                </Dialog.Title>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}

                {!loading && (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Database size={18} className="mr-2" />
                        Basic Information
                      </h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">User:</dt>
                          <dd className="text-sm font-medium text-gray-900">{displayLog.userName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Entity:</dt>
                          <dd className="text-sm font-medium text-gray-900">{displayLog.entityType}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Entity ID:</dt>
                          <dd className="text-sm font-mono text-gray-900 text-xs truncate">{displayLog.entityId}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Action:</dt>
                          <dd className="text-sm font-medium text-gray-900">{displayLog.action}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Status:</dt>
                          <dd>
                            {displayLog.success ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Success
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Failed
                              </span>
                            )}
                          </dd>
                        </div>
                        {displayLog.responseStatus && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">HTTP Status:</dt>
                            <dd className="text-sm font-mono text-gray-900">{displayLog.responseStatus}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Network Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin size={18} className="mr-2" />
                        Network & Location
                      </h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">IP Address:</dt>
                          <dd className="text-sm font-mono text-gray-900">{displayLog.ipAddress}</dd>
                        </div>
                        {displayLog.geolocation && (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Location:</dt>
                              <dd className="text-sm text-gray-900">
                                {displayLog.geolocation.city}, {displayLog.geolocation.region}, {displayLog.geolocation.country}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Coordinates:</dt>
                              <dd className="text-sm text-gray-900">
                                {displayLog.geolocation.latitude.toFixed(4)}, {displayLog.geolocation.longitude.toFixed(4)}
                              </dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>

                    {/* Device Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Monitor size={18} className="mr-2" />
                        Device Information
                      </h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Device Type:</dt>
                          <dd className="text-sm text-gray-900">{agentInfo.device}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Operating System:</dt>
                          <dd className="text-sm text-gray-900">{agentInfo.os}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Browser:</dt>
                          <dd className="text-sm text-gray-900">{agentInfo.browser}</dd>
                        </div>
                        {displayLog.userAgent && (
                          <div className="mt-2">
                            <dt className="text-sm text-gray-600 mb-1">User Agent:</dt>
                            <dd className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 break-all">
                              {displayLog.userAgent}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Description */}
                    {displayLog.description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-700">{displayLog.description}</p>
                      </div>
                    )}

                    {/* Request Details */}
                    {displayLog.requestHeaders && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Request Headers</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                          {typeof displayLog.requestHeaders === 'string' 
                            ? displayLog.requestHeaders 
                            : JSON.stringify(displayLog.requestHeaders, null, 2)}
                        </pre>
                      </div>
                    )}

                    {displayLog.requestBody && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                          {typeof displayLog.requestBody === 'string'
                            ? displayLog.requestBody
                            : JSON.stringify(displayLog.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Changes (Full Width) */}
                {(displayLog.oldValues || displayLog.newValues) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Data Changes</h4>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <ReactDiffViewer
                        oldValue={oldValuesStr}
                        newValue={newValuesStr}
                        splitView={true}
                        leftTitle="Before"
                        rightTitle="After"
                        showDiffOnly={false}
                        styles={{
                          variables: {
                            light: {
                              diffViewerBackground: '#fafafa',
                              diffViewerColor: '#212121',
                              addedBackground: '#e6ffed',
                              addedColor: '#24292e',
                              removedBackground: '#ffeef0',
                              removedColor: '#24292e',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {displayLog.details && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Details</h4>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                      {typeof displayLog.details === 'string'
                        ? displayLog.details
                        : JSON.stringify(displayLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Close
                  </button>
                </div>
                </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
