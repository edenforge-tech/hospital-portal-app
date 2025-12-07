'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { deviceManagementApi, Device } from '@/lib/api/device-management.api';
import { Smartphone, Monitor, Tablet, Shield, ShieldCheck, ShieldAlert, Clock, MapPin, Chrome } from 'lucide-react';

export default function DevicesPage() {
  const { user } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setDevices(response.data || []);
    } catch (err: any) {
      console.error('Error loading devices:', err);
      setError(err.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (deviceId: string) => {
    try {
      setError(null);
      setSuccess(null);
      await deviceManagementApi.setPrimary(deviceId);
      setSuccess('Primary device updated successfully');
      await loadDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set primary device');
    }
  };

  const handleBlockDevice = async (deviceId: string) => {
    const reason = prompt('Enter reason for blocking this device:');
    if (!reason) return;

    try {
      setError(null);
      setSuccess(null);
      await deviceManagementApi.block(deviceId, reason);
      setSuccess('Device blocked successfully');
      await loadDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block device');
    }
  };

  const handleUnblockDevice = async (deviceId: string) => {
    try {
      setError(null);
      setSuccess(null);
      await deviceManagementApi.unblock(deviceId);
      setSuccess('Device unblocked successfully');
      await loadDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unblock device');
    }
  };

  const handleTrustDevice = async (deviceId: string, trustLevel: string) => {
    try {
      setError(null);
      setSuccess(null);
      await deviceManagementApi.setTrustLevel(deviceId, trustLevel);
      setSuccess('Device trust level updated successfully');
      await loadDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update trust level');
    }
  };

  const getDeviceIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="text-blue-600" size={24} />;
      case 'tablet':
        return <Tablet className="text-purple-600" size={24} />;
      default:
        return <Monitor className="text-gray-600" size={24} />;
    }
  };

  const getTrustIcon = (trustLevel: string) => {
    switch (trustLevel) {
      case 'Verified':
        return <ShieldCheck className="text-green-600" size={20} />;
      case 'Trusted':
        return <Shield className="text-blue-600" size={20} />;
      default:
        return <ShieldAlert className="text-yellow-600" size={20} />;
    }
  };

  const getTrustBadge = (trustLevel: string) => {
    const colors = {
      Verified: 'bg-green-100 text-green-800',
      Trusted: 'bg-blue-100 text-blue-800',
      Untrusted: 'bg-yellow-100 text-yellow-800'
    };
    return colors[trustLevel as keyof typeof colors] || colors.Untrusted;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Devices</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage devices that have access to your account
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 ${
              device.isPrimaryDevice ? 'border-indigo-500' : 'border-gray-200'
            } ${device.isBlocked ? 'opacity-60' : ''}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getDeviceIcon(device.deviceType)}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {device.deviceName || `${device.deviceType || 'Device'}`}
                  </h3>
                  {device.isPrimaryDevice && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      Primary
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getTrustIcon(device.trustLevel)}
              </div>
            </div>

            {/* Trust Level Badge */}
            <div className="mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTrustBadge(device.trustLevel)}`}>
                {device.trustLevel}
              </span>
            </div>

            {/* Device Info */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {device.os && (
                <div className="flex items-center space-x-2">
                  <Chrome size={16} />
                  <span>{device.os} {device.osVersion && `(${device.osVersion})`}</span>
                </div>
              )}
              {device.location && (
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>{device.location}</span>
                </div>
              )}
              {device.lastLoginAt && (
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Last login: {new Date(device.lastLoginAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Total logins: {device.totalLogins}
              </div>
            </div>

            {/* Block Status */}
            {device.isBlocked && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <p className="font-semibold">Blocked</p>
                {device.blockReason && <p className="text-xs mt-1">{device.blockReason}</p>}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              {!device.isPrimaryDevice && !device.isBlocked && (
                <button
                  onClick={() => handleSetPrimary(device.id)}
                  className="w-full px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
                >
                  Set as Primary
                </button>
              )}

              {device.trustLevel !== 'Verified' && !device.isBlocked && (
                <button
                  onClick={() => handleTrustDevice(device.id, 'Verified')}
                  className="w-full px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded hover:bg-green-100"
                >
                  Mark as Verified
                </button>
              )}

              {device.isBlocked ? (
                <button
                  onClick={() => handleUnblockDevice(device.id)}
                  className="w-full px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded hover:bg-green-100"
                >
                  Unblock Device
                </button>
              ) : (
                <button
                  onClick={() => handleBlockDevice(device.id)}
                  className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                >
                  Block Device
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
          <p className="mt-1 text-sm text-gray-500">
            No devices have been registered for your account yet.
          </p>
        </div>
      )}
    </div>
  );
}
