'use client';

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

// Using existing notifications API structure
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  category: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    loadNotifications();
  }, [activeTab, filterType, filterPriority, filterCategory]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const api = getApi();
      const params: any = {};
      
      if (activeTab === 'unread') params.isRead = false;
      if (activeTab === 'read') params.isRead = true;
      if (filterType) params.type = filterType;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;

      const response = await api.get('/notifications', { params });
      setNotifications(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const api = getApi();
      await api.post(`/notifications/${id}/mark-read`);
      loadNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      const api = getApi();
      await api.post(`/notifications/${id}/mark-unread`);
      loadNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as unread');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const api = getApi();
      await api.post('/notifications/mark-all-read');
      loadNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      const api = getApi();
      await api.delete(`/notifications/${id}`);
      loadNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type as keyof typeof colors]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority as keyof typeof colors]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const NotificationIcon = ({ type }: { type: string }) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };
    return <span className="text-2xl">{icons[type as keyof typeof icons] || '📬'}</span>;
  };

  const MetricCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentCount = notifications.filter((n) => n.priority === 'urgent' && !n.isRead).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Notifications" value={notifications.length} color="text-blue-600" />
        <MetricCard label="Unread" value={unreadCount} color="text-purple-600" />
        <MetricCard label="Urgent Unread" value={urgentCount} color="text-red-600" />
        <MetricCard label="Read Today" value={notifications.filter((n) => n.isRead && n.readAt && new Date(n.readAt).toDateString() === new Date().toDateString()).length} color="text-green-600" />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {['all', 'unread', 'read'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-4">
            <select
              className="border rounded-md px-3 py-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              className="border rounded-md px-3 py-2"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              className="border rounded-md px-3 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="system">System</option>
              <option value="appointment">Appointment</option>
              <option value="patient">Patient</option>
              <option value="billing">Billing</option>
              <option value="clinical">Clinical</option>
              <option value="administrative">Administrative</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <div>No notifications found</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedNotification(notification);
                  setShowDetailModal(true);
                  if (!notification.isRead) handleMarkAsRead(notification.id);
                }}
              >
                <div className="flex items-start gap-4">
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold">{notification.title}</div>
                      <div className="flex gap-2">
                        <TypeBadge type={notification.type} />
                        <PriorityBadge priority={notification.priority} />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.category && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{notification.category}</span>
                        </>
                      )}
                      {notification.senderName && (
                        <>
                          <span>•</span>
                          <span>From: {notification.senderName}</span>
                        </>
                      )}
                      {!notification.isRead && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-blue-600">UNREAD</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {notification.isRead ? (
                      <button
                        onClick={() => handleMarkAsUnread(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Mark Unread
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notification Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <TypeBadge type={selectedNotification.type} />
                <PriorityBadge priority={selectedNotification.priority} />
                {selectedNotification.category && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    {selectedNotification.category.toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Title</div>
                <div className="font-semibold text-lg">{selectedNotification.title}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Message</div>
                <div className="text-sm whitespace-pre-wrap">{selectedNotification.message}</div>
              </div>

              {selectedNotification.senderName && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">From</div>
                  <div className="text-sm">{selectedNotification.senderName}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Created</div>
                  <div className="text-sm">{new Date(selectedNotification.createdAt).toLocaleString()}</div>
                </div>
                {selectedNotification.readAt && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Read</div>
                    <div className="text-sm">{new Date(selectedNotification.readAt).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {selectedNotification.actionUrl && (
                <div className="pt-4 border-t">
                  <a
                    href={selectedNotification.actionUrl}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    → Go to related item
                  </a>
                </div>
              )}

              {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">Additional Information</div>
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <pre>{JSON.stringify(selectedNotification.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              {selectedNotification.isRead ? (
                <button
                  onClick={() => {
                    handleMarkAsUnread(selectedNotification.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Mark as Unread
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(selectedNotification.id);
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
