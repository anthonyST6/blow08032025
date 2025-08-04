import { oilfieldReportsService } from './services/oilfield-reports.service';

async function testReportGeneration() {
  const service = oilfieldReportsService;
  
  console.log('Testing Oilfield Reports Generation...\n');
  
  try {
    // Test individual report generation
    console.log('1. Testing Lease Expiration Dashboard...');
    const leaseReport = await service.generateLeaseExpirationDashboard();
    console.log('✅ Lease Expiration Dashboard generated:', leaseReport.name);
    
    console.log('\n2. Testing Revenue Analysis Report...');
    const revenueReport = await service.generateRevenueAnalysisReport();
    console.log('✅ Revenue Analysis Report generated:', revenueReport.name);
    
    console.log('\n3. Testing Compliance Status Report...');
    const complianceReport = await service.generateComplianceStatusReport();
    console.log('✅ Compliance Status Report generated:', complianceReport.name);
    
    console.log('\n4. Testing Risk Assessment Matrix...');
    const riskReport = await service.generateRiskAssessmentMatrix();
    console.log('✅ Risk Assessment Matrix generated:', riskReport.name);
    
    console.log('\n5. Testing Production Performance Report...');
    const productionReport = await service.generateProductionPerformanceReport();
    console.log('✅ Production Performance Report generated:', productionReport.name);
    
    console.log('\n\nAll reports generated successfully! 🎉');
    
    // List all generated files
    console.log('\nGenerated files in reports directory:');
    const fs = require('fs');
    const path = require('path');
    const reportsDir = path.join(__dirname, '../reports');
    
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      files.forEach((file: string) => {
        const stats = fs.statSync(path.join(reportsDir, file));
        console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating reports:', error);
  }
}

// Run the test
testReportGeneration();