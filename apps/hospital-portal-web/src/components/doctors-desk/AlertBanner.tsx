'use client';

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: string;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

export default function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
    onDismiss?.(alertId);
  };

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const config = getAlertConfig(alert.severity);
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}
            role="alert"
          >
            <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-semibold ${config.textColor}`}>
                    {config.label}
                  </p>
                  <p className={`mt-1 ${config.messageColor}`}>
                    {alert.message}
                  </p>
                  {alert.details && (
                    <p className={`mt-2 text-sm ${config.detailsColor}`}>
                      {alert.details}
                    </p>
                  )}
                </div>
                
                {onDismiss && (
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className={`ml-4 p-1 rounded-md hover:bg-white/50 transition-colors ${config.textColor}`}
                    aria-label="Dismiss alert"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getAlertConfig(severity: Alert['severity']) {
  switch (severity) {
    case 'critical':
      return {
        label: 'CRITICAL',
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
        messageColor: 'text-red-800',
        detailsColor: 'text-red-700',
      };
    case 'warning':
      return {
        label: 'WARNING',
        icon: AlertCircle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-900',
        messageColor: 'text-yellow-800',
        detailsColor: 'text-yellow-700',
      };
    case 'info':
      return {
        label: 'REVIEW',
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        messageColor: 'text-blue-800',
        detailsColor: 'text-blue-700',
      };
  }
}
