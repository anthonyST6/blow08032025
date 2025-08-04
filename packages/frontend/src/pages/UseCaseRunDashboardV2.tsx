/**
 * UseCaseRunDashboard V2
 * 
 * This is a refactored version that uses the UnifiedDashboardWrapper
 * to ensure the run dashboard has the exact same structure as the demo dashboard,
 * with the addition of the Data Ingestion tab.
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/Badge';
import { SIAMetrics } from '../components/ui/SIAMetric';
import { UnifiedDashboardWrapper } from '../components/dashboards/UnifiedDashboardWrapper';
import { OilfieldDemoData, OilfieldDataTransformerService } from '../services/oilfieldDataTransformer.service';
import { generateIngestedData, IngestedDataRow } from '../services/ingestedData.service';
import { verticals } from '../config/verticals';
import type { UseCase } from '../config/verticals';

// Import existing demo data (this would come from your demo dashboard)
// For now, we'll use the transformer service to generate empty data
const getEmptyDemoData = (): OilfieldDemoData => {
  return OilfieldDataTransformerService.generateEmptyData();
};

// Import custom dashboard components (existing ones)
import OilfieldLandLeaseDashboard from './dashboards/OilfieldLandLeaseDashboard';
import InsuranceRiskAssessmentDashboard from './dashboards/InsuranceRiskAssessmentDashboard';
import PHMSAComplianceDashboard from './dashboards/PHMSAComplianceDashboard';
import MethaneLeakDetectionDashboard from './dashboards/MethaneLeakDetectionDashboard';
import GridResilienceDashboard from './dashboards/GridResilienceDashboard';
import InternalAuditGovernanceDashboard from './dashboards/InternalAuditGovernanceDashboard';
import SCADAIntegrationDashboard from './dashboards/SCADAIntegrationDashboard';
import WildfirePreventionDashboard from './dashboards/WildfirePreventionDashboard';
import AIPricingGovernanceDashboard from './dashboards/AIPricingGovernanceDashboard';

// Map use case IDs to their custom dashboard components
const customDashboards: Record<string, React.ComponentType<{ useCase: UseCase }>> = {
  'oilfield-land-lease': OilfieldLandLeaseDashboard,
  'insurance-risk-assessment': InsuranceRiskAssessmentDashboard,
  'phmsa-compliance': PHMSAComplianceDashboard,
  'methane-leak-detection': MethaneLeakDetectionDashboard,
  'grid-resilience': GridResilienceDashboard,
  'internal-audit-governance': InternalAuditGovernanceDashboard,
  'scada-integration': SCADAIntegrationDashboard,
  'wildfire-prevention': WildfirePreventionDashboard,
  'ai-pricing-governance': AIPricingGovernanceDashboard,
};

const UseCaseRunDashboardV2: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { useCaseId } = useParams<{ useCaseId: string }>();
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [ingestedData, setIngestedData] = useState<IngestedDataRow[] | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [dataTimestamp, setDataTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // First try to load from session storage
    const storedUseCase = sessionStorage.getItem('selectedUseCase');
    if (storedUseCase) {
      const useCase = JSON.parse(storedUseCase);
      setSelectedUseCase(useCase);
      sessionStorage.removeItem('selectedUseCase');
    } else if (useCaseId) {
      // If no session storage, try to find the use case by ID
      let foundUseCase: UseCase | null = null;
      
      // Search through all verticals to find the use case
      for (const vertical of Object.values(verticals)) {
        const useCase = vertical.useCases.find(uc => uc.id === useCaseId);
        if (useCase) {
          foundUseCase = useCase;
          break;
        }
      }
      
      if (foundUseCase) {
        setSelectedUseCase(foundUseCase);
      }
    }
  }, [useCaseId]);

  const handleDataIngest = async () => {
    setIsIngesting(true);
    
    try {
      // In a real implementation, this would open a file picker or data ingestion UI
      console.log('Opening data ingestion interface...');
      
      // For demo purposes, simulate data ingestion after 2 seconds
      setTimeout(() => {
        if (selectedUseCase) {
          // Generate ingested data
          const newData = generateIngestedData(selectedUseCase);
          setIngestedData(newData.ingestedRows);
          setDataTimestamp(new Date().toISOString());
          setIsIngesting(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error ingesting data:', error);
      setIsIngesting(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Refreshing data...');
    // In a real implementation, this would re-fetch or re-process the data
    if (selectedUseCase && ingestedData) {
      // Simulate refresh by regenerating data
      const newData = generateIngestedData(selectedUseCase);
      setIngestedData(newData.ingestedRows);
      setDataTimestamp(new Date().toISOString());
    }
  };

  if (!selectedUseCase) {
    return (
      <div className="min-h-screen bg-seraphim-black p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Use Case Selected</h2>
          <p className="text-gray-400 mb-4">Please select a use case from the launcher.</p>
          <Button onClick={() => navigate('/use-cases')}>
            Back to Use Cases
          </Button>
        </Card>
      </div>
    );
  }

  // Get the appropriate icon for the vertical
  const getVerticalIcon = (vertical: string) => {
    const icons: Record<string, any> = {
      energy: '⚡',
      healthcare: '❤️',
      finance: '💰',
    };
    return icons[vertical] || '📊';
  };

  // Derive vertical from use case ID
  const vertical = selectedUseCase.id.split('-')[0];
  const Icon = getVerticalIcon(vertical);

  // Check if this use case has a custom dashboard that doesn't use the unified wrapper
  const CustomDashboard = customDashboards[selectedUseCase.id];
  
  // For oilfield-land-lease, use the unified wrapper
  if (selectedUseCase.id === 'oilfield-land-lease') {
    return (
      <div className="min-h-screen bg-seraphim-black p-6">
        {/* Header */}
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
                <div className="p-3 rounded-lg bg-gradient-to-br from-seraphim-gold/20 to-transparent mr-4">
                  <span className="text-2xl">{Icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedUseCase.name}</h1>
                  <p className="text-sm text-gray-400">
                    {selectedUseCase.description.replace(/AI-driven insights/gi, 'VANGUARD')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src="/seraphim-vanguards-logo.png"
                alt="Seraphim Vanguards"
                className="h-36 w-auto object-contain"
              />
              <SIAMetrics
                security={selectedUseCase.siaScores.security}
                integrity={selectedUseCase.siaScores.integrity}
                accuracy={selectedUseCase.siaScores.accuracy}
                size="sm"
                animate={false}
              />
            </div>
          </div>
        </div>

        {/* Use the UnifiedDashboardWrapper */}
        <UnifiedDashboardWrapper
          useCase="oilfield"
          mode="run"
          ingestedData={ingestedData || undefined}
          onDataIngest={handleDataIngest}
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  // For other use cases that have custom dashboards, render them
  if (CustomDashboard) {
    return <CustomDashboard useCase={selectedUseCase} />;
  }

  // For use cases without custom dashboards, show a placeholder
  return (
    <div className="min-h-screen bg-seraphim-black p-6">
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
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedUseCase.name}</h1>
              <p className="text-sm text-gray-400">{selectedUseCase.description}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Dashboard Coming Soon</h2>
        <p className="text-gray-400">
          The unified dashboard for this use case is under development.
        </p>
      </Card>
    </div>
  );
};

export default UseCaseRunDashboardV2;