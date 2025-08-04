# Oilfield Land Lease Run Dashboard Architecture

## Current State vs Target State

### Current Run Dashboard (INCORRECT)
- Only 4 tabs: Overview, Data Ingestion, Analytics, Operations
- Generic metrics display
- Basic data ingestion interface
- No specific oilfield components

### Target Run Dashboard (MUST MATCH DEMO)
- 7 tabs: Overview, Data Ingestion, Land Leases, Compliance, Financial, Analytics, Operations
- Exact same components as demo dashboard
- All demo visualizations with empty states
- Data flows from ingestion to populate all components

## Required Components (From Demo Dashboard)

### 1. Overview Tab Components

#### A. Key Metrics Cards (4 cards)
```typescript
{
  name: 'Total Leases',
  value: 0, // Empty state
  unit: '',
  trend: 'up',
  change: 0
}
```

#### B. Critical Lease Expirations Section
- Red/yellow alert boxes
- Fields: name, wells, daysUntilExpiry, currentRate, marketRate, productionImpact, renewalStatus
- Empty state: "No critical expirations. Ingest data to monitor lease expirations."

#### C. Lease Renewal Timeline (Bar Chart)
- Dual-axis chart (count + revenue)
- Time periods: 0-30, 31-60, 61-90, 91-120, 121-180, 181-365, 365+
- Empty state: Show chart axes with no data

#### D. Production Revenue by Well Type (Pie Chart)
- Categories: Horizontal, Vertical, Directional, Injection
- Empty state: Show legend with 0% for all categories

#### E. Lease Status Distribution
- Expandable list with statuses: Active, Pending, Under Review, Expiring Soon
- Shows count and progress bar for each
- Clicking expands to show individual leases
- Empty state: All counts at 0

#### F. VANGUARDS Active Workflows
- List of workflows with name, priority, progress bar, status
- Empty state: "No active workflows. Workflows will appear after data ingestion."

### 2. Land Leases Tab
- Inventory table with columns: Property ID, Location, Type, Status, Annual Payment, Actions
- Details panel on the right when lease is selected
- Empty state: "No lease data available. Please ingest data to view lease inventory."

### 3. Compliance Tab
- 4 category cards: Environmental, Regulatory, Safety, Financial
- Each shows score, last audit, issues, requirements list
- Empty state: All scores at 0%, no audit dates

### 4. Financial Tab
- Revenue Breakdown card
- Expense Breakdown card
- Projections card
- Monthly Revenue Trend chart (Area chart)
- Revenue at Risk chart
- Profitability by Field chart

### 5. Analytics Tab
- Performance metrics
- AI model performance

### 6. Operations Tab
- System status
- Use case information

## Data Structure for Empty State

```typescript
const emptyOilfieldData = {
  // Overview metrics
  metrics: [
    { name: 'Total Leases', value: 0, unit: '', trend: 'up', change: 0 },
    { name: 'Total Acres', value: 0, unit: '', trend: 'up', change: 0 },
    { name: 'Annual Revenue', value: 0, unit: 'M', trend: 'up', change: 0 },
    { name: 'Compliance Score', value: 0, unit: '%', trend: 'up', change: 0 },
  ],
  
  // Critical expirations
  criticalExpirations: [],
  
  // Charts data
  leaseRenewalTimeline: [
    { days: '0-30', count: 0, revenue: 0 },
    { days: '31-60', count: 0, revenue: 0 },
    { days: '61-90', count: 0, revenue: 0 },
    { days: '91-120', count: 0, revenue: 0 },
    { days: '121-180', count: 0, revenue: 0 },
    { days: '181-365', count: 0, revenue: 0 },
    { days: '365+', count: 0, revenue: 0 },
  ],
  
  productionByWellType: [
    { name: 'Horizontal Wells', value: 0, color: '#3B82F6' },
    { name: 'Vertical Wells', value: 0, color: '#10B981' },
    { name: 'Directional Wells', value: 0, color: '#F59E0B' },
    { name: 'Injection Wells', value: 0, color: '#8B5CF6' },
  ],
  
  leaseStatuses: [
    { status: 'Active', count: 0, color: 'text-green-500' },
    { status: 'Pending', count: 0, color: 'text-yellow-500' },
    { status: 'Under Review', count: 0, color: 'text-blue-500' },
    { status: 'Expiring Soon', count: 0, color: 'text-orange-500' },
  ],
  
  activeWorkflows: [],
  
  // Land leases inventory
  landLeases: [],
  
  // Financial data
  revenueData: [],
  revenueAtRisk: [],
  profitabilityByField: [],
  
  // Compliance data
  compliance: {
    categories: []
  }
};
```

## Implementation Approach

### Phase 1: Copy Demo Structure
1. Extract the exact JSX from UseCaseDashboard.tsx (lines 4858-5141)
2. Create new OilfieldLandLeaseRunDashboard.tsx
3. Add all 7 tabs with exact same layout

### Phase 2: Add Empty States
1. Replace all data with empty arrays/zero values
2. Add placeholder messages for each section
3. Add "Ingest Data" CTAs throughout

### Phase 3: Connect Data Flow
1. When data is ingested in Data Ingestion tab
2. Transform using oilfieldDataTransformer.service.ts
3. Update all components with live data
4. Remove empty state messages

## Key Implementation Files

1. **OilfieldLandLeaseRunDashboard.tsx** - Main dashboard component
2. **EmptyStateComponents.tsx** - Reusable empty state components
3. **OilfieldDataIngestion.tsx** - Enhanced data ingestion tab
4. **oilfieldDataTransformer.service.ts** - Transform ingested data to dashboard format

## Success Metrics
- [ ] All 7 tabs present and functional
- [ ] Every component from demo is replicated
- [ ] Empty states are clear and actionable
- [ ] Data flows correctly from ingestion
- [ ] UI matches demo exactly (colors, spacing, layout)