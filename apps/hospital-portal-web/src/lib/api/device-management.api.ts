import { getApi } from '../api';

export interface Device {
  id: string;
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  os?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  trustLevel: 'Untrusted' | 'Trusted' | 'Verified';
  isBlocked: boolean;
  blockReason?: string;
  isPrimaryDevice: boolean;
  registeredAt: string;
  lastSeenAt?: string;
  lastLoginAt?: string;
  totalLogins: number;
  status: string;
}

export interface RegisterDeviceDto {
  deviceName?: string;
  deviceType: string;
  os: string;
  browser: string;
  ipAddress: string;
  userAgent: string;
}

export const deviceManagementApi = {
  // Get all devices for current user
  getMyDevices: async () => {
    return getApi().get<Device[]>('/device-management/my-devices');
  },

  // Get all devices for a specific user (admin)
  getUserDevices: async (userId: string) => {
    return getApi().get<Device[]>(`/device-management/user/${userId}/devices`);
  },

  // Register a new device
  register: async (data: RegisterDeviceDto) => {
    return getApi().post<Device>('/device-management/register', data);
  },

  // Update device trust level
  setTrustLevel: async (deviceId: string, trustLevel: string) => {
    return getApi().put(`/device-management/${deviceId}/trust-level`, { trustLevel });
  },

  // Set primary device
  setPrimary: async (deviceId: string) => {
    return getApi().put(`/device-management/${deviceId}/set-primary`, {});
  },

  // Block device
  block: async (deviceId: string, reason: string) => {
    return getApi().put(`/device-management/${deviceId}/block`, { reason });
  },

  // Unblock device
  unblock: async (deviceId: string) => {
    return getApi().put(`/device-management/${deviceId}/unblock`, {});
  },

  // Delete device
  delete: async (deviceId: string) => {
    return getApi().delete(`/device-management/${deviceId}`);
  }
};
