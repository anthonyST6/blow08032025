import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { SIAMetrics } from '../../ui/SIAMetric';

interface UseCaseHeaderProps {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  onMetricClick: (metric: 'security' | 'integrity' | 'accuracy') => void;
}

export const UseCaseHeader: React.FC<UseCaseHeaderProps> = ({
  name,
  description,
  icon: Icon,
  iconColor,
  siaScores,
  onMetricClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/use-cases')}
            className="mr-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${iconColor}/20 to-transparent mr-4`}>
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <img
            src="/seraphim-vanguards-logo.png"
            alt="Seraphim Vanguards"
            className="h-36 w-auto object-contain"
          />
          <SIAMetrics
            security={siaScores.security}
            integrity={siaScores.integrity}
            accuracy={siaScores.accuracy}
            size="sm"
            animate={false}
            onMetricClick={onMetricClick}
          />
        </div>
      </div>
    </div>
  );
};