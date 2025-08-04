import { firestore } from '../../config/firebase';
import {
  EnergyAnalytics,
  LeasePerformanceMetrics,
  RoyaltyAnalysis,
  ComplianceMetrics,
  ExpirationForecast,
  LandLease,
  LeaseStatus,
  ComplianceCategory,
  RevenuePeriod,
  LeaseRoyaltySummary,
  DeductionSummary,
  ComplianceDeadline,
  ExpirationSummary,
  EventType
} from './types';
import { logger } from '../../utils/logger';
import { landLeaseService } from './landLease.service';
import { complianceService } from './compliance.service';
import { expirationMonitoringService } from './expirationMonitoring.service';

export class AnalyticsService {
  private get analyticsCollection() {
    return firestore().collection('energyAnalytics');
  }
  
  private get reportsCollection() {
    return firestore().collection('energyReports');
  }

  async generateAnalytics(): Promise<EnergyAnalytics> {
    try {
      const [
        leasePerformance,
        royaltyAnalysis,
        complianceMetrics,
        expirationForecast
      ] = await Promise.all([
        this.calculateLeasePerformance(),
        this.analyzeRoyalties(),
        this.calculateComplianceMetrics(),
        this.forecastExpirations()
      ]);

      const analytics: EnergyAnalytics = {
        leasePerformance,
        royaltyAnalysis,
        complianceMetrics,
        expirationForecast
      };

      // Store analytics snapshot
      await this.analyticsCollection.add({
        ...analytics,
        generatedAt: new Date()
      });

      logger.info('Energy analytics generated');
      return analytics;
    } catch (error) {
      logger.error('Error generating analytics', { error });
      throw error;
    }
  }

  private async calculateLeasePerformance(): Promise<LeasePerformanceMetrics> {
    try {
      const allLeases = await landLeaseService.getLeases();
      
      const activeLeases = allLeases.filter(
        lease => lease.status === LeaseStatus.ACTIVE || 
                 lease.status === LeaseStatus.PRODUCING ||
                 lease.status === LeaseStatus.HELD_BY_PRODUCTION
      );

      const producingLeases = allLeases.filter(
        lease => lease.status === LeaseStatus.PRODUCING ||
                 lease.status === LeaseStatus.HELD_BY_PRODUCTION
      );

      const totalAcreage = activeLeases.reduce(
        (sum, lease) => sum + lease.property.acres,
        0
      );

      const totalRoyaltyRates = activeLeases.reduce(
        (sum, lease) => sum + lease.royalties.percentage,
        0
      );

      const averageRoyaltyRate = activeLeases.length > 0 
        ? totalRoyaltyRates / activeLeases.length 
        : 0;

      // Calculate revenue by period
      const revenueByPeriod = await this.calculateRevenueByPeriod(allLeases);

      const totalRevenue = revenueByPeriod.reduce(
        (sum, period) => sum + period.revenue,
        0
      );

      return {
        totalLeases: allLeases.length,
        activeLeases: activeLeases.length,
        producingLeases: producingLeases.length,
        totalAcreage,
        averageRoyaltyRate,
        totalRevenue,
        revenueByPeriod
      };
    } catch (error) {
      logger.error('Error calculating lease performance', { error });
      throw error;
    }
  }

  private async calculateRevenueByPeriod(leases: LandLease[]): Promise<RevenuePeriod[]> {
    const periods: RevenuePeriod[] = [];
    const now = new Date();
    
    // Calculate for last 12 months
    for (let i = 11; i >= 0; i--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const periodName = periodStart.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });

      let royalties = 0;
      let rentals = 0;
      let bonuses = 0;

      for (const lease of leases) {
        // Calculate royalties
        const royaltyEvents = lease.timeline.filter(
          event => 
            event.type === EventType.ROYALTY_PAID &&
            event.date >= periodStart &&
            event.date <= periodEnd
        );
        royalties += royaltyEvents.reduce(
          (sum, event) => sum + (event.metadata?.amount || 0),
          0
        );

        // Calculate rentals
        const rentalEvents = lease.timeline.filter(
          event => 
            event.type === EventType.RENTAL_PAID &&
            event.date >= periodStart &&
            event.date <= periodEnd
        );
        rentals += rentalEvents.reduce(
          (sum, event) => sum + (event.metadata?.amount || 0),
          0
        );

        // Calculate bonuses
        const bonusEvents = lease.timeline.filter(
          event => 
            event.type === EventType.BONUS_PAID &&
            event.date >= periodStart &&
            event.date <= periodEnd
        );
        bonuses += bonusEvents.reduce(
          (sum, event) => sum + (event.metadata?.amount || 0),
          0
        );
      }

      periods.push({
        period: periodName,
        revenue: royalties + rentals + bonuses,
        royalties,
        rentals,
        bonuses
      });
    }

    return periods;
  }

  private async analyzeRoyalties(): Promise<RoyaltyAnalysis> {
    try {
      const leases = await landLeaseService.getLeases();
      const producingLeases = leases.filter(
        lease => lease.status === LeaseStatus.PRODUCING ||
                 lease.status === LeaseStatus.HELD_BY_PRODUCTION
      );

      let totalRoyaltiesPaid = 0;
      const leaseRoyalties: LeaseRoyaltySummary[] = [];
      const deductionsByType: Record<string, number> = {};

      for (const lease of producingLeases) {
        // Calculate total royalties for this lease
        const royaltyEvents = lease.timeline.filter(
          event => event.type === EventType.ROYALTY_PAID
        );

        const leaseTotal = royaltyEvents.reduce(
          (sum, event) => sum + (event.metadata?.amount || 0),
          0
        );

        totalRoyaltiesPaid += leaseTotal;

        // Get last payment info
        const lastPayment = royaltyEvents
          .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        if (lastPayment) {
          leaseRoyalties.push({
            leaseId: lease.id,
            leaseNumber: lease.leaseNumber,
            totalRoyalties: leaseTotal,
            lastPayment: lastPayment.metadata?.amount || 0,
            lastPaymentDate: lastPayment.date
          });
        }

        // Track deductions
        for (const deduction of lease.royalties.deductions) {
          const deductionAmount = royaltyEvents.reduce(
            (sum, event) => {
              const deductionValue = event.metadata?.deductions?.[deduction.type] || 0;
              return sum + deductionValue;
            },
            0
          );
          
          deductionsByType[deduction.type] = 
            (deductionsByType[deduction.type] || 0) + deductionAmount;
        }
      }

      // Sort top producing leases
      const topProducingLeases = leaseRoyalties
        .sort((a, b) => b.totalRoyalties - a.totalRoyalties)
        .slice(0, 10);

      // Calculate average monthly royalty
      const monthsOfData = 12; // Assuming we have 12 months of data
      const averageMonthlyRoyalty = totalRoyaltiesPaid / monthsOfData;

      // Calculate deduction analysis
      const totalDeductions = Object.values(deductionsByType).reduce(
        (sum, amount) => sum + amount,
        0
      );

      const deductionAnalysis: DeductionSummary = {
        totalDeductions,
        byType: deductionsByType,
        percentageOfGross: totalRoyaltiesPaid > 0 
          ? (totalDeductions / (totalRoyaltiesPaid + totalDeductions)) * 100
          : 0
      };

      return {
        totalRoyaltiesPaid,
        averageMonthlyRoyalty,
        topProducingLeases,
        deductionAnalysis
      };
    } catch (error) {
      logger.error('Error analyzing royalties', { error });
      throw error;
    }
  }

  private async calculateComplianceMetrics(): Promise<ComplianceMetrics> {
    try {
      const requirements = await complianceService.getUpcomingRequirements(365);
      const violations = await complianceService.getViolations();
      
      const openViolations = violations.filter(v => v.status === 'open');
      const resolvedViolations = violations.filter(v => v.status === 'resolved');

      // Calculate scores by category
      const byCategory: Record<ComplianceCategory, number> = {
        [ComplianceCategory.REGULATORY]: 100,
        [ComplianceCategory.CONTRACTUAL]: 100,
        [ComplianceCategory.ENVIRONMENTAL]: 100,
        [ComplianceCategory.FINANCIAL]: 100,
        [ComplianceCategory.OPERATIONAL]: 100,
        [ComplianceCategory.REPORTING]: 100
      };

      // Reduce score based on violations
      for (const violation of openViolations) {
        const requirement = requirements.find(r => r.id === violation.requirementId);
        if (requirement) {
          byCategory[requirement.category] -= 10; // 10 points per violation
        }
      }

      // Ensure scores don't go below 0
      for (const category in byCategory) {
        byCategory[category as ComplianceCategory] = Math.max(0, byCategory[category as ComplianceCategory]);
      }

      // Calculate overall score
      const categoryValues = Object.values(byCategory);
      const overallScore = categoryValues.reduce((sum, score) => sum + score, 0) / categoryValues.length;

      // Get upcoming deadlines
      const upcomingDeadlines: ComplianceDeadline[] = requirements
        .filter(r => r.nextDue)
        .map(r => ({
          requirementId: r.id,
          description: r.description,
          dueDate: r.nextDue!,
          daysRemaining: this.getDaysBetween(new Date(), r.nextDue!)
        }))
        .filter(d => d.daysRemaining <= 30)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 10);

      return {
        overallScore,
        byCategory,
        openIssues: openViolations.length,
        resolvedIssues: resolvedViolations.length,
        upcomingDeadlines
      };
    } catch (error) {
      logger.error('Error calculating compliance metrics', { error });
      throw error;
    }
  }

  private async forecastExpirations(): Promise<ExpirationForecast> {
    try {
      const alerts = await expirationMonitoringService.getActiveAlerts();

      const next30Days = this.filterAlertsByDays(alerts, 30);
      const next90Days = this.filterAlertsByDays(alerts, 90);
      const next365Days = this.filterAlertsByDays(alerts, 365);

      return {
        next30Days: await this.summarizeExpirations(next30Days),
        next90Days: await this.summarizeExpirations(next90Days),
        next365Days: await this.summarizeExpirations(next365Days)
      };
    } catch (error) {
      logger.error('Error forecasting expirations', { error });
      throw error;
    }
  }

  private filterAlertsByDays(alerts: any[], days: number): any[] {
    return alerts.filter(alert => alert.daysUntilDue <= days);
  }

  private async summarizeExpirations(alerts: any[]): Promise<ExpirationSummary> {
    const leaseExpirations = alerts.filter(a => a.type === 'primary_term').length;
    const rentalsDue = alerts.filter(a => a.type === 'rental_due').length;
    const optionDeadlines = alerts.filter(a => a.type === 'option_deadline').length;

    // Estimate revenue loss from expirations
    let estimatedRevenueLoss = 0;
    
    for (const alert of alerts.filter(a => a.type === 'primary_term')) {
      const lease = await landLeaseService.getLeaseById(alert.leaseId);
      if (lease && (lease.status === LeaseStatus.PRODUCING || lease.status === LeaseStatus.HELD_BY_PRODUCTION)) {
        // Estimate monthly revenue from this lease
        const recentRoyalties = lease.timeline
          .filter(e => e.type === EventType.ROYALTY_PAID)
          .filter(e => e.date > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
          .reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);
        
        const monthlyRevenue = recentRoyalties / 3; // Average over 3 months
        estimatedRevenueLoss += monthlyRevenue * 12; // Annual loss
      }
    }

    return {
      leaseExpirations,
      rentalsDue,
      optionDeadlines,
      estimatedRevenueLoss
    };
  }

  async generateReport(
    reportType: 'monthly' | 'quarterly' | 'annual',
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const analytics = await this.generateAnalytics();
      
      const report = {
        type: reportType,
        period: {
          start: startDate,
          end: endDate
        },
        generatedAt: new Date(),
        analytics,
        summary: this.generateSummary(analytics, reportType),
        recommendations: this.generateRecommendations(analytics)
      };

      // Store report
      const docRef = await this.reportsCollection.add(report);
      
      logger.info('Report generated', { 
        reportId: docRef.id, 
        type: reportType 
      });

      return {
        id: docRef.id,
        ...report
      };
    } catch (error) {
      logger.error('Error generating report', { error });
      throw error;
    }
  }

  private generateSummary(
    analytics: EnergyAnalytics,
    _reportType: string
  ): any {
    const { leasePerformance, complianceMetrics } = analytics;

    return {
      highlights: [
        `Total active leases: ${leasePerformance.activeLeases}`,
        `Total acreage under management: ${leasePerformance.totalAcreage.toLocaleString()} acres`,
        `Average royalty rate: ${(leasePerformance.averageRoyaltyRate * 100).toFixed(2)}%`,
        `Total revenue: $${leasePerformance.totalRevenue.toLocaleString()}`,
        `Compliance score: ${complianceMetrics.overallScore.toFixed(1)}%`
      ],
      concerns: this.identifyConcerns(analytics),
      opportunities: this.identifyOpportunities(analytics)
    };
  }

  private identifyConcerns(analytics: EnergyAnalytics): string[] {
    const concerns: string[] = [];
    
    // Check for upcoming expirations
    if (analytics.expirationForecast.next30Days.leaseExpirations > 0) {
      concerns.push(
        `${analytics.expirationForecast.next30Days.leaseExpirations} leases expiring within 30 days`
      );
    }

    // Check compliance issues
    if (analytics.complianceMetrics.openIssues > 0) {
      concerns.push(
        `${analytics.complianceMetrics.openIssues} open compliance violations`
      );
    }

    // Check for low compliance scores
    for (const [category, score] of Object.entries(analytics.complianceMetrics.byCategory)) {
      if (score < 80) {
        concerns.push(
          `Low compliance score in ${category}: ${score}%`
        );
      }
    }

    // Check deduction percentage
    if (analytics.royaltyAnalysis.deductionAnalysis.percentageOfGross > 15) {
      concerns.push(
        `High deduction rate: ${analytics.royaltyAnalysis.deductionAnalysis.percentageOfGross.toFixed(1)}% of gross royalties`
      );
    }

    return concerns;
  }

  private identifyOpportunities(analytics: EnergyAnalytics): string[] {
    const opportunities: string[] = [];
    
    // Check for lease extension opportunities
    if (analytics.expirationForecast.next90Days.optionDeadlines > 0) {
      opportunities.push(
        `${analytics.expirationForecast.next90Days.optionDeadlines} lease extension options available`
      );
    }

    // Check for non-producing leases
    const nonProducingPercentage = 
      ((analytics.leasePerformance.activeLeases - analytics.leasePerformance.producingLeases) / 
       analytics.leasePerformance.activeLeases) * 100;
    
    if (nonProducingPercentage > 20) {
      opportunities.push(
        `${nonProducingPercentage.toFixed(1)}% of active leases are non-producing - potential for development`
      );
    }

    // Check for revenue growth
    const recentMonths = analytics.leasePerformance.revenueByPeriod.slice(-3);
    const revenueGrowth = this.calculateGrowthRate(
      recentMonths.map(p => p.revenue)
    );
    
    if (revenueGrowth > 5) {
      opportunities.push(
        `Revenue growing at ${revenueGrowth.toFixed(1)}% monthly rate`
      );
    }

    return opportunities;
  }

  private generateRecommendations(analytics: EnergyAnalytics): string[] {
    const recommendations: string[] = [];
    
    // Expiration recommendations
    if (analytics.expirationForecast.next30Days.leaseExpirations > 0) {
      recommendations.push(
        'Immediate action required: Review and negotiate extensions for expiring leases'
      );
    }

    // Compliance recommendations
    if (analytics.complianceMetrics.overallScore < 90) {
      recommendations.push(
        'Implement compliance improvement plan to address violations and prevent future issues'
      );
    }

    // Revenue optimization
    if (analytics.royaltyAnalysis.deductionAnalysis.percentageOfGross > 10) {
      recommendations.push(
        'Review and renegotiate deduction terms in lease agreements to improve net royalties'
      );
    }

    // Development recommendations
    const idleLeasePercentage = 
      ((analytics.leasePerformance.activeLeases - analytics.leasePerformance.producingLeases) / 
       analytics.leasePerformance.activeLeases) * 100;
    
    if (idleLeasePercentage > 30) {
      recommendations.push(
        'Develop strategic plan for non-producing leases to maximize asset value'
      );
    }

    return recommendations;
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    if (firstValue === 0) return 0;
    
    return ((lastValue - firstValue) / firstValue) * 100 / (values.length - 1);
  }

  private getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getHistoricalAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<EnergyAnalytics[]> {
    try {
      const snapshot = await this.analyticsCollection
        .where('generatedAt', '>=', startDate)
        .where('generatedAt', '<=', endDate)
        .orderBy('generatedAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as EnergyAnalytics));
    } catch (error) {
      logger.error('Error fetching historical analytics', { error });
      throw error;
    }
  }

  async getReports(
    type?: 'monthly' | 'quarterly' | 'annual'
  ): Promise<any[]> {
    try {
      let query = this.reportsCollection.orderBy('generatedAt', 'desc');
      
      if (type) {
        query = query.where('type', '==', type) as any;
      }

      const snapshot = await query.limit(50).get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error fetching reports', { error });
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();