import { vanguardActionsService } from '../services/vanguard-actions.service';
import { unifiedReportsService } from '../services/unified-reports.service';
import { getUseCaseAuditConfig } from '../config/use-case-audit-config';

// Define all 54 use cases from Mission Control V2
const ALL_USE_CASES = [
  // Energy & Utilities (14 use cases)
  { id: 'grid-resilience', name: 'Grid Resilience', vertical: 'energy-utilities' },
  { id: 'methane-detection', name: 'Methane Leak Detection', vertical: 'energy-utilities' },
  { id: 'phmsa-compliance', name: 'PHMSA Compliance', vertical: 'energy-utilities' },
  { id: 'oilfield-land-lease', name: 'Oilfield Land Lease', vertical: 'energy-utilities' },
  { id: 'internal-audit', name: 'Internal Audit', vertical: 'energy-utilities' },
  { id: 'scada-integration', name: 'SCADA Integration', vertical: 'energy-utilities' },
  { id: 'predictive-resilience', name: 'Predictive Resilience', vertical: 'energy-utilities' },
  { id: 'cyber-defense', name: 'Cyber Defense', vertical: 'energy-utilities' },
  { id: 'wildfire-prevention', name: 'Wildfire Prevention', vertical: 'energy-utilities' },
  { id: 'energy-storage-management', name: 'Energy Storage Management', vertical: 'energy-utilities' },
  { id: 'demand-response', name: 'Demand Response', vertical: 'energy-utilities' },
  { id: 'renewable-energy-integration', name: 'Renewable Energy Integration', vertical: 'energy-utilities' },
  { id: 'energy-trading-optimization', name: 'Energy Trading Optimization', vertical: 'energy-utilities' },
  { id: 'smart-grid-management', name: 'Smart Grid Management', vertical: 'energy-utilities' },
  
  // Healthcare (7 use cases)
  { id: 'patient-risk', name: 'Patient Risk Stratification', vertical: 'healthcare' },
  { id: 'telemedicine-optimization', name: 'Telemedicine Optimization', vertical: 'healthcare' },
  { id: 'medical-imaging-analysis', name: 'Medical Imaging Analysis', vertical: 'healthcare' },
  { id: 'hospital-operations-optimization', name: 'Hospital Operations Optimization', vertical: 'healthcare' },
  { id: 'medication-management', name: 'Medication Management', vertical: 'healthcare' },
  { id: 'population-health-management', name: 'Population Health Management', vertical: 'healthcare' },
  { id: 'patient-intake', name: 'Patient Intake Automation', vertical: 'healthcare' },
  
  // Finance (6 use cases)
  { id: 'fraud-detection', name: 'Transaction Fraud Detection', vertical: 'finance' },
  { id: 'credit-risk-assessment', name: 'Credit Risk Assessment', vertical: 'finance' },
  { id: 'portfolio-optimization', name: 'Portfolio Optimization', vertical: 'finance' },
  { id: 'aml-compliance-monitoring', name: 'AML Compliance Monitoring', vertical: 'finance' },
  { id: 'algorithmic-trading', name: 'Algorithmic Trading', vertical: 'finance' },
  { id: 'regulatory-reporting-automation', name: 'Regulatory Reporting Automation', vertical: 'finance' },
  
  // Manufacturing (5 use cases)
  { id: 'predictive-maintenance', name: 'Predictive Maintenance', vertical: 'manufacturing' },
  { id: 'quality-control', name: 'Quality Control', vertical: 'manufacturing' },
  { id: 'supply-chain-optimization', name: 'Supply Chain Optimization', vertical: 'manufacturing' },
  { id: 'inventory-optimization', name: 'Inventory Optimization', vertical: 'manufacturing' },
  { id: 'manufacturing-energy-efficiency', name: 'Manufacturing Energy Efficiency', vertical: 'manufacturing' },
  
  // Retail (4 use cases)
  { id: 'customer-experience', name: 'Customer Experience', vertical: 'retail' },
  { id: 'dynamic-pricing', name: 'Dynamic Pricing', vertical: 'retail' },
  { id: 'demand-forecasting', name: 'Demand Forecasting', vertical: 'retail' },
  { id: 'customer-personalization', name: 'Customer Personalization', vertical: 'retail' },
  
  // Transportation & Logistics (3 use cases)
  { id: 'fleet-optimization', name: 'Fleet Optimization', vertical: 'transportation' },
  { id: 'predictive-maintenance-transport', name: 'Predictive Maintenance', vertical: 'transportation' },
  { id: 'cargo-tracking', name: 'Cargo Tracking', vertical: 'transportation' },
  
  // Education (3 use cases)
  { id: 'student-performance', name: 'Student Performance Analytics', vertical: 'education' },
  { id: 'curriculum-optimization', name: 'Curriculum Optimization', vertical: 'education' },
  { id: 'resource-allocation', name: 'Resource Allocation', vertical: 'education' },
  
  // Pharmaceuticals (3 use cases)
  { id: 'drug-discovery', name: 'AI Drug Discovery', vertical: 'pharmaceuticals' },
  { id: 'clinical-trial-optimization', name: 'Clinical Trial Optimization', vertical: 'pharmaceuticals' },
  { id: 'pharma-supply-chain', name: 'Pharmaceutical Supply Chain', vertical: 'pharmaceuticals' },
  
  // Government (3 use cases)
  { id: 'citizen-services', name: 'Digital Citizen Services', vertical: 'government' },
  { id: 'public-safety-analytics', name: 'Public Safety Analytics', vertical: 'government' },
  { id: 'regulatory-compliance-monitoring', name: 'Regulatory Compliance Monitoring', vertical: 'government' },
  
  // Telecommunications (3 use cases)
  { id: 'network-optimization', name: 'Network Optimization', vertical: 'telecommunications' },
  { id: 'customer-churn-prevention', name: 'Customer Churn Prevention', vertical: 'telecommunications' },
  { id: 'telecom-fraud-detection', name: 'Telecom Fraud Detection', vertical: 'telecommunications' },
  
  // Real Estate (3 use cases)
  { id: 'property-valuation', name: 'Property Valuation', vertical: 'real-estate' },
  { id: 'tenant-screening', name: 'Tenant Screening', vertical: 'real-estate' },
  { id: 'property-management-optimization', name: 'Property Management Optimization', vertical: 'real-estate' },
  
  // Agriculture (3 use cases)
  { id: 'crop-yield-prediction', name: 'Crop Yield Prediction', vertical: 'agriculture' },
  { id: 'irrigation-optimization', name: 'Irrigation Optimization', vertical: 'agriculture' },
  { id: 'pest-disease-detection', name: 'Pest & Disease Detection', vertical: 'agriculture' },
  
  // Logistics (3 use cases)
  { id: 'route-optimization', name: 'Route Optimization', vertical: 'logistics' },
  { id: 'warehouse-automation', name: 'Warehouse Automation', vertical: 'logistics' },
  { id: 'last-mile-delivery', name: 'Last Mile Delivery', vertical: 'logistics' },
  
  // Hospitality (3 use cases)
  { id: 'guest-experience-personalization', name: 'Guest Experience Personalization', vertical: 'hospitality' },
  { id: 'dynamic-revenue-management', name: 'Dynamic Revenue Management', vertical: 'hospitality' },
  { id: 'hotel-operations-optimization', name: 'Hotel Operations Optimization', vertical: 'hospitality' }
];

