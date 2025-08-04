import { logger } from '../utils/logger';

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'dateRange' | 'select' | 'multiSelect';
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ReportConfiguration {
  useCaseId: string;
  reportType: string;
  parameters: ReportParameter[];
  outputFormats: string[];
  scheduling?: {
    enabled: boolean;
    frequencies: ('daily' | 'weekly' | 'monthly' | 'quarterly')[];
  };
  filters?: {
    dateRange?: boolean;
    status?: boolean;
    category?: boolean;
    customFields?: string[];
  };
}

// Comprehensive report configurations for all use cases
const REPORT_CONFIGURATIONS: Record<string, Record<string, ReportConfiguration>> = {
  'oilfield-land-lease': {
    'lease-expiration-dashboard': {
      useCaseId: 'oilfield-land-lease',
      reportType: 'lease-expiration-dashboard',
      parameters: [
        {
          name: 'expirationWindow',
          type: 'select',
          label: 'Expiration Window',
          description: 'Time window for lease expiration analysis',
          required: true,
          defaultValue: '365',
          options: [
            { value: '30', label: '30 Days' },
            { value: '90', label: '90 Days' },
            { value: '180', label: '6 Months' },
            { value: '365', label: '1 Year' },
            { value: '730', label: '2 Years' }
          ]
        },
        {
          name: 'includeRenewals',
          type: 'boolean',
          label: 'Include Renewal Options',
          defaultValue: true
        },
        {
          name: 'operators',
          type: 'multiSelect',
          label: 'Filter by Operators',
          description: 'Select specific operators to include',
          options: [
            { value: 'chevron', label: 'Chevron' },
            { value: 'exxon', label: 'ExxonMobil' },
            { value: 'shell', label: 'Shell' },
            { value: 'bp', label: 'BP' },
            { value: 'conocophillips', label: 'ConocoPhillips' }
          ]
        },
        {
          name: 'minRevenue',
          type: 'number',
          label: 'Minimum Annual Revenue',
          description: 'Filter leases by minimum revenue threshold',
          validation: { min: 0 }
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly', 'monthly']
      },
      filters: {
        dateRange: true,
        status: true,
        category: true
      }
    },
    'revenue-analysis': {
      useCaseId: 'oilfield-land-lease',
      reportType: 'revenue-analysis',
      parameters: [
        {
          name: 'analysisType',
          type: 'select',
          label: 'Analysis Type',
          required: true,
          defaultValue: 'comprehensive',
          options: [
            { value: 'comprehensive', label: 'Comprehensive Analysis' },
            { value: 'by-operator', label: 'By Operator' },
            { value: 'by-field', label: 'By Field' },
            { value: 'by-product', label: 'By Product Type' }
          ]
        },
        {
          name: 'dateRange',
          type: 'dateRange',
          label: 'Analysis Period',
          required: true
        },
        {
          name: 'includeProjections',
          type: 'boolean',
          label: 'Include Future Projections',
          defaultValue: true
        },
        {
          name: 'projectionMonths',
          type: 'number',
          label: 'Projection Period (months)',
          defaultValue: 12,
          validation: { min: 1, max: 60 }
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['weekly', 'monthly', 'quarterly']
      }
    }
  },
  'energy-load-forecasting': {
    'daily-load-forecast': {
      useCaseId: 'energy-load-forecasting',
      reportType: 'daily-load-forecast',
      parameters: [
        {
          name: 'forecastDate',
          type: 'date',
          label: 'Forecast Date',
          required: true,
          defaultValue: 'tomorrow'
        },
        {
          name: 'regions',
          type: 'multiSelect',
          label: 'Grid Regions',
          description: 'Select regions for forecast',
          options: [
            { value: 'north', label: 'North Region' },
            { value: 'south', label: 'South Region' },
            { value: 'east', label: 'East Region' },
            { value: 'west', label: 'West Region' },
            { value: 'central', label: 'Central Region' }
          ]
        },
        {
          name: 'includeWeather',
          type: 'boolean',
          label: 'Include Weather Impact Analysis',
          defaultValue: true
        },
        {
          name: 'confidenceLevel',
          type: 'select',
          label: 'Confidence Interval',
          defaultValue: '95',
          options: [
            { value: '90', label: '90%' },
            { value: '95', label: '95%' },
            { value: '99', label: '99%' }
          ]
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json', 'csv'],
      scheduling: {
        enabled: true,
        frequencies: ['daily']
      }
    },
    'weekly-load-analysis': {
      useCaseId: 'energy-load-forecasting',
      reportType: 'weekly-load-analysis',
      parameters: [
        {
          name: 'weekStartDate',
          type: 'date',
          label: 'Week Start Date',
          required: true
        },
        {
          name: 'comparisonPeriod',
          type: 'select',
          label: 'Compare With',
          defaultValue: 'previous-week',
          options: [
            { value: 'previous-week', label: 'Previous Week' },
            { value: 'same-week-last-year', label: 'Same Week Last Year' },
            { value: 'average-last-4-weeks', label: 'Average of Last 4 Weeks' }
          ]
        },
        {
          name: 'includeAnomalies',
          type: 'boolean',
          label: 'Highlight Anomalies',
          defaultValue: true
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['weekly']
      }
    }
  },
  'patient-intake': {
    'patient-intake-dashboard': {
      useCaseId: 'patient-intake',
      reportType: 'patient-intake-dashboard',
      parameters: [
        {
          name: 'dateRange',
          type: 'dateRange',
          label: 'Reporting Period',
          required: true
        },
        {
          name: 'departments',
          type: 'multiSelect',
          label: 'Departments',
          options: [
            { value: 'emergency', label: 'Emergency' },
            { value: 'cardiology', label: 'Cardiology' },
            { value: 'orthopedics', label: 'Orthopedics' },
            { value: 'pediatrics', label: 'Pediatrics' },
            { value: 'oncology', label: 'Oncology' }
          ]
        },
        {
          name: 'metrics',
          type: 'multiSelect',
          label: 'Include Metrics',
          defaultValue: ['wait-time', 'satisfaction', 'throughput'],
          options: [
            { value: 'wait-time', label: 'Wait Time Analysis' },
            { value: 'satisfaction', label: 'Patient Satisfaction' },
            { value: 'throughput', label: 'Throughput Metrics' },
            { value: 'demographics', label: 'Patient Demographics' },
            { value: 'insurance', label: 'Insurance Analysis' }
          ]
        },
        {
          name: 'aggregation',
          type: 'select',
          label: 'Data Aggregation',
          defaultValue: 'daily',
          options: [
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ]
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly', 'monthly']
      },
      filters: {
        dateRange: true,
        status: true,
        customFields: ['urgency', 'insurance-type', 'age-group']
      }
    }
  },
  'fraud-detection': {
    'fraud-detection-dashboard': {
      useCaseId: 'fraud-detection',
      reportType: 'fraud-detection-dashboard',
      parameters: [
        {
          name: 'timeWindow',
          type: 'select',
          label: 'Analysis Window',
          required: true,
          defaultValue: '24h',
          options: [
            { value: '1h', label: 'Last Hour' },
            { value: '24h', label: 'Last 24 Hours' },
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' }
          ]
        },
        {
          name: 'riskThreshold',
          type: 'number',
          label: 'Risk Score Threshold',
          description: 'Minimum risk score to include (0-100)',
          defaultValue: 70,
          validation: { min: 0, max: 100 }
        },
        {
          name: 'transactionTypes',
          type: 'multiSelect',
          label: 'Transaction Types',
          options: [
            { value: 'wire', label: 'Wire Transfers' },
            { value: 'ach', label: 'ACH Transfers' },
            { value: 'card', label: 'Card Transactions' },
            { value: 'check', label: 'Check Deposits' },
            { value: 'atm', label: 'ATM Withdrawals' }
          ]
        },
        {
          name: 'includePatterns',
          type: 'boolean',
          label: 'Include Pattern Analysis',
          defaultValue: true
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json', 'csv'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly']
      }
    }
  },
  'predictive-maintenance': {
    'predictive-maintenance-dashboard': {
      useCaseId: 'predictive-maintenance',
      reportType: 'predictive-maintenance-dashboard',
      parameters: [
        {
          name: 'equipmentTypes',
          type: 'multiSelect',
          label: 'Equipment Types',
          options: [
            { value: 'pumps', label: 'Pumps' },
            { value: 'motors', label: 'Motors' },
            { value: 'compressors', label: 'Compressors' },
            { value: 'turbines', label: 'Turbines' },
            { value: 'conveyors', label: 'Conveyors' }
          ]
        },
        {
          name: 'predictionWindow',
          type: 'select',
          label: 'Prediction Window',
          defaultValue: '30',
          options: [
            { value: '7', label: '7 Days' },
            { value: '14', label: '14 Days' },
            { value: '30', label: '30 Days' },
            { value: '60', label: '60 Days' },
            { value: '90', label: '90 Days' }
          ]
        },
        {
          name: 'riskLevel',
          type: 'select',
          label: 'Minimum Risk Level',
          defaultValue: 'medium',
          options: [
            { value: 'low', label: 'Low Risk' },
            { value: 'medium', label: 'Medium Risk' },
            { value: 'high', label: 'High Risk' },
            { value: 'critical', label: 'Critical Risk' }
          ]
        },
        {
          name: 'includeCostAnalysis',
          type: 'boolean',
          label: 'Include Cost Impact Analysis',
          defaultValue: true
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly']
      }
    }
  },
  'demand-forecasting': {
    'demand-forecast-dashboard': {
      useCaseId: 'demand-forecasting',
      reportType: 'demand-forecast-dashboard',
      parameters: [
        {
          name: 'forecastPeriod',
          type: 'select',
          label: 'Forecast Period',
          required: true,
          defaultValue: '30',
          options: [
            { value: '7', label: 'Next 7 Days' },
            { value: '14', label: 'Next 14 Days' },
            { value: '30', label: 'Next 30 Days' },
            { value: '60', label: 'Next 60 Days' },
            { value: '90', label: 'Next 90 Days' }
          ]
        },
        {
          name: 'productCategories',
          type: 'multiSelect',
          label: 'Product Categories',
          options: [
            { value: 'electronics', label: 'Electronics' },
            { value: 'apparel', label: 'Apparel' },
            { value: 'home', label: 'Home & Garden' },
            { value: 'sports', label: 'Sports & Outdoors' },
            { value: 'beauty', label: 'Beauty & Personal Care' }
          ]
        },
        {
          name: 'includeSeasonality',
          type: 'boolean',
          label: 'Include Seasonal Analysis',
          defaultValue: true
        },
        {
          name: 'confidenceInterval',
          type: 'select',
          label: 'Confidence Interval',
          defaultValue: '95',
          options: [
            { value: '90', label: '90%' },
            { value: '95', label: '95%' },
            { value: '99', label: '99%' }
          ]
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json', 'csv'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly', 'monthly']
      }
    }
  },
  'route-optimization': {
    'route-optimization-dashboard': {
      useCaseId: 'route-optimization',
      reportType: 'route-optimization-dashboard',
      parameters: [
        {
          name: 'dateRange',
          type: 'dateRange',
          label: 'Analysis Period',
          required: true
        },
        {
          name: 'vehicleTypes',
          type: 'multiSelect',
          label: 'Vehicle Types',
          options: [
            { value: 'van', label: 'Delivery Vans' },
            { value: 'truck', label: 'Trucks' },
            { value: 'semi', label: 'Semi-Trailers' },
            { value: 'bike', label: 'Delivery Bikes' }
          ]
        },
        {
          name: 'optimizationGoal',
          type: 'select',
          label: 'Optimization Goal',
          defaultValue: 'balanced',
          options: [
            { value: 'distance', label: 'Minimize Distance' },
            { value: 'time', label: 'Minimize Time' },
            { value: 'fuel', label: 'Minimize Fuel' },
            { value: 'balanced', label: 'Balanced Optimization' }
          ]
        },
        {
          name: 'includeTraffic',
          type: 'boolean',
          label: 'Include Real-time Traffic',
          defaultValue: true
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json', 'kml'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly']
      }
    }
  },
  'student-performance': {
    'student-performance-dashboard': {
      useCaseId: 'student-performance',
      reportType: 'student-performance-dashboard',
      parameters: [
        {
          name: 'academicPeriod',
          type: 'select',
          label: 'Academic Period',
          required: true,
          options: [
            { value: 'current-semester', label: 'Current Semester' },
            { value: 'previous-semester', label: 'Previous Semester' },
            { value: 'academic-year', label: 'Academic Year' },
            { value: 'all-time', label: 'All Time' }
          ]
        },
        {
          name: 'gradeLevel',
          type: 'multiSelect',
          label: 'Grade Levels',
          options: [
            { value: 'freshman', label: 'Freshman' },
            { value: 'sophomore', label: 'Sophomore' },
            { value: 'junior', label: 'Junior' },
            { value: 'senior', label: 'Senior' },
            { value: 'graduate', label: 'Graduate' }
          ]
        },
        {
          name: 'performanceMetrics',
          type: 'multiSelect',
          label: 'Performance Metrics',
          defaultValue: ['gpa', 'attendance', 'engagement'],
          options: [
            { value: 'gpa', label: 'GPA Analysis' },
            { value: 'attendance', label: 'Attendance Rates' },
            { value: 'engagement', label: 'Engagement Scores' },
            { value: 'improvement', label: 'Improvement Trends' },
            { value: 'risk', label: 'At-Risk Indicators' }
          ]
        },
        {
          name: 'anonymize',
          type: 'boolean',
          label: 'Anonymize Student Data',
          defaultValue: false
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['weekly', 'monthly', 'quarterly']
      }
    }
  },
  'drug-discovery': {
    'drug-discovery-dashboard': {
      useCaseId: 'drug-discovery',
      reportType: 'drug-discovery-dashboard',
      parameters: [
        {
          name: 'researchPhase',
          type: 'multiSelect',
          label: 'Research Phases',
          options: [
            { value: 'discovery', label: 'Discovery' },
            { value: 'preclinical', label: 'Preclinical' },
            { value: 'phase1', label: 'Phase I' },
            { value: 'phase2', label: 'Phase II' },
            { value: 'phase3', label: 'Phase III' }
          ]
        },
        {
          name: 'therapeuticAreas',
          type: 'multiSelect',
          label: 'Therapeutic Areas',
          options: [
            { value: 'oncology', label: 'Oncology' },
            { value: 'neurology', label: 'Neurology' },
            { value: 'cardiology', label: 'Cardiology' },
            { value: 'immunology', label: 'Immunology' },
            { value: 'infectious', label: 'Infectious Diseases' }
          ]
        },
        {
          name: 'includeAIInsights',
          type: 'boolean',
          label: 'Include AI-Generated Insights',
          defaultValue: true
        },
        {
          name: 'confidentialityLevel',
          type: 'select',
          label: 'Confidentiality Level',
          defaultValue: 'internal',
          options: [
            { value: 'public', label: 'Public' },
            { value: 'internal', label: 'Internal Only' },
            { value: 'confidential', label: 'Confidential' },
            { value: 'restricted', label: 'Restricted Access' }
          ]
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['weekly', 'monthly']
      }
    }
  },
  'citizen-services': {
    'citizen-services-dashboard': {
      useCaseId: 'citizen-services',
      reportType: 'citizen-services-dashboard',
      parameters: [
        {
          name: 'serviceCategories',
          type: 'multiSelect',
          label: 'Service Categories',
          options: [
            { value: 'permits', label: 'Permits & Licenses' },
            { value: 'utilities', label: 'Utilities' },
            { value: 'transportation', label: 'Transportation' },
            { value: 'health', label: 'Health Services' },
            { value: 'education', label: 'Education Services' }
          ]
        },
        {
          name: 'reportingPeriod',
          type: 'dateRange',
          label: 'Reporting Period',
          required: true
        },
        {
          name: 'includesSatisfaction',
          type: 'boolean',
          label: 'Include Satisfaction Metrics',
          defaultValue: true
        },
        {
          name: 'demographicBreakdown',
          type: 'boolean',
          label: 'Include Demographic Analysis',
          defaultValue: false
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json', 'csv'],
      scheduling: {
        enabled: true,
        frequencies: ['weekly', 'monthly', 'quarterly']
      }
    }
  },
  'network-optimization': {
    'network-performance': {
      useCaseId: 'network-optimization',
      reportType: 'network-performance',
      parameters: [
        {
          name: 'networkSegments',
          type: 'multiSelect',
          label: 'Network Segments',
          options: [
            { value: 'core', label: 'Core Network' },
            { value: 'edge', label: 'Edge Network' },
            { value: 'access', label: 'Access Network' },
            { value: 'backhaul', label: 'Backhaul' },
            { value: 'datacenter', label: 'Data Centers' }
          ]
        },
        {
          name: 'performanceMetrics',
          type: 'multiSelect',
          label: 'Performance Metrics',
          defaultValue: ['latency', 'throughput', 'availability'],
          options: [
            { value: 'latency', label: 'Latency' },
            { value: 'throughput', label: 'Throughput' },
            { value: 'availability', label: 'Availability' },
            { value: 'packet-loss', label: 'Packet Loss' },
            { value: 'jitter', label: 'Jitter' }
          ]
        },
        {
          name: 'alertThreshold',
          type: 'select',
          label: 'Alert Threshold',
          defaultValue: 'warning',
          options: [
            { value: 'info', label: 'Information' },
            { value: 'warning', label: 'Warning' },
            { value: 'critical', label: 'Critical' }
          ]
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json', 'csv'],
      scheduling: {
        enabled: true,
        frequencies: ['daily', 'weekly']
      }
    }
  },
  'property-management': {
    'property-portfolio': {
      useCaseId: 'property-management',
      reportType: 'property-portfolio',
      parameters: [
        {
          name: 'propertyTypes',
          type: 'multiSelect',
          label: 'Property Types',
          options: [
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'industrial', label: 'Industrial' },
            { value: 'retail', label: 'Retail' },
            { value: 'mixed-use', label: 'Mixed Use' }
          ]
        },
        {
          name: 'portfolioMetrics',
          type: 'multiSelect',
          label: 'Portfolio Metrics',
          defaultValue: ['occupancy', 'revenue', 'noi'],
          options: [
            { value: 'occupancy', label: 'Occupancy Rates' },
            { value: 'revenue', label: 'Revenue Analysis' },
            { value: 'noi', label: 'Net Operating Income' },
            { value: 'cap-rate', label: 'Capitalization Rate' },
            { value: 'maintenance', label: 'Maintenance Costs' }
          ]
        },
        {
          name: 'comparisonPeriod',
          type: 'select',
          label: 'Compare With',
          defaultValue: 'previous-quarter',
          options: [
            { value: 'previous-month', label: 'Previous Month' },
            { value: 'previous-quarter', label: 'Previous Quarter' },
            { value: 'previous-year', label: 'Previous Year' },
            { value: 'market-average', label: 'Market Average' }
          ]
        }
      ],
      outputFormats: ['pdf', 'xlsx', 'json'],
      scheduling: {
        enabled: true,
        frequencies: ['monthly', 'quarterly']
      }
    }
  }
};

class ReportConfigService {
  /**
   * Get configuration for a specific report
   */
  getReportConfig(useCaseId: string, reportType: string): ReportConfiguration | null {
    const useCaseConfigs = REPORT_CONFIGURATIONS[useCaseId];
    if (!useCaseConfigs) {
      logger.warn(`No configurations found for use case: ${useCaseId}`);
      return null;
    }

    const config = useCaseConfigs[reportType];
    if (!config) {
      logger.warn(`No configuration found for report type: ${reportType} in use case: ${useCaseId}`);
      return null;
    }

    return config;
  }

  /**
   * Get all configurations for a use case
   */
  getUseCaseConfigs(useCaseId: string): Record<string, ReportConfiguration> | null {
    return REPORT_CONFIGURATIONS[useCaseId] || null;
  }

  /**
   * Validate report parameters against configuration
   */
  validateParameters(
    useCaseId: string,
    reportType: string,
    parameters: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const config = this.getReportConfig(useCaseId, reportType);
    if (!config) {
      return { valid: false, errors: ['Invalid use case or report type'] };
    }

    const errors: string[] = [];

    // Check required parameters
    for (const param of config.parameters) {
      if (param.required && !(param.name in parameters)) {
        errors.push(`Missing required parameter: ${param.label}`);
      }
    }

    // Validate parameter types and constraints
    for (const [paramName, value] of Object.entries(parameters)) {
      const paramConfig = config.parameters.find(p => p.name === paramName);
      if (!paramConfig) {
        errors.push(`Unknown parameter: ${paramName}`);
        continue;
      }

      // Type validation
      if (!this.validateParameterType(value, paramConfig)) {
        errors.push(`Invalid type for parameter ${paramConfig.label}: expected ${paramConfig.type}`);
      }

      // Constraint validation
      if (paramConfig.validation) {
        const validationErrors = this.validateConstraints(value, paramConfig);
        errors.push(...validationErrors);
      }

      // Options validation for select/multiSelect
      if ((paramConfig.type === 'select' || paramConfig.type === 'multiSelect') && paramConfig.options) {
        const validOptions = paramConfig.options.map(o => o.value);
        const values = paramConfig.type === 'multiSelect' ? value : [value];
        
        for (const v of values) {
          if (!validOptions.includes(v)) {
            errors.push(`Invalid option for ${paramConfig.label}: ${v}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Apply default values to parameters
   */
  applyDefaults(
    useCaseId: string,
    reportType: string,
    parameters: Record<string, any>
  ): Record<string, any> {
    const config = this.getReportConfig(useCaseId, reportType);
    if (!config) {
      return parameters;
    }

    const result = { ...parameters };

    for (const param of config.parameters) {
      if (!(param.name in result) && param.defaultValue !== undefined) {
        result[param.name] = param.defaultValue;
      }
    }

    return result;
  }

  /**
   * Get available output formats for a report
   */
  getOutputFormats(useCaseId: string, reportType: string): string[] {
    const config = this.getReportConfig(useCaseId, reportType);
    return config?.outputFormats || ['pdf'];
  }

  /**
   * Check if scheduling is enabled for a report
   */
  isSchedulingEnabled(useCaseId: string, reportType: string): boolean {
    const config = this.getReportConfig(useCaseId, reportType);
    return config?.scheduling?.enabled || false;
  }

  /**
   * Get available scheduling frequencies
   */
  getSchedulingFrequencies(useCaseId: string, reportType: string): string[] {
    const config = this.getReportConfig(useCaseId, reportType);
    return config?.scheduling?.frequencies || [];
  }

  /**
  /**
   * Validate parameter type
   */
  private validateParameterType(value: any, param: ReportParameter): boolean {
    switch (param.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'dateRange':
        return Array.isArray(value) && value.length === 2 &&
               value.every(d => d instanceof Date || !isNaN(Date.parse(d)));
      case 'select':
        return typeof value === 'string';
      case 'multiSelect':
        return Array.isArray(value) && value.every(v => typeof v === 'string');
      default:
        return false;
    }
  }

  /**
   * Validate parameter constraints
   */
  private validateConstraints(value: any, param: ReportParameter): string[] {
    const errors: string[] = [];
    const validation = param.validation;

    if (!validation) return errors;

    if (param.type === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push(`${param.label} must be at least ${validation.min}`);
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push(`${param.label} must be at most ${validation.max}`);
      }
    }

    if (param.type === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        errors.push(`${param.label} must be at least ${validation.minLength} characters`);
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        errors.push(`${param.label} must be at most ${validation.maxLength} characters`);
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push(`${param.label} does not match required pattern`);
        }
      }
    }

    return errors;
  }

  /**
   * Get all report configurations
   */
  getAllConfigurations(): Record<string, Record<string, ReportConfiguration>> {
    return REPORT_CONFIGURATIONS;
  }

  /**
   * Get parameter schema for a report
   */
  getParameterSchema(useCaseId: string, reportType: string): ReportParameter[] {
    const config = this.getReportConfig(useCaseId, reportType);
    return config?.parameters || [];
  }

  /**
   * Export configuration as JSON
   */
  exportConfiguration(useCaseId: string, reportType: string): string {
    const config = this.getReportConfig(useCaseId, reportType);
    if (!config) {
      throw new Error(`Configuration not found for ${useCaseId}/${reportType}`);
    }
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfiguration(useCaseId: string, reportType: string, jsonConfig: string): void {
    try {
      const config = JSON.parse(jsonConfig) as ReportConfiguration;
      
      // Validate the imported configuration
      if (config.useCaseId !== useCaseId || config.reportType !== reportType) {
        throw new Error('Configuration mismatch');
      }

      // Update the configuration
      if (!REPORT_CONFIGURATIONS[useCaseId]) {
        REPORT_CONFIGURATIONS[useCaseId] = {};
      }
      REPORT_CONFIGURATIONS[useCaseId][reportType] = config;
      
      logger.info(`Imported configuration for ${useCaseId}/${reportType}`);
    } catch (error) {
      logger.error('Failed to import configuration:', error);
      throw new Error('Invalid configuration format');
    }
  }
}

export const reportConfigService = new ReportConfigService();