# Unified Report System Documentation

## Overview

The Unified Report System is a comprehensive solution for generating customizable reports across all 50 use cases in the Seraphim Vanguards platform. It supports 11 industry verticals with domain-specific report templates, dynamic parameter configuration, and multiple output formats.

## Architecture

### System Components

1. **Backend Services**
   - `unified-reports.service.ts` - Central orchestration service
   - `report-config.service.ts` - Parameter configuration and validation
   - Domain-specific report services (11 verticals)
   - Mock data generators for testing

2. **Frontend Components**
   - `SimpleReportGenerator.tsx` - Main UI component
   - Integration with Mission Control V2 dashboard
   - Real-time report generation interface

3. **API Endpoints**
   - `GET /api/reports/use-cases` - List all available use cases
   - `GET /api/reports/config/:useCaseId` - Get report configuration
   - `POST /api/reports/generate` - Generate report with parameters

## Supported Use Cases (50 Total)

### 1. Energy & Utilities (14 use cases)
- Oilfield Land Lease Management
- Grid Anomaly Detection
- Renewable Energy Optimization
- Drilling Risk Assessment
- Environmental Compliance
- Load Forecasting
- PHMSA Compliance Automation
- Methane Leak Detection
- Grid Resilience & Outage Response
- Internal Audit and Governance
- SCADA-Legacy Integration
- Predictive Grid Resilience & Orchestration
- Energy Supply Chain Cyber Defense
- Wildfire Prevention & Infrastructure Risk

### 2. Healthcare & Life Sciences (5 use cases)
- Patient Risk Stratification
- Clinical Trial Matching
- Treatment Recommendation
- Diagnosis Assistant
- Medical Supply Chain & Crisis Orchestration

### 3. Financial Services (5 use cases)
- Real-time Fraud Detection
- AI Credit Scoring
- Portfolio Optimization
- AML Transaction Monitoring
- Insurance Risk Assessment

### 4. Manufacturing & Industry 4.0 (3 use cases)
- Predictive Maintenance
- Automated Quality Inspection
- Supply Chain Optimization

### 5. Retail & E-commerce (3 use cases)
- Demand Forecasting
- Customer Personalization
- Dynamic Price Optimization

### 6. Logistics & Transportation (3 use cases)
- Dynamic Route Optimization
- Predictive Fleet Maintenance
- Warehouse Automation

### 7. Education & EdTech (3 use cases)
- Adaptive Learning Paths
- Student Performance Prediction
- Smart Content Recommendation

### 8. Pharmaceutical & Biotech (3 use cases)
- AI-Assisted Drug Discovery
- Clinical Trial Optimization
- Adverse Event Detection

### 9. Government & Public Sector (5 use cases)
- Coordinated Emergency Response Orchestration
- National Critical Infrastructure Coordination
- Smart Citizen Services
- Public Safety Analytics
- Resource Optimization

### 10. Telecommunications (3 use cases)
- Network Performance Optimization
- Customer Churn Prevention
- Network Security Monitoring

### 11. Real Estate (1 use case)
- AI Pricing Governance

### 12. All Verticals (4 use cases)
- Cross-Industry Analytics
- Universal Compliance Engine
- Multi-Vertical Optimization
- Industry Benchmarking

## Report Configuration

### Parameter Types

1. **Date Range**
   - Start and end date selection
   - Validation for logical date ranges
   - Support for preset ranges (Last 7 days, Last 30 days, etc.)

2. **Dropdown Selection**
   - Single and multi-select options
   - Dynamic option loading
   - Validation for required selections

3. **Number Input**
   - Min/max value validation
   - Step increments
   - Format validation (integer, decimal)

4. **Text Input**
   - Pattern validation (regex)
   - Length constraints
   - Required field validation

5. **Boolean Toggle**
   - Yes/No selections
   - Default value support

### Configuration Example

```typescript
{
  useCaseId: 'oilfield-lease',
  parameters: [
    {
      id: 'dateRange',
      type: 'dateRange',
      label: 'Report Period',
      required: true,
      validation: {
        maxRange: 365 // days
      }
    },
    {
      id: 'region',
      type: 'dropdown',
      label: 'Region',
      required: true,
      options: ['Permian Basin', 'Eagle Ford', 'Bakken', 'All Regions']
    },
    {
      id: 'includeFinancials',
      type: 'boolean',
      label: 'Include Financial Analysis',
      defaultValue: true
    }
  ]
}
```

## Report Formats

### 1. PDF Format
- Professional layout with headers and footers
- Charts and visualizations
- Page breaks for sections
- Embedded metadata

### 2. Excel Format
- Multiple worksheets for different sections
- Formatted tables with headers
- Charts and pivot tables
- Data validation and formulas

### 3. JSON Format
- Structured data output
- Nested objects for complex data
- ISO date formats
- UTF-8 encoding

### 4. Text Format
- Plain text with formatting
- ASCII tables for data
- Section separators
- Suitable for email/logging

## Implementation Details

### Backend Service Structure

```typescript
// Unified Reports Service
export class UnifiedReportsService {
  async generateReport(useCaseId: string, parameters: any, format: string) {
    // 1. Validate use case
    // 2. Get domain service
    // 3. Generate report data
    // 4. Format output
    // 5. Return report
  }
}

// Domain-Specific Service Example
export class EnergyReportsService {
  async generateOilfieldLeaseReport(params: any) {
    // 1. Fetch data
    // 2. Process analytics
    // 3. Generate insights
    // 4. Return structured data
  }
}
```

### Frontend Component Integration

```typescript
// SimpleReportGenerator Component
const SimpleReportGenerator: React.FC = () => {
  // 1. Load use cases
  // 2. Get configuration
  // 3. Render parameter form
  // 4. Handle generation
  // 5. Download report
};

// Integration in Mission Control V2
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
  <h5 className="text-sm font-semibold text-gray-400 mb-4">
    Generate New Report
  </h5>
  <SimpleReportGenerator />
</div>
```

## API Reference

### List Use Cases
```http
GET /api/reports/use-cases
Authorization: Bearer {token}

Response:
{
  "useCases": [
    {
      "id": "oilfield-lease",
      "name": "Oilfield Land Lease Management",
      "vertical": "energy",
      "description": "Comprehensive lease portfolio analysis"
    }
  ]
}
```

### Get Report Configuration
```http
GET /api/reports/config/oilfield-lease
Authorization: Bearer {token}

Response:
{
  "useCaseId": "oilfield-lease",
  "parameters": [...],
  "formats": ["pdf", "excel", "json", "text"]
}
```

### Generate Report
```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "useCaseId": "oilfield-lease",
  "format": "pdf",
  "parameters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "region": "Permian Basin"
  }
}

Response:
{
  "reportId": "rpt_123456",
  "format": "pdf",
  "size": 2457600,
  "downloadUrl": "/api/reports/download/rpt_123456"
}
```

## Security Considerations

1. **Authentication**
   - All endpoints require valid JWT token
   - Role-based access control (RBAC)
   - Audit logging for all report generation

2. **Data Security**
   - Encryption in transit (HTTPS)
   - Encryption at rest for stored reports
   - Automatic report expiration (30 days)

3. **Input Validation**
   - Parameter sanitization
   - SQL injection prevention
   - XSS protection

## Performance Optimization

1. **Caching**
   - Configuration caching (1 hour)
   - Report template caching
   - Data query result caching

2. **Async Processing**
   - Queue-based report generation for large reports
   - Progress tracking via WebSocket
   - Email notification on completion

3. **Resource Management**
   - Connection pooling
   - Memory limits for report generation
   - Concurrent request throttling

## Error Handling

### Common Error Codes

- `400` - Invalid parameters
- `401` - Unauthorized access
- `403` - Insufficient permissions
- `404` - Use case not found
- `422` - Validation error
- `500` - Server error
- `503` - Service unavailable

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Start date must be before end date",
    "details": {
      "field": "dateRange",
      "constraint": "chronological"
    }
  }
}
```

## Testing

### Unit Tests
- Parameter validation tests
- Report generation logic tests
- Format conversion tests
- Mock data generation tests

### Integration Tests
- API endpoint tests
- Database integration tests
- File system operations tests
- Authentication/authorization tests

### E2E Tests
- Complete report generation flow
- UI interaction tests
- Download functionality tests
- Error scenario tests

## Deployment

### Environment Variables
```env
REPORT_STORAGE_PATH=/var/reports
REPORT_RETENTION_DAYS=30
MAX_REPORT_SIZE_MB=50
CONCURRENT_REPORT_LIMIT=10
```

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Monitoring
- Report generation metrics (Prometheus)
- Error rate monitoring (Sentry)
- Performance tracking (New Relic)
- Storage usage alerts

## Future Enhancements

1. **Scheduled Reports**
   - Cron-based scheduling
   - Email delivery
   - Report subscriptions

2. **Report Templates**
   - Custom branding
   - User-defined templates
   - Template marketplace

3. **Advanced Analytics**
   - Machine learning insights
   - Predictive analytics
   - Anomaly detection

4. **Collaboration Features**
   - Report sharing
   - Comments and annotations
   - Version control

5. **Mobile Support**
   - Responsive report viewer
   - Mobile app integration
   - Offline report access

## Support

For questions or issues:
- Documentation: `/docs/unified-report-system.md`
- API Reference: `/api/docs`
- Support Email: support@seraphim.ai
- Issue Tracker: GitHub Issues

## License

Copyright © 2024 Seraphim Vanguards. All rights reserved.