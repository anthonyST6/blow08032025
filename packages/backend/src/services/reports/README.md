# Unified Report System

## Quick Start

### Generate a Report

```typescript
import { UnifiedReportsService } from './unified-reports.service';

const reportsService = new UnifiedReportsService();

// Generate a report
const report = await reportsService.generateReport(
  'oilfield-lease',
  {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    region: 'Permian Basin',
    includeFinancials: true
  },
  'pdf'
);
```

### Available Use Cases

The system supports 50 use cases across 11 industry verticals:

- **Energy & Utilities**: 14 use cases
- **Healthcare & Life Sciences**: 5 use cases
- **Financial Services**: 5 use cases
- **Manufacturing & Industry 4.0**: 3 use cases
- **Retail & E-commerce**: 3 use cases
- **Logistics & Transportation**: 3 use cases
- **Education & EdTech**: 3 use cases
- **Pharmaceutical & Biotech**: 3 use cases
- **Government & Public Sector**: 5 use cases
- **Telecommunications**: 3 use cases
- **Real Estate**: 1 use case
- **All Verticals**: 4 use cases

## Service Structure

```
services/reports/
├── unified-reports.service.ts      # Main orchestration service
├── report-config.service.ts        # Configuration management
├── domains/                        # Domain-specific services
│   ├── energy-reports.service.ts
│   ├── healthcare-reports.service.ts
│   ├── financial-reports.service.ts
│   ├── manufacturing-reports.service.ts
│   ├── retail-reports.service.ts
│   ├── logistics-reports.service.ts
│   ├── education-reports.service.ts
│   ├── pharma-reports.service.ts
│   ├── government-reports.service.ts
│   ├── telecom-reports.service.ts
│   ├── realestate-reports.service.ts
│   └── allverticals-reports.service.ts
└── README.md                       # This file
```

## Adding a New Report

1. **Define the use case** in the appropriate domain service:

```typescript
// In energy-reports.service.ts
async generateNewEnergyReport(params: any): Promise<any> {
  // Implementation
}
```

2. **Add configuration** in report-config.service.ts:

```typescript
'new-energy-report': {
  name: 'New Energy Report',
  vertical: 'energy',
  parameters: [
    // Define parameters
  ]
}
```

3. **Map in unified service**:

```typescript
// In unified-reports.service.ts
case 'new-energy-report':
  return await energyService.generateNewEnergyReport(parameters);
```

## Report Formats

All reports support 4 output formats:

1. **PDF** - Professional documents with charts
2. **Excel** - Multi-sheet workbooks with data
3. **JSON** - Structured data for APIs
4. **Text** - Plain text for emails/logs

## Testing

Run tests with:

```bash
npm test -- unified-reports.service.spec.ts
```

## API Endpoints

- `GET /api/reports/use-cases` - List all use cases
- `GET /api/reports/config/:useCaseId` - Get report config
- `POST /api/reports/generate` - Generate a report

## Frontend Integration

The `SimpleReportGenerator` component provides a complete UI for report generation:

```tsx
import { SimpleReportGenerator } from '@/components/SimpleReportGenerator';

// In your component
<SimpleReportGenerator />
```

## Performance Tips

1. Use appropriate date ranges (avoid > 1 year)
2. Implement caching for frequently generated reports
3. Consider async generation for large reports
4. Use pagination for data-heavy reports

## Support

For issues or questions:
- Check the main documentation: `/docs/unified-report-system.md`
- Review test files for examples
- Contact the development team

## License

Copyright © 2024 Seraphim Vanguards. All rights reserved.