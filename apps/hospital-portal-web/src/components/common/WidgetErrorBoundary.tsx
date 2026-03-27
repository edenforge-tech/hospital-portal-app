import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component - Catches JavaScript errors in child component tree
 * Displays fallback UI and provides error recovery options
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.logError(error, {
        componentStack: errorInfo.componentStack,
        context: 'WidgetErrorBoundary',
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Widget Error</h3>
              <p className="text-sm text-gray-600">Something went wrong loading this widget</p>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-900 mb-2">Error Details:</p>
              <p className="text-xs text-red-700 font-mono">
                {this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Component Stack
                  </summary>
                  <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional component wrapper for error boundary
 * Use this to wrap individual widgets or sections
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

export function ErrorBoundaryWrapper({ 
  children, 
  fallbackMessage = 'Failed to load content',
  onReset 
}: ErrorBoundaryWrapperProps) {
  return (
    <WidgetErrorBoundary
      fallback={
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{fallbackMessage}</p>
          {onReset && (
            <button
              onClick={onReset}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          )}
        </div>
      }
      onReset={onReset}
    >
      {children}
    </WidgetErrorBoundary>
  );
}
