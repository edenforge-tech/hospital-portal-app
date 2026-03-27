/**
 * Pending Actions Widget
 * Shows the counselor's outstanding action items — unsigned consents,
 * pending insurance pre-auths, follow-up calls due, etc.
 * Each item has an action button and a priority colour.
 * Created: March 10, 2026
 */

'use client';

import React from 'react';
import {
  FileText,
  Phone,
  Shield,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActionPriority = 'urgent' | 'high' | 'normal';
export type ActionCategory = 'consent' | 'insurance' | 'follow-up' | 'admission' | 'payment';

export interface PendingAction {
  id: string;
  category: ActionCategory;
  priority: ActionPriority;
  title: string;
  patientName: string;
  patientMrn?: string;
  dueAt?: string; // ISO datetime or relative like "Today 3pm"
  actionLabel: string;
  onAction?: () => void;
}

interface PendingActionsWidgetProps {
  actions: PendingAction[];
  isLoading?: boolean;
}

const CATEGORY_META: Record<ActionCategory, { icon: React.ReactNode; bg: string; iconColor: string }> = {
  consent: {
    icon: <FileText className="w-4 h-4" />,
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  insurance: {
    icon: <Shield className="w-4 h-4" />,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  'follow-up': {
    icon: <Phone className="w-4 h-4" />,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  admission: {
    icon: <Calendar className="w-4 h-4" />,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-500',
  },
  payment: {
    icon: <AlertCircle className="w-4 h-4" />,
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
};

const PRIORITY_BADGE: Record<ActionPriority, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600',
};

function PendingActionRow({ action }: { action: PendingAction }) {
  const meta = CATEGORY_META[action.category];

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
        action.priority === 'urgent' && 'bg-red-50/40'
      )}
    >
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', meta.bg)}>
        <span className={meta.iconColor}>{meta.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{action.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {action.patientName}
              {action.patientMrn && (
                <span className="ml-1 font-mono text-gray-400">• {action.patientMrn}</span>
              )}
            </p>
            {action.dueAt && (
              <div className="flex items-center gap-1 mt-1">
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', PRIORITY_BADGE[action.priority])}>
                  {action.priority}
                </span>
                <span className="text-[10px] text-gray-500">Due: {action.dueAt}</span>
              </div>
            )}
          </div>
          <button
            onClick={action.onAction}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap"
          >
            {action.actionLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PendingActionsWidget({ actions, isLoading = false }: PendingActionsWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 animate-pulse">
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3 flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const urgentCount = actions.filter((a) => a.priority === 'urgent').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">Pending Actions</h3>
          {actions.length > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
              {actions.length}
            </span>
          )}
        </div>
        {urgentCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            {urgentCount} urgent
          </span>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700">All clear!</p>
            <p className="text-xs text-gray-500 mt-1">No pending actions at the moment</p>
          </div>
        ) : (
          // Sort: urgent first, then high, then normal
          [...actions]
            .sort((a, b) => {
              const order: Record<ActionPriority, number> = { urgent: 0, high: 1, normal: 2 };
              return order[a.priority] - order[b.priority];
            })
            .map((action) => <PendingActionRow key={action.id} action={action} />)
        )}
      </div>

      {/* Footer */}
      {actions.length > 0 && (
        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all → 
          </button>
        </div>
      )}
    </div>
  );
}
