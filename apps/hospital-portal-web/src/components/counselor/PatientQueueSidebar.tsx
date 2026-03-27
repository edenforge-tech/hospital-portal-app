/**
 * Patient Queue Sidebar Component
 * Enhanced sidebar with search, filters, and patient list
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Clock, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueItem {
  id: string;
  patientId: string;
  patientName?: string; // Optional to match CounselingQueueItem
  tokenNumber: string;
  status?: string; // For backward compatibility
  queueStatus?: string; // Backend uses this
  urgency?: string; // For backward compatibility  
  urgencyLevel?: string; // Backend uses this
  sessionType?: string;
  addedToQueueAt?: string;
  estimatedWaitMinutes?: number;
}

interface PatientQueueSidebarProps {
  queueItems: QueueItem[];
  selectedQueueId: string | null;
  isOpen: boolean;
  isLoading?: boolean;
  onSelectPatient: (item: QueueItem) => void;
  onClose: () => void;
  className?: string;
}

type StatusFilter = 'all' | 'Waiting' | 'Called' | 'InProgress';

export function PatientQueueSidebar({
  queueItems,
  selectedQueueId,
  isOpen,
  isLoading = false,
  onSelectPatient,
  onClose,
  className,
}: PatientQueueSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = queueItems;

    // Apply status filter (handle both property names)
    if (statusFilter !== 'all') {
      items = items.filter(item => {
        const itemStatus = item.status || item.queueStatus;
        return itemStatus === statusFilter;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        (item.patientName || '').toLowerCase().includes(query) ||
        item.tokenNumber.toLowerCase().includes(query)
      );
    }

    return items;
  }, [queueItems, statusFilter, searchQuery]);

  // Calculate wait time
  const getWaitTime = (addedToQueueAt?: string): number => {
    if (!addedToQueueAt) return 0;
    return Math.floor((Date.now() - new Date(addedToQueueAt).getTime()) / 60000);
  };

  // Get urgency badge styles (handle both property names)
  const getUrgencyStyles = (item: QueueItem) => {
    const urgency = item.urgency || item.urgencyLevel || 'Normal';
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Normal':
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get urgency icon (handle both property names)
  const getUrgencyIcon = (item: QueueItem) => {
    const urgency = item.urgency || item.urgencyLevel || 'Normal';
    if (urgency === 'Critical' || urgency === 'High') {
      return <AlertCircle className="h-3 w-3" />;
    }
    return null;
  };

  // Status filter tabs (handle both property names)
  const statusTabs: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'All', value: 'all', count: queueItems.length },
    { label: 'Waiting', value: 'Waiting', count: queueItems.filter(i => (i.status || i.queueStatus) === 'Waiting').length },
    { label: 'Called', value: 'Called', count: queueItems.filter(i => (i.status || i.queueStatus) === 'Called').length },
    { label: 'In Progress', value: 'InProgress', count: queueItems.filter(i => (i.status || i.queueStatus) === 'InProgress').length },
  ];

  if (!isOpen) return null;

  return (
    <div className={cn('w-80 bg-white border-r border-gray-200 flex flex-col', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📋 Patient Queue
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredItems.length})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <span className="text-gray-500">×</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or token..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-1',
                statusFilter === tab.value ? 'text-blue-100' : 'text-gray-400'
              )}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="h-8 w-8 animate-spin text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">Loading queue...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No patients match your search' : 'No patients in queue'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const waitTime = getWaitTime(item.addedToQueueAt);
              const isSelected = selectedQueueId === item.id;
              const itemStatus = item.status || item.queueStatus || 'Waiting';
              const itemUrgency = item.urgency || item.urgencyLevel || 'Normal';

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPatient(item)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  )}
                >
                  {/* Patient Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {item.patientName || 'Unknown Patient'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Token: <span className="font-mono font-medium">{item.tokenNumber}</span>
                      </p>
                    </div>
                    
                    {/* Urgency Badge */}
                    <span className={cn(
                      'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ml-2',
                      getUrgencyStyles(item)
                    )}>
                      {getUrgencyIcon(item)}
                      {itemUrgency}
                    </span>
                  </div>

                  {/* Wait Time & Session Type */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Wait: <span className="font-medium">{waitTime} min</span>
                      </span>
                    </div>
                    
                    {item.sessionType && (
                      <span className="text-blue-600 font-medium">
                        {item.sessionType}
                      </span>
                    )}
                  </div>

                  {/* Status Badge (for non-waiting items) */}
                  {itemStatus !== 'Waiting' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                        itemStatus === 'Called' && 'bg-yellow-100 text-yellow-700',
                        itemStatus === 'InProgress' && 'bg-purple-100 text-purple-700'
                      )}>
                        <Activity className="h-3 w-3" />
                        {itemStatus === 'InProgress' ? 'In Progress' : itemStatus}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Quick Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Avg Wait</p>
            <p className="text-sm font-semibold text-gray-900">
              {queueItems.length > 0
                ? Math.round(
                    queueItems.reduce((sum, item) => sum + getWaitTime(item.addedToQueueAt), 0) /
                      queueItems.length
                  )
                : 0}m
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Longest</p>
            <p className="text-sm font-semibold text-gray-900">
              {queueItems.length > 0
                ? Math.max(...queueItems.map(item => getWaitTime(item.addedToQueueAt)))
                : 0}m
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-semibold text-gray-900">{queueItems.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
