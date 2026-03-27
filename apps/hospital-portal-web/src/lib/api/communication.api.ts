// Communication System API Service
// Secure messaging, video consultations, notifications, and multi-channel communication

import api from './axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'broadcast' | 'patient-provider';
  name?: string;
  description?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  settings: ConversationSettings;
  metadata: {
    patientId?: string;
    appointmentId?: string;
    departmentId?: string;
    priority?: 'normal' | 'high' | 'urgent';
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  oderId: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
  joinedAt: string;
  notifications: 'all' | 'mentions' | 'none';
}

export interface ConversationSettings {
  allowFileSharing: boolean;
  allowVideoCall: boolean;
  allowVoiceCall: boolean;
  retentionDays: number;
  isEncrypted: boolean;
  hipaaCompliant: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  htmlContent?: string;
  attachments: Attachment[];
  reactions: Reaction[];
  mentions: Mention[];
  replyTo?: string;
  replyToMessage?: Message;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  readBy: ReadReceipt[];
  deliveredTo: string[];
  metadata: {
    priority?: 'normal' | 'high' | 'urgent';
    expiresAt?: string;
    isSystemMessage?: boolean;
    actionRequired?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'file' 
  | 'video' 
  | 'audio' 
  | 'link' 
  | 'system' 
  | 'appointment' 
  | 'prescription' 
  | 'labResult' 
  | 'referral'
  | 'consent'
  | 'form';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  isSecure: boolean;
  expiresAt?: string;
  downloadCount: number;
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Mention {
  userId: string;
  userName: string;
  startIndex: number;
  endIndex: number;
}

export interface ReadReceipt {
  userId: string;
  userName: string;
  readAt: string;
}

export interface VideoCall {
  id: string;
  conversationId?: string;
  appointmentId?: string;
  type: 'video' | 'audio' | 'screen-share';
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'missed';
  host: CallParticipant;
  participants: CallParticipant[];
  maxParticipants: number;
  settings: VideoCallSettings;
  recording?: Recording;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  roomUrl: string;
  accessCode?: string;
  waitingRoom: boolean;
  metadata: {
    patientId?: string;
    providerId?: string;
    departmentId?: string;
    visitType?: string;
    notes?: string;
  };
  createdAt: string;
}

export interface CallParticipant {
  id: string;
  oderId: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'host' | 'co-host' | 'participant' | 'viewer';
  status: 'invited' | 'waiting' | 'connected' | 'disconnected' | 'declined';
  joinedAt?: string;
  leftAt?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface VideoCallSettings {
  allowRecording: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowParticipantVideo: boolean;
  allowParticipantAudio: boolean;
  allowVirtualBackground: boolean;
  enableWaitingRoom: boolean;
  enableEncryption: boolean;
  maxDuration: number;
  autoEndOnHostLeave: boolean;
  muteOnEntry: boolean;
  videoOffOnEntry: boolean;
}

export interface Recording {
  id: string;
  callId: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  url?: string;
  duration?: number;
  size?: number;
  startedAt: string;
  endedAt?: string;
  expiresAt: string;
  downloadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data: Record<string, any>;
  action?: NotificationAction;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'message' 
  | 'appointment' 
  | 'reminder' 
  | 'alert' 
  | 'task' 
  | 'update' 
  | 'announcement' 
  | 'lab-result' 
  | 'prescription' 
  | 'billing'
  | 'system';

export interface NotificationAction {
  type: 'link' | 'button' | 'dismiss';
  label: string;
  url?: string;
  callback?: string;
}

export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push' | 'slack' | 'teams';

export interface NotificationPreferences {
  userId: string;
  channels: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
      schedule?: {
        quiet: { start: string; end: string };
        days: number[];
      };
    };
  };
  globalSettings: {
    doNotDisturb: boolean;
    doNotDisturbSchedule?: { start: string; end: string };
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    previewEnabled: boolean;
    groupByConversation: boolean;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  priority: 'low' | 'normal' | 'high' | 'critical';
  targetAudience: {
    type: 'all' | 'departments' | 'roles' | 'users';
    ids?: string[];
  };
  schedule?: {
    publishAt: string;
    expireAt: string;
  };
  attachments: Attachment[];
  acknowledgmentRequired: boolean;
  acknowledgments: {
    userId: string;
    acknowledgedAt: string;
  }[];
  status: 'draft' | 'scheduled' | 'published' | 'expired' | 'archived';
  publishedBy?: string;
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'message' | 'email' | 'sms' | 'notification';
  category: string;
  subject?: string;
  content: string;
  htmlContent?: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  status: 'active' | 'draft' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}

export interface Contact {
  id: string;
  userId?: string;
  type: 'internal' | 'external' | 'patient' | 'vendor' | 'emergency';
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  title?: string;
  organization?: string;
  status: 'active' | 'inactive';
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  lastContactedAt?: string;
  createdAt: string;
}

// ============================================================================
// CONVERSATIONS API
// ============================================================================

export const conversationsApi = {
  // Get all conversations
  getConversations: async (params?: { 
    type?: string; 
    archived?: boolean; 
    unreadOnly?: boolean;
    search?: string;
  }): Promise<Conversation[]> => {
    const response = await api.get('/communication/conversations', { params });
    return response.data;
  },

  // Get conversation by ID
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/communication/conversations/${id}`);
    return response.data;
  },

  // Create conversation
  createConversation: async (data: {
    type: Conversation['type'];
    name?: string;
    description?: string;
    participants: string[];
    settings?: Partial<ConversationSettings>;
    metadata?: Record<string, any>;
  }): Promise<Conversation> => {
    const response = await api.post('/communication/conversations', data);
    return response.data;
  },

  // Update conversation
  updateConversation: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
    const response = await api.put(`/communication/conversations/${id}`, data);
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/communication/conversations/${id}`);
  },

  // Archive conversation
  archiveConversation: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/archive`);
  },

  // Unarchive conversation
  unarchiveConversation: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/unarchive`);
  },

  // Pin conversation
  pinConversation: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/pin`);
  },

  // Unpin conversation
  unpinConversation: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/unpin`);
  },

  // Mute conversation
  muteConversation: async (id: string, duration?: number): Promise<void> => {
    await api.post(`/communication/conversations/${id}/mute`, { duration });
  },

  // Unmute conversation
  unmuteConversation: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/unmute`);
  },

  // Add participants
  addParticipants: async (id: string, userIds: string[]): Promise<void> => {
    await api.post(`/communication/conversations/${id}/participants`, { userIds });
  },

  // Remove participant
  removeParticipant: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/communication/conversations/${id}/participants/${userId}`);
  },

  // Leave conversation
  leaveConversation: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/leave`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ total: number; byConversation: Record<string, number> }> => {
    const response = await api.get('/communication/conversations/unread');
    return response.data;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/communication/conversations/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/communication/conversations/read-all');
  }
};

// ============================================================================
// MESSAGES API
// ============================================================================

export const messagesApi = {
  // Get messages for conversation
  getMessages: async (conversationId: string, params?: { 
    before?: string; 
    after?: string; 
    limit?: number;
    search?: string;
  }): Promise<{ messages: Message[]; hasMore: boolean }> => {
    const response = await api.get(`/communication/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId: string, data: {
    type: MessageType;
    content: string;
    attachments?: File[];
    replyTo?: string;
    mentions?: string[];
    metadata?: Record<string, any>;
  }): Promise<Message> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('content', data.content);
    if (data.replyTo) formData.append('replyTo', data.replyTo);
    if (data.mentions) formData.append('mentions', JSON.stringify(data.mentions));
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
    if (data.attachments) {
      data.attachments.forEach(file => formData.append('attachments', file));
    }
    
    const response = await api.post(`/communication/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Edit message
  editMessage: async (conversationId: string, messageId: string, content: string): Promise<Message> => {
    const response = await api.put(`/communication/conversations/${conversationId}/messages/${messageId}`, { content });
    return response.data;
  },

  // Delete message
  deleteMessage: async (conversationId: string, messageId: string): Promise<void> => {
    await api.delete(`/communication/conversations/${conversationId}/messages/${messageId}`);
  },

  // React to message
  addReaction: async (conversationId: string, messageId: string, emoji: string): Promise<void> => {
    await api.post(`/communication/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji });
  },

  // Remove reaction
  removeReaction: async (conversationId: string, messageId: string, emoji: string): Promise<void> => {
    await api.delete(`/communication/conversations/${conversationId}/messages/${messageId}/reactions/${emoji}`);
  },

  // Forward message
  forwardMessage: async (messageId: string, conversationIds: string[]): Promise<void> => {
    await api.post(`/communication/messages/${messageId}/forward`, { conversationIds });
  },

  // Search messages
  searchMessages: async (query: string, params?: {
    conversationId?: string;
    type?: MessageType;
    fromDate?: string;
    toDate?: string;
    senderId?: string;
  }): Promise<Message[]> => {
    const response = await api.get('/communication/messages/search', { params: { query, ...params } });
    return response.data;
  },

  // Get pinned messages
  getPinnedMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/communication/conversations/${conversationId}/messages/pinned`);
    return response.data;
  },

  // Pin message
  pinMessage: async (conversationId: string, messageId: string): Promise<void> => {
    await api.post(`/communication/conversations/${conversationId}/messages/${messageId}/pin`);
  },

  // Unpin message
  unpinMessage: async (conversationId: string, messageId: string): Promise<void> => {
    await api.post(`/communication/conversations/${conversationId}/messages/${messageId}/unpin`);
  },

  // Mark message as important
  markImportant: async (conversationId: string, messageId: string): Promise<void> => {
    await api.post(`/communication/conversations/${conversationId}/messages/${messageId}/important`);
  }
};

// ============================================================================
// VIDEO CALLS API
// ============================================================================

export const videoCallsApi = {
  // Get all calls
  getCalls: async (params?: { status?: string; type?: string }): Promise<VideoCall[]> => {
    const response = await api.get('/communication/calls', { params });
    return response.data;
  },

  // Get call by ID
  getCall: async (id: string): Promise<VideoCall> => {
    const response = await api.get(`/communication/calls/${id}`);
    return response.data;
  },

  // Create/schedule call
  createCall: async (data: {
    type: VideoCall['type'];
    conversationId?: string;
    appointmentId?: string;
    participants: string[];
    scheduledAt?: string;
    settings?: Partial<VideoCallSettings>;
    metadata?: Record<string, any>;
  }): Promise<VideoCall> => {
    const response = await api.post('/communication/calls', data);
    return response.data;
  },

  // Start call
  startCall: async (id: string): Promise<{ roomUrl: string; token: string }> => {
    const response = await api.post(`/communication/calls/${id}/start`);
    return response.data;
  },

  // Join call
  joinCall: async (id: string, accessCode?: string): Promise<{ roomUrl: string; token: string }> => {
    const response = await api.post(`/communication/calls/${id}/join`, { accessCode });
    return response.data;
  },

  // Leave call
  leaveCall: async (id: string): Promise<void> => {
    await api.post(`/communication/calls/${id}/leave`);
  },

  // End call
  endCall: async (id: string): Promise<void> => {
    await api.post(`/communication/calls/${id}/end`);
  },

  // Cancel scheduled call
  cancelCall: async (id: string, reason?: string): Promise<void> => {
    await api.post(`/communication/calls/${id}/cancel`, { reason });
  },

  // Update call settings
  updateCallSettings: async (id: string, settings: Partial<VideoCallSettings>): Promise<void> => {
    await api.patch(`/communication/calls/${id}/settings`, settings);
  },

  // Invite participant
  inviteParticipant: async (callId: string, userId: string): Promise<void> => {
    await api.post(`/communication/calls/${callId}/invite`, { userId });
  },

  // Remove participant
  removeParticipant: async (callId: string, participantId: string): Promise<void> => {
    await api.delete(`/communication/calls/${callId}/participants/${participantId}`);
  },

  // Mute participant
  muteParticipant: async (callId: string, participantId: string): Promise<void> => {
    await api.post(`/communication/calls/${callId}/participants/${participantId}/mute`);
  },

  // Start recording
  startRecording: async (id: string): Promise<Recording> => {
    const response = await api.post(`/communication/calls/${id}/recording/start`);
    return response.data;
  },

  // Stop recording
  stopRecording: async (id: string): Promise<Recording> => {
    const response = await api.post(`/communication/calls/${id}/recording/stop`);
    return response.data;
  },

  // Get recordings
  getRecordings: async (callId: string): Promise<Recording[]> => {
    const response = await api.get(`/communication/calls/${callId}/recordings`);
    return response.data;
  },

  // Get call stats
  getCallStats: async (id: string): Promise<any> => {
    const response = await api.get(`/communication/calls/${id}/stats`);
    return response.data;
  },

  // Get upcoming calls
  getUpcomingCalls: async (): Promise<VideoCall[]> => {
    const response = await api.get('/communication/calls/upcoming');
    return response.data;
  },

  // Get call history
  getCallHistory: async (params?: { fromDate?: string; toDate?: string }): Promise<VideoCall[]> => {
    const response = await api.get('/communication/calls/history', { params });
    return response.data;
  }
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsApi = {
  // Get notifications
  getNotifications: async (params?: { 
    type?: NotificationType; 
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; total: number; unread: number }> => {
    const response = await api.get('/communication/notifications', { params });
    return response.data;
  },

  // Get notification by ID
  getNotification: async (id: string): Promise<Notification> => {
    const response = await api.get(`/communication/notifications/${id}`);
    return response.data;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/communication/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/communication/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/communication/notifications/${id}`);
  },

  // Clear all notifications
  clearAll: async (): Promise<void> => {
    await api.delete('/communication/notifications');
  },

  // Get notification preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get('/communication/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await api.put('/communication/notifications/preferences', preferences);
    return response.data;
  },

  // Subscribe to push notifications
  subscribePush: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await api.post('/communication/notifications/push/subscribe', subscription);
  },

  // Unsubscribe from push notifications
  unsubscribePush: async (): Promise<void> => {
    await api.post('/communication/notifications/push/unsubscribe');
  },

  // Send test notification
  sendTest: async (channel: NotificationChannel): Promise<void> => {
    await api.post('/communication/notifications/test', { channel });
  }
};

