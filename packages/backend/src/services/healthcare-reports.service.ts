import { reportService, ReportContent } from './report.service';
import { logger } from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

// Data models for healthcare
interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  registrationDate: Date;
  intakeStatus: 'pending' | 'in-progress' | 'completed' | 'requires-review';
  medicalRecordNumber: string;
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    verified: boolean;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface IntakeMetrics {
  date: Date;
  totalIntakes: number;
  completedIntakes: number;
  pendingIntakes: number;
  averageCompletionTime: number; // minutes
  insuranceVerificationRate: number; // percentage
  dataQualityScore: number; // 0-100
  patientSatisfactionScore: number; // 0-5
}

interface ClinicalTrial {
  trialId: string;
  trialName: string;
  sponsor: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV';
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  condition: string;
  interventionType: string;
  enrollmentTarget: number;
  currentEnrollment: number;
  startDate: Date;
  estimatedEndDate: Date;
  eligibilityCriteria: {
    minAge: number;
    maxAge: number;
    gender: string;
    conditions: string[];
    exclusions: string[];
  };
}

interface TrialMatch {
  matchId: string;
  patientId: string;
  trialId: string;
  matchScore: number; // 0-100
  matchDate: Date;
  status: 'potential' | 'screened' | 'enrolled' | 'ineligible' | 'declined';
  eligibilityFactors: {
    factor: string;
    met: boolean;
    importance: 'required' | 'preferred' | 'optional';
  }[];
  recommendation: string;
}

interface IntakeWorkflow {
  workflowId: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  currentStep: string;
  completedSteps: string[];
  pendingSteps: string[];
  bottlenecks: string[];
  automationRate: number; // percentage
}

