import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  BeakerIcon,
  CalculatorIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowLeftIcon,
  CpuChipIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface AccuracyMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AccuracyAnalysis: React.FC = () => {
  const navigate = useNavigate();

  const overallScore = 91;

  const metrics: AccuracyMetric[] = [
    {
      name: 'Model Accuracy',
      value: 94,
      status: 'good',
      description: 'AI model prediction accuracy across all use cases',
      icon: CpuChipIcon,
    },
    {
      name: 'Data Quality',
      value: 89,
      status: 'good',
      description: 'Input data quality and completeness metrics',
      icon: BeakerIcon,
    },
    {
      name: 'Output Validation',
      value: 92,
      status: 'good',
      description: 'Automated validation of AI-generated outputs',
      icon: DocumentMagnifyingGlassIcon,
    },
    {
      name: 'Calculation Precision',
      value: 96,
      status: 'good',
      description: 'Mathematical and computational precision in calculations',
      icon: CalculatorIcon,
    },
    {
      name: 'Trend Prediction',
      value: 85,
      status: 'warning',
      description: 'Accuracy of predictive analytics and forecasting',
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Anomaly Detection',
      value: 90,
      status: 'good',
      description: 'Effectiveness in identifying outliers and anomalies',
      icon: SparklesIcon,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-vanguard-green';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-vanguard-red';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-vanguard-green';
    if (score >= 70) return 'text-yellow-500';
    return 'text-vanguard-red';
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ChartBarIcon className="w-8 h-8 mr-3 text-vanguard-green" />
          Accuracy Analysis
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Comprehensive breakdown of accuracy metrics and performance indicators
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="p-8 mb-6 bg-gradient-to-r from-vanguard-green/10 to-transparent border-vanguard-green/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Overall Accuracy Score</h2>
            <p className="text-gray-400">
              Based on model performance, data quality, and validation metrics
            </p>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <p className="text-sm text-gray-400 mt-1">Excellent</p>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-vanguard-green/10 border border-vanguard-green/30`}>
                  <metric.icon className="w-6 h-6 text-vanguard-green" />
                </div>
                <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}%
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{metric.name}</h3>
              <p className="text-sm text-gray-400">{metric.description}</p>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    metric.status === 'good' ? 'bg-vanguard-green' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-vanguard-red'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
          Accuracy Score Calculation
        </h2>
        
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Calculation Method</h3>
            <p className="text-sm text-gray-300">
              The accuracy score is calculated using a weighted average of all accuracy metrics:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• Model Accuracy: 30% weight</li>
              <li>• Data Quality: 20% weight</li>
              <li>• Output Validation: 20% weight</li>
              <li>• Calculation Precision: 15% weight</li>
              <li>• Trend Prediction: 10% weight</li>
              <li>• Anomaly Detection: 5% weight</li>
            </ul>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent Performance Metrics</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Successful predictions</span>
                <span className="text-vanguard-green">4,892 of 5,200</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">False positive rate</span>
                <span className="text-yellow-500">3.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Model confidence average</span>
                <span className="text-vanguard-green">87.5%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommendations</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ArrowTrendingUpIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                <span className="text-gray-300">Improve trend prediction models with additional training data</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 text-vanguard-green mr-2 mt-0.5" />
                <span className="text-gray-300">Maintain high model accuracy through continuous learning</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 text-vanguard-green mr-2 mt-0.5" />
                <span className="text-gray-300">Continue rigorous output validation processes</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccuracyAnalysis;