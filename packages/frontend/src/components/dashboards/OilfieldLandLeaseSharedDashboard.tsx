/**
 * Oilfield Land Lease Shared Dashboard
 * 
 * This is a refactored version of OilfieldLandLeaseDashboard that uses
 * shared components and can work with both demo and ingested data.
 * This will be used by both the demo dashboard and run dashboard.
 */

import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Shield,
  MapPin,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  MetricCard,
  MetricCardsGrid,
  UniversalChart,
  TimeSeriesChart,
  DistributionChart,
  DataTable,
  createLeaseTableColumns,
  ComplianceStatus,
  StatusIndicator,
  formatCurrency,
  formatPercentage,
  formatNumber,
  daysUntil
} from './shared';
import { OilfieldDemoData } from '../../services/oilfieldDataTransformer.service';

interface OilfieldLandLeaseSharedDashboardProps {
  data: OilfieldDemoData;
  isLiveData: boolean;
  hasData: boolean;
  onDataRequest?: () => void;
}

export const OilfieldLandLeaseSharedDashboard: React.FC<OilfieldLandLeaseSharedDashboardProps> = ({
  data,
  isLiveData,
  hasData,
  onDataRequest
}) => {
  // This component returns an object with tab content, not JSX directly
  // It's meant to be used by a parent component that handles tab navigation
  // Prepare metric cards data
  const metricsData = [
    {
      title: 'Total Leases',
      value: formatNumber(data.leaseMetrics.totalLeases),
      change: 12,
      trend: 'up' as const,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Active Leases',
      value: formatNumber(data.leaseMetrics.activeLeases),
      change: 5,
      trend: 'up' as const,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(data.leaseMetrics.monthlyRevenue, 1) + 'M',
      change: 8.5,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'yellow'
    },
    {
      title: 'Avg Royalty Rate',
      value: formatPercentage(data.leaseMetrics.averageRoyaltyRate),
      change: -0.5,
      trend: 'stable' as const,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  // Prepare expiration alerts
  const expirationAlerts = [
    {
      label: 'Expiring in 30 Days',
      status: 'warning' as const,
      value: data.leaseMetrics.expiringIn30Days,
      description: 'Immediate attention required'
    },
    {
      label: 'Expiring in 90 Days',
      status: 'info' as const,
      value: data.leaseMetrics.expiringIn90Days,
      description: 'Schedule renewal discussions'
    }
  ];

  // Transform lease data for table
  const leaseTableData = data.geographicDistribution.map((region, index) => ({
    leaseId: `L-${1000 + index}`,
    leaseName: `${region.region} Lease ${index + 1}`,
    status: region.risk === 'high' ? 'Pending' : 'Active',
    expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    royaltyRate: data.leaseMetrics.averageRoyaltyRate + (Math.random() - 0.5) * 5,
    monthlyRevenue: region.production * 1000
  }));

  const tabContent = {
    overview: (
      <div className="space-y-6">
        {/* Key Metrics */}
        <MetricCardsGrid
          metrics={metricsData}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lease Status Distribution */}
          <DistributionChart
            title="Lease Status Distribution"
            data={data.leasesByStatus}
            dataKeys={['count']}
            xAxisKey="status"
            yAxisLabel="Number of Leases"
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />

          {/* Geographic Distribution */}
          <UniversalChart
            title="Geographic Distribution"
            type="bar"
            data={data.geographicDistribution}
            dataKeys={['leases', 'production']}
            xAxisKey="region"
            yAxisLabel="Count / Production (M bbl)"
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
            stacked
          />
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Expiration Alerts</h3>
            <StatusIndicator
              data={expirationAlerts}
              isLiveData={isLiveData}
              hasData={hasData}
              onDataRequest={onDataRequest}
            />
          </div>
          
          <ComplianceStatus
            compliant={data.complianceStatus.compliant}
            pendingReview={data.complianceStatus.pendingReview}
            nonCompliant={data.complianceStatus.nonCompliant}
            requiresAction={data.complianceStatus.requiresAction}
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />
        </div>
      </div>
    ),

    financial: (
      <div className="space-y-6">
        {/* Financial Metrics */}
        {data.financialMetrics && (
          <MetricCardsGrid
            metrics={[
              {
                title: 'Total Revenue',
                value: formatCurrency(data.financialMetrics.totalRevenue, 1) + 'M',
                change: 15.2,
                trend: 'up' as const,
                icon: DollarSign,
                color: 'green'
              },
              {
                title: 'Avg Revenue/Lease',
                value: formatCurrency(data.financialMetrics.avgRevenuePerLease * 1000),
                change: 8.7,
                trend: 'up' as const,
                icon: TrendingUp,
                color: 'blue'
              },
              {
                title: 'Projected Revenue',
                value: formatCurrency(data.financialMetrics.projectedRevenue, 1) + 'M',
                change: 12.5,
                trend: 'up' as const,
                icon: BarChart3,
                color: 'purple'
              },
              {
                title: 'Cost Savings',
                value: formatCurrency(data.financialMetrics.costSavings, 1) + 'M',
                change: 23.8,
                trend: 'up' as const,
                icon: Shield,
                color: 'yellow'
              }
            ]}
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />
        )}

        {/* Revenue Trends */}
        <TimeSeriesChart
          title="Monthly Revenue Trends"
          data={data.productionByLease.map(p => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: p.value * 0.004 // Convert to revenue
          }))}
          dataKeys={['revenue']}
          xAxisKey="date"
          yAxisLabel="Revenue ($M)"
          height={400}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Royalty Rate Analysis */}
        <TimeSeriesChart
          title="Royalty Rate Trends"
          data={data.royaltyTrends.map(r => ({
            date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rate: r.value
          }))}
          dataKeys={['rate']}
          xAxisKey="date"
          yAxisLabel="Royalty Rate (%)"
          height={300}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />
      </div>
    ),

    risk: (
      <div className="space-y-6">
        {/* Risk Metrics */}
        {data.riskAssessment && (
          <MetricCardsGrid
            metrics={[
              {
                title: 'High Risk Leases',
                value: data.riskAssessment.highRisk,
                change: -12.5,
                trend: 'down' as const,
                icon: Shield,
                color: 'red'
              },
              {
                title: 'Medium Risk',
                value: data.riskAssessment.mediumRisk,
                change: 5.2,
                trend: 'up' as const,
                icon: Shield,
                color: 'yellow'
              },
              {
                title: 'Low Risk',
                value: data.riskAssessment.lowRisk,
                change: 8.7,
                trend: 'up' as const,
                icon: Shield,
                color: 'green'
              },
              {
                title: 'Mitigated Risks',
                value: data.riskAssessment.mitigatedRisks,
                change: 45.3,
                trend: 'up' as const,
                icon: Shield,
                color: 'blue'
              }
            ]}
            columns={4}
            size="small"
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />
        )}

        {/* Expiration Timeline */}
        <TimeSeriesChart
          title="Lease Expiration Timeline"
          data={data.expirationTimeline.slice(0, 90).map(e => ({
            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            expiring: e.value
          }))}
          dataKeys={['expiring']}
          xAxisKey="date"
          yAxisLabel="Leases Expiring"
          height={400}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Risk by Region */}
        <UniversalChart
          title="Risk Assessment by Region"
          type="radar"
          data={data.geographicDistribution.map(g => ({
            region: g.region,
            riskScore: g.risk === 'high' ? 80 : g.risk === 'medium' ? 50 : 20,
            production: g.production,
            leases: g.leases / 10 // Scale for radar chart
          }))}
          dataKeys={['riskScore', 'production', 'leases']}
          xAxisKey="region"
          height={400}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />
      </div>
    ),

    operations: (
      <div className="space-y-6">
        {/* Lease Table */}
        <DataTable
          title="Active Leases"
          data={leaseTableData}
          columns={createLeaseTableColumns()}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
          searchable
          sortable
        />

        {/* Production by Lease */}
        <TimeSeriesChart
          title="Production Trends"
          data={data.productionByLease.map(p => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            production: p.value
          }))}
          dataKeys={['production']}
          xAxisKey="date"
          yAxisLabel="Production (bbl/day)"
          height={300}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Geographic Performance */}
        <UniversalChart
          title="Regional Performance"
          type="bar"
          data={data.geographicDistribution}
          dataKeys={['production']}
          xAxisKey="region"
          yAxisLabel="Production (M bbl)"
          colors={['#10B981']}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />
      </div>
    )
  };

  // For now, return null as this is a utility component
  // In practice, this would be used by a parent dashboard component
  return null;
};

// Export the tab content generator as a separate function
export const generateOilfieldTabContent = (
  data: OilfieldDemoData,
  isLiveData: boolean,
  hasData: boolean,
  onDataRequest?: () => void
) => {
  // Prepare metric cards data
  const metricsData = [
    {
      title: 'Total Leases',
      value: formatNumber(data.leaseMetrics.totalLeases),
      change: 12,
      trend: 'up' as const,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Active Leases',
      value: formatNumber(data.leaseMetrics.activeLeases),
      change: 5,
      trend: 'up' as const,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(data.leaseMetrics.monthlyRevenue, 1) + 'M',
      change: 8.5,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'yellow'
    },
    {
      title: 'Avg Royalty Rate',
      value: formatPercentage(data.leaseMetrics.averageRoyaltyRate),
      change: -0.5,
      trend: 'stable' as const,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  // Prepare expiration alerts
  const expirationAlerts = [
    {
      label: 'Expiring in 30 Days',
      status: 'warning' as const,
      value: data.leaseMetrics.expiringIn30Days,
      description: 'Immediate attention required'
    },
    {
      label: 'Expiring in 90 Days',
      status: 'info' as const,
      value: data.leaseMetrics.expiringIn90Days,
      description: 'Schedule renewal discussions'
    }
  ];

  // Transform lease data for table
  const leaseTableData = data.geographicDistribution.map((region, index) => ({
    leaseId: `L-${1000 + index}`,
    leaseName: `${region.region} Lease ${index + 1}`,
    status: region.risk === 'high' ? 'Pending' : 'Active',
    expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    royaltyRate: data.leaseMetrics.averageRoyaltyRate + (Math.random() - 0.5) * 5,
    monthlyRevenue: region.production * 1000
  }));

  return {
    overview: (
      <div className="space-y-6">
        {/* Key Metrics */}
        <MetricCardsGrid
          metrics={metricsData}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lease Status Distribution */}
          <DistributionChart
            title="Lease Status Distribution"
            data={data.leasesByStatus}
            dataKeys={['count']}
            xAxisKey="status"
            yAxisLabel="Number of Leases"
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />

          {/* Geographic Distribution */}
          <UniversalChart
            title="Geographic Distribution"
            type="bar"
            data={data.geographicDistribution}
            dataKeys={['leases', 'production']}
            xAxisKey="region"
            yAxisLabel="Count / Production (M bbl)"
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
            stacked
          />
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Expiration Alerts</h3>
            <StatusIndicator
              data={expirationAlerts}
              isLiveData={isLiveData}
              hasData={hasData}
              onDataRequest={onDataRequest}
            />
          </div>
          
          <ComplianceStatus
            compliant={data.complianceStatus.compliant}
            pendingReview={data.complianceStatus.pendingReview}
            nonCompliant={data.complianceStatus.nonCompliant}
            requiresAction={data.complianceStatus.requiresAction}
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />
        </div>
      </div>
    ),

    financial: (
      <div className="space-y-6">
        {/* Financial Metrics */}
        {data.financialMetrics && (
          <MetricCardsGrid
            metrics={[
              {
                title: 'Total Revenue',
                value: formatCurrency(data.financialMetrics.totalRevenue, 1) + 'M',
                change: 15.2,
                trend: 'up' as const,
                icon: DollarSign,
                color: 'green'
              },
              {
                title: 'Avg Revenue/Lease',
                value: formatCurrency(data.financialMetrics.avgRevenuePerLease * 1000),
                change: 8.7,
                trend: 'up' as const,
                icon: TrendingUp,
                color: 'blue'
              },
              {
                title: 'Projected Revenue',
                value: formatCurrency(data.financialMetrics.projectedRevenue, 1) + 'M',
                change: 12.5,
                trend: 'up' as const,
                icon: BarChart3,
                color: 'purple'
              },
              {
                title: 'Cost Savings',
                value: formatCurrency(data.financialMetrics.costSavings, 1) + 'M',
                change: 23.8,
                trend: 'up' as const,
                icon: Shield,
                color: 'yellow'
              }
            ]}
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />
        )}

        {/* Revenue Trends */}
        <TimeSeriesChart
          title="Monthly Revenue Trends"
          data={data.productionByLease.map(p => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: p.value * 0.004 // Convert to revenue
          }))}
          dataKeys={['revenue']}
          xAxisKey="date"
          yAxisLabel="Revenue ($M)"
          height={400}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Royalty Rate Analysis */}
        <TimeSeriesChart
          title="Royalty Rate Trends"
          data={data.royaltyTrends.map(r => ({
            date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rate: r.value
          }))}
          dataKeys={['rate']}
          xAxisKey="date"
          yAxisLabel="Royalty Rate (%)"
          height={300}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />
      </div>
    ),

    risk: (
      <div className="space-y-6">
        {/* Risk Metrics */}
        {data.riskAssessment && (
          <MetricCardsGrid
            metrics={[
              {
                title: 'High Risk Leases',
                value: data.riskAssessment.highRisk,
                change: -12.5,
                trend: 'down' as const,
                icon: Shield,
                color: 'red'
              },
              {
                title: 'Medium Risk',
                value: data.riskAssessment.mediumRisk,
                change: 5.2,
                trend: 'up' as const,
                icon: Shield,
                color: 'yellow'
              },
              {
                title: 'Low Risk',
                value: data.riskAssessment.lowRisk,
                change: 8.7,
                trend: 'up' as const,
                icon: Shield,
                color: 'green'
              },
              {
                title: 'Mitigated Risks',
                value: data.riskAssessment.mitigatedRisks,
                change: 45.3,
                trend: 'up' as const,
                icon: Shield,
                color: 'blue'
              }
            ]}
            columns={4}
            size="small"
            isLiveData={isLiveData}
            hasData={hasData}
            onDataRequest={onDataRequest}
          />
        )}

        {/* Expiration Timeline */}
        <TimeSeriesChart
          title="Lease Expiration Timeline"
          data={data.expirationTimeline.slice(0, 90).map(e => ({
            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            expiring: e.value
          }))}
          dataKeys={['expiring']}
          xAxisKey="date"
          yAxisLabel="Leases Expiring"
          height={400}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Risk by Region */}
        <UniversalChart
          title="Risk Assessment by Region"
          type="radar"
          data={data.geographicDistribution.map(g => ({
            region: g.region,
            riskScore: g.risk === 'high' ? 80 : g.risk === 'medium' ? 50 : 20,
            production: g.production,
            leases: g.leases / 10 // Scale for radar chart
          }))}
          dataKeys={['riskScore', 'production', 'leases']}
          xAxisKey="region"
          height={400}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />
      </div>
    ),

    operations: (
      <div className="space-y-6">
        {/* Lease Table */}
        <DataTable
          title="Active Leases"
          data={leaseTableData}
          columns={createLeaseTableColumns()}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
          searchable
          sortable
        />

        {/* Production by Lease */}
        <TimeSeriesChart
          title="Production Trends"
          data={data.productionByLease.map(p => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            production: p.value
          }))}
          dataKeys={['production']}
          xAxisKey="date"
          yAxisLabel="Production (bbl/day)"
          height={300}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />

        {/* Geographic Performance */}
        <UniversalChart
          title="Regional Performance"
          type="bar"
          data={data.geographicDistribution}
          dataKeys={['production']}
          xAxisKey="region"
          yAxisLabel="Production (M bbl)"
          colors={['#10B981']}
          isLiveData={isLiveData}
          hasData={hasData}
          onDataRequest={onDataRequest}
        />
      </div>
    )
  };
};