class HealthcareReportsService {
  private readonly reportsDir = path.join(process.cwd(), 'reports');
  private readonly publicReportsDir = path.join(process.cwd(), 'public', 'reports');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      await fs.mkdir(this.publicReportsDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create report directories:', error);
    }
  }

  // Generate sample patients
  private generateSamplePatients(count: number = 100): Patient[] {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const insuranceProviders = ['Blue Cross', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana'];
    const statuses: Patient['intakeStatus'][] = ['pending', 'in-progress', 'completed', 'requires-review'];
    
    return Array.from({ length: count }, (_, i) => {
      const registrationDate = new Date();
      registrationDate.setDate(registrationDate.getDate() - Math.floor(Math.random() * 30));
      
      const birthYear = 1940 + Math.floor(Math.random() * 60);
      const dateOfBirth = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      return {
        patientId: `PAT-${String(i + 1).padStart(6, '0')}`,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        dateOfBirth,
        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)] as any,
        registrationDate,
        intakeStatus: statuses[Math.floor(Math.random() * statuses.length)],
        medicalRecordNumber: `MRN-${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`,
        insurance: {
          provider: insuranceProviders[Math.floor(Math.random() * insuranceProviders.length)],
          policyNumber: `POL-${Math.floor(Math.random() * 1000000)}`,
          groupNumber: `GRP-${Math.floor(Math.random() * 10000)}`,
          verified: Math.random() > 0.2
        },
        contactInfo: {
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `patient${i}@email.com`,
          address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, ST ${Math.floor(Math.random() * 90000) + 10000}`
        },
        emergencyContact: {
          name: `Emergency Contact ${i}`,
          relationship: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend'][Math.floor(Math.random() * 5)],
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
        }
      };
    });
  }

  // Generate sample clinical trials
  private generateSampleTrials(count: number = 20): ClinicalTrial[] {
    const conditions = ['Diabetes Type 2', 'Hypertension', 'COPD', 'Alzheimer\'s Disease', 'Breast Cancer', 'Lung Cancer', 'Depression', 'Rheumatoid Arthritis'];
    const sponsors = ['Pfizer', 'Moderna', 'Johnson & Johnson', 'Roche', 'Novartis', 'Merck', 'AstraZeneca'];
    const interventions = ['Drug', 'Device', 'Behavioral', 'Biological', 'Procedure'];
    const phases: ClinicalTrial['phase'][] = ['Phase I', 'Phase II', 'Phase III', 'Phase IV'];
    
    return Array.from({ length: count }, () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24));
      
      const estimatedEndDate = new Date(startDate);
      estimatedEndDate.setMonth(estimatedEndDate.getMonth() + 12 + Math.floor(Math.random() * 24));
      
      const enrollmentTarget = 50 + Math.floor(Math.random() * 450);
      
      return {
        trialId: `NCT${String(Math.floor(Math.random() * 10000000)).padStart(8, '0')}`,
        trialName: `Study of ${interventions[Math.floor(Math.random() * interventions.length)]} for ${conditions[Math.floor(Math.random() * conditions.length)]}`,
        sponsor: sponsors[Math.floor(Math.random() * sponsors.length)],
        phase: phases[Math.floor(Math.random() * phases.length)],
        status: Math.random() > 0.3 ? 'recruiting' : 'active',
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        interventionType: interventions[Math.floor(Math.random() * interventions.length)],
        enrollmentTarget,
        currentEnrollment: Math.floor(enrollmentTarget * Math.random()),
        startDate,
        estimatedEndDate,
        eligibilityCriteria: {
          minAge: 18 + Math.floor(Math.random() * 30),
          maxAge: 50 + Math.floor(Math.random() * 30),
          gender: ['all', 'male', 'female'][Math.floor(Math.random() * 3)],
          conditions: [conditions[Math.floor(Math.random() * conditions.length)]],
          exclusions: ['Pregnancy', 'Severe kidney disease', 'Active cancer treatment']
        }
      };
    });
  }

  // 1. Patient Intake Dashboard Report
  async generatePatientIntakeDashboard() {
    const patients = this.generateSamplePatients(150);
    const recentPatients = patients.filter(p => 
      p.registrationDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    

    const content: ReportContent = {
      title: 'Patient Intake Dashboard - Weekly Report',
      subtitle: 'Comprehensive overview of patient registration and intake processes',
      sections: [
        {
          heading: 'Weekly Summary',
          content: `Total New Patients: ${recentPatients.length}\nCompleted Intakes: ${recentPatients.filter(p => p.intakeStatus === 'completed').length}\nPending Review: ${recentPatients.filter(p => p.intakeStatus === 'requires-review').length}\nInsurance Verification Rate: ${((recentPatients.filter(p => p.insurance.verified).length / recentPatients.length) * 100).toFixed(1)}%\nAverage Processing Time: 24 minutes`,
          type: 'text'
        },
        {
          heading: 'Recent Patient Registrations',
          content: recentPatients.slice(0, 10).map(p => ({
            'Patient ID': p.patientId,
            'Name': `${p.lastName}, ${p.firstName}`,
            'Registration Date': p.registrationDate.toLocaleDateString(),
            'Status': p.intakeStatus.toUpperCase(),
            'Insurance': p.insurance.provider,
            'Verified': p.insurance.verified ? 'Yes' : 'No',
            'MRN': p.medicalRecordNumber
          })),
          type: 'table'
        },
        {
          heading: 'Process Improvements',
          content: [
            'Implement auto-verification for top 5 insurance providers',
            'Add real-time eligibility checking',
            'Streamline emergency contact collection',
            'Enable patient portal pre-registration',
            'Reduce manual data entry by 40% through OCR'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Patient Intake Dashboard - Weekly Report',
      description: 'Weekly patient registration and intake metrics',
      type: 'pdf',
      agent: 'Vanguard Patient Intake Agent',
      useCaseId: 'patient-intake',
      workflowId: 'weekly-dashboard'
    });
  }

  // 2. Intake Process Analytics Report
  async generateIntakeAnalyticsReport() {
    const metrics = this.generateIntakeMetrics(30);
    const workflows = this.generateIntakeWorkflows(100);
    
    const excelData = {
      'Daily Metrics': metrics.map(m => ({
        Date: m.date.toLocaleDateString(),
        'Total Intakes': m.totalIntakes,
        'Completed': m.completedIntakes,
        'Completion Rate': `${((m.completedIntakes / m.totalIntakes) * 100).toFixed(1)}%`,
        'Avg Time (min)': m.averageCompletionTime,
        'Insurance Verified': `${m.insuranceVerificationRate.toFixed(1)}%`,
        'Quality Score': m.dataQualityScore,
        'Satisfaction': m.patientSatisfactionScore.toFixed(1)
      })),
      'Bottleneck Analysis': this.analyzeBottlenecks(workflows),
      'Automation Opportunities': [
        { Process: 'Insurance Verification', 'Current Manual %': 60, 'Automation Potential %': 85, 'Time Savings (hrs/week)': 40 },
        { Process: 'Document Scanning', 'Current Manual %': 100, 'Automation Potential %': 90, 'Time Savings (hrs/week)': 25 },
        { Process: 'Appointment Scheduling', 'Current Manual %': 70, 'Automation Potential %': 95, 'Time Savings (hrs/week)': 30 },
        { Process: 'Medical History Collection', 'Current Manual %': 80, 'Automation Potential %': 60, 'Time Savings (hrs/week)': 20 }
      ]
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Patient Intake Process Analytics',
      description: 'Detailed analysis of intake workflow efficiency and bottlenecks',
      type: 'xlsx',
      agent: 'Vanguard Process Analytics Agent',
      useCaseId: 'patient-intake',
      workflowId: 'process-analytics'
    });
  }

  // 3. Clinical Trial Matching Report
  async generateClinicalTrialMatchingReport() {
    const patients = this.generateSamplePatients(200);
    const trials = this.generateSampleTrials(25);
    const matches = this.generateTrialMatches(patients, trials);
    
    const highScoreMatches = matches.filter(m => m.matchScore > 80);
    const enrolledMatches = matches.filter(m => m.status === 'enrolled');

    const content: ReportContent = {
      title: 'Clinical Trial Matching Report - November 2024',
      subtitle: 'AI-powered patient-trial matching analysis and recommendations',
      sections: [
        {
          heading: 'Matching Overview',
          content: `Total Patients Screened: ${patients.length}\nActive Trials: ${trials.filter(t => t.status === 'recruiting').length}\nPotential Matches Found: ${matches.length}\nHigh-Score Matches (>80%): ${highScoreMatches.length}\nPatients Enrolled: ${enrolledMatches.length}\nAverage Match Score: ${(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length).toFixed(1)}%`,
          type: 'text'
        },
        {
          heading: 'Top Trial Matches',
          content: highScoreMatches.slice(0, 15).map(m => {
            const trial = trials.find(t => t.trialId === m.trialId)!;
            return {
              'Patient ID': m.patientId,
              'Trial': trial.trialName.substring(0, 50) + '...',
              'Match Score': `${m.matchScore}%`,
              'Phase': trial.phase,
              'Status': m.status.toUpperCase(),
              'Primary Condition': trial.condition,
              'Action': m.matchScore > 90 ? 'Contact Immediately' : 'Schedule Screening'
            };
          }),
          type: 'table'
        },
        {
          heading: 'Recruitment Recommendations',
          content: [
            'Focus outreach on diabetes patients - 5 trials actively recruiting',
            'Implement automated pre-screening questionnaires',
            'Partner with primary care for early identification',
            'Enhance patient education about trial benefits',
            'Streamline consent process for faster enrollment',
            'Target underrepresented populations for diversity goals'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Clinical Trial Matching Report',
      description: 'AI-powered patient-trial matching analysis',
      type: 'pdf',
      agent: 'Vanguard Trial Matching Agent',
      useCaseId: 'clinical-trial-matching',
      workflowId: 'monthly-matching'
    });
  }

  // 4. Trial Enrollment Pipeline Report
  async generateTrialEnrollmentPipeline() {
    const trials = this.generateSampleTrials(30);
    const enrollmentData = this.generateEnrollmentPipeline(trials);
    
    const excelData = {
      'Trial Summary': trials.map(t => ({
        'Trial ID': t.trialId,
        'Trial Name': t.trialName,
        'Sponsor': t.sponsor,
        'Phase': t.phase,
        'Status': t.status.toUpperCase(),
        'Enrollment Target': t.enrollmentTarget,
        'Current Enrollment': t.currentEnrollment,
        'Enrollment %': `${((t.currentEnrollment / t.enrollmentTarget) * 100).toFixed(1)}%`,
        'Days Active': Math.floor((Date.now() - t.startDate.getTime()) / (1000 * 60 * 60 * 24))
      })),
      'Pipeline Stages': enrollmentData.stages,
      'Conversion Metrics': [
        { Metric: 'Overall Conversion', Value: enrollmentData.conversions['Overall Conversion'] },
        { Metric: 'Screening Success Rate', Value: enrollmentData.conversions['Screening Success Rate'] },
        { Metric: 'Consent Rate', Value: enrollmentData.conversions['Consent Rate'] },
        { Metric: 'Average Days to Enrollment', Value: enrollmentData.conversions['Average Days to Enrollment'] }
      ],
      'Dropout Analysis': enrollmentData.dropouts
    };

    return await reportService.generateXLSXReport(excelData, {
      name: 'Clinical Trial Enrollment Pipeline',
      description: 'Comprehensive enrollment funnel analysis',
      type: 'xlsx',
      agent: 'Vanguard Enrollment Analytics Agent',
      useCaseId: 'clinical-trial-matching',
      workflowId: 'enrollment-pipeline'
    });
  }

  // 5. Patient Safety Monitoring Report
  async generatePatientSafetyReport() {
    const safetyEvents = this.generateSafetyEvents(50);
    this.generateRiskAssessments(100);
    
    const content: ReportContent = {
      title: 'Patient Safety Monitoring Report - Q4 2024',
      subtitle: 'Comprehensive safety event tracking and risk assessment',
      sections: [
        {
          heading: 'Safety Overview',
          content: `Total Safety Events: ${safetyEvents.length}\nSerious Adverse Events: ${safetyEvents.filter(e => e.severity === 'serious').length}\nEvents Requiring Intervention: ${safetyEvents.filter(e => e.requiresIntervention).length}\nAverage Response Time: 12 minutes\nSafety Score: 94.2/100`,
          type: 'text'
        },
        {
          heading: 'Recent Safety Events',
          content: safetyEvents.slice(0, 10).map(e => ({
            'Event ID': e.eventId,
            'Date': e.eventDate.toLocaleDateString(),
            'Type': e.eventType,
            'Severity': e.severity.toUpperCase(),
            'Patient ID': e.patientId,
            'Resolution': e.resolution,
            'Follow-up': e.followUpRequired ? 'Required' : 'None'
          })),
          type: 'table'
        },
        {
          heading: 'Risk Mitigation Strategies',
          content: [
            'Implement real-time vital sign monitoring',
            'Enhance medication reconciliation process',
            'Deploy predictive fall risk algorithms',
            'Strengthen infection control protocols',
            'Improve handoff communication procedures'
          ],
          type: 'list'
        }
      ]
    };

    return await reportService.generatePDFReport(content, {
      name: 'Patient Safety Monitoring Report',
      description: 'Quarterly safety event analysis and risk assessment',
      type: 'pdf',
      agent: 'Vanguard Safety Monitoring Agent',
      useCaseId: 'patient-intake',
      workflowId: 'safety-monitoring'
    });
  }

  // 6. Healthcare Compliance Report
  async generateComplianceReport() {
    const jsonData = {
      reportDate: new Date().toISOString(),
      complianceAreas: [
        {
          area: 'HIPAA Privacy',
          score: 96.5,
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 2,
          remediated: 2
        },
        {
          area: 'Clinical Documentation',
          score: 92.3,
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 5,
          remediated: 4
        },
        {
          area: 'Informed Consent',
          score: 98.7,
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 1,
          remediated: 1
        },
        {
          area: 'Data Security',
          score: 94.1,
          status: 'Compliant',
          lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          findings: 3,
          remediated: 3
        }
      ],
      upcomingRequirements: [
        {
          requirement: 'Annual HIPAA Training',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'On Track',
          completion: 78
        },
        {
          requirement: 'Security Risk Assessment',
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Scheduled',
          completion: 0
        }
      ],
      recommendations: [
        'Update privacy notices for new AI-based matching systems',
        'Enhance audit logging for clinical trial access',
        'Implement additional encryption for patient communications',
        'Review and update consent forms for digital health tools'
      ]
    };

    return await reportService.generateJSONReport(jsonData, {
      name: 'Healthcare Compliance Status Report',
      description: 'Comprehensive compliance tracking and recommendations',
      type: 'json',
      agent: 'Vanguard Compliance Agent',
      useCaseId: 'patient-intake',
      workflowId: 'compliance-tracking'
    });
  }

  // Helper methods
  private generateIntakeMetrics(days: number): IntakeMetrics[] {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - days + i + 1);
      
      const totalIntakes = 20 + Math.floor(Math.random() * 30);
      const completedIntakes = Math.floor(totalIntakes * (0.7 + Math.random() * 0.25));
      
      return {
        date,
        totalIntakes,
        completedIntakes,
        pendingIntakes: totalIntakes - completedIntakes,
        averageCompletionTime: 20 + Math.floor(Math.random() * 20),
        insuranceVerificationRate: 75 + Math.random() * 20,
        dataQualityScore: 85 + Math.floor(Math.random() * 15),
        patientSatisfactionScore: 4.0 + Math.random() * 0.8
      };
    });
  }

  private generateIntakeWorkflows(count: number): IntakeWorkflow[] {
    const steps = ['Registration', 'Insurance Verification', 'Medical History', 'Consent Forms', 'Scheduling'];
    
    return Array.from({ length: count }, (_, i) => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 168));
      
      const completedSteps = steps.slice(0, Math.floor(Math.random() * steps.length));
      const currentStep = steps[completedSteps.length] || 'Complete';
      
      return {
        workflowId: `WF-${String(i + 1).padStart(5, '0')}`,
        patientId: `PAT-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
        startTime,
        endTime: completedSteps.length === steps.length ? new Date(startTime.getTime() + 30 * 60 * 1000) : undefined,
        currentStep,
        completedSteps,
        pendingSteps: steps.slice(completedSteps.length),
        bottlenecks: Math.random() > 0.7 ? ['Insurance Verification'] : [],
        automationRate: 40 + Math.random() * 40
      };
    });
  }

  private generateTrialMatches(patients: Patient[], trials: ClinicalTrial[]): TrialMatch[] {
    const matches: TrialMatch[] = [];
    
    patients.forEach(patient => {
      const age = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      
      trials.forEach(trial => {
        if (trial.status === 'recruiting' && 
            age >= trial.eligibilityCriteria.minAge && 
            age <= trial.eligibilityCriteria.maxAge &&
            Math.random() > 0.7) {
          
          const matchScore = 60 + Math.random() * 40;
          
          matches.push({
            matchId: `MATCH-${matches.length + 1}`,
            patientId: patient.patientId,
            trialId: trial.trialId,
            matchScore,
            matchDate: new Date(),
            status: matchScore > 90 ? 'screened' : matchScore > 80 ? 'potential' : 'potential',
            eligibilityFactors: [
              { factor: 'Age', met: true, importance: 'required' },
              { factor: 'Diagnosis', met: Math.random() > 0.3, importance: 'required' },
              { factor: 'Prior Treatment', met: Math.random() > 0.5, importance: 'preferred' },
              { factor: 'Geographic Location', met: Math.random() > 0.4, importance: 'optional' }
            ],
            recommendation: matchScore > 85 ? 'Strong candidate for enrollment' : 'Consider for screening'
          });
        }
      });
    });
    
    return matches;
  }

  private analyzeBottlenecks(workflows: IntakeWorkflow[]) {
    const bottleneckCounts = workflows.reduce((acc, w) => {
      w.bottlenecks.forEach(b => {
        acc[b] = (acc[b] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(bottleneckCounts).map(([step, count]) => ({
      'Process Step': step,
      'Bottleneck Occurrences': count,
      'Impact %': ((count / workflows.length) * 100).toFixed(1),
      'Avg Delay (min)': Math.floor(15 + Math.random() * 30),
      'Recommended Action': 'Automate verification process'
    }));
  }

  private generateEnrollmentPipeline(_trials: ClinicalTrial[]) {
    const stages = [
      { Stage: 'Initial Interest', Count: 2500, 'Conversion %': 60 },
      { Stage: 'Pre-screening', Count: 1500, 'Conversion %': 40 },
      { Stage: 'Full Screening', Count: 600, 'Conversion %': 50 },
      { Stage: 'Eligible', Count: 300, 'Conversion %': 80 },
      { Stage: 'Consented', Count: 240, 'Conversion %': 90 },
      { Stage: 'Enrolled', Count: 216, 'Conversion %': 100 }
    ];

    const conversions = {
      'Overall Conversion': '8.6%',
      'Screening Success Rate': '50%',
      'Consent Rate': '80%',
      'Average Days to Enrollment': 21
    };

    const dropouts = [
      { Reason: 'Failed Eligibility', Count: 300, Percentage: '50%' },
      { Reason: 'Withdrew Consent', Count: 60, Percentage: '10%' },
      { Reason: 'Lost to Follow-up', Count: 120, Percentage: '20%' },
      { Reason: 'Adverse Events', Count: 30, Percentage: '5%' },
      { Reason: 'Other', Count: 90, Percentage: '15%' }
    ];

    return { stages, conversions, dropouts };
  }

  private generateSafetyEvents(count: number) {
    const eventTypes = ['Medication Error', 'Fall', 'Infection', 'Allergic Reaction', 'Equipment Malfunction'];
    const severities = ['mild', 'moderate', 'serious'];
    
    return Array.from({ length: count }, (_, i) => ({
      eventId: `SE-${String(i + 1).padStart(5, '0')}`,
      eventDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      patientId: `PAT-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
      resolution: 'Addressed immediately',
      requiresIntervention: Math.random() > 0.7,
      followUpRequired: Math.random() > 0.5
    }));
  }

  private generateRiskAssessments(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      assessmentId: `RA-${String(i + 1).padStart(5, '0')}`,
      patientId: `PAT-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
      assessmentDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      riskScore: Math.floor(Math.random() * 100),
      riskFactors: ['Fall Risk', 'Medication Interactions', 'Infection Risk'],
      interventions: ['Safety monitoring', 'Medication review', 'Preventive care']
    }));
  }


  // Generate all reports
  async generateAllReports() {
    try {
      logger.info('Generating all healthcare reports...');
      
      const reports = await Promise.all([
        this.generatePatientIntakeDashboard(),
        this.generateIntakeAnalyticsReport(),
        this.generateClinicalTrialMatchingReport(),
        this.generateTrialEnrollmentPipeline(),
        this.generatePatientSafetyReport(),
        this.generateComplianceReport()
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
      case 'patient-intake-dashboard':
        return await this.generatePatientIntakeDashboard();
      case 'intake-analytics':
        return await this.generateIntakeAnalyticsReport();
      case 'clinical-trial-matching':
        return await this.generateClinicalTrialMatchingReport();
      case 'trial-enrollment-pipeline':
        return await this.generateTrialEnrollmentPipeline();
      case 'patient-safety':
        return await this.generatePatientSafetyReport();
      case 'healthcare-compliance':
        return await this.generateComplianceReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

export const healthcareReportsService = new HealthcareReportsService();