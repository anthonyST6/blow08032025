import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CogIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PlayIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { agentConfigurationService } from '../services/agentConfiguration.service';
import { useCaseService } from '../services/usecase.service';
import { UseCaseWorkflow, WorkflowStep } from '../types/usecase.types';
import { toast } from 'react-hot-toast';

interface WorkflowGeneratorProps {
  useCaseId: string;
  useCaseName: string;
  onWorkflowGenerated?: (workflow: UseCaseWorkflow) => void;
}

const WorkflowGenerator: React.FC<WorkflowGeneratorProps> = ({
  useCaseId,
  useCaseName,
  onWorkflowGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<UseCaseWorkflow | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check if we have a configuration for this use case
    if (agentConfigurationService.hasConfiguration(useCaseId)) {
      generateWorkflowSteps();
    }
  }, [useCaseId]);

  const generateWorkflowSteps = async () => {
    setIsGenerating(true);
    
    try {
      // Get workflow steps from agent configuration
      const configSteps = agentConfigurationService.getWorkflowSteps(useCaseId);
      
      if (configSteps.length > 0) {
        // Convert to workflow steps
        const steps: WorkflowStep[] = configSteps.map((step, index) => ({
          id: step.id,
          name: step.name,
          agentId: step.agentId,
          order: index + 1,
          config: getStepConfig(step.agentId, useCaseId),
          parameters: getStepParameters(step.agentId, useCaseId),
        }));
        
        setWorkflowSteps(steps);
        
        // Create the workflow object
        const workflow: UseCaseWorkflow = {
          id: `workflow-${useCaseId}-${Date.now()}`,
          useCaseId,
          name: `${useCaseName} Automated Workflow`,
          description: `Dynamically generated workflow for ${useCaseName} processing`,
          steps,
          status: 'active',
          schedule: {
            type: 'manual',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          runCount: 0,
        };
        
        setGeneratedWorkflow(workflow);
        toast.success('Workflow generated successfully!');
      } else {
        toast.error('No agent configuration found for this use case');
      }
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      toast.error('Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepConfig = (agentId: string, useCaseId: string): Record<string, any> => {
    // Return specific configuration based on agent type and use case
    const configs: Record<string, Record<string, any>> = {
      'data-ingestion': {
        sources: ['csv', 'json', 'api'],
        validation: true,
        batchSize: 1000,
      },
      'data-transformation': {
        transformations: ['normalize', 'geocode', 'validate'],
        outputFormat: 'standardized',
      },
      'analytics': {
        algorithms: ['trend-analysis', 'anomaly-detection'],
        confidenceThreshold: 0.95,
      },
      'compliance': {
        regulations: ['EPA', 'BLM', 'state-specific'],
        strictMode: true,
      },
      'report-generator': {
        formats: ['pdf', 'excel', 'json'],
        includeVisualizations: true,
      },
    };
    
    return configs[agentId] || {};
  };

  const getStepParameters = (agentId: string, useCaseId: string): Record<string, any> => {
    // Return specific parameters based on use case
    if (useCaseId === 'oilfield-land-lease') {
      const params: Record<string, Record<string, any>> = {
        'data-ingestion': {
          filePattern: '*.csv',
          dateFormat: 'MM/DD/YYYY',
        },
        'analytics': {
          expirationThreshold: 90,
          revenueCalculation: 'monthly',
        },
        'compliance': {
          jurisdiction: 'Texas',
          complianceLevel: 'strict',
        },
      };
      return params[agentId] || {};
    }
    
    return {};
  };

  const handleSaveWorkflow = async () => {
    if (!generatedWorkflow) return;
    
    try {
      const savedWorkflow = await useCaseService.createWorkflow(generatedWorkflow);
      toast.success('Workflow saved successfully!');
      
      if (onWorkflowGenerated) {
        onWorkflowGenerated(savedWorkflow);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const getStepIcon = (agentId: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'orchestrator': CogIcon,
      'data-ingestion': DocumentTextIcon,
      'data-transformation': ArrowPathIcon,
      'analytics': SparklesIcon,
      'compliance': CheckCircleIcon,
      'report-generator': DocumentTextIcon,
    };
    
    return icons[agentId] || CogIcon;
  };

  return (
    <div className="space-y-4">
      {/* Generation Status */}
      {!generatedWorkflow && (
        <Card variant="glass" padding="sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CogIcon className="h-6 w-6 text-seraphim-gold" />
                <div>
                  <p className="text-sm font-medium text-white">Workflow Generation</p>
                  <p className="text-xs text-gray-400">
                    {agentConfigurationService.hasConfiguration(useCaseId)
                      ? 'Ready to generate workflow based on agent configuration'
                      : 'No pre-configured agents found for this use case'}
                  </p>
                </div>
              </div>
              
              {agentConfigurationService.hasConfiguration(useCaseId) && !generatedWorkflow && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={generateWorkflowSteps}
                  disabled={isGenerating}
                  className="flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Workflow Preview */}
      <AnimatePresence>
        {generatedWorkflow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="gradient" effect="shimmer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SparklesIcon className="h-5 w-5 text-seraphim-gold mr-2" />
                    Generated Workflow
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide' : 'Show'} Steps
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Workflow Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Workflow Name</p>
                      <p className="text-sm font-medium text-white">{generatedWorkflow.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Steps</p>
                      <p className="text-sm font-medium text-white">{generatedWorkflow.steps.length}</p>
                    </div>
                  </div>

                  {/* Workflow Steps Preview */}
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {workflowSteps.map((step, index) => {
                        const StepIcon = getStepIcon(step.agentId);
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-seraphim-gold/20 rounded-full">
                              <StepIcon className="h-4 w-4 text-seraphim-gold" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{step.name}</p>
                              <p className="text-xs text-gray-400">Step {step.order}</p>
                            </div>
                            {index < workflowSteps.length - 1 && (
                              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>Estimated execution time: {workflowSteps.length * 2} minutes</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setGeneratedWorkflow(null);
                          setWorkflowSteps([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={handleSaveWorkflow}
                        className="flex items-center"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Save Workflow
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowGenerator;