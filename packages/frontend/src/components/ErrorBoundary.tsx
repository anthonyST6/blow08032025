import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-900/10 border border-red-500/30 rounded-lg">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {this.props.fallbackTitle || 'Component Error'}
          </h3>
          <p className="text-sm text-gray-400 text-center mb-4 max-w-md">
            {this.props.fallbackMessage || 
             'An error occurred while loading this component. Please try refreshing the page or contact support if the issue persists.'}
          </p>
          {this.state.error && (
            <details className="mb-4 text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-400">Error Details</summary>
              <pre className="mt-2 p-2 bg-black/50 rounded overflow-auto max-w-md">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;