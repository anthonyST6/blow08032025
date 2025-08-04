import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UseCase, VerticalModule } from '@/config/verticals';

interface UseCaseConfigurationProps {
  useCase: UseCase;
  vertical: VerticalModule;
  onSubmit: (config: Record<string, any>) => void;
  onCancel: () => void;
}

export const UseCaseConfiguration: React.FC<UseCaseConfigurationProps> = ({
  useCase,
  vertical,
  onSubmit,
  onCancel
}) => {
  const [configuration, setConfiguration] = useState<Record<string, any>>({
    threshold: 0.85,
    maxIterations: 100,
    enableAlerts: true,
    alertThreshold: 0.95,
    outputFormat: 'json',
    includeMetadata: true,
    verticalSpecific: {}
  });

  const handleInputChange = (key: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...configuration,
      useCaseId: useCase.id,
      verticalId: vertical.id,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{useCase.name}</h2>
        <p className="text-gray-600 mb-6">{useCase.description}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confidence Threshold
                </label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={configuration.threshold}
                  onChange={(e) => handleInputChange('threshold', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Iterations
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={configuration.maxIterations}
                  onChange={(e) => handleInputChange('maxIterations', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Alert Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Alert Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableAlerts"
                  checked={configuration.enableAlerts}
                  onChange={(e) => handleInputChange('enableAlerts', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="enableAlerts" className="text-sm font-medium">
                  Enable real-time alerts
                </label>
              </div>
              {configuration.enableAlerts && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Alert Threshold
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={configuration.alertThreshold}
                    onChange={(e) => handleInputChange('alertThreshold', parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Output Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Output Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Output Format
                </label>
                <select
                  value={configuration.outputFormat}
                  onChange={(e) => handleInputChange('outputFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xml">XML</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeMetadata"
                  checked={configuration.includeMetadata}
                  onChange={(e) => handleInputChange('includeMetadata', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeMetadata" className="text-sm font-medium">
                  Include metadata in output
                </label>
              </div>
            </div>
          </div>

          {/* Vertical-Specific Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {vertical.name} Specific Settings
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-4">
                Configure settings specific to {vertical.name} compliance and regulations.
              </p>
              <div className="space-y-4">
                {vertical.regulations.slice(0, 3).map((regulation, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`reg-${idx}`}
                      defaultChecked
                      onChange={(e) => handleInputChange(`regulation_${regulation}`, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`reg-${idx}`} className="text-sm">
                      Enable {regulation} compliance checks
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIA Score Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Expected SIA Scores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-md">
                <div className="text-2xl font-bold text-blue-600">
                  {useCase.siaScores.security}%
                </div>
                <div className="text-sm text-gray-600">Security</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-md">
                <div className="text-2xl font-bold text-green-600">
                  {useCase.siaScores.integrity}%
                </div>
                <div className="text-sm text-gray-600">Integrity</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-md">
                <div className="text-2xl font-bold text-orange-600">
                  {useCase.siaScores.accuracy}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Execute Use Case
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};