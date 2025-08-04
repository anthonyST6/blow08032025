import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('Global Error Boundary caught error:', error);
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Details:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Something went wrong
            </h1>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                An error occurred while rendering this page. Please check the console for details.
              </p>
              {this.state.error && (
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm font-mono text-red-400">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Go to Home
              </button>
            </div>
            {this.state.errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                  Error Details (for developers)
                </summary>
                <pre className="mt-2 p-4 bg-gray-900 rounded text-xs text-gray-400 overflow-auto">
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;