// ============================================================================
// ANNOUNCEMENTS API
// ============================================================================

export const announcementsApi = {
  // Get announcements
  getAnnouncements: async (params?: { status?: string; priority?: string }): Promise<Announcement[]> => {
    const response = await api.get('/communication/announcements', { params });
    return response.data;
  },

  // Get announcement by ID
  getAnnouncement: async (id: string): Promise<Announcement> => {
    const response = await api.get(`/communication/announcements/${id}`);
    return response.data;
  },

  // Create announcement
  createAnnouncement: async (data: Partial<Announcement>): Promise<Announcement> => {
    const response = await api.post('/communication/announcements', data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (id: string, data: Partial<Announcement>): Promise<Announcement> => {
    const response = await api.put(`/communication/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (id: string): Promise<void> => {
    await api.delete(`/communication/announcements/${id}`);
  },

  // Publish announcement
  publishAnnouncement: async (id: string): Promise<void> => {
    await api.post(`/communication/announcements/${id}/publish`);
  },

  // Archive announcement
  archiveAnnouncement: async (id: string): Promise<void> => {
    await api.post(`/communication/announcements/${id}/archive`);
  },

  // Acknowledge announcement
  acknowledgeAnnouncement: async (id: string): Promise<void> => {
    await api.post(`/communication/announcements/${id}/acknowledge`);
  },

  // Get active announcements
  getActiveAnnouncements: async (): Promise<Announcement[]> => {
    const response = await api.get('/communication/announcements/active');
    return response.data;
  }
};

// ============================================================================
// TEMPLATES API
// ============================================================================

export const templatesApi = {
  // Get templates
  getTemplates: async (params?: { type?: string; category?: string }): Promise<Template[]> => {
    const response = await api.get('/communication/templates', { params });
    return response.data;
  },

  // Get template by ID
  getTemplate: async (id: string): Promise<Template> => {
    const response = await api.get(`/communication/templates/${id}`);
    return response.data;
  },

  // Create template
  createTemplate: async (data: Partial<Template>): Promise<Template> => {
    const response = await api.post('/communication/templates', data);
    return response.data;
  },

  // Update template
  updateTemplate: async (id: string, data: Partial<Template>): Promise<Template> => {
    const response = await api.put(`/communication/templates/${id}`, data);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/communication/templates/${id}`);
  },

  // Preview template
  previewTemplate: async (id: string, variables: Record<string, any>): Promise<{ content: string; htmlContent?: string }> => {
    const response = await api.post(`/communication/templates/${id}/preview`, { variables });
    return response.data;
  },

  // Duplicate template
  duplicateTemplate: async (id: string, name: string): Promise<Template> => {
    const response = await api.post(`/communication/templates/${id}/duplicate`, { name });
    return response.data;
  }
};

// ============================================================================
// CONTACTS API
// ============================================================================

export const contactsApi = {
  // Get contacts
  getContacts: async (params?: { type?: string; search?: string }): Promise<Contact[]> => {
    const response = await api.get('/communication/contacts', { params });
    return response.data;
  },

  // Get contact by ID
  getContact: async (id: string): Promise<Contact> => {
    const response = await api.get(`/communication/contacts/${id}`);
    return response.data;
  },

  // Create contact
  createContact: async (data: Partial<Contact>): Promise<Contact> => {
    const response = await api.post('/communication/contacts', data);
    return response.data;
  },

  // Update contact
  updateContact: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.put(`/communication/contacts/${id}`, data);
    return response.data;
  },

  // Delete contact
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/communication/contacts/${id}`);
  },

  // Toggle favorite
  toggleFavorite: async (id: string): Promise<void> => {
    await api.post(`/communication/contacts/${id}/favorite`);
  },

  // Get favorites
  getFavorites: async (): Promise<Contact[]> => {
    const response = await api.get('/communication/contacts/favorites');
    return response.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<Contact[]> => {
    const response = await api.get('/communication/contacts/search', { params: { query } });
    return response.data;
  },

  // Get online users
  getOnlineUsers: async (): Promise<Contact[]> => {
    const response = await api.get('/communication/contacts/online');
    return response.data;
  }
};

export default {
  conversationsApi,
  messagesApi,
  videoCallsApi,
  notificationsApi,
  announcementsApi,
  templatesApi,
  contactsApi
};
