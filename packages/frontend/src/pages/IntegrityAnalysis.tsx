import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  CircleStackIcon,
  ShieldExclamationIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface IntegrityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const IntegrityAnalysis: React.FC = () => {
  const navigate = useNavigate();

  const overallScore = 88;

  const metrics: IntegrityMetric[] = [
    {
      name: 'Data Validation',
      value: 92,
      status: 'good',
      description: 'Input validation and sanitization across all data entry points',
      icon: DocumentCheckIcon,
    },
    {
      name: 'Data Consistency',
      value: 85,
      status: 'warning',
      description: 'Cross-system data synchronization with minor discrepancies detected',
      icon: CircleStackIcon,
    },
    {
      name: 'Audit Trail Integrity',
      value: 98,
      status: 'good',
      description: 'Immutable audit logs with cryptographic verification',
      icon: ClipboardDocumentCheckIcon,
    },
    {
      name: 'Transaction Integrity',
      value: 90,
      status: 'good',
      description: 'ACID compliance for all critical transactions',
      icon: ArrowPathIcon,
    },
    {
      name: 'Access Control Violations',
      value: 78,
      status: 'warning',
      description: 'Some unauthorized access attempts detected and blocked',
      icon: LockOpenIcon,
    },
    {
      name: 'Data Lineage Tracking',
      value: 88,
      status: 'good',
      description: 'Complete traceability of data transformations and movements',
      icon: ShieldExclamationIcon,
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
          <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-vanguard-red" />
          Integrity Analysis
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Comprehensive breakdown of data integrity metrics and validation results
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="p-8 mb-6 bg-gradient-to-r from-vanguard-red/10 to-transparent border-vanguard-red/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Overall Integrity Score</h2>
            <p className="text-gray-400">
              Based on data validation, consistency, audit trails, and access control
            </p>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <p className="text-sm text-gray-400 mt-1">Good</p>
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
                <div className={`p-3 rounded-lg bg-vanguard-red/10 border border-vanguard-red/30`}>
                  <metric.icon className="w-6 h-6 text-vanguard-red" />
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
          Integrity Score Calculation
        </h2>
        
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Calculation Method</h3>
            <p className="text-sm text-gray-300">
              The integrity score is calculated using a weighted average of all integrity metrics:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• Data Validation: 20% weight</li>
              <li>• Data Consistency: 25% weight</li>
              <li>• Audit Trail Integrity: 20% weight</li>
              <li>• Transaction Integrity: 15% weight</li>
              <li>• Access Control: 10% weight</li>
              <li>• Data Lineage: 10% weight</li>
            </ul>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent Integrity Events</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Data validation errors caught</span>
                <span className="text-yellow-500">23 (last 24h)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Consistency checks passed</span>
                <span className="text-vanguard-green">1,247 of 1,280</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Unauthorized modifications blocked</span>
                <span className="text-vanguard-red">7 attempts</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommendations</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                <span className="text-gray-300">Investigate data consistency discrepancies in cross-system sync</span>
              </li>
              <li className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                <span className="text-gray-300">Review access control policies for recent violation attempts</span>
              </li>
              <li className="flex items-start">
                <CheckBadgeIcon className="w-4 h-4 text-vanguard-green mr-2 mt-0.5" />
                <span className="text-gray-300">Continue maintaining high audit trail standards</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntegrityAnalysis;