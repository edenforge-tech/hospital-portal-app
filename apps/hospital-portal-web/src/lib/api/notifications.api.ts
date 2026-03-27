import { getApi } from '../api';

// Interfaces
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  isRead: boolean;
  readAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  readToday: number;
  byType: { type: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

/**
 * Notifications API Client
 * Manages user notifications with read/unread tracking
 */
export const notificationsApi = {
  /**
   * Get all notifications with filters
   */
  async getAll(filters?: NotificationFilters): Promise<{ data: Notification[] }> {
    const params: any = {};
    if (filters?.isRead !== undefined) params.isRead = filters.isRead;
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.pageSize = filters.pageSize;

    return getApi().get('/notifications', { params });
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<{ data: { count: number } }> {
    return getApi().get('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<{ data: Notification }> {
    return getApi().put(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ data: { count: number } }> {
    return getApi().put('/notifications/mark-all-read', {});
  },

  /**
   * Delete notification
   */
  async delete(id: string): Promise<void> {
    return getApi().delete(`/notifications/${id}`);
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<{ data: NotificationStats }> {
    return getApi().get('/notifications/stats');
  }
};
