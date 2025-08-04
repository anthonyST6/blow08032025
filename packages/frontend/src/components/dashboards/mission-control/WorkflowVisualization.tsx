import React, { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  duration?: string;
  agent?: string;
}

const WorkflowVisualization: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('lease-renewal');

  const workflows = {
    'lease-renewal': {
      name: 'Lease Renewal Process',
      steps: [
        { id: '1', name: 'Detect Expiration', status: 'completed', duration: '2s', agent: 'Integrity Agent' },
        { id: '2', name: 'Analyze Terms', status: 'completed', duration: '5s', agent: 'Accuracy Agent' },
        { id: '3', name: 'Optimize Pricing', status: 'active', duration: '12s', agent: 'Optimization Agent' },
        { id: '4', name: 'Negotiate Terms', status: 'pending', agent: 'Negotiation Agent' },
        { id: '5', name: 'Verify Compliance', status: 'pending', agent: 'Security Agent' },
        { id: '6', name: 'Update Systems', status: 'pending', agent: 'Integrity Agent' }
      ]
    },
    'security-audit': {
      name: 'Security Audit Workflow',
      steps: [
        { id: '1', name: 'Scan Documents', status: 'completed', duration: '10s', agent: 'Security Agent' },
        { id: '2', name: 'Identify Issues', status: 'completed', duration: '3s', agent: 'Security Agent' },
        { id: '3', name: 'Apply Fixes', status: 'failed', duration: '8s', agent: 'Security Agent' },
        { id: '4', name: 'Human Review', status: 'active', agent: 'Human-in-Loop' },
        { id: '5', name: 'Update Records', status: 'pending', agent: 'Integrity Agent' }
      ]
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'active':
        return <ClockIcon className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'active':
        return 'bg-blue-50 border-blue-200 animate-pulse';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const currentWorkflow = workflows[selectedWorkflow as keyof typeof workflows];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Workflow Visualization</h3>
        <select
          value={selectedWorkflow}
          onChange={(e) => setSelectedWorkflow(e.target.value)}
          className="block w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(workflows).map(([key, workflow]) => (
            <option key={key} value={key}>
              {workflow.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {currentWorkflow.steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className={`flex items-center p-4 rounded-lg border ${getStepColor(step.status)}`}>
              <div className="flex-shrink-0 mr-4">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Step {step.id}: {step.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.agent && `Assigned to: ${step.agent}`}
                      {step.duration && ` • Duration: ${step.duration}`}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                    step.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    step.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>
            </div>
            
            {index < currentWorkflow.steps.length - 1 && (
              <div className="absolute left-7 top-full h-4 w-0.5 bg-gray-300 -translate-x-1/2" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Total Progress:</span>
            <span className="ml-2 font-medium text-gray-900">
              {currentWorkflow.steps.filter(s => s.status === 'completed').length} / {currentWorkflow.steps.length} steps
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              View Details
            </button>
            <button className="text-blue-600 hover:text-blue-500 font-medium">
              Export Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualization;