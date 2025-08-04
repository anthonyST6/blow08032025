import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import * as ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';

// Pharma domain data models
interface ClinicalTrial {
  trialId: string;
  protocolNumber: string;
  trialName: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV';
  status: 'planning' | 'recruiting' | 'active' | 'completed' | 'suspended';
  sponsor: string;
  indication: string;
  targetEnrollment: number;
  currentEnrollment: number;
  sites: {
    siteId: string;
    siteName: string;
    location: string;
    enrolled: number;
    screenFailures: number;
    dropouts: number;
    completed: number;
  }[];
  startDate: Date;
  estimatedEndDate: Date;
  primaryEndpoint: string;
  secondaryEndpoints: string[];
}

interface DrugDiscovery {
  compoundId: string;
  compoundName: string;
  targetProtein: string;
  therapeuticArea: string;
  stage: 'target-validation' | 'hit-identification' | 'lead-optimization' | 'preclinical' | 'clinical';
  potency: number; // IC50 in nM
  selectivity: number;
  toxicity: {
    cytotoxicity: number;
    hepatotoxicity: number;
    cardiotoxicity: number;
  };
  pharmacokinetics: {
    bioavailability: number;
    halfLife: number; // hours
    clearance: number;
  };
  patentStatus: string;
  estimatedValue: number;
}

interface RegulatorySubmission {
  submissionId: string;
  type: 'IND' | 'NDA' | 'BLA' | 'ANDA' | '510k' | 'PMA';
  product: string;
  indication: string;
  submissionDate: Date;
  targetApprovalDate: Date;
  status: 'preparing' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'withdrawn';
  reviewDivision: string;
  documents: {
    documentType: string;
    status: 'draft' | 'review' | 'final' | 'submitted';
    completeness: number;
    lastUpdated: Date;
  }[];
  queries: {
    queryId: string;
    queryDate: Date;
    responseDeadline: Date;
    status: 'pending' | 'responded' | 'resolved';
  }[];
  riskFactors: string[];
}

interface ManufacturingBatch {
  batchId: string;
  productName: string;
  batchSize: number;
  unit: string;
  manufacturingDate: Date;
  expiryDate: Date;
  status: 'in-process' | 'testing' | 'quarantine' | 'released' | 'rejected';
  yield: number;
  purity: number;
  qualityTests: {
    testName: string;
    specification: string;
    result: string;
    passed: boolean;
  }[];
  deviations: {
    deviationId: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    resolution: string;
  }[];
  costPerUnit: number;
}

interface PatientSafety {
  eventId: string;
  productName: string;
  eventDate: Date;
  reportDate: Date;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening' | 'death';
  seriousness: boolean;
  outcome: 'recovered' | 'recovering' | 'not-recovered' | 'fatal' | 'unknown';
  patientAge: number;
  patientGender: string;
  concomitantMeds: string[];
  narrative: string;
  causality: 'certain' | 'probable' | 'possible' | 'unlikely' | 'unrelated';
  reportedTo: string[];
  followUpRequired: boolean;
}