interface TestResult {
  useCaseId: string;
  useCaseName: string;
  vertical: string;
  auditConfigExists: boolean;
  customFieldsCount: number;
  vanguardActionsGenerated: boolean;
  vanguardActionsCount: number;
  reportConfigExists: boolean;
  reportCount: number;
  hasMinimumReports: boolean;
  reportTypes: string[];
  errors: string[];
}

async function testUseCaseAuditAndReports(useCase: { id: string; name: string; vertical: string }): Promise<TestResult> {
  const result: TestResult = {
    useCaseId: useCase.id,
    useCaseName: useCase.name,
    vertical: useCase.vertical,
    auditConfigExists: false,
    customFieldsCount: 0,
    vanguardActionsGenerated: false,
    vanguardActionsCount: 0,
    reportConfigExists: false,
    reportCount: 0,
    hasMinimumReports: false,
    reportTypes: [],
    errors: []
  };

  try {
    // Test 1: Check if audit configuration exists
    const auditConfig = getUseCaseAuditConfig(useCase.id);
    result.auditConfigExists = !!auditConfig;
    
    if (auditConfig) {
      // Test 2: Count custom fields
      result.customFieldsCount = auditConfig.customParticulars?.fields?.length || 0;
      
      // Test 3: Test custom field extraction
      const mockWorkflowData = {
        promptData: { useCaseId: useCase.id },
        configuration: { useCaseId: useCase.id },
        results: {
          analysis: 'Test analysis',
          recommendations: ['Test recommendation 1', 'Test recommendation 2'],
          metrics: { accuracy: 0.95, confidence: 0.88 }
        }
      };
      
      try {
        // Import the extractCustomParticulars function
        const { extractCustomParticulars } = await import('../config/use-case-audit-config');
        const customParticulars = extractCustomParticulars(useCase.id, mockWorkflowData);
        if (!customParticulars || Object.keys(customParticulars).length === 0) {
          result.errors.push('Custom particulars extraction returned empty object');
        }
      } catch (error) {
        result.errors.push(`Custom particulars extraction failed: ${error}`);
      }
    } else {
      result.errors.push('No audit configuration found');
    }
    
    // Test 4: Check vanguard actions generation
    try {
      const vanguardActions = vanguardActionsService.generateUseCaseActions(useCase.id);
      result.vanguardActionsGenerated = vanguardActions && vanguardActions.length > 0;
      result.vanguardActionsCount = vanguardActions ? vanguardActions.length : 0;
      
      if (!result.vanguardActionsGenerated) {
        result.errors.push('No vanguard actions generated');
      }
    } catch (error) {
      result.errors.push(`Vanguard actions generation failed: ${error}`);
    }
    
    // Test 5: Check report configuration
    try {
      const availableReports = await unifiedReportsService.getAvailableReports(useCase.id);
      result.reportConfigExists = true;
      result.reportCount = availableReports.reports.length;
      result.hasMinimumReports = result.reportCount >= 3;
      result.reportTypes = availableReports.reports.map(r => r.name);
      
      if (!result.hasMinimumReports) {
        result.errors.push(`Only ${result.reportCount} reports configured (minimum 3 required)`);
      }
    } catch (error) {
      result.reportConfigExists = false;
      result.errors.push(`Report configuration check failed: ${error}`);
    }
    
  } catch (error) {
    result.errors.push(`Unexpected error: ${error}`);
  }
  
  return result;
}

