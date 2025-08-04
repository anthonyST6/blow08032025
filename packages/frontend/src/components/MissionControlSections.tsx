import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import {
  CogIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  ServerStackIcon,
  DocumentCheckIcon,
  CommandLineIcon,
  EyeIcon,
  PlayIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import AgentOrchestrationBranded from '../pages/AgentOrchestrationBranded';
import DeploymentOrchestration from '../pages/DeploymentOrchestration';
import Operations from '../pages/Operations';
import IntegrationLogEnhanced from '../pages/IntegrationLogEnhanced';
import AuditConsoleEnhanced from '../pages/AuditConsoleEnhanced';
import WorkflowGenerator from './WorkflowGenerator';
import AgentOrchestrationFlow from './AgentOrchestrationFlow';
import DeploymentStatus from './DeploymentStatus';
import AgentActivityFeed from './AgentActivityFeed';
import UnifiedEventStream from './UnifiedEventStream';
import CertificationResults from './CertificationResults';
import { AgentNode } from '../types/usecase.types';
import { motion } from 'framer-motion';

interface MissionControlSectionsProps {
  activeUseCaseId: string | null;
  activeWorkflow: { workflowId: string; agents: AgentNode[] } | null;
  activeDeployment: { workflowId: string; agents: AgentNode[] } | null;
  showCertifications: boolean;
  workflows: any[];
  onWorkflowGenerated: (workflow: any) => void;
  onRunWorkflow: (workflowId: string) => void;
}

export const MissionControlSections: React.FC<MissionControlSectionsProps> = ({
  activeUseCaseId,
  activeWorkflow,
  activeDeployment,
  showCertifications,
  workflows,
  onWorkflowGenerated,
  onRunWorkflow,
}) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Agent Orchestration Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        className="scroll-mt-20"
        id="agent-orchestration"
      >
        <Card variant="gradient" effect="shimmer" className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-vanguard-blue/20 to-seraphim-gold/20">
            <CardTitle className="flex items-center text-xl">
              <CogIcon className="h-6 w-6 text-seraphim-gold mr-3" />
              Agent Orchestration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeWorkflow ? (
              <div className="space-y-6">
                <AgentOrchestrationFlow
                  agents={activeWorkflow.agents}
                  workflowId={activeWorkflow.workflowId}
                  isActive={true}
                />
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Draggable Agent Configuration</h3>
                  <AgentOrchestrationBranded />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CogIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Launch a use case to see agent orchestration</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Workflows Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.1 }}
        className="scroll-mt-20"
        id="workflows"
      >
        <Card variant="glass-dark" effect="glow">
          <CardHeader className="bg-gradient-to-r from-vanguard-green/20 to-vanguard-blue/20">
            <CardTitle className="flex items-center text-xl">
              <ChartBarIcon className="h-6 w-6 text-vanguard-green mr-3" />
              Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeUseCaseId ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Active Workflows</h3>
                  <WorkflowGenerator
                    useCaseId={activeUseCaseId}
                    useCaseName="Current Mission"
                    onWorkflowGenerated={onWorkflowGenerated}
                  />
                </div>
                
                {workflows.length > 0 ? (
                  <div className="space-y-4">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              workflow.status === 'completed' ? 'bg-vanguard-green' :
                              workflow.status === 'running' ? 'bg-vanguard-blue animate-pulse' :
                              workflow.status === 'failed' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`} />
                            <h4 className="text-sm font-semibold text-white">{workflow.name}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              workflow.status === 'completed' ? 'bg-vanguard-green/20 text-vanguard-green' :
                              workflow.status === 'running' ? 'bg-vanguard-blue/20 text-vanguard-blue' :
                              workflow.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                              'bg-gray-500/20 text-gray-500'
                            }`}>
                              {workflow.status}
                            </span>
                            
                            {workflow.status === 'pending' && (
                              <Button
                                variant="primary"
                                size="small"
                                onClick={() => onRunWorkflow(workflow.id)}
                              >
                                <PlayIcon className="h-3 w-3 mr-1" />
                                Run
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {workflow.status === 'running' && workflow.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{workflow.progress}%</span>
                            </div>
                            <div className="w-full bg-black/50 rounded-full h-2">
                              <div
                                className="bg-vanguard-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${workflow.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No workflows configured yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a use case to view workflows</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Deployment Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
        className="scroll-mt-20"
        id="deployment"
      >
        <Card variant="gradient" effect="shimmer">
          <CardHeader className="bg-gradient-to-r from-vanguard-red/20 to-vanguard-blue/20">
            <CardTitle className="flex items-center text-xl">
              <ServerStackIcon className="h-6 w-6 text-vanguard-red mr-3" />
              Deployment Orchestration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeDeployment ? (
              <div className="space-y-6">
                <DeploymentStatus
                  workflowId={activeDeployment.workflowId}
                  agents={activeDeployment.agents}
                  isDeploying={true}
                />
                <div className="mt-8">
                  <DeploymentOrchestration />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ServerStackIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No active deployments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Operations Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.3 }}
        className="scroll-mt-20"
        id="operations"
      >
        <Card variant="glass-dark" effect="glow">
          <CardHeader className="bg-gradient-to-r from-seraphim-gold/20 to-vanguard-green/20">
            <CardTitle className="flex items-center text-xl">
              <DocumentCheckIcon className="h-6 w-6 text-seraphim-gold mr-3" />
              Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeWorkflow ? (
              <div className="space-y-6">
                <AgentActivityFeed
                  workflowId={activeWorkflow.workflowId}
                  agents={activeWorkflow.agents}
                  isActive={true}
                />
                <div className="mt-8">
                  <Operations />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentCheckIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Launch a workflow to see operations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Integration Log Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
        className="scroll-mt-20"
        id="integration-log"
      >
        <Card variant="gradient" effect="shimmer">
          <CardHeader className="bg-gradient-to-r from-vanguard-blue/20 to-vanguard-green/20">
            <CardTitle className="flex items-center text-xl">
              <DocumentArrowUpIcon className="h-6 w-6 text-vanguard-blue mr-3" />
              Integration Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <IntegrationLogEnhanced />
          </CardContent>
        </Card>
      </motion.section>

      {/* Audit Console Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.5 }}
        className="scroll-mt-20"
        id="audit-console"
      >
        <Card variant="glass-dark" effect="glow">
          <CardHeader className="bg-gradient-to-r from-vanguard-red/20 to-seraphim-gold/20">
            <CardTitle className="flex items-center text-xl">
              <CommandLineIcon className="h-6 w-6 text-vanguard-red mr-3" />
              Audit Console
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AuditConsoleEnhanced />
          </CardContent>
        </Card>
      </motion.section>

      {/* Output Viewer Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.6 }}
        className="scroll-mt-20"
        id="output-viewer"
      >
        <Card variant="gradient" effect="shimmer">
          <CardHeader className="bg-gradient-to-r from-seraphim-gold/20 to-vanguard-red/20">
            <CardTitle className="flex items-center text-xl">
              <EyeIcon className="h-6 w-6 text-seraphim-gold mr-3" />
              Output Viewer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeWorkflow ? (
              <div className="space-y-6">
                <UnifiedEventStream
                  workflowId={activeWorkflow.workflowId}
                  isActive={true}
                />
                
                {showCertifications && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Certification Results</h3>
                    <CertificationResults
                      workflowId={activeWorkflow.workflowId}
                      useCaseId={activeUseCaseId || ''}
                      isActive={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <EyeIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No output to display</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default MissionControlSections;