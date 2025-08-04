import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Progress } from '../components/Progress';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { getVertical } from '../config/verticals';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UseCase {
  id: string;
  name: string;
  description: string;
  vertical: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  requiredAgents: string[];
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  tags: string[];
  status: 'available' | 'coming-soon' | 'beta';
  popularity: number;
  lastUpdated: Date;
}

const VerticalDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  // Extract vertical ID from the pathname
  const pathParts = location.pathname.split('/');
  const dashboardName = pathParts[pathParts.length - 1];
  const verticalId = dashboardName.replace('-dashboard', '');
  
  const vertical = verticalId ? getVertical(verticalId) : null;

  useEffect(() => {
    // Load selected use case from session storage
    const storedUseCase = sessionStorage.getItem('selectedUseCase');
    if (storedUseCase) {
      const useCase = JSON.parse(storedUseCase);
      setSelectedUseCase(useCase);
      sessionStorage.removeItem('selectedUseCase');
      
      // Simulate activating agents for the use case
      if (useCase.requiredAgents) {
        setTimeout(() => {
          setActiveAgents(useCase.requiredAgents);
        }, 1000);
      }
    }

    // Generate mock metrics data
    if (vertical) {
      const mockMetrics = vertical.metrics.map(metric => ({
        ...metric,
        currentValue: metric.visualization === 'gauge' 
          ? Math.random() * 100 
          : Math.random() * metric.threshold.warning * 1.5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendValue: Math.random() * 10,
      }));
      setMetrics(mockMetrics);
    }
  }, [vertical]);

  if (!vertical) {
    return (
      <div className="min-h-screen bg-seraphim-black p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Vertical Not Found</h2>
          <p className="text-gray-400 mb-4">The requested vertical dashboard does not exist.</p>
          <Button onClick={() => navigate('/use-cases')}>
            Back to Use Cases
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = vertical.icon;

  // Mock data for charts
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.random() * 100,
    baseline: 75,
  }));

  const distributionData = [
    { name: 'Category A', value: 30, color: '#3B82F6' },
    { name: 'Category B', value: 25, color: '#10B981' },
    { name: 'Category C', value: 20, color: '#F59E0B' },
    { name: 'Category D', value: 15, color: '#EF4444' },
    { name: 'Category E', value: 10, color: '#8B5CF6' },
  ];

  const performanceData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    actual: Math.random() * 100,
    target: 85,
  }));

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/use-cases')}
              className="mr-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${vertical.bgGradient} mr-4`}>
                <Icon className={`w-8 h-8 ${vertical.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{vertical.name} Dashboard</h1>
                <p className="text-sm text-gray-400">{vertical.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary">
              {activeAgents.length} Active Agents
            </Badge>
            <Button variant="primary">
              <CogIcon className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Use Case Info */}
      {selectedUseCase && (
        <Card className="mb-6 p-4 bg-gradient-to-r from-seraphim-gold/10 to-transparent border-seraphim-gold/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="w-5 h-5 text-seraphim-gold mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedUseCase.name}</h3>
                <p className="text-sm text-gray-400">{selectedUseCase.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SIAMetrics
                security={selectedUseCase.siaScores.security}
                integrity={selectedUseCase.siaScores.integrity}
                accuracy={selectedUseCase.siaScores.accuracy}
                size="sm"
                animate={false}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={metric.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-gray-400">{metric.name}</p>
                <p className="text-2xl font-bold text-white">
                  {metric.currentValue.toFixed(metric.unit === '%' ? 0 : 1)} {metric.unit}
                </p>
              </div>
              <div className={`flex items-center text-xs ${
                metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${
                  metric.trend === 'down' ? 'rotate-180' : ''
                }`} />
                {metric.trendValue.toFixed(1)}%
              </div>
            </div>
            <Progress 
              value={metric.currentValue} 
              max={metric.threshold.warning * 1.2}
              className="h-2"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-gray-500">Target: {metric.threshold.warning} {metric.unit}</span>
              <Badge 
                variant={
                  metric.currentValue >= metric.threshold.warning ? 'success' :
                  metric.currentValue >= metric.threshold.critical ? 'warning' : 'error'
                }
                size="small"
              >
                {metric.currentValue >= metric.threshold.warning ? 'Good' :
                 metric.currentValue >= metric.threshold.critical ? 'Warning' : 'Critical'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Agents */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Active AI Agents
          </h3>
          <div className="space-y-3">
            {vertical.aiAgents.map((agent, index) => {
              const isActive = activeAgents.includes(agent);
              return (
                <div
                  key={agent}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        isActive ? 'bg-green-500' : 'bg-gray-600'
                      }`} />
                      <span className="text-sm font-medium text-white">{agent}</span>
                    </div>
                    <Badge variant={isActive ? 'success' : 'secondary'} size="small">
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Performance Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Performance Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#D4AF37" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#6B7280" 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Use Cases */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Available Use Cases
          </h3>
          <div className="space-y-3">
            {vertical.useCases.map((useCase) => (
              <div
                key={useCase.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedUseCase?.id === `${verticalId}-${vertical.useCases.indexOf(useCase) + 1}`
                    ? 'bg-seraphim-gold/10 border-seraphim-gold/30'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => {
                  const fullUseCase: UseCase = {
                    id: `${verticalId}-${vertical.useCases.indexOf(useCase) + 1}`,
                    name: useCase.name,
                    description: useCase.description,
                    vertical: verticalId || '',
                    category: 'General',
                    complexity: useCase.complexity,
                    estimatedTime: useCase.estimatedTime,
                    requiredAgents: vertical.aiAgents.slice(0, 3),
                    siaScores: useCase.siaScores,
                    tags: [verticalId || ''],
                    status: 'available',
                    popularity: 85,
                    lastUpdated: new Date(),
                  };
                  setSelectedUseCase(fullUseCase);
                  setActiveAgents(fullUseCase.requiredAgents);
                }}
              >
                <h4 className="text-sm font-medium text-white mb-1">{useCase.name}</h4>
                <p className="text-xs text-gray-400">{useCase.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" size="small">
                    {useCase.complexity}
                  </Badge>
                  <span className="text-xs text-gray-500">{useCase.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Resource Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Weekly Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Bar dataKey="actual" fill="#D4AF37" />
              <Bar dataKey="target" fill="#6B7280" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Compliance & Regulations */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
          Compliance & Regulations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vertical.regulations.map((regulation) => (
            <div
              key={regulation}
              className="p-3 rounded-lg bg-gray-900 border border-gray-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">{regulation}</span>
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary">
          <DocumentTextIcon className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
        <Button variant="primary">
          <SparklesIcon className="w-4 h-4 mr-2" />
          Optimize Workflow
        </Button>
      </div>
    </div>
  );
};

export default VerticalDashboard;