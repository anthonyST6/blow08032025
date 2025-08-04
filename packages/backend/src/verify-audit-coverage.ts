import { getAllConfiguredUseCaseIds, hasAuditConfig } from './config/use-case-audit-config';
import { workflowRegistry } from './orchestration/workflow-registry';

interface AuditCoverageReport {
  totalUseCases: number;
  configuredUseCases: number;
  missingConfigurations: string[];
  coveragePercentage: number;
  verticalBreakdown: Record<string, {
    total: number;
    configured: number;
    missing: string[];
  }>;
}

async function verifyAuditCoverage(): Promise<AuditCoverageReport> {
  console.log('🔍 Verifying Audit Configuration Coverage...\n');

  // Wait for workflow registry to initialize
  await new Promise(resolve => setTimeout(resolve, 100));

  // Get all workflows from the registry
  const allWorkflows = workflowRegistry.getAllWorkflows();
  const totalUseCases = allWorkflows.length;

  // If no workflows loaded yet, wait a bit more
  if (totalUseCases === 0) {
    console.log('⏳ Waiting for workflows to load...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const retryWorkflows = workflowRegistry.getAllWorkflows();
    if (retryWorkflows.length > 0) {
      return verifyAuditCoverage(); // Retry with loaded workflows
    }
  }

  // Find missing configurations
  const missingConfigurations: string[] = [];
  let configuredCount = 0;
  const verticalBreakdown: Record<string, {
    total: number;
    configured: number;
    missing: string[];
  }> = {};

  // Check each workflow
  for (const workflow of allWorkflows) {
    const useCaseId = workflow.useCaseId; // Use useCaseId instead of dynamic id
    const category = workflow.industry || 'uncategorized';

    // Initialize vertical breakdown
    if (!verticalBreakdown[category]) {
      verticalBreakdown[category] = {
        total: 0,
        configured: 0,
        missing: []
      };
    }

    verticalBreakdown[category].total++;

    // Check if audit config exists
    if (!hasAuditConfig(useCaseId)) {
      missingConfigurations.push(useCaseId);
      verticalBreakdown[category].missing.push(useCaseId);
      console.log(`❌ Missing audit config: ${useCaseId} (${workflow.name})`);
    } else {
      verticalBreakdown[category].configured++;
      configuredCount++;
      console.log(`✅ Configured: ${useCaseId}`);
    }
  }

  const configuredUseCases = configuredCount;
  const coveragePercentage = totalUseCases > 0 ? (configuredUseCases / totalUseCases) * 100 : 0;

  const report: AuditCoverageReport = {
    totalUseCases,
    configuredUseCases,
    missingConfigurations,
    coveragePercentage,
    verticalBreakdown
  };

  // Log summary
  console.log('\n📊 Audit Configuration Coverage Summary:');
  console.log('=====================================');
  console.log(`Total Use Cases: ${totalUseCases}`);
  console.log(`Configured: ${configuredUseCases}`);
  console.log(`Missing: ${missingConfigurations.length}`);
  console.log(`Coverage: ${coveragePercentage.toFixed(2)}%`);

  // Log vertical breakdown
  console.log('\n📈 Coverage by Vertical:');
  console.log('======================');
  for (const [vertical, stats] of Object.entries(verticalBreakdown)) {
    const verticalCoverage = (stats.configured / stats.total) * 100;
    console.log(`\n${vertical.toUpperCase()}:`);
    console.log(`  Total: ${stats.total}`);
    console.log(`  Configured: ${stats.configured}`);
    console.log(`  Coverage: ${verticalCoverage.toFixed(2)}%`);
    if (stats.missing.length > 0) {
      console.log(`  Missing: ${stats.missing.join(', ')}`);
    }
  }

  // Log missing configurations
  if (missingConfigurations.length > 0) {
    console.log('\n⚠️  Missing Audit Configurations:');
    console.log('================================');
    missingConfigurations.forEach(id => {
      const workflow = allWorkflows.find(w => w.useCaseId === id);
      console.log(`- ${id} (${workflow?.name || 'Unknown'})`);
    });
  } else {
    console.log('\n✨ All use cases have audit configurations!');
  }

  // Save report to file
  const reportPath = './audit-coverage-report.json';
  const fs = await import('fs/promises');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return report;
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyAuditCoverage()
    .then(report => {
      if (report.coveragePercentage === 100) {
        console.log('\n🎉 SUCCESS: 100% audit configuration coverage achieved!');
        process.exit(0);
      } else {
        console.log(`\n⚠️  WARNING: Only ${report.coveragePercentage.toFixed(2)}% coverage achieved.`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Error verifying audit coverage:', error);
      process.exit(1);
    });
}

export { verifyAuditCoverage };