# Oilfield Land Lease Run Dashboard Implementation Guide

## Overview
This guide provides step-by-step instructions to create an EXACT copy of the oilfield land lease demo dashboard for the run dashboard, with the addition of a Data Ingestion tab and empty states.

## Step 1: Create the Main Dashboard Component

### File: `packages/frontend/src/pages/dashboards/OilfieldLandLeaseRunDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ... all necessary imports from UseCaseDashboard.tsx

const OilfieldLandLeaseRunDashboard: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<any>(getEmptyDashboardData());
  const [hasIngestedData, setHasIngestedData] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [selectedLeaseStatus, setSelectedLeaseStatus] = useState<string | null>(null);

  // Tab configuration - MUST match demo exactly
  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'data-ingestion', label: 'Data Ingestion', icon: CloudArrowUpIcon }, // NEW TAB
    { id: 'leases', label: 'Land Leases', icon: MapIcon },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
    { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'operations', label: 'Operations', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header - EXACT copy from demo */}
      {/* Tab Navigation - with Data Ingestion added */}
      {/* Tab Content - EXACT copy of each tab from demo */}
    </div>
  );
};
```

## Step 2: Empty State Data Structure

```typescript
function getEmptyDashboardData() {
  return {
    // Key metrics - all zeros
    metrics: [
      { name: 'Total Leases', value: 0, unit: '', trend: 'up', change: 0 },
      { name: 'Total Acres', value: 0, unit: '', trend: 'up', change: 0 },
      { name: 'Annual Revenue', value: 0, unit: 'M', trend: 'up', change: 0 },
      { name: 'Compliance Score', value: 0, unit: '%', trend: 'up', change: 0 },
    ],
    
    // Critical expirations - empty array
    criticalExpirations: [],
    
    // Lease renewal timeline - structure with zeros
    leaseRenewalTimeline: [
      { days: '0-30', count: 0, revenue: 0 },
      { days: '31-60', count: 0, revenue: 0 },
      { days: '61-90', count: 0, revenue: 0 },
      { days: '91-120', count: 0, revenue: 0 },
      { days: '121-180', count: 0, revenue: 0 },
      { days: '181-365', count: 0, revenue: 0 },
      { days: '365+', count: 0, revenue: 0 },
    ],
    
    // Production by well type - structure with zeros
    productionByWellType: [
      { name: 'Horizontal Wells', value: 0, color: '#3B82F6' },
      { name: 'Vertical Wells', value: 0, color: '#10B981' },
      { name: 'Directional Wells', value: 0, color: '#F59E0B' },
      { name: 'Injection Wells', value: 0, color: '#8B5CF6' },
    ],
    
    // Lease statuses - structure with zeros
    leaseStatuses: [
      { status: 'Active', count: 0, color: 'text-green-500' },
      { status: 'Pending', count: 0, color: 'text-yellow-500' },
      { status: 'Under Review', count: 0, color: 'text-blue-500' },
      { status: 'Expiring Soon', count: 0, color: 'text-orange-500' },
    ],
    
    // Active workflows - empty array
    activeWorkflows: [],
    
    // Land leases - empty array
    landLeases: [],
    
    // Financial data - empty structures
    revenueData: [],
    revenueAtRisk: [],
    profitabilityByField: [],
    
    // Compliance data - empty structure
    compliance: {
      categories: [
        {
          id: 1,
          category: 'Environmental Compliance',
          score: 0,
          lastAudit: null,
          issues: 0,
          resolved: 0,
          requirements: []
        },
        // ... other categories
      ]
    }
  };
}
```

## Step 3: Overview Tab Components

### Critical Lease Expirations Component
```typescript
{/* Critical Lease Expirations - EXACT copy from demo */}
<Card variant="glass" effect="glow">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Critical Lease Expirations - Next 365 Days</span>
      <span className="text-sm text-red-500">Action Required</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    {dashboardData.criticalExpirations.length > 0 ? (
      <div className="space-y-4">
        {dashboardData.criticalExpirations.map((expiration: any, index: number) => (
          // EXACT copy of expiration card from demo
        ))}
      </div>
    ) : (
      // Empty state
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400 mb-4">No critical lease expirations found</p>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setActiveTab('data-ingestion')}
        >
          Ingest Data to Monitor Expirations
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

### Lease Renewal Timeline Chart
```typescript
<Card variant="glass" effect="glow">
  <CardHeader>
    <CardTitle>Lease Renewal Timeline</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={dashboardData.leaseRenewalTimeline}>
        {/* EXACT chart configuration from demo */}
      </BarChart>
    </ResponsiveContainer>
    {!hasIngestedData && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    )}
  </CardContent>
</Card>
```

### VANGUARDS Active Workflows
```typescript
<Card variant="glass-dark" effect="float">
  <CardHeader>
    <CardTitle>VANGUARDS Active Workflows</CardTitle>
  </CardHeader>
  <CardContent>
    {dashboardData.activeWorkflows.length > 0 ? (
      <div className="space-y-3">
        {dashboardData.activeWorkflows.map((workflow: any, index: number) => (
          // EXACT copy of workflow card from demo
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <CogIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400 mb-2">No active workflows</p>
        <p className="text-sm text-gray-500">Workflows will appear after data ingestion</p>
      </div>
    )}
  </CardContent>
</Card>
```

## Step 4: Data Ingestion Tab

```typescript
{activeTab === 'data-ingestion' && (
  <div className="space-y-6">
    {/* Data Source Selection */}
    <Card variant="glass" effect="glow">
      <CardHeader>
        <CardTitle>Select Data Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-2 border-transparent hover:border-seraphim-gold"
            onClick={() => setDataSource('file')}
          >
            <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-seraphim-gold" />
            <h3 className="text-lg font-semibold text-white mb-2">Upload File</h3>
            <p className="text-sm text-gray-400">CSV, JSON, or Excel files</p>
          </button>
          
          <button
            className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-2 border-transparent hover:border-seraphim-gold"
            onClick={() => setDataSource('api')}
          >
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-seraphim-gold" />
            <h3 className="text-lg font-semibold text-white mb-2">API Connection</h3>
            <p className="text-sm text-gray-400">Connect to external data source</p>
          </button>
        </div>
      </CardContent>
    </Card>

    {/* File Upload or API Configuration */}
    {/* Data Preview */}
    {/* Process Button */}
  </div>
)}
```

## Step 5: Data Flow Implementation

```typescript
const handleDataIngestion = async (ingestedData: any) => {
  try {
    // Transform ingested data to dashboard format
    const transformedData = await oilfieldDataTransformer.transform(ingestedData);
    
    // Update dashboard state
    setDashboardData(transformedData);
    setHasIngestedData(true);
    
    // Store in Zustand for persistence
    useDashboardStore.setState({
      oilfieldData: transformedData,
      lastUpdated: new Date().toISOString()
    });
    
    // Switch to overview tab to show results
    setActiveTab('overview');
    
    // Show success notification
    toast.success('Data successfully ingested and processed!');
  } catch (error) {
    toast.error('Failed to process data. Please check the format.');
  }
};
```

## Step 6: Empty State Components

Create reusable empty state components:

```typescript
const EmptyStateCard: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 mb-4">{description}</p>
    {actionLabel && onAction && (
      <Button variant="secondary" size="small" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
```

## Key Implementation Notes

1. **EXACT COPY**: Every component must match the demo dashboard exactly
2. **Tab Order**: Overview, Data Ingestion (NEW), Land Leases, Compliance, Financial, Analytics, Operations
3. **Empty States**: All data fields start at 0 or empty arrays
4. **CTAs**: Empty states should guide users to the Data Ingestion tab
5. **Data Flow**: Ingested data populates ALL tabs simultaneously
6. **Styling**: Use exact same classes and styles from demo

## Testing Checklist

- [ ] All 7 tabs are present and clickable
- [ ] Overview tab matches demo layout exactly
- [ ] Empty states show appropriate messages
- [ ] Data Ingestion tab allows file upload and API connection
- [ ] After ingestion, all tabs populate with data
- [ ] Charts and visualizations render correctly
- [ ] Expandable sections work (lease status list)
- [ ] All styling matches demo (colors, spacing, fonts)