// Comprehensive Vanguard Agent configurations for all active use cases
// Each use case has Security, Integrity, and Accuracy vanguards as standard
// Additional vanguards are customized based on the specific use case needs

export interface Agent {
  id: string;
  name: string;
  type: 'security' | 'integrity' | 'accuracy' | 'optimization' | 'negotiation' | 'prediction' | 'monitoring' | 'compliance' | 'analysis' | 'response';
  status: 'inactive' | 'active' | 'processing' | 'completed';
  position: { x: number; y: number };
  tasks: string[];
  connections: string[];
}

// Part 1: Energy & Utilities configurations
import { energyUtilitiesAgents } from './agents/energyUtilities';
// Part 2: Healthcare configurations  
import { healthcareAgents } from './agents/healthcare';
// Part 3: Financial Services configurations
import { financialServicesAgents } from './agents/financialServices';
// Part 4: Manufacturing & Logistics configurations
import { manufacturingLogisticsAgents } from './agents/manufacturingLogistics';
// Part 5: Other verticals configurations
import { otherVerticalsAgents } from './agents/otherVerticals';

export const vanguardAgentsConfig: { [key: string]: Agent[] } = {
  ...energyUtilitiesAgents,
  ...healthcareAgents,
  ...financialServicesAgents,
  ...manufacturingLogisticsAgents,
  ...otherVerticalsAgents,
};

// Export a function to get agents for a specific use case
export const getAgentsForUseCase = (useCaseId: string): Agent[] => {
  return vanguardAgentsConfig[useCaseId] || [];
};

// Export a function to get the decision process for agents
export const getAgentDecisionProcess = () => {
  return {
    steps: [
      {
        number: 1,
        title: 'Analyze Incoming Data',
        description: 'The agent continuously monitors relevant data streams, documents, and system updates to identify items requiring attention.',
      },
      {
        number: 2,
        title: 'Assess Risk Level',
        description: 'Each action is evaluated for risk based on financial impact, regulatory requirements, and business rules specific to the use case.',
      },
      {
        number: 3,
        title: 'Take Appropriate Action',
        lowRisk: 'Automatically execute approved actions and update all connected systems',
        highRisk: 'Create detailed action package and notify human experts via Teams/Email for review',
      },
    ],
  };
};

// Export a function to get performance objectives
export const getAgentPerformanceObjectives = (useCaseId: string) => {
  // Common objectives for all agents
  const commonObjectives = [
    {
      icon: 'CheckCircleIcon',
      color: 'green',
      title: 'Never Miss Critical Events',
      description: 'Tracks all important deadlines, thresholds, and triggers with automated alerts',
    },
    {
      icon: 'CheckCircleIcon',
      color: 'blue',
      title: 'Ensure Data Accuracy',
      description: 'Validates information across all systems to maintain a single source of truth',
    },
    {
      icon: 'CheckCircleIcon',
      color: 'purple',
      title: 'Maintain Compliance',
      description: 'Creates complete audit trails and ensures all actions meet regulatory requirements',
    },
    {
      icon: 'CheckCircleIcon',
      color: 'amber',
      title: 'Prevent Problems Before They Occur',
      description: 'Identifies potential issues early and recommends preventive actions',
    },
  ];

  // Use case specific objectives can be added here
  const specificObjectives: { [key: string]: any[] } = {
    'oilfield-lease': [
      {
        icon: 'DocumentTextIcon',
        color: 'indigo',
        title: 'Optimize Lease Portfolio',
        description: 'Continuously analyze lease terms and market conditions to maximize value',
      },
    ],
    'grid-anomaly': [
      {
        icon: 'BoltIcon',
        color: 'yellow',
        title: 'Prevent Grid Failures',
        description: 'Predict and prevent cascading failures before they impact customers',
      },
    ],
    'patient-risk': [
      {
        icon: 'HeartIcon',
        color: 'red',
        title: 'Improve Patient Outcomes',
        description: 'Enable early interventions that prevent complications and save lives',
      },
    ],
    'fraud-detection': [
      {
        icon: 'ShieldCheckIcon',
        color: 'red',
        title: 'Stop Fraud in Real-Time',
        description: 'Block fraudulent transactions milliseconds after detection',
      },
    ],
  };

  return [...commonObjectives, ...(specificObjectives[useCaseId] || [])];
};