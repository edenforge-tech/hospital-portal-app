'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { deviceManagementApi, DeviceSecurityMetrics, Device } from '@/lib/api/device-management.api';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Lock,
  Unlock,
  Calendar
} from 'lucide-react';

export default function SecurityMonitoringPage() {
  const { user } = useAuthStore();
  const [securityMetrics, setSecurityMetrics] = useState<DeviceSecurityMetrics | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedTimeframe]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [securityResponse, devicesResponse] = await Promise.all([
        deviceManagementApi.getSecurityMetrics(),
        deviceManagementApi.getMyDevices()
      ]);
      
      setSecurityMetrics(securityResponse.data);
      setDevices(devicesResponse.data || []);
    } catch (err: any) {
      console.error('Error loading security data:', err);
      setError(err.response?.data?.message || 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (type.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    } else {
      return <Monitor className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getThreatLevel = (device: Device): { level: string; color: string; icon: React.ReactNode } => {
    const daysSinceLastSeen = device.lastSeenAt 
      ? Math.floor((Date.now() - new Date(device.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (device.isBlocked) {
      return { 
        level: 'Blocked', 
        color: 'red',
        icon: <Ban className="h-4 w-4" />
      };
    }
    
    if (device.trustLevel === 'Untrusted') {
      return { 
        level: 'High Risk', 
        color: 'red',
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }
    
    if (daysSinceLastSeen > 30) {
      return { 
        level: 'Inactive', 
        color: 'yellow',
        icon: <Clock className="h-4 w-4" />
      };
    }
    
    if (device.trustLevel === 'Trusted') {
      return { 
        level: 'Secure', 
        color: 'green',
        icon: <Shield className="h-4 w-4" />
      };
    }
    
    return { 
      level: 'Medium Risk', 
      color: 'yellow',
      icon: <AlertTriangle className="h-4 w-4" />
    };
  };

  const securityEvents = [
    { id: 1, type: 'login_attempt', device: 'iPhone 14', location: 'New York, US', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'device_blocked', device: 'Unknown Android', location: 'Unknown', time: '15 minutes ago', status: 'blocked' },
    { id: 3, type: 'suspicious_activity', device: 'Chrome Browser', location: 'London, UK', time: '1 hour ago', status: 'flagged' },
    { id: 4, type: 'device_approved', device: 'MacBook Pro', location: 'San Francisco, US', time: '2 hours ago', status: 'approved' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
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
            <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
            <p className="text-gray-600">Monitor device security and threat levels</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

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

        {/* Security Metrics Overview */}
        {securityMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.threatsDetected}</p>
                  <p className="text-sm text-red-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{Math.floor(securityMetrics.threatsDetected * 0.1)} today
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Ban className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blocked Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.blockedDevices}</p>
                  <p className="text-sm text-gray-500">
                    {securityMetrics.blockedDevices > 0 ? 'Active blocks' : 'No blocks'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.securityScore}%</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {securityMetrics.securityScore > 85 ? 'Excellent' : securityMetrics.securityScore > 70 ? 'Good' : 'Needs Attention'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trusted Devices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {devices.filter(d => d.trustLevel === 'Trusted').length}
                  </p>
                  <p className="text-sm text-gray-500">
                    of {devices.length} total
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Trends</h3>
            
            {securityMetrics?.securityTrends && securityMetrics.securityTrends.length > 0 ? (
              <div className="space-y-4">
                {securityMetrics.securityTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{trend.date}</p>
                        <p className="text-sm text-gray-600">
                          {trend.threatsBlocked} threats blocked, {trend.newDevices} new devices
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {trend.threatsBlocked > (securityMetrics.securityTrends[index + 1]?.threatsBlocked || 0) ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No security trend data available</p>
            )}
          </div>

          {/* Recent Security Events */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
            
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      event.status === 'success' ? 'bg-green-100' :
                      event.status === 'blocked' ? 'bg-red-100' :
                      event.status === 'flagged' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {event.status === 'success' && <Shield className="h-4 w-4 text-green-600" />}
                      {event.status === 'blocked' && <Ban className="h-4 w-4 text-red-600" />}
                      {event.status === 'flagged' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {event.status === 'approved' && <Lock className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {event.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.device} • {event.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Security Status */}
        <div className="mt-6 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Device Security Status</h3>
          </div>
          
          <div className="p-6">
            {devices.length > 0 ? (
              <div className="space-y-4">
                {devices.slice(0, 10).map((device) => {
                  const threat = getThreatLevel(device);
                  
                  return (
                    <div key={device.id} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-4">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {device.deviceName || device.deviceType || 'Unknown Device'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {device.os} • {device.ipAddress} • 
                            Last seen: {device.lastSeenAt ? formatDate(device.lastSeenAt) : 'Never'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          threat.color === 'green' ? 'bg-green-100 text-green-800' :
                          threat.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {threat.icon}
                          <span className="ml-1">{threat.level}</span>
                        </span>
                        
                        <div className="text-sm text-gray-500">
                          {device.totalLogins} logins
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {devices.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Showing 10 of {devices.length} devices
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Monitor className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No devices are registered for security monitoring.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}