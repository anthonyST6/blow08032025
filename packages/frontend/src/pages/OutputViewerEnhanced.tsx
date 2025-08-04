import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  DocumentIcon,
  PhotoIcon,
  ChartBarIcon,
  TableCellsIcon,
  CodeBracketIcon,
  EyeIcon,
  CloudArrowDownIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import { workflowEventsService, OutputArtifact } from '../services/workflowEvents.service';
import { reportService } from '../services/report.service';
import { ReportRepository } from '../components/ReportRepository';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const OutputViewerEnhanced: React.FC = () => {
  const [artifacts, setArtifacts] = useState<OutputArtifact[]>([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState<OutputArtifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [selectedArtifact, setSelectedArtifact] = useState<OutputArtifact | null>(null);
  const [showRepository, setShowRepository] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  
  // Get use case context
  let selectedUseCase = 'all';
  try {
    const context = useUseCaseContext();
    selectedUseCase = context?.selectedUseCase || 'all';
  } catch (err) {
    console.log('UseCaseContext not available');
  }

  // Generate dummy oilfield output artifacts for demo
  const generateOilfieldOutputs = (): OutputArtifact[] => {
    const now = new Date();
    const outputs: OutputArtifact[] = [];
    
    // Various output types for oilfield operations
    const outputTemplates = [
      // Reports
      {
        name: 'Lease Valuation Report - Block 42',
        description: 'Comprehensive valuation analysis including production forecasts, NPV calculations, and risk assessment',
        type: 'report' as const,
        agent: 'Valuation Agent',
        size: 2457600,
        content: `OILFIELD LEASE VALUATION REPORT
Block 42 - Permian Basin
Generated: ${format(now, 'MMMM d, yyyy')}

EXECUTIVE SUMMARY
- Estimated NPV: $45.7M
- Production Potential: 850,000 BBL
- Risk Score: 7.2/10
- Recommended Action: ACQUIRE

PRODUCTION ANALYSIS
- Current Wells: 12 active, 3 plugged
- Average Daily Production: 2,450 BBL/day
- Decline Rate: 8.5% annually
- Enhanced Recovery Potential: High

FINANCIAL METRICS
- Acquisition Cost: $28.5M
- Operating Expenses: $12.50/BBL
- Break-even: 14 months
- IRR: 34.7%`
      },
      {
        name: 'Environmental Compliance Report',
        description: 'Environmental impact assessment and regulatory compliance verification for lease operations',
        type: 'report' as const,
        agent: 'Compliance Agent',
        size: 1843200,
        content: `ENVIRONMENTAL COMPLIANCE REPORT
Lease ID: TX-2024-042
Assessment Date: ${format(now, 'MMMM d, yyyy')}

COMPLIANCE STATUS: PASSED
- Air Quality Standards: Compliant
- Water Management: Compliant
- Waste Disposal: Compliant
- Wildlife Protection: Compliant

KEY FINDINGS
1. All injection wells operating within permitted parameters
2. Zero reportable spills in last 12 months
3. Methane emissions 15% below regulatory limits
4. Groundwater monitoring shows no contamination`
      },
      {
        name: 'Title Chain Analysis',
        description: 'Complete ownership history and title verification for mineral rights',
        type: 'document' as const,
        agent: 'Title Agent',
        size: 3276800,
        content: `TITLE CHAIN ANALYSIS
Property: Section 15, Township 2N, Range 5E

OWNERSHIP HISTORY
1952 - Original Grant: Johnson Family Trust
1978 - Partial Sale: 50% to Permian Oil Co.
1995 - Merger: Permian Oil -> Texas Energy Corp
2010 - Acquisition: Texas Energy -> Current Owner

MINERAL RIGHTS STATUS
- Surface Rights: Clear
- Mineral Rights: 87.5% available
- Existing Leases: 12.5% (expires 2025)
- Encumbrances: None`
      },
      
      // Data files
      {
        name: 'Production_Data_2024.xlsx',
        description: 'Monthly production data with well-by-well breakdown and decline curve analysis',
        type: 'data' as const,
        agent: 'Data Analysis Agent',
        size: 524288,
        content: 'Binary Excel data...'
      },
      {
        name: 'Seismic_Survey_Results.csv',
        description: '3D seismic survey data showing potential drilling locations and reservoir characteristics',
        type: 'data' as const,
        agent: 'Geological Agent',
        size: 8388608,
        content: `Well_ID,Latitude,Longitude,Depth_ft,Porosity,Permeability_mD,Oil_Saturation
W-001,31.7754,-102.3521,8450,0.22,125,0.78
W-002,31.7761,-102.3515,8475,0.21,118,0.75
W-003,31.7768,-102.3509,8490,0.23,132,0.80`
      },
      
      // Images
      {
        name: 'Lease_Map_Overview.png',
        description: 'Aerial view of lease boundaries with well locations and infrastructure',
        type: 'image' as const,
        agent: 'Mapping Agent',
        size: 4194304,
        url: '/api/placeholder/800/600'
      },
      {
        name: 'Production_Decline_Curves.png',
        description: 'Visual analysis of production decline rates across all active wells',
        type: 'image' as const,
        agent: 'Analytics Agent',
        size: 2097152,
        url: '/api/placeholder/800/600'
      },
      
      // Code/Scripts
      {
        name: 'valuation_model.py',
        description: 'Python script for Monte Carlo simulation of lease valuation scenarios',
        type: 'code' as const,
        agent: 'Modeling Agent',
        size: 16384,
        content: `import numpy as np
import pandas as pd
from scipy.stats import norm

class OilfieldValuationModel:
    def __init__(self, lease_data):
        self.lease_data = lease_data
        self.oil_price_volatility = 0.25
        self.production_decline_rate = 0.085
        
    def calculate_npv(self, scenarios=10000):
        # Monte Carlo simulation for NPV
        results = []
        for _ in range(scenarios):
            oil_price = self.simulate_oil_price()
            production = self.simulate_production()
            npv = self.calculate_scenario_npv(oil_price, production)
            results.append(npv)
        return np.array(results)`
      },
      
      // Additional documents
      {
        name: 'Regulatory_Permits.pdf',
        description: 'Complete set of drilling and operating permits from Texas Railroad Commission',
        type: 'document' as const,
        agent: 'Legal Agent',
        size: 5242880,
        content: 'PDF content...'
      },
      {
        name: 'Risk_Assessment_Matrix.pdf',
        description: 'Comprehensive risk analysis covering geological, operational, and market risks',
        type: 'document' as const,
        agent: 'Risk Agent',
        size: 1572864,
        content: 'PDF content...'
      },
      {
        name: 'Competitor_Analysis.json',
        description: 'Analysis of neighboring lease operations and competitive landscape',
        type: 'data' as const,
        agent: 'Market Agent',
        size: 65536,
        content: JSON.stringify({
          competitors: [
            { name: 'Apache Corp', leases: 15, production: 12500 },
            { name: 'EOG Resources', leases: 22, production: 18750 },
            { name: 'Pioneer Natural', leases: 8, production: 9200 }
          ],
          market_share: 0.12,
          competitive_advantages: ['Lower operating costs', 'Better infrastructure', 'Water rights']
        }, null, 2)
      }
    ];
    
    // Generate outputs with timestamps
    outputTemplates.forEach((template, index) => {
      const minutesAgo = Math.floor(Math.random() * 1440); // Random time within last 24 hours
      const timestamp = new Date(now.getTime() - minutesAgo * 60000);
      
      outputs.push({
        id: `output-${Date.now()}-${index}`,
        ...template,
        timestamp,
        useCaseId: 'oilfield-land-lease',
        workflowId: `workflow-${Math.floor(Math.random() * 1000)}`,
        url: template.type === 'image' ? template.url : undefined
      });
    });
    
    return outputs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Load initial artifacts
  useEffect(() => {
    const initialArtifacts = workflowEventsService.getOutputArtifacts(
      selectedUseCase !== 'all' ? selectedUseCase : undefined
    );
    
    // Add dummy data for oilfield use case if no real data exists
    if (selectedUseCase === 'oilfield-land-lease' && initialArtifacts.length === 0) {
      const dummyOutputs = generateOilfieldOutputs();
      setArtifacts(dummyOutputs);
    } else {
      setArtifacts(initialArtifacts);
    }
  }, [selectedUseCase]);

  // Subscribe to real-time updates
  useEffect(() => {
    const handleNewArtifact = (artifact: OutputArtifact) => {
      if (selectedUseCase === 'all' || artifact.useCaseId === selectedUseCase) {
        setArtifacts(prev => [artifact, ...prev].slice(0, 50)); // Keep last 50 artifacts
      }
    };

    workflowEventsService.on('outputArtifact', handleNewArtifact);
    
    return () => {
      workflowEventsService.off('outputArtifact', handleNewArtifact);
    };
  }, [selectedUseCase]);

  // Filter artifacts
  useEffect(() => {
    let filtered = artifacts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(artifact => 
        artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artifact.agent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(artifact => artifact.type === filterType);
    }

    // Agent filter
    if (filterAgent !== 'all') {
      filtered = filtered.filter(artifact => artifact.agent === filterAgent);
    }

    setFilteredArtifacts(filtered);
  }, [artifacts, searchQuery, filterType, filterAgent]);

  // Get unique agents and types
  const agents = Array.from(new Set(artifacts.map(a => a.agent)));
  const types = Array.from(new Set(artifacts.map(a => a.type)));

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const updatedArtifacts = workflowEventsService.getOutputArtifacts(
        selectedUseCase !== 'all' ? selectedUseCase : undefined
      );
      
      // Preserve dummy data for oilfield use case during demo
      if (selectedUseCase === 'oilfield-land-lease' && updatedArtifacts.length === 0 && artifacts.length > 0) {
        // Keep existing dummy data
        return;
      }
      
      setArtifacts(updatedArtifacts);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedUseCase, artifacts.length]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    const updatedArtifacts = workflowEventsService.getOutputArtifacts(
      selectedUseCase !== 'all' ? selectedUseCase : undefined
    );
    setArtifacts(updatedArtifacts);
    setTimeout(() => setLoading(false), 500);
  }, [selectedUseCase]);

  const handleDownload = useCallback(async (artifact: OutputArtifact) => {
    try {
      // Generate a real report based on the artifact type
      const reportType = artifact.type === 'document' ? 'pdf' :
                        artifact.type === 'data' ? 'xlsx' :
                        artifact.type === 'code' ? 'txt' : 'json';
      
      setGeneratingReport(artifact.id);
      const report = await reportService.generateReportFromOutput(artifact, reportType);
      
      // Download the generated report
      await reportService.downloadReport(report.id, report.name, report.type);
      toast.success(`Downloaded ${report.name}.${report.type}`);
    } catch (error) {
      console.error('Failed to generate/download report:', error);
      toast.error('Failed to download report');
    } finally {
      setGeneratingReport(null);
    }
  }, []);

  const handleGenerateReport = useCallback(async (artifact: OutputArtifact, type: 'pdf' | 'json' | 'xlsx' | 'txt') => {
    try {
      setGeneratingReport(artifact.id);
      const report = await reportService.generateReportFromOutput(artifact, type);
      toast.success(`Generated ${type.toUpperCase()} report: ${report.name}`);
      
      // Optionally download immediately
      const shouldDownload = window.confirm('Report generated successfully. Download now?');
      if (shouldDownload) {
        await reportService.downloadReport(report.id, report.name, report.type);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <DocumentIcon className="w-5 h-5" />;
      case 'image':
        return <PhotoIcon className="w-5 h-5" />;
      case 'report':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'data':
        return <TableCellsIcon className="w-5 h-5" />;
      case 'code':
        return <CodeBracketIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'text-blue-500';
      case 'image':
        return 'text-purple-500';
      case 'report':
        return 'text-green-500';
      case 'data':
        return 'text-yellow-500';
      case 'code':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Calculate stats
  const stats = {
    total: artifacts.length,
    documents: artifacts.filter(a => a.type === 'document').length,
    reports: artifacts.filter(a => a.type === 'report').length,
    data: artifacts.filter(a => a.type === 'data').length,
    totalSize: artifacts.reduce((sum, a) => sum + a.size, 0),
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3 text-purple-500" />
              Output Viewer
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Generated artifacts and outputs from workflow executions
            </p>
          </div>
          <Button
            variant={showRepository ? 'primary' : 'secondary'}
            onClick={() => setShowRepository(!showRepository)}
          >
            <FolderIcon className="w-4 h-4 mr-1" />
            {showRepository ? 'Show Outputs' : 'Report Repository'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Total Outputs</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Documents</p>
          <p className="text-2xl font-bold text-blue-500">{stats.documents}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Reports</p>
          <p className="text-2xl font-bold text-green-500">{stats.reports}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Data Files</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.data}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Total Size</p>
          <p className="text-2xl font-bold text-purple-500">{formatFileSize(stats.totalSize)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh
            </label>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
              <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <Input
              placeholder="Search outputs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none appearance-none pr-10"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Agent</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none appearance-none pr-10"
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Show either repository or output grid */}
      {showRepository ? (
        <ReportRepository
          useCaseId={selectedUseCase !== 'all' ? selectedUseCase : undefined}
          onGenerateReport={() => setShowRepository(false)}
        />
      ) : (
        <>
          {/* Output Grid */}
          {filteredArtifacts.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">
          {artifacts.length === 0 ? (
            <div>
              <FolderOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No output artifacts yet.</p>
              {selectedUseCase === 'oilfield-land-lease' && (
                <p className="text-sm mt-2">Deploy the workflow to generate outputs.</p>
              )}
            </div>
          ) : (
            <div>
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No outputs match your filters.</p>
            </div>
          )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredArtifacts.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:border-purple-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedArtifact(artifact)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${getTypeColor(artifact.type)}`}>
                      {getTypeIcon(artifact.type)}
                    </div>
                    <Badge variant="secondary" size="small">
                      {artifact.type}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1 truncate">{artifact.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{artifact.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{artifact.agent}</span>
                    <span>{formatFileSize(artifact.size)}</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {format(artifact.timestamp, 'MMM d, HH:mm')}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArtifact(artifact);
                          }}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <div className="relative group">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(artifact);
                            }}
                            disabled={generatingReport === artifact.id}
                          >
                            {generatingReport === artifact.id ? (
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            ) : (
                              <CloudArrowDownIcon className="w-4 h-4" />
                            )}
                          </Button>
                          
                          {/* Report type dropdown on hover */}
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-1">
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateReport(artifact, 'pdf');
                                }}
                              >
                                Generate PDF
                              </button>
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateReport(artifact, 'json');
                                }}
                              >
                                Generate JSON
                              </button>
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateReport(artifact, 'xlsx');
                                }}
                              >
                                Generate Excel
                              </button>
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateReport(artifact, 'txt');
                                }}
                              >
                                Generate Text
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        </>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedArtifact(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={getTypeColor(selectedArtifact.type)}>
                    {getTypeIcon(selectedArtifact.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedArtifact.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedArtifact.agent} • {format(selectedArtifact.timestamp, 'MMM d, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateReport(selectedArtifact, 'pdf')}
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateReport(selectedArtifact, 'json')}
                  >
                    <CodeBracketIcon className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateReport(selectedArtifact, 'xlsx')}
                  >
                    <TableCellsIcon className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateReport(selectedArtifact, 'txt')}
                  >
                    <DocumentIcon className="w-4 h-4 mr-1" />
                    Text
                  </Button>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {selectedArtifact.type === 'image' ? (
                  <img 
                    src={selectedArtifact.url || ''} 
                    alt={selectedArtifact.name}
                    className="max-w-full h-auto mx-auto"
                  />
                ) : (
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {selectedArtifact.content || 'Content preview not available'}
                  </pre>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OutputViewerEnhanced;