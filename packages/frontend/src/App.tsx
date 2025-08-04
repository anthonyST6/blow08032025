import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { VerticalProvider } from './contexts/VerticalContext';
import { UseCaseProvider } from './contexts/UseCaseContext';
import { WorkflowStateProvider } from './contexts/WorkflowStateContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import LoadingSpinner from './components/LoadingSpinner';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Eagerly load critical pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Lazy load non-critical pages
const PromptEngineering = lazy(() => import('./pages/PromptEngineering'));
const PromptAnalysis = lazy(() => import('./pages/PromptAnalysis'));
const Workflows = lazy(() => import('./pages/Workflows'));
const Admin = lazy(() => import('./pages/Admin'));
const AgentOrchestration = lazy(() => import('./pages/AgentOrchestrationBranded'));
const AuditConsole = lazy(() => import('./pages/AuditConsoleEnhanced'));
const IntegrationLog = lazy(() => import('./pages/IntegrationLogEnhanced'));
const UseCaseLauncher = lazy(() => import('./pages/UseCaseLauncher'));
const OutputViewer = lazy(() => import('./pages/OutputViewerEnhanced'));
const Certifications = lazy(() => import('./pages/Certifications'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const SettingsAdmin = lazy(() => import('./pages/SettingsAdmin'));
const WebSocketTest = lazy(() => import('./pages/WebSocketTest').then(module => ({ default: module.WebSocketTest })));

// Lazy load analytics pages
const Analytics = lazy(() => import('./pages/Analytics'));
const RiskAnalytics = lazy(() => import('./pages/RiskAnalytics'));
const ComplianceAnalytics = lazy(() => import('./pages/ComplianceAnalytics'));

// Lazy load SIA analysis pages
const SecurityAnalysis = lazy(() => import('./pages/SecurityAnalysis'));
const IntegrityAnalysis = lazy(() => import('./pages/IntegrityAnalysis'));
const AccuracyAnalysis = lazy(() => import('./pages/AccuracyAnalysis'));

// Lazy load vertical dashboards
const EnergyDashboard = lazy(() => import('./pages/EnergyDashboard'));
const VerticalDashboard = lazy(() => import('./pages/VerticalDashboard'));
const UseCaseDashboard = lazy(() => import('./pages/UseCaseDashboard'));
const UseCaseRunDashboard = lazy(() => import('./pages/UseCaseRunDashboard'));

// Lazy load custom use case dashboards
const InsuranceRiskAssessmentDashboard = lazy(() => import('./pages/dashboards/InsuranceRiskAssessmentDashboard'));
const PHMSAComplianceDashboard = lazy(() => import('./pages/dashboards/PHMSAComplianceDashboard'));
const MethaneLeakDetectionDashboard = lazy(() => import('./pages/dashboards/MethaneLeakDetectionDashboard'));
const GridResilienceDashboard = lazy(() => import('./pages/dashboards/GridResilienceDashboard'));
const InternalAuditGovernanceDashboard = lazy(() => import('./pages/dashboards/InternalAuditGovernanceDashboard'));
const SCADAIntegrationDashboard = lazy(() => import('./pages/dashboards/SCADAIntegrationDashboard'));
const WildfirePreventionDashboard = lazy(() => import('./pages/dashboards/WildfirePreventionDashboard'));
const AIPricingGovernanceDashboard = lazy(() => import('./pages/dashboards/AIPricingGovernanceDashboard'));

// Lazy load deployment orchestration
const DeploymentOrchestration = lazy(() => import('./pages/DeploymentOrchestration'));

// Lazy load operations center
const Operations = lazy(() => import('./pages/Operations'));

// Lazy load Mission Control Enhanced and Mission Operations Center
const MissionControlEnhanced = lazy(() => import('./pages/MissionControlEnhanced'));
const MissionOperationsCenter = lazy(() => import('./pages/MissionOperationsCenter'));

// Lazy load energy & utilities modules
const LoadForecasting = lazy(() => import('./pages/LoadForecasting'));
const LandLeaseManagement = lazy(() => import('./pages/LandLeaseManagement'));

// Lazy load Mission Control dashboards
const MissionControl = lazy(() => import('./pages/dashboards/mission-control'));
const MissionControlUseCaseDashboard = lazy(() => import('./pages/dashboards/mission-control/UseCaseDashboard'));
const MissionControlCertificationsDashboard = lazy(() => import('./pages/dashboards/mission-control/CertificationsDashboard'));

// Test page for persistence
const TestPersistence = lazy(() => import('./pages/TestPersistence'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="large" />
  </div>
);

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <VerticalProvider>
            <UseCaseProvider>
              <WorkflowStateProvider>
                <WebSocketProvider>
                  <Router>
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <MainLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="prompts" element={<PromptEngineering />} />
                    <Route path="analysis" element={<PromptAnalysis />} />
                    <Route path="workflows" element={<Workflows />} />
                    <Route path="agents" element={<AgentOrchestration />} />
                    <Route path="audit" element={<AuditConsole />} />
                    <Route path="integration-log" element={<IntegrationLog />} />
                    <Route path="use-cases" element={<UseCaseLauncher />} />
                    <Route path="outputs" element={<OutputViewer />} />
                    <Route path="certifications" element={<Certifications />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="settings" element={<SettingsAdmin />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="analytics/risks" element={<RiskAnalytics />} />
                    <Route path="analytics/compliance" element={<ComplianceAnalytics />} />
                    <Route path="analytics/security" element={<SecurityAnalysis />} />
                    <Route path="analytics/integrity" element={<IntegrityAnalysis />} />
                    <Route path="analytics/accuracy" element={<AccuracyAnalysis />} />
                    <Route path="deployment" element={<DeploymentOrchestration />} />
                    <Route path="operations" element={<Operations />} />
                    <Route path="mission-control-enhanced" element={<MissionControlEnhanced />} />
                    <Route path="mission-operations" element={<MissionOperationsCenter />} />
                    
                    {/* Mission Control Dashboards */}
                    <Route path="mission-control" element={<MissionControl />} />
                    <Route path="mission-control/use-case" element={<MissionControlUseCaseDashboard />} />
                    <Route path="use-case-dashboard" element={<MissionControlUseCaseDashboard />} />
                    <Route path="mission-control/certifications" element={<MissionControlCertificationsDashboard />} />
                    
                    {/* Test Route */}
                    <Route path="test-persistence" element={<TestPersistence />} />
                    <Route path="energy-dashboard" element={<EnergyDashboard />} />
                    <Route path="load-forecasting" element={<LoadForecasting />} />
                    <Route path="land-lease" element={<LandLeaseManagement />} />
                    
                    {/* Vertical Dashboards */}
                    <Route path="healthcare-dashboard" element={<VerticalDashboard />} />
                    <Route path="finance-dashboard" element={<VerticalDashboard />} />
                    <Route path="manufacturing-dashboard" element={<VerticalDashboard />} />
                    <Route path="retail-dashboard" element={<VerticalDashboard />} />
                    <Route path="logistics-dashboard" element={<VerticalDashboard />} />
                    <Route path="education-dashboard" element={<VerticalDashboard />} />
                    <Route path="pharma-dashboard" element={<VerticalDashboard />} />
                    <Route path="government-dashboard" element={<VerticalDashboard />} />
                    <Route path="telecom-dashboard" element={<VerticalDashboard />} />
                    
                    {/* Dynamic Use Case Dashboard */}
                    <Route path="use-case/:useCaseId" element={<UseCaseDashboard />} />
                    <Route path="use-case/:useCaseId/run" element={<UseCaseRunDashboard />} />
                    
                    <Route path="websocket-test" element={<WebSocketTest />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
                </WebSocketProvider>
              </WorkflowStateProvider>
            </UseCaseProvider>
          </VerticalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;