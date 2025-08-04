import React from 'react';
import { motion } from 'framer-motion';
import { useVertical } from '../contexts/VerticalContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { StatCard, CardGrid } from './ui/StatCard';
import { SIAMetrics } from './ui/SIAMetric';
import {
  BoltIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface VerticalMetrics {
  totalPrompts: number;
  activeWorkflows: number;
  averageRiskScore: number;
  complianceRate: number;
  recentAlerts: number;
  processingTime: number;
}

const mockMetrics: Record<string, VerticalMetrics> = {
  energy: {
    totalPrompts: 1234,
    activeWorkflows: 12,
    averageRiskScore: 85,
    complianceRate: 92,
    recentAlerts: 3,
    processingTime: 2.4,
  },
  government: {
    totalPrompts: 856,
    activeWorkflows: 8,
    averageRiskScore: 88,
    complianceRate: 95,
    recentAlerts: 1,
    processingTime: 3.1,
  },
  insurance: {
    totalPrompts: 2341,
    activeWorkflows: 18,
    averageRiskScore: 82,
    complianceRate: 89,
    recentAlerts: 5,
    processingTime: 1.8,
  },
};

const verticalConfigs = {
  energy: {
    icon: BoltIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
    borderColor: 'border-yellow-400',
    title: 'Energy Sector Dashboard',
    description: 'AI governance for power generation and distribution',
    specificMetrics: [
      { label: 'Grid Stability Score', value: 94, trend: 'up' },
      { label: 'Renewable Integration', value: 78, trend: 'up' },
      { label: 'Demand Forecast Accuracy', value: 91, trend: 'neutral' },
    ],
  },
  government: {
    icon: BuildingLibraryIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    borderColor: 'border-blue-400',
    title: 'Government Sector Dashboard',
    description: 'AI governance for public administration',
    specificMetrics: [
      { label: 'Policy Compliance', value: 96, trend: 'up' },
      { label: 'Citizen Privacy Score', value: 89, trend: 'neutral' },
      { label: 'Service Efficiency', value: 85, trend: 'up' },
    ],
  },
  insurance: {
    icon: ShieldCheckIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
    borderColor: 'border-green-400',
    title: 'Insurance Sector Dashboard',
    description: 'AI governance for risk assessment and claims',
    specificMetrics: [
      { label: 'Fraud Detection Rate', value: 87, trend: 'up' },
      { label: 'Claims Accuracy', value: 92, trend: 'up' },
      { label: 'Risk Model Precision', value: 88, trend: 'neutral' },
    ],
  },
};

export const VerticalDashboard: React.FC = () => {
  const { selectedVertical } = useVertical();

  if (!selectedVertical) {
    return (
      <Card variant="glass" className="text-center py-12">
        <CardContent>
          <p className="text-seraphim-text-dim">
            Please select a vertical to view sector-specific metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  const config = verticalConfigs[selectedVertical];
  const metrics = mockMetrics[selectedVertical];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card variant="gradient" effect="shimmer">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${config.bgColor}/20 ${config.borderColor}/30 border`}>
                <Icon className={`h-8 w-8 ${config.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-seraphim-text">
                  {config.title}
                </h2>
                <p className="text-seraphim-text-dim mt-1">
                  {config.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SIA Metrics for Vertical */}
      <div>
        <h3 className="text-lg font-semibold text-seraphim-text mb-4">
          Sector SIA Compliance
        </h3>
        <SIAMetrics
          security={metrics.complianceRate}
          integrity={metrics.averageRiskScore}
          accuracy={90 + Math.random() * 10}
          size="md"
          variant="card"
          layout="horizontal"
        />
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-seraphim-text mb-4">
          Key Performance Indicators
        </h3>
        <CardGrid columns={3}>
          <StatCard
            title="Total Prompts"
            value={metrics.totalPrompts}
            icon={ChartBarIcon}
            variant="default"
            change={12}
            changeLabel="vs last month"
          />
          <StatCard
            title="Active Workflows"
            value={metrics.activeWorkflows}
            icon={CogIcon}
            variant="default"
            trend="up"
          />
          <StatCard
            title="Recent Alerts"
            value={metrics.recentAlerts}
            icon={ExclamationTriangleIcon}
            variant={metrics.recentAlerts > 3 ? 'integrity' : 'default'}
            trend={metrics.recentAlerts > 3 ? 'up' : 'neutral'}
          />
        </CardGrid>
      </div>

      {/* Sector-Specific Metrics */}
      <Card variant="glass-dark" effect="glow">
        <CardHeader>
          <CardTitle>Sector-Specific Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.specificMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-seraphim-text-dim">
                  {metric.label}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-semibold text-seraphim-text">
                      {metric.value}%
                    </span>
                    {metric.trend === 'up' && (
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    )}
                    {metric.trend === 'down' && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${config.bgColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Performance */}
      <Card variant="glass" effect="float">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClockIcon className="h-5 w-5 text-seraphim-gold mr-2" />
            Processing Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-seraphim-text-dim">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-seraphim-text mt-1">
                {metrics.processingTime}s
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-seraphim-text-dim">Compliance Rate</p>
              <p className="text-2xl font-bold text-seraphim-text mt-1">
                {metrics.complianceRate}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerticalDashboard;