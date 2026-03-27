import React, { ReactNode } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, X } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

/**
 * Confirmation Dialog Component
 * Displays a modal dialog for confirming destructive or important actions
 */
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  // Variant styling
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      confirmText: 'text-white',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmText: 'text-white',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      confirmBg: 'bg-green-600 hover:bg-green-700',
      confirmText: 'text-white',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={handleBackdropClick}
      aria-labelledby="confirmation-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 ${config.iconBg} rounded-lg flex-shrink-0`}>
                <Icon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              <div>
                <h3
                  id="confirmation-dialog-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-sm text-gray-700">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3 rounded-b-lg">
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${config.confirmBg} ${config.confirmText}`}
          >
            {(isProcessing || isLoading) && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing confirmation dialog state
 */
export function useConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>>({
    onConfirm: () => {},
    title: '',
    message: '',
  });

  const showConfirmation = (dialogConfig: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
  };

  const ConfirmationComponent = () => (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={hideConfirmation}
      {...config}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationComponent,
  };
}

/**
 * Quick confirmation dialog for common actions
 */
export function useDeleteConfirmation() {
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Confirm Deletion',
      message: (
        <div>
          <p className="mb-2">Are you sure you want to delete <strong>{itemName}</strong>?</p>
          <p className="text-gray-600">This action cannot be undone.</p>
        </div>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm,
    });
  };

  return {
    confirmDelete,
    ConfirmationComponent,
  };
}

/**
 * Quick confirmation dialog for cancel actions
 */
export function useCancelConfirmation() {
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  const confirmCancel = (message: string, onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Confirm Cancellation',
      message,
      confirmText: 'Yes, Cancel',
      cancelText: 'Go Back',
      variant: 'warning',
      onConfirm,
    });
  };

  return {
    confirmCancel,
    ConfirmationComponent,
  };
}