async function runAllTests() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE USE CASE AUDIT & REPORT GENERATION TEST');
  console.log('='.repeat(80));
  console.log(`Testing ${ALL_USE_CASES.length} use cases across all verticals`);
  console.log('Requirements:');
  console.log('- Each use case must have audit configuration');
  console.log('- Each use case must generate vanguard actions');
  console.log('- Each use case must have at least 3 custom reports configured');
  console.log('='.repeat(80));
  console.log();
  
  const results: TestResult[] = [];
  const verticalStats: Record<string, { total: number; passed: number; failed: number }> = {};
  
  // Initialize vertical stats
  const uniqueVerticals = [...new Set(ALL_USE_CASES.map(uc => uc.vertical))];
  uniqueVerticals.forEach(vertical => {
    verticalStats[vertical] = { total: 0, passed: 0, failed: 0 };
  });
  
  // Test each use case
  for (const useCase of ALL_USE_CASES) {
    console.log(`Testing ${useCase.name} (${useCase.id})...`);
    const result = await testUseCaseAuditAndReports(useCase);
    results.push(result);
    
    // Update vertical stats
    verticalStats[useCase.vertical].total++;
    
    const passed = result.auditConfigExists && 
                   result.vanguardActionsGenerated && 
                   result.reportConfigExists && 
                   result.hasMinimumReports &&
                   result.errors.length === 0;
    
    if (passed) {
      verticalStats[useCase.vertical].passed++;
      console.log(`  ✓ PASSED - Audit: ✓, Actions: ${result.vanguardActionsCount}, Reports: ${result.reportCount}`);
    } else {
      verticalStats[useCase.vertical].failed++;
      console.log(`  ✗ FAILED - Audit: ${result.auditConfigExists ? '✓' : '✗'}, Actions: ${result.vanguardActionsGenerated ? result.vanguardActionsCount : '✗'}, Reports: ${result.reportCount}${result.hasMinimumReports ? '' : ' (< 3)'}`);
      if (result.errors.length > 0) {
        result.errors.forEach(error => console.log(`    - ${error}`));
      }
    }
  }
  
  // Print summary statistics
  console.log();
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  
  // Overall statistics
  const totalPassed = results.filter(r => 
    r.auditConfigExists && 
    r.vanguardActionsGenerated && 
    r.reportConfigExists && 
    r.hasMinimumReports &&
    r.errors.length === 0
  ).length;
  const totalFailed = results.length - totalPassed;
  const passRate = ((totalPassed / results.length) * 100).toFixed(1);
  
  console.log(`Total Use Cases: ${results.length}`);
  console.log(`Passed: ${totalPassed} (${passRate}%)`);
  console.log(`Failed: ${totalFailed} (${(100 - parseFloat(passRate)).toFixed(1)}%)`);
  console.log();
  
  // Vertical breakdown
  console.log('BY VERTICAL:');
  console.log('-'.repeat(60));
  Object.entries(verticalStats).forEach(([vertical, stats]) => {
    const verticalPassRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
    console.log(`${vertical.padEnd(25)} Total: ${stats.total.toString().padStart(2)} | Passed: ${stats.passed.toString().padStart(2)} | Failed: ${stats.failed.toString().padStart(2)} | Pass Rate: ${verticalPassRate.padStart(5)}%`);
  });
  
  // Detailed failure analysis
  console.log();
  console.log('FAILURE ANALYSIS:');
  console.log('-'.repeat(60));
  
  const noAuditConfig = results.filter(r => !r.auditConfigExists);
  const noVanguardActions = results.filter(r => !r.vanguardActionsGenerated);
  const noReportConfig = results.filter(r => !r.reportConfigExists);
  const insufficientReports = results.filter(r => r.reportConfigExists && !r.hasMinimumReports);
  
  console.log(`Missing Audit Configuration: ${noAuditConfig.length} use cases`);
  if (noAuditConfig.length > 0 && noAuditConfig.length <= 10) {
    noAuditConfig.forEach(r => console.log(`  - ${r.useCaseName} (${r.useCaseId})`));
  }
  
  console.log(`Missing Vanguard Actions: ${noVanguardActions.length} use cases`);
  if (noVanguardActions.length > 0 && noVanguardActions.length <= 10) {
    noVanguardActions.forEach(r => console.log(`  - ${r.useCaseName} (${r.useCaseId})`));
  }
  
  console.log(`Missing Report Configuration: ${noReportConfig.length} use cases`);
  if (noReportConfig.length > 0 && noReportConfig.length <= 10) {
    noReportConfig.forEach(r => console.log(`  - ${r.useCaseName} (${r.useCaseId})`));
  }
  
  console.log(`Insufficient Reports (< 3): ${insufficientReports.length} use cases`);
  if (insufficientReports.length > 0) {
    insufficientReports.forEach(r => console.log(`  - ${r.useCaseName} (${r.useCaseId}): ${r.reportCount} reports`));
  }
  
  // Report statistics
  console.log();
  console.log('REPORT STATISTICS:');
  console.log('-'.repeat(60));
  const totalReports = results.reduce((sum, r) => sum + r.reportCount, 0);
  const avgReportsPerUseCase = (totalReports / results.length).toFixed(1);
  const maxReports = Math.max(...results.map(r => r.reportCount));
  const minReports = Math.min(...results.filter(r => r.reportConfigExists).map(r => r.reportCount));
  
  console.log(`Total Reports Configured: ${totalReports}`);
  console.log(`Average Reports per Use Case: ${avgReportsPerUseCase}`);
  console.log(`Maximum Reports: ${maxReports}`);
  console.log(`Minimum Reports: ${minReports}`);
  
  // List use cases with most reports
  const topReportUseCases = results
    .filter(r => r.reportCount > 0)
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 5);
  
  console.log();
  console.log('TOP 5 USE CASES BY REPORT COUNT:');
  topReportUseCases.forEach((r, i) => {
    console.log(`${i + 1}. ${r.useCaseName}: ${r.reportCount} reports`);
  });
  
  console.log();
  console.log('='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
  
  // Return overall success/failure
  return {
    success: totalPassed === results.length,
    totalUseCases: results.length,
    passed: totalPassed,
    failed: totalFailed,
    passRate: parseFloat(passRate),
    results
  };
}

// Run the tests
if (require.main === module) {
  runAllTests()
    .then(summary => {
      if (summary.success) {
        console.log('\n✅ ALL TESTS PASSED! The use case orchestration engine is fully functional.');
        process.exit(0);
      } else {
        console.log(`\n❌ TESTS FAILED: ${summary.failed} out of ${summary.totalUseCases} use cases failed.`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ TEST EXECUTION ERROR:', error);
      process.exit(1);
    });
}

export { runAllTests, testUseCaseAuditAndReports };