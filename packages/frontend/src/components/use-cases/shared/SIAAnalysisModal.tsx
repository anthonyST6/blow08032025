import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../ui/Card';

export interface SIAMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
}

export interface SIAAnalysisData {
  security: {
    overallScore: number;
    description: string;
    metrics: SIAMetric[];
    recommendations?: {
      type: 'warning' | 'success' | 'info';
      title: string;
      description: string;
    }[];
  };
  integrity: {
    overallScore: number;
    description: string;
    metrics: SIAMetric[];
    complianceItems?: {
      name: string;
      status: 'Current' | 'Due Soon' | 'Overdue';
      date: string;
    }[];
  };
  accuracy: {
    overallScore: number;
    description: string;
    metrics: SIAMetric[];
    modelPerformance?: {
      name: string;
      accuracy: number;
    }[];
  };
}

interface SIAAnalysisModalProps {
  selectedMetric: 'security' | 'integrity' | 'accuracy' | null;
  onClose: () => void;
  useCaseName: string;
  analysisData: SIAAnalysisData;
}

export const SIAAnalysisModal: React.FC<SIAAnalysisModalProps> = ({
  selectedMetric,
  onClose,
  useCaseName,
  analysisData,
}) => {
  if (!selectedMetric) return null;

  const renderMetricAnalysis = () => {
    const data = analysisData[selectedMetric];
    const metricConfig = {
      security: {
        icon: ShieldCheckIcon,
        color: 'vanguard-blue',
        bgColor: 'bg-vanguard-blue',
      },
      integrity: {
        icon: ScaleIcon,
        color: 'vanguard-red',
        bgColor: 'bg-vanguard-red',
      },
      accuracy: {
        icon: ChartPieIcon,
        color: 'vanguard-green',
        bgColor: 'bg-vanguard-green',
      },
    };

    const config = metricConfig[selectedMetric];
    const Icon = config.icon;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card variant="gradient" effect="shimmer" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Overall {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Score
              </h3>
              <p className="text-gray-400">{data.description}</p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold text-${config.color}`}>
                {data.overallScore}%
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {data.overallScore >= 90 ? 'Excellent' : 
                 data.overallScore >= 80 ? 'Good' :
                 data.overallScore >= 70 ? 'Fair' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.metrics.map((metric) => (
            <Card key={metric.name} variant="glass" effect="glow" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${config.bgColor}/10 border border-${config.color}/30`}>
                  <metric.icon className={`w-6 h-6 text-${config.color}`} />
                </div>
                <div className={`text-2xl font-bold ${
                  metric.status === 'good' ? 'text-vanguard-green' :
                  metric.status === 'warning' ? 'text-yellow-500' : 'text-vanguard-red'
                }`}>
                  {metric.value}%
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-white mb-2">{metric.name}</h4>
              <p className="text-sm text-gray-400 mb-4">{metric.description}</p>
              
              <div className="space-y-2">
                {metric.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-vanguard-green mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Sections */}
        {selectedMetric === 'security' && 'recommendations' in data && data.recommendations && (
          <Card variant="glass-dark" effect="float" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Security Recommendations</h3>
            <div className="space-y-4">
              {data.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className={`${
                  rec.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  rec.type === 'success' ? 'bg-vanguard-green/10 border-vanguard-green/30' :
                  'bg-blue-500/10 border-blue-500/30'
                } border rounded-lg p-4`}>
                  <div className="flex items-start">
                    {rec.type === 'warning' ? (
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5 text-vanguard-green mr-3 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-400">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {selectedMetric === 'integrity' && 'complianceItems' in data && data.complianceItems && (
          <Card variant="glass-dark" effect="float" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance & Regulatory Status</h3>
            <div className="space-y-3">
              {data.complianceItems.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">Last updated: {item.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'Current' ? 'bg-vanguard-green/20 text-vanguard-green' :
                    item.status === 'Due Soon' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {selectedMetric === 'accuracy' && 'modelPerformance' in data && data.modelPerformance && (
          <Card variant="glass-dark" effect="float" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Model Performance</h3>
            <div className="space-y-4">
              {data.modelPerformance.map((model: any) => (
                <div key={model.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{model.name}</span>
                    <span className="text-sm font-medium text-white">{model.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-vanguard-green" 
                      style={{ width: `${model.accuracy}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {selectedMetric && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-seraphim-black border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-white/10 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  selectedMetric === 'security' ? 'bg-vanguard-blue/20' :
                  selectedMetric === 'integrity' ? 'bg-vanguard-red/20' :
                  'bg-vanguard-green/20'
                }`}>
                  {selectedMetric === 'security' ? (
                    <ShieldCheckIcon className="w-8 h-8 text-vanguard-blue" />
                  ) : selectedMetric === 'integrity' ? (
                    <ScaleIcon className="w-8 h-8 text-vanguard-red" />
                  ) : (
                    <ChartPieIcon className="w-8 h-8 text-vanguard-green" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white capitalize">
                    {selectedMetric} Analysis - {useCaseName}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Detailed breakdown of {selectedMetric} metrics for this use case
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {renderMetricAnalysis()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};