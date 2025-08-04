import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ServerIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface SecurityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SecurityAnalysis: React.FC = () => {
  const navigate = useNavigate();

  const overallScore = 95;

  const metrics: SecurityMetric[] = [
    {
      name: 'Authentication Security',
      value: 98,
      status: 'good',
      description: 'Multi-factor authentication enabled, strong password policies enforced',
      icon: KeyIcon,
    },
    {
      name: 'Data Encryption',
      value: 100,
      status: 'good',
      description: 'All data encrypted at rest and in transit using AES-256',
      icon: LockClosedIcon,
    },
    {
      name: 'Access Control',
      value: 92,
      status: 'good',
      description: 'Role-based access control with principle of least privilege',
      icon: FingerPrintIcon,
    },
    {
      name: 'API Security',
      value: 88,
      status: 'warning',
      description: 'API rate limiting and authentication in place, some endpoints need review',
      icon: ServerIcon,
    },
    {
      name: 'Network Security',
      value: 95,
      status: 'good',
      description: 'Firewall rules configured, intrusion detection active',
      icon: CloudIcon,
    },
    {
      name: 'Audit Logging',
      value: 96,
      status: 'good',
      description: 'Comprehensive audit trails for all critical operations',
      icon: DocumentTextIcon,
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
          <ShieldCheckIcon className="w-8 h-8 mr-3 text-vanguard-blue" />
          Security Analysis
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Comprehensive breakdown of security metrics and contributing factors
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="p-8 mb-6 bg-gradient-to-r from-vanguard-blue/10 to-transparent border-vanguard-blue/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Overall Security Score</h2>
            <p className="text-gray-400">
              Based on authentication, encryption, access control, and monitoring metrics
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
                <div className={`p-3 rounded-lg bg-vanguard-blue/10 border border-vanguard-blue/30`}>
                  <metric.icon className="w-6 h-6 text-vanguard-blue" />
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
          Security Score Calculation
        </h2>
        
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Calculation Method</h3>
            <p className="text-sm text-gray-300">
              The security score is calculated using a weighted average of all security metrics:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• Authentication Security: 20% weight</li>
              <li>• Data Encryption: 25% weight</li>
              <li>• Access Control: 20% weight</li>
              <li>• API Security: 15% weight</li>
              <li>• Network Security: 10% weight</li>
              <li>• Audit Logging: 10% weight</li>
            </ul>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent Security Events</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Failed login attempts blocked</span>
                <span className="text-vanguard-green">12 (last 24h)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Suspicious API calls detected</span>
                <span className="text-yellow-500">3 (under review)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Security patches applied</span>
                <span className="text-vanguard-green">All up to date</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommendations</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                <span className="text-gray-300">Review API endpoints with lower security scores</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 text-vanguard-green mr-2 mt-0.5" />
                <span className="text-gray-300">Continue enforcing MFA for all admin accounts</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 text-vanguard-green mr-2 mt-0.5" />
                <span className="text-gray-300">Maintain current encryption standards</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecurityAnalysis;