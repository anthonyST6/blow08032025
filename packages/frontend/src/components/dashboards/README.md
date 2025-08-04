# Oilfield Land Lease Run Dashboard Implementation

## Overview
The OilfieldLandLeaseRunDashboard is a custom dashboard that provides an exact pixel-for-pixel replication of the DEMO dashboard with one key addition: a "Data Ingestion" button at the far right of the header.

## Implementation Details

### 1. Component Structure
- **OilfieldLandLeaseRunDashboard.tsx**: The main custom dashboard component
- **DashboardTemplateWithIngestion.tsx**: A wrapper component that extends DashboardTemplate to add the Data Ingestion button

### 2. Key Features
- Exact visual replication of the DEMO dashboard (OilfieldLandLeaseDashboard.tsx)
- Data Ingestion button positioned at the far right of the header
- Support for 100 dynamic lease data points
- Real-time updates and interactive visualizations
- Responsive design matching the original

### 3. Technical Implementation

#### DashboardTemplateWithIngestion
This component wraps the standard DashboardTemplate and adds a Data Ingestion button without duplicating the header:

```tsx
const DashboardTemplateWithIngestion: React.FC<DashboardTemplateProps> = ({ config }) => {
  return (
    <DashboardTemplate
      config={config}
      renderCustomHeader={() => (
        <Button
          variant="primary"
          onClick={() => console.log('Data Ingestion clicked')}
          className="flex items-center"
        >
          <CloudArrowUpIcon className="w-4 h-4 mr-2" />
          Data Ingestion
        </Button>
      )}
    />
  );
};
```

#### Use Case ID Mapping
The system handles both raw use case IDs and prefixed IDs:
- Raw ID: `oilfield-land-lease`
- Prefixed ID: `energy-oilfield-land-lease`

The UseCaseRunDashboard.tsx has been updated to handle both formats:
```tsx
// Search for use cases with both ID formats
const useCase = vertical.useCases.find(uc => 
  uc.id === useCaseId || `${verticalId}-${uc.id}` === useCaseId
);

// Custom dashboard lookup also checks both IDs
const CustomDashboard = customDashboards[selectedUseCase.id] || customDashboards[useCaseId || ''];
```

### 4. Navigation Flow
1. User selects "Oilfield Land Lease" from the Use Case Launcher
2. Navigation URL: `/use-case/energy-oilfield-land-lease/run`
3. UseCaseRunDashboard finds the use case by checking both ID formats
4. Custom dashboard is loaded via the customDashboards mapping
5. OilfieldLandLeaseRunDashboard renders with the Data Ingestion button

### 5. Testing Routes
- Production route: `/use-case/energy-oilfield-land-lease/run`
- Test route: `/test-oilfield` (bypasses authentication)

### 6. Data Flow
- Dashboard receives use case data via props
- Generates 100 dynamic lease entries with realistic data
- Updates visualizations in real-time
- Data Ingestion button ready for future integration

## Future Enhancements
1. Connect Data Ingestion button to actual data ingestion workflow
2. Add file upload and API integration capabilities
3. Implement real-time data streaming
4. Add export functionality for processed data

## Troubleshooting
If the custom dashboard doesn't load:
1. Check that the use case ID mapping includes both formats in customDashboards
2. Verify the import statement in UseCaseRunDashboard.tsx
3. Ensure the component is exported as default
4. Check browser console for any runtime errors