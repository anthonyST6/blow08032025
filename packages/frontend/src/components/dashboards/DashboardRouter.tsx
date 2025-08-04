import React, { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getDashboardComponent, dashboardExists, dashboardMetadata } from './dashboard-registry';
import { Loader2 } from 'lucide-react';

interface DashboardRouterProps {
  isDarkMode?: boolean;
}

// Loading component for lazy-loaded dashboards
const DashboardLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</p>
    </div>
  </div>
);

// Error boundary for dashboard loading errors
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Loading Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was an error loading this dashboard. Please try refreshing the page.
            </p>
            <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 text-sm overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main dashboard router component
export const DashboardRouter: React.FC<DashboardRouterProps> = ({ isDarkMode = true }) => {
  const { dashboardId } = useParams<{ dashboardId: string }>();

  // Check if dashboard exists
  if (!dashboardId || !dashboardExists(dashboardId)) {
    return <Navigate to="/dashboards" replace />;
  }

  // Get the dashboard component
  const DashboardComponent = getDashboardComponent(dashboardId);
  
  if (!DashboardComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Dashboard Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The dashboard "{dashboardId}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Get dashboard metadata
  const metadata = dashboardMetadata[dashboardId as keyof typeof dashboardMetadata];

  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<DashboardLoader />}>
        <div className="min-h-screen">
          {/* Optional: Add breadcrumb navigation */}
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Dashboards</span>
              <span>/</span>
              <span>{metadata?.vertical || 'Unknown'}</span>
              <span>/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {metadata?.name || dashboardId}
              </span>
            </div>
          </div>
          
          {/* Render the dashboard */}
          <DashboardComponent isDarkMode={isDarkMode} />
        </div>
      </Suspense>
    </DashboardErrorBoundary>
  );
};

// Dashboard list component for navigation
export const DashboardList: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const { dashboardsByVertical } = require('./dashboard-registry');
  
  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Available Dashboards</h1>
        
        {Object.entries(dashboardsByVertical).map(([vertical, dashboardIds]) => (
          <div key={vertical} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{vertical}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(dashboardIds as string[]).map(dashboardId => {
                const metadata = dashboardMetadata[dashboardId as keyof typeof dashboardMetadata];
                return (
                  <a
                    key={dashboardId}
                    href={`/dashboard/${dashboardId}`}
                    className={`block p-4 rounded-lg border transition-all hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                        : 'bg-white border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <h3 className="font-medium mb-2">{metadata?.name || dashboardId}</h3>
                    <p className="text-sm text-gray-500">Click to view dashboard</p>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardRouter;