'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  Search, 
  Plus, 
  MoreVertical, 
  Settings,
  Users,
  Star,
  Archive,
  Pin,
  Bell,
  BellOff,
  Trash2,
  Edit,
  Reply,
  Forward,
  Copy,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Monitor,
  Maximize2,
  Minimize2,
  UserPlus,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  Shield,
  Lock,
  Megaphone,
  Hash,
  AtSign,
  Camera,
  ScreenShare,
  Hand,
  Volume2,
  VolumeX,
  Radio,
  Circle
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'patient-provider';
  name: string;
  avatar?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isOnline?: boolean;
  updatedAt: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system' | 'appointment';
  attachments?: Attachment[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  replyTo?: Message;
  isEdited: boolean;
  readBy: string[];
  createdAt: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

interface VideoCall {
  id: string;
  status: 'ringing' | 'connected' | 'ended';
  participants: CallParticipant[];
  startedAt?: string;
  duration?: number;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  priority: 'low' | 'normal' | 'high' | 'critical';
  publishedAt: string;
  publishedBy: string;
  acknowledgmentRequired: boolean;
  acknowledged: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const currentUserId = 'current-user';

const mockConversations: Conversation[] = [
  {
    id: '1',
    type: 'direct',
    name: 'Dr. Sarah Johnson',
    avatar: undefined,
    participants: [
      { id: '1', name: 'Dr. Sarah Johnson', role: 'Cardiologist', status: 'online' }
    ],
    lastMessage: {
      id: 'm1',
      senderId: '1',
      senderName: 'Dr. Sarah Johnson',
      content: 'The patient\'s ECG results are ready for review',
      type: 'text',
      isEdited: false,
      readBy: [],
      createdAt: '2026-01-23T10:30:00Z'
    },
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    isOnline: true,
    updatedAt: '2026-01-23T10:30:00Z'
  },
  {
    id: '2',
    type: 'group',
    name: 'Emergency Department',
    participants: [
      { id: '2', name: 'Dr. Michael Chen', role: 'ER Physician', status: 'online' },
      { id: '3', name: 'Nurse Emily Davis', role: 'ER Nurse', status: 'away' },
      { id: '4', name: 'Dr. James Wilson', role: 'Trauma Surgeon', status: 'busy' }
    ],
    lastMessage: {
      id: 'm2',
      senderId: '2',
      senderName: 'Dr. Michael Chen',
      content: 'Incoming trauma patient - ETA 5 minutes',
      type: 'text',
      isEdited: false,
      readBy: ['3'],
      createdAt: '2026-01-23T10:25:00Z'
    },
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    updatedAt: '2026-01-23T10:25:00Z'
  },
  {
    id: '3',
    type: 'patient-provider',
    name: 'John Smith (Patient)',
    participants: [
      { id: '5', name: 'John Smith', role: 'Patient', status: 'offline' }
    ],
    lastMessage: {
      id: 'm3',
      senderId: currentUserId,
      senderName: 'You',
      content: 'Your prescription has been sent to the pharmacy',
      type: 'text',
      isEdited: false,
      readBy: ['5'],
      createdAt: '2026-01-23T09:15:00Z'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    updatedAt: '2026-01-23T09:15:00Z'
  },
  {
    id: '4',
    type: 'channel',
    name: 'Hospital Announcements',
    participants: [],
    lastMessage: {
      id: 'm4',
      senderId: 'admin',
      senderName: 'Admin',
      content: 'Staff meeting scheduled for Friday at 2 PM',
      type: 'system',
      isEdited: false,
      readBy: [],
      createdAt: '2026-01-22T16:00:00Z'
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: true,
    isArchived: false,
    updatedAt: '2026-01-22T16:00:00Z'
  },
  {
    id: '5',
    type: 'direct',
    name: 'Dr. Lisa Anderson',
    participants: [
      { id: '6', name: 'Dr. Lisa Anderson', role: 'Neurologist', status: 'away' }
    ],
    lastMessage: {
      id: 'm5',
      senderId: '6',
      senderName: 'Dr. Lisa Anderson',
      content: 'Can you review the MRI scans when you get a chance?',
      type: 'text',
      isEdited: false,
      readBy: [currentUserId],
      createdAt: '2026-01-22T14:30:00Z'
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isOnline: false,
    updatedAt: '2026-01-22T14:30:00Z'
  }
];

const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: '1',
    senderName: 'Dr. Sarah Johnson',
    content: 'Good morning! I wanted to discuss the cardiac patient from Room 302.',
    type: 'text',
    isEdited: false,
    readBy: [currentUserId],
    createdAt: '2026-01-23T09:00:00Z'
  },
  {
    id: 'm2',
    senderId: currentUserId,
    senderName: 'You',
    content: 'Good morning! Yes, I reviewed the case. The patient is showing improvement.',
    type: 'text',
    isEdited: false,
    readBy: ['1'],
    createdAt: '2026-01-23T09:05:00Z'
  },
  {
    id: 'm3',
    senderId: '1',
    senderName: 'Dr. Sarah Johnson',
    content: 'Great to hear! I\'ve attached the latest ECG results.',
    type: 'text',
    attachments: [
      { id: 'a1', name: 'ECG_Report_Room302.pdf', type: 'application/pdf', size: 245760, url: '#' }
    ],
    isEdited: false,
    readBy: [currentUserId],
    createdAt: '2026-01-23T09:10:00Z'
  },
  {
    id: 'm4',
    senderId: currentUserId,
    senderName: 'You',
    content: 'The rhythm looks much better. Should we consider reducing the medication dosage?',
    type: 'text',
    isEdited: false,
    readBy: ['1'],
    createdAt: '2026-01-23T09:15:00Z'
  },
  {
    id: 'm5',
    senderId: '1',
    senderName: 'Dr. Sarah Johnson',
    content: 'I agree. Let\'s discuss during rounds. Can we do a quick video call at 10:30?',
    type: 'text',
    reactions: [{ emoji: '👍', count: 1, users: [currentUserId] }],
    isEdited: false,
    readBy: [currentUserId],
    createdAt: '2026-01-23T09:20:00Z'
  },
  {
    id: 'm6',
    senderId: currentUserId,
    senderName: 'You',
    content: 'Perfect, I\'ll be available.',
    type: 'text',
    isEdited: false,
    readBy: ['1'],
    createdAt: '2026-01-23T09:25:00Z'
  },
  {
    id: 'm7',
    senderId: '1',
    senderName: 'Dr. Sarah Johnson',
    content: 'The patient\'s ECG results are ready for review',
    type: 'text',
    isEdited: false,
    readBy: [],
    createdAt: '2026-01-23T10:30:00Z'
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'System Maintenance Scheduled',
    content: 'The hospital information system will undergo scheduled maintenance on January 25th from 2:00 AM to 4:00 AM. Please ensure all critical data is saved before this time.',
    type: 'warning',
    priority: 'high',
    publishedAt: '2026-01-23T08:00:00Z',
    publishedBy: 'IT Department',
    acknowledgmentRequired: true,
    acknowledged: false
  },
  {
    id: 'a2',
    title: 'New COVID-19 Protocols',
    content: 'Updated infection control protocols have been released. All staff must complete the online training module by January 31st.',
    type: 'alert',
    priority: 'critical',
    publishedAt: '2026-01-22T14:00:00Z',
    publishedBy: 'Infection Control',
    acknowledgmentRequired: true,
    acknowledged: true
  },
  {
    id: 'a3',
    title: 'Staff Appreciation Event',
    content: 'Join us for our annual staff appreciation event on February 14th. RSVP by February 7th.',
    type: 'info',
    priority: 'normal',
    publishedAt: '2026-01-20T10:00:00Z',
    publishedBy: 'HR Department',
    acknowledgmentRequired: false,
    acknowledged: false
  }
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const Avatar: React.FC<{ name: string; avatar?: string; size?: 'sm' | 'md' | 'lg'; status?: string }> = ({ 
  name, 
  avatar, 
  size = 'md',
  status 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      {avatar ? (
        <img src={avatar} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium`}>
          {initials}
        </div>
      )}
      {status && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[status as keyof typeof statusColors]}`} />
      )}
    </div>
  );
};

const ConversationListItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ conversation, isSelected, onClick }) => {
  const typeIcons = {
    direct: null,
    group: <Users className="w-3 h-3" />,
    channel: <Hash className="w-3 h-3" />,
    'patient-provider': <Shield className="w-3 h-3" />
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="relative">
        <Avatar 
          name={conversation.name} 
          status={conversation.type === 'direct' ? (conversation.isOnline ? 'online' : 'offline') : undefined}
        />
        {conversation.type !== 'direct' && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {typeIcons[conversation.type]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {conversation.name}
            </span>
            {conversation.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
            {conversation.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
          </span>
        </div>
        {conversation.lastMessage && (
          <div className="flex items-center justify-between mt-1">
            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              {conversation.lastMessage.senderId === currentUserId && (
                <span className="text-gray-400">You: </span>
              )}
              {conversation.lastMessage.content}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

const MessageBubble: React.FC<{ message: Message; isOwn: boolean; showAvatar: boolean }> = ({ 
  message, 
  isOwn, 
  showAvatar 
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div 
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar ? (
        <Avatar name={message.senderName} size="sm" />
      ) : (
        <div className="w-8" />
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isOwn && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">{message.senderName}</p>
        )}
        <div className="relative">
          <div className={`px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
          }`}>
            {message.replyTo && (
              <div className={`text-xs mb-2 pb-2 border-b ${isOwn ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'}`}>
                <p className="opacity-70">Replying to {message.replyTo.senderName}</p>
                <p className="truncate">{message.replyTo.content}</p>
              </div>
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isOwn ? 'bg-blue-500/50' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm truncate">{attachment.name}</span>
                    <span className="text-xs opacity-70">{(attachment.size / 1024).toFixed(1)} KB</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} flex items-center gap-1`}>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded shadow">
                <Smile className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded shadow">
                <Reply className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded shadow">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
            {message.reactions.map((reaction, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </div>
        )}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
          <span>{formatTime(message.createdAt)}</span>
          {message.isEdited && <span>· Edited</span>}
          {isOwn && (
            message.readBy.length > 0 
              ? <CheckCheck className="w-3 h-3 text-blue-500" />
              : <Check className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
};

const AnnouncementBanner: React.FC<{ announcement: Announcement; onAcknowledge: () => void; onDismiss: () => void }> = ({
  announcement,
  onAcknowledge,
  onDismiss
}) => {
  const typeColors = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    alert: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
  };

  const typeIcons = {
    info: <Circle className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    alert: <AlertCircle className="w-5 h-5 text-red-500" />,
    success: <Check className="w-5 h-5 text-green-500" />
  };

  return (
    <div className={`p-4 border rounded-lg ${typeColors[announcement.type]}`}>
      <div className="flex items-start gap-3">
        {typeIcons[announcement.type]}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">{announcement.title}</h4>
            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{announcement.content}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {announcement.publishedBy} · {new Date(announcement.publishedAt).toLocaleDateString()}
            </p>
            {announcement.acknowledgmentRequired && !announcement.acknowledged && (
              <button
                onClick={onAcknowledge}
                className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoCallModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  participantName: string;
}> = ({ isOpen, onClose, participantName }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(timer);
    }
    setCallDuration(0);
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm">{formatDuration(callDuration)}</span>
          </div>
          <div className="w-px h-6 bg-gray-700" />
          <Lock className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-400">End-to-end encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
            <UserPlus className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
          {/* Remote Video */}
          <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center relative">
            <Avatar name={participantName} size="lg" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-gray-900/70 rounded-full">
              <span className="text-white text-sm">{participantName}</span>
              <Volume2 className="w-4 h-4 text-green-500" />
            </div>
          </div>
          
          {/* Local Video */}
          <div className="aspect-video bg-gray-700 rounded-2xl flex items-center justify-center relative">
            {isVideoOff ? (
              <Avatar name="You" size="lg" />
            ) : (
              <Camera className="w-12 h-12 text-gray-500" />
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-gray-900/70 rounded-full">
              <span className="text-white text-sm">You</span>
              {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-green-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 bg-gray-900/50">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-4 rounded-full ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        >
          <Monitor className="w-6 h-6" />
        </button>
        <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
          <Hand className="w-6 h-6" />
        </button>
        <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
          <MessageSquare className="w-6 h-6" />
        </button>
        <button
          onClick={onClose}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunicationPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isInCall, setIsInCall] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: currentUserId,
      senderName: 'You',
      content: newMessage.trim(),
      type: 'text',
      isEdited: false,
      readBy: [],
      createdAt: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || conv.type === filterType;
    return matchesSearch && matchesFilter && !conv.isArchived;
  });

  const unacknowledgedAnnouncements = announcements.filter(a => a.acknowledgmentRequired && !a.acknowledged);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Messages
            </h1>
            <button 
              onClick={() => setShowNewConversation(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3">
            {[
              { id: 'all', label: 'All' },
              { id: 'direct', label: 'Direct' },
              { id: 'group', label: 'Groups' },
              { id: 'patient-provider', label: 'Patients' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === filter.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned Conversations */}
          {filteredConversations.filter(c => c.isPinned).length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pinned</p>
              {filteredConversations.filter(c => c.isPinned).map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversation?.id === conv.id}
                  onClick={() => setSelectedConversation(conv)}
                />
              ))}
            </div>
          )}

          {/* Recent Conversations */}
          <div>
            <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recent</p>
            {filteredConversations.filter(c => !c.isPinned).map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversation?.id === conv.id}
                onClick={() => setSelectedConversation(conv)}
              />
            ))}
          </div>

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar 
                  name={selectedConversation.name} 
                  status={selectedConversation.type === 'direct' ? (selectedConversation.isOnline ? 'online' : 'offline') : undefined}
                />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConversation.type === 'direct' 
                      ? (selectedConversation.isOnline ? 'Online' : 'Offline')
                      : `${selectedConversation.participants.length} participants`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsInCall(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsInCall(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Announcements */}
            {showAnnouncements && unacknowledgedAnnouncements.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 space-y-3">
                {unacknowledgedAnnouncements.slice(0, 2).map((announcement) => (
                  <AnnouncementBanner
                    key={announcement.id}
                    announcement={announcement}
                    onAcknowledge={() => {
                      setAnnouncements(prev => prev.map(a => 
                        a.id === announcement.id ? { ...a, acknowledged: true } : a
                      ));
                    }}
                    onDismiss={() => {
                      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
                    }}
                  />
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 pr-24 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                    />
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  HIPAA Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  End-to-end encrypted
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select a conversation</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={isInCall}
        onClose={() => setIsInCall(false)}
        participantName={selectedConversation?.name || 'Unknown'}
      />
    </div>
  );
}