class PharmaReportsService {
  // Generate mock data methods
  private generateClinicalTrials(count: number): ClinicalTrial[] {
    const indications = ['Oncology', 'Cardiovascular', 'Neurology', 'Immunology', 'Infectious Disease'];
    const sponsors = ['Pharma Corp A', 'Biotech Inc', 'University Medical Center', 'Research Institute'];
    const phases: ClinicalTrial['phase'][] = ['Phase I', 'Phase II', 'Phase III', 'Phase IV'];
    const statuses: ClinicalTrial['status'][] = ['planning', 'recruiting', 'active', 'completed', 'suspended'];

    return Array.from({ length: count }, (_, i) => {
      const phase = phases[Math.floor(Math.random() * phases.length)];
      const targetEnrollment = phase === 'Phase I' ? 20 + Math.floor(Math.random() * 30) :
                             phase === 'Phase II' ? 50 + Math.floor(Math.random() * 150) :
                             phase === 'Phase III' ? 200 + Math.floor(Math.random() * 800) :
                             100 + Math.floor(Math.random() * 400);
      
      const currentEnrollment = Math.floor(targetEnrollment * Math.random());
      const siteCount = Math.floor(Math.random() * 20) + 5;
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24));
      
      const estimatedEndDate = new Date(startDate);
      estimatedEndDate.setMonth(estimatedEndDate.getMonth() + 12 + Math.floor(Math.random() * 36));

      return {
        trialId: `CT-${String(i + 1).padStart(5, '0')}`,
        protocolNumber: `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        trialName: `Study of Drug ${String.fromCharCode(65 + i)} in ${indications[Math.floor(Math.random() * indications.length)]}`,
        phase,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        sponsor: sponsors[Math.floor(Math.random() * sponsors.length)],
        indication: indications[Math.floor(Math.random() * indications.length)],
        targetEnrollment,
        currentEnrollment,
        sites: Array.from({ length: siteCount }, (_, j) => {
          const siteEnrolled = Math.floor(currentEnrollment / siteCount * (0.5 + Math.random()));
          return {
            siteId: `SITE-${String(j + 1).padStart(3, '0')}`,
            siteName: `Clinical Site ${j + 1}`,
            location: ['USA', 'Canada', 'UK', 'Germany', 'Japan'][Math.floor(Math.random() * 5)],
            enrolled: siteEnrolled,
            screenFailures: Math.floor(siteEnrolled * 0.2),
            dropouts: Math.floor(siteEnrolled * 0.1),
            completed: Math.floor(siteEnrolled * 0.7)
          };
        }),
        startDate,
        estimatedEndDate,
        primaryEndpoint: 'Overall Response Rate',
        secondaryEndpoints: ['Progression-Free Survival', 'Overall Survival', 'Quality of Life']
      };
    });
  }

  private generateDrugDiscoveryPipeline(count: number): DrugDiscovery[] {
    const therapeuticAreas = ['Oncology', 'CNS', 'Cardiovascular', 'Metabolic', 'Immunology', 'Infectious Disease'];
    const stages: DrugDiscovery['stage'][] = ['target-validation', 'hit-identification', 'lead-optimization', 'preclinical', 'clinical'];
    const targets = ['EGFR', 'PD-1', 'BRAF', 'BCL-2', 'JAK2', 'VEGFR', 'CDK4/6', 'BTK'];

    return Array.from({ length: count }, (_, i) => ({
      compoundId: `CPD-${String(i + 1).padStart(6, '0')}`,
      compoundName: `Compound ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
      targetProtein: targets[Math.floor(Math.random() * targets.length)],
      therapeuticArea: therapeuticAreas[Math.floor(Math.random() * therapeuticAreas.length)],
      stage: stages[Math.floor(Math.random() * stages.length)],
      potency: Math.random() * 1000, // IC50 in nM
      selectivity: 10 + Math.random() * 990,
      toxicity: {
        cytotoxicity: Math.random() * 100,
        hepatotoxicity: Math.random() * 100,
        cardiotoxicity: Math.random() * 100
      },
      pharmacokinetics: {
        bioavailability: 20 + Math.random() * 80,
        halfLife: 0.5 + Math.random() * 24,
        clearance: 0.1 + Math.random() * 10
      },
      patentStatus: Math.random() > 0.5 ? 'Filed' : 'Pending',
      estimatedValue: 10000000 + Math.random() * 990000000
    }));
  }

  private generateRegulatorySubmissions(count: number): RegulatorySubmission[] {
    const types: RegulatorySubmission['type'][] = ['IND', 'NDA', 'BLA', 'ANDA', '510k', 'PMA'];
    const statuses: RegulatorySubmission['status'][] = ['preparing', 'submitted', 'under-review', 'approved', 'rejected', 'withdrawn'];
    const products = ['Drug A', 'Drug B', 'Device X', 'Biosimilar Y', 'Generic Z'];

    return Array.from({ length: count }, (_, i) => {
      const submissionDate = new Date();
      submissionDate.setMonth(submissionDate.getMonth() - Math.floor(Math.random() * 12));
      
      const targetApprovalDate = new Date(submissionDate);
      targetApprovalDate.setMonth(targetApprovalDate.getMonth() + 6 + Math.floor(Math.random() * 12));

      const documentTypes = ['Clinical Study Report', 'CMC', 'Nonclinical', 'Statistical Analysis', 'Labeling'];
      const queryCount = Math.floor(Math.random() * 5);

      return {
        submissionId: `SUB-${String(i + 1).padStart(5, '0')}`,
        type: types[Math.floor(Math.random() * types.length)],
        product: products[Math.floor(Math.random() * products.length)],
        indication: 'Treatment of Advanced Cancer',
        submissionDate,
        targetApprovalDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        reviewDivision: 'Oncology Products',
        documents: documentTypes.map(docType => ({
          documentType: docType,
          status: ['draft', 'review', 'final', 'submitted'][Math.floor(Math.random() * 4)] as any,
          completeness: 60 + Math.random() * 40,
          lastUpdated: new Date()
        })),
        queries: Array.from({ length: queryCount }, (_, j) => {
          const queryDate = new Date(submissionDate);
          queryDate.setDate(queryDate.getDate() + 30 + j * 15);
          
          return {
            queryId: `Q-${String(j + 1).padStart(3, '0')}`,
            queryDate,
            responseDeadline: new Date(queryDate.getTime() + 14 * 24 * 60 * 60 * 1000),
            status: ['pending', 'responded', 'resolved'][Math.floor(Math.random() * 3)] as any
          };
        }),
        riskFactors: ['Manufacturing scale-up', 'Clinical data completeness', 'Regulatory precedent']
      };
    });
  }

  private generateManufacturingBatches(count: number): ManufacturingBatch[] {
    const products = ['Tablet A 50mg', 'Injection B 100mg/ml', 'Capsule C 25mg', 'Solution D 5mg/ml'];
    const statuses: ManufacturingBatch['status'][] = ['in-process', 'testing', 'quarantine', 'released', 'rejected'];

    return Array.from({ length: count }, (_, i) => {
      const manufacturingDate = new Date();
      manufacturingDate.setDate(manufacturingDate.getDate() - Math.floor(Math.random() * 90));
      
      const expiryDate = new Date(manufacturingDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);

      const batchYield = 85 + Math.random() * 13;
      const purity = 98 + Math.random() * 1.8;

      return {
        batchId: `BATCH-${new Date().getFullYear()}${String(i + 1).padStart(5, '0')}`,
        productName: products[Math.floor(Math.random() * products.length)],
        batchSize: 10000 + Math.floor(Math.random() * 90000),
        unit: 'tablets',
        manufacturingDate,
        expiryDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        yield: batchYield,
        purity,
        qualityTests: [
          { testName: 'Assay', specification: '95.0-105.0%', result: `${(98 + Math.random() * 4).toFixed(1)}%`, passed: true },
          { testName: 'Dissolution', specification: 'NLT 80% in 30 min', result: `${(82 + Math.random() * 15).toFixed(1)}%`, passed: true },
          { testName: 'Impurities', specification: 'NMT 0.5%', result: `${(0.1 + Math.random() * 0.3).toFixed(2)}%`, passed: true },
          { testName: 'Microbial Limits', specification: '<100 CFU/g', result: '<10 CFU/g', passed: true }
        ],
        deviations: Math.random() > 0.8 ? [{
          deviationId: `DEV-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
          description: 'Temperature excursion during processing',
          impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          resolution: 'Impact assessment completed, no quality impact'
        }] : [],
        costPerUnit: 0.5 + Math.random() * 4.5
      };
    });
  }

  private generatePatientSafetyEvents(count: number): PatientSafety[] {
    const products = ['Drug A', 'Drug B', 'Drug C', 'Device X', 'Vaccine Y'];
    const severities: PatientSafety['severity'][] = ['mild', 'moderate', 'severe', 'life-threatening', 'death'];
    const outcomes: PatientSafety['outcome'][] = ['recovered', 'recovering', 'not-recovered', 'fatal', 'unknown'];
    const causalities: PatientSafety['causality'][] = ['certain', 'probable', 'possible', 'unlikely', 'unrelated'];

    return Array.from({ length: count }, (_, i) => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 180));
      
      const reportDate = new Date(eventDate);
      reportDate.setDate(reportDate.getDate() + Math.floor(Math.random() * 30));

      const severity = severities[Math.floor(Math.random() * severities.length)];
      const seriousness = severity === 'severe' || severity === 'life-threatening' || severity === 'death';

      return {
        eventId: `AE-${String(i + 1).padStart(6, '0')}`,
        productName: products[Math.floor(Math.random() * products.length)],
        eventDate,
        reportDate,
        severity,
        seriousness,
        outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        patientAge: 18 + Math.floor(Math.random() * 70),
        patientGender: Math.random() > 0.5 ? 'Male' : 'Female',
        concomitantMeds: ['Aspirin', 'Metformin', 'Lisinopril'].slice(0, Math.floor(Math.random() * 3)),
        narrative: 'Patient experienced adverse event during treatment',
        causality: causalities[Math.floor(Math.random() * causalities.length)],
        reportedTo: seriousness ? ['FDA', 'EMA'] : ['FDA'],
        followUpRequired: seriousness || Math.random() > 0.7
      };
    });
  }

  // Report generation methods
  async generateClinicalTrialsDashboard() {
    const trials = this.generateClinicalTrials(15);
    
    const content: ReportContent = {
      title: 'Clinical Trials Dashboard',
      subtitle: 'Real-time clinical trial monitoring and analytics',
      sections: [
        {
          heading: 'Portfolio Overview',
          content: `Active Trials: ${trials.filter(t => t.status === 'active').length}\nTotal Enrollment: ${trials.reduce((sum, t) => sum + t.currentEnrollment, 0)}\nAverage Enrollment Rate: ${(trials.reduce((sum, t) => sum + (t.currentEnrollment / t.targetEnrollment), 0) / trials.length * 100).toFixed(1)}%\nTrials at Risk: ${trials.filter(t => t.currentEnrollment / t.targetEnrollment < 0.5).length}\nTotal Sites: ${trials.reduce((sum, t) => sum + t.sites.length, 0)}\nPhase Distribution: ${['I', 'II', 'III', 'IV'].map(p => `Phase ${p}: ${trials.filter(t => t.phase === `Phase ${p}`).length}`).join(', ')}`,
          type: 'text'
        },
        {
          heading: 'Trial Performance',
          content: trials.slice(0, 10).map(t => ({
            'Trial ID': t.trialId,
            'Protocol': t.protocolNumber,
            'Phase': t.phase,
            'Status': t.status.toUpperCase(),
            'Enrollment': `${t.currentEnrollment}/${t.targetEnrollment}`,
            'Progress': `${(t.currentEnrollment / t.targetEnrollment * 100).toFixed(1)}%`,
            'Sites': t.sites.length,
            'Est. Completion': t.estimatedEndDate.toLocaleDateString()
          })),
          type: 'table'
        },
        {
          heading: 'Key Insights & Recommendations',
          content: [
            'Accelerate enrollment in CT-00003 by activating 3 additional sites',
            'High screen failure rate (25%) in oncology trials - review inclusion criteria',
            'Consider protocol amendment for CT-00007 to improve recruitment',
            'Implement risk-based monitoring for sites with low enrollment',
            'Deploy patient recruitment campaigns in underperforming regions',
            'Schedule interim analysis for Phase III trials approaching 50% enrollment'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Clinical Trials Dashboard',
      description: 'Comprehensive clinical trial portfolio analysis',
      type: 'pdf',
      agent: 'pharma-trials-agent',
      useCaseId: 'clinical-trials',
      workflowId: 'trials-dashboard'
    });
  }

  async generateDrugDiscoveryReport() {
    const pipeline = this.generateDrugDiscoveryPipeline(25);
    const timestamp = new Date().toISOString();
    
    const workbook = new ExcelJS.Workbook();
    
    // Pipeline Overview
    const overviewSheet = workbook.addWorksheet('Pipeline Overview');
    overviewSheet.columns = [
      { header: 'Compound ID', key: 'compoundId', width: 15 },
      { header: 'Name', key: 'compoundName', width: 20 },
      { header: 'Target', key: 'targetProtein', width: 15 },
      { header: 'Therapeutic Area', key: 'therapeuticArea', width: 20 },
      { header: 'Stage', key: 'stage', width: 20 },
      { header: 'Potency (IC50 nM)', key: 'potency', width: 18 },
      { header: 'Selectivity', key: 'selectivity', width: 12 },
      { header: 'Est. Value ($M)', key: 'value', width: 15 }
    ];

    pipeline.forEach(compound => {
      overviewSheet.addRow({
        compoundId: compound.compoundId,
        compoundName: compound.compoundName,
        targetProtein: compound.targetProtein,
        therapeuticArea: compound.therapeuticArea,
        stage: compound.stage.toUpperCase(),
        potency: compound.potency.toFixed(2),
        selectivity: compound.selectivity.toFixed(1),
        value: (compound.estimatedValue / 1000000).toFixed(1)
      });
    });

    // Toxicity Analysis
    const toxSheet = workbook.addWorksheet('Toxicity Profile');
    toxSheet.columns = [
      { header: 'Compound', key: 'compound', width: 20 },
      { header: 'Cytotoxicity (%)', key: 'cyto', width: 18 },
      { header: 'Hepatotoxicity (%)', key: 'hepato', width: 18 },
      { header: 'Cardiotoxicity (%)', key: 'cardio', width: 18 },
      { header: 'Risk Level', key: 'risk', width: 15 }
    ];

    pipeline.forEach(compound => {
      const avgTox = (compound.toxicity.cytotoxicity + compound.toxicity.hepatotoxicity + compound.toxicity.cardiotoxicity) / 3;
      toxSheet.addRow({
        compound: compound.compoundName,
        cyto: compound.toxicity.cytotoxicity.toFixed(1),
        hepato: compound.toxicity.hepatotoxicity.toFixed(1),
        cardio: compound.toxicity.cardiotoxicity.toFixed(1),
        risk: avgTox < 30 ? 'Low' : avgTox < 60 ? 'Medium' : 'High'
      });
    });

    // PK Analysis
    const pkSheet = workbook.addWorksheet('Pharmacokinetics');
    pkSheet.columns = [
      { header: 'Compound', key: 'compound', width: 20 },
      { header: 'Bioavailability (%)', key: 'bioavail', width: 20 },
      { header: 'Half-Life (hrs)', key: 'halfLife', width: 18 },
      { header: 'Clearance (L/h)', key: 'clearance', width: 18 },
      { header: 'PK Score', key: 'score', width: 15 }
    ];

    pipeline.forEach(compound => {
      const pkScore = (compound.pharmacokinetics.bioavailability * 0.4 + 
                      (compound.pharmacokinetics.halfLife > 4 ? 40 : compound.pharmacokinetics.halfLife * 10) * 0.3 +
                      (10 - compound.pharmacokinetics.clearance) * 3 * 0.3);
      
      pkSheet.addRow({
        compound: compound.compoundName,
        bioavail: compound.pharmacokinetics.bioavailability.toFixed(1),
        halfLife: compound.pharmacokinetics.halfLife.toFixed(1),
        clearance: compound.pharmacokinetics.clearance.toFixed(2),
        score: pkScore.toFixed(1)
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const reportId = uuidv4();
    
    logger.info(`Generated drug discovery report: ${reportId}`);
    
    return {
      id: reportId,
      name: 'Drug Discovery Pipeline Report',
      description: 'AI-driven drug discovery analytics and compound profiling',
      type: 'drug-discovery',
      format: 'xlsx',
      size: buffer.byteLength,
      createdAt: timestamp,
      downloadUrl: `/api/reports/download/${reportId}`,
      data: buffer,
      agent: 'pharma-discovery-agent'
    };
  }

  async generateRegulatoryComplianceReport() {
    const submissions = this.generateRegulatorySubmissions(10);
    const timestamp = new Date().toISOString();
    
    const jsonData = {
      reportDate: timestamp,
      submissionsSummary: {
        total: submissions.length,
        byStatus: {
          preparing: submissions.filter(s => s.status === 'preparing').length,
          submitted: submissions.filter(s => s.status === 'submitted').length,
          underReview: submissions.filter(s => s.status === 'under-review').length,
          approved: submissions.filter(s => s.status === 'approved').length,
          rejected: submissions.filter(s => s.status === 'rejected').length
        },
        byType: {
          IND: submissions.filter(s => s.type === 'IND').length,
          NDA: submissions.filter(s => s.type === 'NDA').length,
          BLA: submissions.filter(s => s.type === 'BLA').length,
          other: submissions.filter(s => !['IND', 'NDA', 'BLA'].includes(s.type)).length
        }
      },
      activeSubmissions: submissions
        .filter(s => ['submitted', 'under-review'].includes(s.status))
        .map(s => ({
          submissionId: s.submissionId,
          type: s.type,
          product: s.product,
          status: s.status,
          submissionDate: s.submissionDate.toISOString(),
          targetApprovalDate: s.targetApprovalDate.toISOString(),
          documentReadiness: (s.documents.reduce((sum, d) => sum + d.completeness, 0) / s.documents.length).toFixed(1) + '%',
          openQueries: s.queries.filter(q => q.status === 'pending').length,
          riskLevel: s.queries.filter(q => q.status === 'pending').length > 2 ? 'High' : 'Medium'
        })),
      documentStatus: submissions.flatMap(s => 
        s.documents.map(d => ({
          submission: s.submissionId,
          documentType: d.documentType,
          status: d.status,
          completeness: d.completeness + '%',
          lastUpdated: d.lastUpdated.toISOString()
        }))
      ),
      upcomingDeadlines: submissions
        .flatMap(s => s.queries)
        .filter(q => q.status === 'pending')
        .sort((a, b) => a.responseDeadline.getTime() - b.responseDeadline.getTime())
        .slice(0, 10)
        .map(q => ({
          queryId: q.queryId,
          deadline: q.responseDeadline.toISOString(),
          daysRemaining: Math.floor((q.responseDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        })),
      recommendations: [
        'Prioritize response to FDA queries for NDA-00003',
        'Complete CMC documentation for upcoming BLA submission',
        'Schedule pre-submission meeting for IND-00008',
        'Update regulatory strategy based on recent FDA guidance',
        'Implement electronic submission system for faster processing'
      ]
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Regulatory Compliance Report',
      description: 'FDA submission tracking and compliance monitoring',
      type: 'json',
      agent: 'pharma-regulatory-agent',
      useCaseId: 'regulatory-compliance',
      workflowId: 'compliance-report'
    });
  }

  async generateManufacturingQualityReport() {
    const batches = this.generateManufacturingBatches(50);
    
    const excelData = {
      'Batch Summary': batches.slice(0, 30).map(b => ({
        'Batch ID': b.batchId,
        'Product': b.productName,
        'Batch Size': `${b.batchSize.toLocaleString()} ${b.unit}`,
        'Mfg Date': b.manufacturingDate.toLocaleDateString(),
        'Expiry': b.expiryDate.toLocaleDateString(),
        'Status': b.status.toUpperCase(),
        'Yield %': b.yield.toFixed(1),
        'Purity %': b.purity.toFixed(1),
        'Cost/Unit': `$${b.costPerUnit.toFixed(2)}`
      })),
      'Quality Metrics': [
        { Metric: 'Average Yield', Value: `${(batches.reduce((sum, b) => sum + b.yield, 0) / batches.length).toFixed(1)}%` },
        { Metric: 'Average Purity', Value: `${(batches.reduce((sum, b) => sum + b.purity, 0) / batches.length).toFixed(2)}%` },
        { Metric: 'Right First Time', Value: `${(batches.filter(b => b.deviations.length === 0).length / batches.length * 100).toFixed(1)}%` },
        { Metric: 'Batches Released', Value: batches.filter(b => b.status === 'released').length },
        { Metric: 'Batches Rejected', Value: batches.filter(b => b.status === 'rejected').length },
        { Metric: 'Average Cost/Unit', Value: `$${(batches.reduce((sum, b) => sum + b.costPerUnit, 0) / batches.length).toFixed(2)}` }
      ],
      'Deviations': batches
        .filter(b => b.deviations.length > 0)
        .flatMap(b => b.deviations.map(d => ({
          'Batch ID': b.batchId,
          'Deviation ID': d.deviationId,
          'Description': d.description,
          'Impact': d.impact.toUpperCase(),
          'Resolution': d.resolution
        }))),
      'Test Results': batches.slice(0, 10).flatMap(b =>
        b.qualityTests.map(t => ({
          'Batch ID': b.batchId,
          'Test': t.testName,
          'Specification': t.specification,
          'Result': t.result,
          'Status': t.passed ? 'PASS' : 'FAIL'
        }))
      )
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Manufacturing Quality Report',
      description: 'GMP compliance and batch quality analysis',
      type: 'xlsx',
      agent: 'pharma-quality-agent',
      useCaseId: 'pharma-manufacturing',
      workflowId: 'quality-report'
    });
  }

  async generatePatientSafetyReport() {
    const events = this.generatePatientSafetyEvents(100);
    
    const content: ReportContent = {
      title: 'Patient Safety Surveillance Report',
      subtitle: 'Adverse event monitoring and pharmacovigilance',
      sections: [
        {
          heading: 'Safety Overview',
          content: `Total Events: ${events.length}\nSerious Events: ${events.filter(e => e.seriousness).length}\nDeaths: ${events.filter(e => e.outcome === 'fatal').length}\nLife-Threatening: ${events.filter(e => e.severity === 'life-threatening').length}\nReporting Rate: ${(events.length / 30).toFixed(1)} events/day\nFollow-up Required: ${events.filter(e => e.followUpRequired).length}`,
          type: 'text'
        },
        {
          heading: 'Severity Distribution',
          content: [
            { Severity: 'Mild', Count: events.filter(e => e.severity === 'mild').length, Percentage: `${(events.filter(e => e.severity === 'mild').length / events.length * 100).toFixed(1)}%` },
            { Severity: 'Moderate', Count: events.filter(e => e.severity === 'moderate').length, Percentage: `${(events.filter(e => e.severity === 'moderate').length / events.length * 100).toFixed(1)}%` },
            { Severity: 'Severe', Count: events.filter(e => e.severity === 'severe').length, Percentage: `${(events.filter(e => e.severity === 'severe').length / events.length * 100).toFixed(1)}%` },
            { Severity: 'Life-Threatening', Count: events.filter(e => e.severity === 'life-threatening').length, Percentage: `${(events.filter(e => e.severity === 'life-threatening').length / events.length * 100).toFixed(1)}%` },
            { Severity: 'Death', Count: events.filter(e => e.severity === 'death').length, Percentage: `${(events.filter(e => e.severity === 'death').length / events.length * 100).toFixed(1)}%` }
          ],
          type: 'table'
        },
        {
          heading: 'Product Safety Profile',
          content: ['Drug A', 'Drug B', 'Drug C', 'Device X', 'Vaccine Y'].map(product => ({
            Product: product,
            'Total Events': events.filter(e => e.productName === product).length,
            'Serious Events': events.filter(e => e.productName === product && e.seriousness).length,
            'Causality (Probable+)': events.filter(e => e.productName === product && ['certain', 'probable'].includes(e.causality)).length,
            'Risk Score': (events.filter(e => e.productName === product && e.seriousness).length / events.filter(e => e.productName === product).length * 100).toFixed(1) + '%'
          })),
          type: 'table'
        },
        {
          heading: 'Regulatory Actions',
          content: [
            'Submit expedited safety reports for 3 serious unexpected events',
            'Update product labeling for Drug B based on new safety signals',
            'Conduct signal detection analysis for cardiovascular events',
            'Prepare PSUR/PBRER for upcoming regulatory deadline',
            'Implement enhanced monitoring for high-risk patient populations',
            'Schedule safety review committee meeting for risk assessment'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Patient Safety Surveillance Report',
      description: 'Comprehensive pharmacovigilance and safety monitoring',
      type: 'pdf',
      agent: 'pharma-safety-agent',
      useCaseId: 'patient-safety',
      workflowId: 'safety-report'
    });
  }

  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all pharma reports...');
      
      const reports = await Promise.all([
        this.generateClinicalTrialsDashboard(),
        this.generateDrugDiscoveryReport(),
        this.generateRegulatoryComplianceReport(),
        this.generateManufacturingQualityReport(),
        this.generatePatientSafetyReport()
      ]);

      logger.info(`Successfully generated ${reports.length} reports`);
      return reports;
    } catch (error) {
      logger.error('Failed to generate all reports:', error);
      throw error;
    }
  }

  // Generate specific report by type
  async generateReportByType(reportType: string) {
    switch (reportType) {
      case 'clinical-trials-dashboard':
        return await this.generateClinicalTrialsDashboard();
      case 'drug-discovery-pipeline':
        return await this.generateDrugDiscoveryReport();
      case 'regulatory-compliance':
        return await this.generateRegulatoryComplianceReport();
      case 'manufacturing-quality':
        return await this.generateManufacturingQualityReport();
      case 'patient-safety':
        return await this.generatePatientSafetyReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const pharmaReportsService = new PharmaReportsService();