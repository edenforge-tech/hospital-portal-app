'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { deviceManagementApi, Device } from '@/lib/api/device-management.api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Smartphone, 
  Monitor, 
  Tablet,
  Shield,
  MapPin,
  Calendar,
  User
} from 'lucide-react';

export default function DeviceApprovalPage() {
  const { user } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingDeviceId, setProcessingDeviceId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadDevices();
    }
  }, [user]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await deviceManagementApi.getMyDevices();
      // Filter devices that need approval (untrusted and not blocked)
      const pendingDevices = (response.data || []).filter(
        device => device.trustLevel === 'Untrusted' && !device.isBlocked && device.status === 'active'
      );
      setDevices(pendingDevices);
    } catch (err: any) {
      console.error('Error loading devices:', err);
      setError(err.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone className="h-6 w-6 text-blue-500" />;
    } else if (type.includes('tablet')) {
      return <Tablet className="h-6 w-6 text-green-500" />;
    } else {
      return <Monitor className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleApproveClick = (device: Device) => {
    setSelectedDevice(device);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleApproveDevice = async () => {
    if (!selectedDevice) return;

    try {
      setProcessingDeviceId(selectedDevice.id);
      setError(null);
      
      await deviceManagementApi.approve(selectedDevice.id, approvalNotes);
      
      setSuccess(`Device "${selectedDevice.deviceName || selectedDevice.deviceType}" has been approved successfully`);
      setShowApprovalModal(false);
      setSelectedDevice(null);
      setApprovalNotes('');
      
      // Remove the approved device from the list
      setDevices(devices.filter(d => d.id !== selectedDevice.id));
    } catch (err: any) {
      console.error('Error approving device:', err);
      setError(err.response?.data?.message || 'Failed to approve device');
    } finally {
      setProcessingDeviceId(null);
    }
  };

  const handleBlockDevice = async (device: Device) => {
    const reason = prompt(`Block device "${device.deviceName || device.deviceType}"?\n\nReason:`);
    if (!reason) return;

    try {
      setProcessingDeviceId(device.id);
      setError(null);
      
      await deviceManagementApi.block(device.id, reason);
      
      setSuccess(`Device "${device.deviceName || device.deviceType}" has been blocked`);
      
      // Remove the blocked device from the list
      setDevices(devices.filter(d => d.id !== device.id));
    } catch (err: any) {
      console.error('Error blocking device:', err);
      setError(err.response?.data?.message || 'Failed to block device');
    } finally {
      setProcessingDeviceId(null);
    }
  };

  const getRiskLevel = (device: Device) => {
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(device.registeredAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (device.totalLogins > 10 && daysSinceRegistration > 7) {
      return { level: 'Low', color: 'green' };
    } else if (device.totalLogins > 5 && daysSinceRegistration > 3) {
      return { level: 'Medium', color: 'yellow' };
    } else {
      return { level: 'High', color: 'red' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Approval</h1>
            <p className="text-gray-600">Review and approve pending device registrations</p>
          </div>
          <div className="text-sm text-gray-500">
            {devices.length} device{devices.length !== 1 ? 's' : ''} pending approval
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Devices List */}
        {devices.length > 0 ? (
          <div className="space-y-4">
            {devices.map((device) => {
              const risk = getRiskLevel(device);
              const isProcessing = processingDeviceId === device.id;

              return (
                <div key={device.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {device.deviceName || device.deviceType || 'Unknown Device'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            risk.color === 'green' ? 'bg-green-100 text-green-800' :
                            risk.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {risk.level} Risk
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Device Type: {device.deviceType || 'Unknown'}
                            </div>
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              OS: {device.os} {device.osVersion && `(${device.osVersion})`}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              IP: {device.ipAddress}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Registered: {formatDate(device.registeredAt)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Last Seen: {device.lastSeenAt ? formatDate(device.lastSeenAt) : 'Never'}
                            </div>
                            <div>
                              Total Logins: {device.totalLogins}
                            </div>
                          </div>
                        </div>

                        {device.userAgent && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                            <strong>User Agent:</strong> {device.userAgent}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApproveClick(device)}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isProcessing 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => handleBlockDevice(device)}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isProcessing 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        Block
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All devices approved</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no devices pending approval at this time.
            </p>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedDevice && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Approve Device
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  You are about to approve "{selectedDevice.deviceName || selectedDevice.deviceType}". 
                  This will grant the device trusted status.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Notes (optional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add any notes about this approval..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveDevice}
                    disabled={processingDeviceId !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {processingDeviceId ? 'Approving...' : 'Approve Device'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}