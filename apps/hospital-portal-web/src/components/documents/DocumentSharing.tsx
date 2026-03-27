// Document Sharing Component
// Secure document sharing with HIPAA compliance and granular permissions

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share, 
  X, 
  User, 
  Users, 
  Mail, 
  Lock, 
  Unlock, 
  Eye, 
  Edit, 
  Download, 
  Clock, 
  Calendar, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  QrCode,
  Globe,
  Building,
  UserPlus,
  Settings,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Minus
} from 'lucide-react';
import { 
  documentSharingApi, 
  DocumentShare, 
  Document, 
  SharePermission 
} from '../../lib/api/document-sharing.api';

interface DocumentSharingProps {
  documentId: string;
  document?: Document;
  onClose: () => void;
  onShared: (share: DocumentShare) => void;
}

interface ShareForm {
  shareType: 'individual' | 'group' | 'public' | 'organization';
  recipients: Recipient[];
  accessLevel: 'read' | 'comment' | 'edit' | 'full';
  permissions: {
    canView: boolean;
    canDownload: boolean;
    canPrint: boolean;
    canShare: boolean;
    canComment: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  expirationDate?: string;
  password?: string;
  requireLogin: boolean;
  allowAnonymous: boolean;
  notifyRecipients: boolean;
  message?: string;
  trackActivity: boolean;
  watermark: boolean;
}

interface Recipient {
  id: string;
  type: 'email' | 'user' | 'group' | 'role';
  value: string;
  name?: string;
  email?: string;
  department?: string;
}

export default function DocumentSharingComponent({ 
  documentId, 
  document, 
  onClose, 
  onShared 
}: DocumentSharingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'share' | 'existing' | 'settings'>('share');
  const [existingShares, setExistingShares] = useState<DocumentShare[]>([]);
  const [shareLink, setShareLink] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [shareForm, setShareForm] = useState<ShareForm>({
    shareType: 'individual',
    recipients: [],
    accessLevel: 'read',
    permissions: {
      canView: true,
      canDownload: false,
      canPrint: false,
      canShare: false,
      canComment: false,
      canEdit: false,
      canDelete: false
    },
    requireLogin: true,
    allowAnonymous: false,
    notifyRecipients: true,
    trackActivity: true,
    watermark: true
  });

  const [recipientSearch, setRecipientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);

  useEffect(() => {
    loadExistingShares();
  }, [documentId]);

  useEffect(() => {
    updatePermissionsFromAccessLevel();
  }, [shareForm.accessLevel]);

  useEffect(() => {
    if (recipientSearch.length > 2) {
      searchRecipients();
    } else {
      setSearchResults([]);
    }
  }, [recipientSearch]);

  const loadExistingShares = async () => {
    try {
      setLoading(true);
      const shares = await documentSharingApi.getSharedDocuments(documentId);
      setExistingShares(shares);
    } catch (error) {
      console.error('Error loading shares:', error);
      setError('Failed to load existing shares.');
    } finally {
      setLoading(false);
    }
  };

  const searchRecipients = async () => {
    try {
      // This would search users, groups, and roles in the system
      const results = await documentSharingApi.searchRecipients(recipientSearch);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching recipients:', error);
    }
  };

  const updatePermissionsFromAccessLevel = () => {
    let permissions = { ...shareForm.permissions };

    switch (shareForm.accessLevel) {
      case 'read':
        permissions = {
          canView: true,
          canDownload: false,
          canPrint: false,
          canShare: false,
          canComment: false,
          canEdit: false,
          canDelete: false
        };
        break;
      case 'comment':
        permissions = {
          canView: true,
          canDownload: false,
          canPrint: false,
          canShare: false,
          canComment: true,
          canEdit: false,
          canDelete: false
        };
        break;
      case 'edit':
        permissions = {
          canView: true,
          canDownload: true,
          canPrint: true,
          canShare: false,
          canComment: true,
          canEdit: true,
          canDelete: false
        };
        break;
      case 'full':
        permissions = {
          canView: true,
          canDownload: true,
          canPrint: true,
          canShare: true,
          canComment: true,
          canEdit: true,
          canDelete: true
        };
        break;
    }

    setShareForm(prev => ({ ...prev, permissions }));
  };

  const addRecipient = (recipient: Recipient) => {
    if (!shareForm.recipients.find(r => r.id === recipient.id)) {
      setShareForm(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipient]
      }));
    }
    setRecipientSearch('');
    setSearchResults([]);
  };

  const removeRecipient = (recipientId: string) => {
    setShareForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.id !== recipientId)
    }));
  };

  const generateShareLink = async () => {
    try {
      const link = await documentSharingApi.generateShareLink(documentId, {
        accessLevel: shareForm.accessLevel,
        permissions: shareForm.permissions,
        expirationDate: shareForm.expirationDate,
        password: shareForm.password,
        requireLogin: shareForm.requireLogin
      });
      setShareLink(link);
    } catch (error) {
      console.error('Error generating share link:', error);
      setError('Failed to generate share link.');
    }
  };

  const submitShare = async () => {
    if (!validateShareForm()) return;

    try {
      setLoading(true);
      setError('');

      const shareRequest = {
        documentId,
        shareType: shareForm.shareType,
        recipients: shareForm.recipients,
        accessLevel: shareForm.accessLevel,
        permissions: shareForm.permissions,
        expirationDate: shareForm.expirationDate,
        password: shareForm.password,
        requireLogin: shareForm.requireLogin,
        allowAnonymous: shareForm.allowAnonymous,
        message: shareForm.message,
        trackActivity: shareForm.trackActivity,
        watermark: shareForm.watermark
      };

      const share = await documentSharingApi.createShare(shareRequest);
      
      if (shareForm.notifyRecipients) {
        await documentSharingApi.notifyRecipients(share.id, shareForm.message);
      }
      
      onShared(share);
      loadExistingShares(); // Refresh the list
      
      // Reset form for next share
      setShareForm(prev => ({
        ...prev,
        recipients: [],
        message: ''
      }));
      
    } catch (error) {
      console.error('Error creating share:', error);
      setError('Failed to share document. Please check permissions and try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateShareForm = (): boolean => {
    if (shareForm.shareType === 'individual' && shareForm.recipients.length === 0) {
      setError('Please select at least one recipient.');
      return false;
    }

    if (shareForm.expirationDate) {
      const expDate = new Date(shareForm.expirationDate);
      if (expDate <= new Date()) {
        setError('Expiration date must be in the future.');
        return false;
      }
    }

    return true;
  };

  const revokeShare = async (shareId: string) => {
    try {
      await documentSharingApi.revokeShare(shareId);
      loadExistingShares();
    } catch (error) {
      console.error('Error revoking share:', error);
      setError('Failed to revoke access.');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    // Show success message
  };

  const renderShareForm = () => (
    <div className="space-y-6">
      {/* Share Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Share With</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { type: 'individual', icon: User, label: 'Individuals' },
            { type: 'group', icon: Users, label: 'Groups' },
            { type: 'organization', icon: Building, label: 'Organization' },
            { type: 'public', icon: Globe, label: 'Public Link' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setShareForm(prev => ({ ...prev, shareType: type as any }))}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                shareForm.shareType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Icon className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recipients */}
      {shareForm.shareType !== 'public' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
          
          {/* Search Recipients */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, groups, or roles..."
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map(recipient => (
                  <button
                    key={recipient.id}
                    onClick={() => addRecipient(recipient)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {recipient.type === 'user' && <User className="h-5 w-5 text-gray-400" />}
                      {recipient.type === 'group' && <Users className="h-5 w-5 text-gray-400" />}
                      {recipient.type === 'email' && <Mail className="h-5 w-5 text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{recipient.name || recipient.value}</div>
                      {recipient.email && <div className="text-sm text-gray-500">{recipient.email}</div>}
                      {recipient.department && <div className="text-xs text-gray-400">{recipient.department}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Recipients */}
          {shareForm.recipients.length > 0 && (
            <div className="mt-3 space-y-2">
              {shareForm.recipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <div className="flex items-center space-x-3">
                    {recipient.type === 'user' && <User className="h-4 w-4 text-gray-400" />}
                    {recipient.type === 'group' && <Users className="h-4 w-4 text-gray-400" />}
                    {recipient.type === 'email' && <Mail className="h-4 w-4 text-gray-400" />}
                    <div>
                      <div className="font-medium">{recipient.name || recipient.value}</div>
                      {recipient.email && <div className="text-sm text-gray-500">{recipient.email}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeRecipient(recipient.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Access Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { level: 'read', icon: Eye, label: 'View Only', description: 'Can view document' },
            { level: 'comment', icon: MessageSquare, label: 'Comment', description: 'Can view and comment' },
            { level: 'edit', icon: Edit, label: 'Edit', description: 'Can view, comment, and edit' },
            { level: 'full', icon: Shield, label: 'Full Access', description: 'All permissions' }
          ].map(({ level, icon: Icon, label, description }) => (
            <button
              key={level}
              onClick={() => setShareForm(prev => ({ ...prev, accessLevel: level as any }))}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                shareForm.accessLevel === level
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5 mx-auto mb-2" />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-gray-500 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <Settings className="h-4 w-4" />
        <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* Custom Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Custom Permissions</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(shareForm.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setShareForm(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, [key]: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {key.replace('can', 'Can ').replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input
              type="datetime-local"
              value={shareForm.expirationDate}
              onChange={(e) => setShareForm(prev => ({ ...prev, expirationDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Protection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
            <input
              type="password"
              placeholder="Enter password for additional security"
              value={shareForm.password}
              onChange={(e) => setShareForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Security Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shareForm.requireLogin}
                onChange={(e) => setShareForm(prev => ({ ...prev, requireLogin: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require login to access</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shareForm.trackActivity}
                onChange={(e) => setShareForm(prev => ({ ...prev, trackActivity: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Track access activity</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shareForm.watermark}
                onChange={(e) => setShareForm(prev => ({ ...prev, watermark: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Add watermark to document</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shareForm.notifyRecipients}
                onChange={(e) => setShareForm(prev => ({ ...prev, notifyRecipients: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Notify recipients via email</span>
            </label>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              placeholder="Add a personal message for recipients..."
              value={shareForm.message}
              onChange={(e) => setShareForm(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Public Link Generation */}
      {shareForm.shareType === 'public' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Public Link Warning</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Anyone with this link will be able to access the document. Ensure this complies with your organization's security policies and HIPAA requirements.
              </p>
              {shareLink && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-700 truncate mr-2">{shareLink}</span>
                    <button
                      onClick={copyShareLink}
                      className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={generateShareLink}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Generate Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExistingShares = () => (
    <div className="space-y-4">
      {existingShares.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Share className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Shares</h3>
          <p>This document has not been shared with anyone yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {existingShares.map(share => (
            <div key={share.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {share.shareType === 'individual' && <User className="h-4 w-4 text-gray-400" />}
                    {share.shareType === 'group' && <Users className="h-4 w-4 text-gray-400" />}
                    {share.shareType === 'public' && <Globe className="h-4 w-4 text-gray-400" />}
                    <span className="font-medium">{share.sharedWithEmail || share.shareType}</span>
                    <div className={`px-2 py-1 rounded-full text-xs ${getAccessLevelColor(share.accessLevel)}`}>
                      {share.accessLevel}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Shared {new Date(share.sharedAt).toLocaleDateString()}</span>
                      </div>
                      {share.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expires {new Date(share.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {share.lastAccessedAt && (
                      <div className="text-xs text-gray-500">
                        Last accessed: {new Date(share.lastAccessedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {share.shareType === 'public' && share.shareUrl && (
                    <button
                      onClick={() => navigator.clipboard.writeText(share.shareUrl!)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded"
                      title="Copy Link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => revokeShare(share.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded"
                    title="Revoke Access"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'text-green-600 bg-green-50 border border-green-200';
      case 'comment': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'edit': return 'text-orange-600 bg-orange-50 border border-orange-200';
      case 'full': return 'text-red-600 bg-red-50 border border-red-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Share className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Share Document</h2>
              <p className="text-sm text-gray-600">{document?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[
              { id: 'share', label: 'Share Document', icon: Plus },
              { id: 'existing', label: 'Existing Shares', icon: Users },
              { id: 'settings', label: 'Share Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {activeTab === 'share' && renderShareForm()}
          {activeTab === 'existing' && renderExistingShares()}
          {activeTab === 'settings' && (
            <div className="text-center py-8 text-gray-500">
              Share settings panel will be implemented here
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'share' && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>HIPAA compliant sharing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitShare}
                disabled={loading || (shareForm.shareType !== 'public' && shareForm.recipients.length === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <Share className="h-4 w-4" />
                <span>{shareForm.shareType === 'public' ? 'Generate Link' : 'Share Document'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}