import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  RocketLaunchIcon,
  DocumentArrowUpIcon,
  PhotoIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../services/api';
import { useUseCaseContext } from '../contexts/UseCaseContext';

interface UseCaseFormData {
  name: string;
  description: string;
  domain: string;
  iconFile?: File;
  configFile?: File;
  template?: string;
}

const templates = [
  { id: 'oilfield-lease', name: 'Oilfield Land Lease', domain: 'energy' },
  { id: 'load-forecasting', name: 'Energy Load Forecasting', domain: 'energy' },
  { id: 'custom', name: 'Custom Configuration', domain: 'all' },
];

interface ExistingUseCase {
  id: string;
  name: string;
  description: string;
  vertical: string;
  category: string;
  status: string;
}

const UseCaseLauncherForm: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveUseCaseId, setActiveUseCaseData } = useUseCaseContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [existingUseCases, setExistingUseCases] = useState<ExistingUseCase[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedExistingUseCase, setSelectedExistingUseCase] = useState<string>('');
  const [isLoadingUseCases, setIsLoadingUseCases] = useState(false);
  const [formData, setFormData] = useState<UseCaseFormData>({
    name: '',
    description: '',
    domain: '',
    template: '',
  });

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, []);

  // Fetch use cases when domain changes
  useEffect(() => {
    if (selectedDomain) {
      fetchUseCasesByDomain(selectedDomain);
    } else {
      setExistingUseCases([]);
    }
  }, [selectedDomain]);

  const fetchDomains = async () => {
    // Immediately set fallback domains for faster loading
    const fallbackDomains = [
      'Energy & Utilities',
      'Healthcare',
      'Finance & Banking',
      'Manufacturing',
      'Retail & E-commerce',
      'Logistics & Supply Chain',
      'Education',
      'Pharmaceuticals',
      'Government',
      'Telecommunications',
      'Real Estate'
    ];
    setDomains(fallbackDomains);
    
    // Try to fetch from API in background (optional)
    try {
      const response = await Promise.race([
        api.get('/domains'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
      ]) as any;
      if (response && response.data) {
        setDomains(response.data);
      }
    } catch (error) {
      // Keep using fallback data
      console.log('Using fallback domains data');
    }
  };

  const fetchUseCasesByDomain = async (domain: string) => {
    setIsLoadingUseCases(true);
    
    // Fallback use cases for immediate loading
    const fallbackUseCases: Record<string, ExistingUseCase[]> = {
      'Energy & Utilities': [
        { id: 'oilfield-land-lease', name: 'Oilfield Land Lease', description: 'Manage O&G well leases', vertical: 'Energy & Utilities', category: 'Land Management', status: 'active' },
        { id: 'energy-load-forecasting', name: 'Energy Load Forecasting', description: 'AI-powered load prediction', vertical: 'Energy & Utilities', category: 'Operations', status: 'active' },
        { id: 'grid-anomaly-detection', name: 'Grid Anomaly Detection', description: 'Detect grid failures', vertical: 'Energy & Utilities', category: 'Monitoring', status: 'active' }
      ],
      'Healthcare': [
        { id: 'patient-intake', name: 'Patient Intake Automation', description: 'Streamline patient registration', vertical: 'Healthcare', category: 'Administration', status: 'active' },
        { id: 'clinical-trial-matching', name: 'Clinical Trial Matching', description: 'Match patients with trials', vertical: 'Healthcare', category: 'Research', status: 'active' }
      ],
      'Finance & Banking': [
        { id: 'fraud-detection', name: 'Transaction Fraud Detection', description: 'Real-time fraud analysis', vertical: 'Finance & Banking', category: 'Security', status: 'active' },
        { id: 'loan-processing', name: 'Automated Loan Processing', description: 'End-to-end loan automation', vertical: 'Finance & Banking', category: 'Operations', status: 'active' }
      ]
    };
    
    // Set fallback data immediately
    setExistingUseCases(fallbackUseCases[domain] || []);
    setIsLoadingUseCases(false);
    
    // Try to fetch from API in background (optional)
    try {
      const response = await Promise.race([
        api.get(`/usecases?domain=${encodeURIComponent(domain)}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
      ]) as any;
      if (response && response.data) {
        setExistingUseCases(response.data);
      }
    } catch (error) {
      // Keep using fallback data
      console.log('Using fallback use cases data for domain:', domain);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'iconFile' | 'configFile') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const generateDummyData = () => {
    // Generate dummy orchestration data
    const orchestration = {
      agents: [
        { id: 'agent-1', name: 'Data Collector', type: 'collector', status: 'active' },
        { id: 'agent-2', name: 'Analyzer', type: 'analyzer', status: 'active' },
        { id: 'agent-3', name: 'Reporter', type: 'reporter', status: 'active' },
      ],
      connections: [
        { from: 'agent-1', to: 'agent-2', type: 'data-flow' },
        { from: 'agent-2', to: 'agent-3', type: 'analysis-flow' },
      ],
    };

    // Generate dummy KPIs
    const kpis = [
      { name: 'Processing Speed', value: 95, unit: '%', trend: 'up' },
      { name: 'Accuracy Rate', value: 98.5, unit: '%', trend: 'stable' },
      { name: 'Cost Savings', value: 45000, unit: '$', trend: 'up' },
      { name: 'Efficiency Gain', value: 32, unit: '%', trend: 'up' },
    ];

    // Generate dummy logs
    const logs = Array.from({ length: 20 }, (_, i) => ({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
      message: `System event ${i + 1}: ${['Processing completed', 'Data validated', 'Analysis started', 'Report generated'][Math.floor(Math.random() * 4)]}`,
      agent: `agent-${Math.floor(Math.random() * 3) + 1}`,
    }));

    // Generate dummy audit events
    const auditEvents = Array.from({ length: 15 }, (_, i) => ({
      id: `audit-${i}`,
      timestamp: new Date(Date.now() - i * 7200000).toISOString(),
      user: ['system', 'admin@example.com', 'operator@example.com'][Math.floor(Math.random() * 3)],
      action: ['CREATE', 'UPDATE', 'DELETE', 'ACCESS'][Math.floor(Math.random() * 4)],
      resource: ['configuration', 'data', 'report', 'agent'][Math.floor(Math.random() * 4)],
      status: 'success',
    }));

    // Generate dummy outputs
    const outputs = Array.from({ length: 10 }, (_, i) => ({
      id: `output-${i}`,
      name: `Report_${new Date(Date.now() - i * 86400000).toISOString().split('T')[0]}`,
      type: ['analysis', 'summary', 'detailed'][Math.floor(Math.random() * 3)],
      size: Math.floor(Math.random() * 5000) + 1000,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    return { orchestration, kpis, logs, auditEvents, outputs };
  };

  const handleDomainSelect = (domain: string) => {
    console.log('Selected domain:', domain);
    setSelectedDomain(domain);
    setSelectedExistingUseCase(''); // Clear use case selection when domain changes
  };

  const handleExistingUseCaseSelect = (useCaseId: string) => {
    console.log('Selected use case:', useCaseId);
    setSelectedExistingUseCase(useCaseId);
  };

  const clearExistingSelection = () => {
    setSelectedDomain('');
    setSelectedExistingUseCase('');
  };

  // Check if we're in existing mode (both dropdowns selected)
  const isExistingMode = !!(selectedDomain && selectedExistingUseCase);

  const handleLaunchExistingUseCase = async () => {
    if (!selectedDomain || !selectedExistingUseCase) {
      toast.error('Please select both domain and use case');
      return;
    }

    setIsSubmitting(true);
    console.log('Launching existing use case:', selectedExistingUseCase);

    try {
      // Fetch the unified data for the selected use case
      try {
        const response = await api.get(`/usecases/${selectedExistingUseCase}/data`);
        console.log('Fetched unified use case data:', response.data);
        
        // Store the unified data in global context
        setActiveUseCaseData(response.data);
      } catch (error) {
        console.log('Could not fetch unified data, proceeding with minimal data');
        // Set minimal data if API fails
        setActiveUseCaseData({
          summary: {
            activeItems: 0,
            successRate: 0,
            costSavings: 0,
            efficiencyGain: 0,
          }
        });
      }

      // Set active use case in global context
      setActiveUseCaseId(selectedExistingUseCase);
      
      const useCase = existingUseCases.find(uc => uc.id === selectedExistingUseCase);
      toast.success(`Launching ${useCase?.name || selectedExistingUseCase}...`);
      
      // Navigate to use case dashboard
      console.log('Navigating to:', `/use-case/${selectedExistingUseCase}`);
      setTimeout(() => {
        navigate(`/use-case/${selectedExistingUseCase}`);
      }, 500);
    } catch (error: any) {
      console.error('Error launching use case:', error);
      toast.error('Failed to launch use case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);

    try {
      // This is for creating new use case only
        // Create new use case (existing logic)
        if (!formData.name || !formData.description || !formData.domain) {
          toast.error('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('domain', formData.domain);
      
      if (formData.iconFile) {
        submitData.append('icon', formData.iconFile);
      }
      
      if (formData.configFile) {
        submitData.append('config', formData.configFile);
      } else if (formData.template && formData.template !== 'custom') {
        submitData.append('template', formData.template);
      }

      // Save the use case
      const response = await api.post('/usecases', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const useCaseId = response.data.id;

      // If no config file was provided, generate default orchestration and dummy data
      if (!formData.configFile) {
        const dummyData = generateDummyData();
        
        // Save orchestration
        await api.post('/orchestration/save', {
          useCaseId,
          ...dummyData.orchestration,
        });

        // Save dummy data (this would be handled by the backend in a real implementation)
        await api.post(`/usecases/${useCaseId}/data`, {
          kpis: dummyData.kpis,
          logs: dummyData.logs,
          auditEvents: dummyData.auditEvents,
          outputs: dummyData.outputs,
        });
      }

      toast.success('Use case launched successfully!');
      
      // Set the new use case as active
      setActiveUseCaseId(useCaseId);
      
      // Navigate to workflows for new use case
      setTimeout(() => {
        navigate('/workflows');
      }, 500);
    } catch (error: any) {
      console.error('Error launching use case:', error);
      toast.error(error.response?.data?.message || 'Failed to launch use case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTemplates = formData.domain
    ? templates.filter(t => t.domain === formData.domain || t.domain === 'all')
    : templates;

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <RocketLaunchIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
            Launch New Use Case
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Register or upload a new use case into the Seraphim Vanguards platform
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Section 1: Select Existing Use Case */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Select an Existing Use Case
              </h2>
              
              {/* Domain/Industry Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  1. Select Domain/Industry
                </label>
                <div className="relative">
                  <select
                    value={selectedDomain}
                    onChange={(e) => handleDomainSelect(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none appearance-none pr-10"
                  >
                    <option value="">Choose a domain...</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Use Case Dropdown - Only show when domain is selected */}
              {selectedDomain && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    2. Select Use Case
                  </label>
                  <div className="relative">
                    <select
                      value={selectedExistingUseCase}
                      onChange={(e) => handleExistingUseCaseSelect(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none appearance-none pr-10"
                      disabled={isLoadingUseCases}
                    >
                      <option value="">
                        {isLoadingUseCases ? 'Loading use cases...' : 'Choose a use case...'}
                      </option>
                      {existingUseCases.map(useCase => (
                        <option key={useCase.id} value={useCase.id}>
                          {useCase.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Launch Button for Existing Use Case */}
              {isExistingMode && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={handleLaunchExistingUseCase}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <RocketLaunchIcon className="w-5 h-5 mr-2" />
                        Launch Use Case
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Selected Use Case Display */}
              {selectedExistingUseCase && (
                <div className="mt-3 flex items-center justify-between p-3 bg-seraphim-gold/10 rounded-lg">
                  <div>
                    <p className="text-sm text-seraphim-gold font-medium">
                      {existingUseCases.find(uc => uc.id === selectedExistingUseCase)?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {existingUseCases.find(uc => uc.id === selectedExistingUseCase)?.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearExistingSelection}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Or Launch a New Use Case */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Or Launch a New Use Case
              </h2>
              <form id="new-use-case-form" onSubmit={handleSubmit}>
                <div className="space-y-6">
              {/* Use Case Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Use Case Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter use case name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the use case and its objectives"
                  className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-seraphim-gold focus:outline-none resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Domain/Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domain / Industry <span className="text-red-500">*</span>
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                  required
                >
                  <option value="">Select a domain</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon/Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon/Logo Upload
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <PhotoIcon className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-300">Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'iconFile')}
                      className="hidden"
                    />
                  </label>
                  {formData.iconFile && (
                    <span className="text-sm text-gray-400">
                      {formData.iconFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Configuration Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload JSON/YAML Configuration (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-300">Choose File</span>
                    <input
                      type="file"
                      accept=".json,.yaml,.yml"
                      onChange={(e) => handleFileChange(e, 'configFile')}
                      className="hidden"
                    />
                  </label>
                  {formData.configFile && (
                    <span className="text-sm text-gray-400">
                      {formData.configFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              {!formData.configFile && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Or Choose from a Template
                  </label>
                  <select
                    name="template"
                    value={formData.template}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                  >
                    <option value="">No template</option>
                    {filteredTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-seraphim-gold/10 border border-seraphim-gold/30 rounded-lg">
                <div className="flex items-start">
                  <SparklesIcon className="w-5 h-5 text-seraphim-gold mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-seraphim-gold mb-1">Auto-Generation</p>
                    <p>
                      If no configuration is provided, the system will automatically generate:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• Default orchestration template with dummy agents and connections</li>
                      <li>• Sample KPIs and metrics</li>
                      <li>• Example logs and audit events</li>
                      <li>• Demo outputs and reports</li>
                    </ul>
                  </div>
                </div>
              </div>

                </div>
              </form>
            </div>
            {/* Submit Button for New Use Case Form */}
            {!isExistingMode && (
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/use-cases')}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  form="new-use-case-form"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-5 h-5 mr-2" />
                      Create New Use Case
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UseCaseLauncherForm;