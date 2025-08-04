export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
  category?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'prompt' | 'agent' | 'condition' | 'action';
  config: Record<string, any>;
  order: number;
}

export const predefinedWorkflows: Workflow[] = [
  {
    id: 'land-lease-mgmt',
    name: 'Land Lease Management',
    description: 'Automated workflow for processing and analyzing land lease agreements, compliance checks, and renewal notifications',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    lastRunAt: '2024-03-25T09:15:00Z',
    runCount: 156,
    category: 'Real Estate',
    steps: [
      {
        id: 'step-1',
        name: 'Document Extraction',
        type: 'agent',
        order: 1,
        config: {
          agent: 'document-parser',
          extractFields: ['lease_terms', 'payment_schedule', 'renewal_clauses'],
        },
      },
      {
        id: 'step-2',
        name: 'Compliance Check',
        type: 'prompt',
        order: 2,
        config: {
          prompt: 'Analyze lease agreement for regulatory compliance',
          model: 'gpt-4',
        },
      },
      {
        id: 'step-3',
        name: 'Risk Assessment',
        type: 'agent',
        order: 3,
        config: {
          agent: 'risk-analyzer',
          thresholds: { high: 0.8, medium: 0.5 },
        },
      },
      {
        id: 'step-4',
        name: 'Notification Trigger',
        type: 'condition',
        order: 4,
        config: {
          condition: 'renewal_date < 90_days',
          action: 'send_notification',
        },
      },
      {
        id: 'step-5',
        name: 'Generate Report',
        type: 'action',
        order: 5,
        config: {
          template: 'lease_analysis_report',
          format: 'pdf',
        },
      },
    ],
  },
  {
    id: 'load-forecasting',
    name: 'Energy Load Forecasting',
    description: 'AI-powered workflow for predicting energy consumption patterns and optimizing grid load distribution',
    status: 'active',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-22T16:45:00Z',
    lastRunAt: '2024-03-25T12:00:00Z',
    runCount: 892,
    category: 'Energy',
    steps: [
      {
        id: 'step-1',
        name: 'Data Collection',
        type: 'agent',
        order: 1,
        config: {
          agent: 'data-collector',
          sources: ['smart_meters', 'weather_api', 'historical_data'],
          interval: '15_minutes',
        },
      },
      {
        id: 'step-2',
        name: 'Pattern Analysis',
        type: 'prompt',
        order: 2,
        config: {
          prompt: 'Analyze consumption patterns and identify anomalies',
          model: 'gpt-4-turbo',
          temperature: 0.3,
        },
      },
      {
        id: 'step-3',
        name: 'ML Prediction',
        type: 'agent',
        order: 3,
        config: {
          agent: 'ml-predictor',
          model: 'lstm_energy_v2',
          horizon: '24_hours',
        },
      },
      {
        id: 'step-4',
        name: 'Optimization Engine',
        type: 'agent',
        order: 4,
        config: {
          agent: 'grid-optimizer',
          constraints: ['peak_demand', 'renewable_availability'],
        },
      },
      {
        id: 'step-5',
        name: 'Alert Generation',
        type: 'condition',
        order: 5,
        config: {
          condition: 'predicted_load > capacity * 0.9',
          action: 'critical_alert',
        },
      },
      {
        id: 'step-6',
        name: 'Dashboard Update',
        type: 'action',
        order: 6,
        config: {
          target: 'energy_dashboard',
          metrics: ['forecast', 'recommendations', 'alerts'],
        },
      },
    ],
  },
  {
    id: 'insurance-claims',
    name: 'Insurance Claims Processing',
    description: 'Automated workflow for processing insurance claims with fraud detection and approval routing',
    status: 'active',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-03-18T13:20:00Z',
    lastRunAt: '2024-03-25T08:30:00Z',
    runCount: 423,
    category: 'Insurance',
    steps: [
      {
        id: 'step-1',
        name: 'Claim Intake',
        type: 'agent',
        order: 1,
        config: {
          agent: 'claim-processor',
          validateFields: true,
        },
      },
      {
        id: 'step-2',
        name: 'Fraud Detection',
        type: 'prompt',
        order: 2,
        config: {
          prompt: 'Analyze claim for potential fraud indicators',
          model: 'gpt-4',
        },
      },
      {
        id: 'step-3',
        name: 'Approval Routing',
        type: 'condition',
        order: 3,
        config: {
          conditions: [
            { if: 'amount < 5000', then: 'auto_approve' },
            { if: 'fraud_score > 0.7', then: 'manual_review' },
          ],
        },
      },
    ],
  },
];

export const getMockWorkflows = (): Workflow[] => {
  return predefinedWorkflows;
};

export const createMockWorkflow = (data: { name: string; description: string }): Workflow => {
  const newWorkflow: Workflow = {
    id: `workflow-${Date.now()}`,
    name: data.name,
    description: data.description,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    runCount: 0,
    steps: [],
  };
  
  predefinedWorkflows.push(newWorkflow);
  return newWorkflow;
};

export const deleteMockWorkflow = (id: string): void => {
  const index = predefinedWorkflows.findIndex(w => w.id === id);
  if (index > -1) {
    predefinedWorkflows.splice(index, 1);
  }
};

export const runMockWorkflow = (id: string): void => {
  const workflow = predefinedWorkflows.find(w => w.id === id);
  if (workflow) {
    workflow.lastRunAt = new Date().toISOString();
    workflow.runCount += 1;
  }
};