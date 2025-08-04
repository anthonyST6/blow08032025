# Seraphim Vanguards POC Mock Data & Models

## Data Models

### 1. Base Session Model
```typescript
interface VanguardSession {
  sessionId: string;
  verticalId: 'energy' | 'government' | 'insurance' | 'finance' | 'healthcare';
  useCaseId: string;
  userId: string;
  organizationId: string;
  status: 'initializing' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  documents: Document[];
  vanguardResults: {
    security: SecurityResult;
    integrity: IntegrityResult;
    accuracy: AccuracyResult;
  };
  finalReport: FinalReport;
  metadata: {
    totalDocuments: number;
    processingTime: number;
    estimatedValue: number;
    riskScore: number;
  };
}
```

### 2. Document Model
```typescript
interface Document {
  documentId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'image' | 'text';
  fileSize: number;
  uploadTime: Date;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  extractedText?: string;
  metadata: {
    pageCount?: number;
    author?: string;
    createdDate?: Date;
    modifiedDate?: Date;
    digitalSignature?: boolean;
  };
  processingResults: {
    security: SecurityFinding[];
    integrity: IntegrityFinding[];
    accuracy: AccuracyFinding[];
  };
}
```

### 3. Vanguard Result Models
```typescript
interface SecurityResult {
  agentId: 'security-sentinel';
  processingTime: number;
  overallScore: number; // 0-100
  findings: SecurityFinding[];
  summary: {
    documentsVerified: number;
    documentsFlagger: number;
    criticalIssues: number;
    recommendations: string[];
  };
}

interface IntegrityResult {
  agentId: 'integrity-auditor';
  processingTime: number;
  overallScore: number; // 0-100
  findings: IntegrityFinding[];
  crossReferences: CrossReference[];
  summary: {
    discrepanciesFound: number;
    dataConflicts: number;
    complianceIssues: number;
    financialImpact: number;
  };
}

interface AccuracyResult {
  agentId: 'accuracy-engine';
  processingTime: number;
  overallScore: number; // 0-100
  findings: AccuracyFinding[];
  calculations: Calculation[];
  summary: {
    errorsCorreected: number;
    deadlinesIdentified: number;
    criticalDates: Date[];
    accuracyRate: number;
  };
}
```

## Mock API Responses

### 1. Energy - Oil & Gas Lease Audit

#### POST /api/sessions/create
```json
{
  "sessionId": "sess_energy_20240117_001",
  "verticalId": "energy",
  "useCaseId": "oil-gas-lease-audit",
  "status": "initializing",
  "startTime": "2024-01-17T10:00:00Z",
  "metadata": {
    "totalDocuments": 3300,
    "estimatedProcessingTime": 14400,
    "organizationName": "MidTex Energy Partners"
  }
}
```

#### GET /api/sessions/{sessionId}/status (Security Processing)
```json
{
  "sessionId": "sess_energy_20240117_001",
  "status": "processing",
  "currentAgent": "security-sentinel",
  "progress": 45,
  "currentFindings": {
    "documentsProcessed": 1485,
    "issuesFound": 11,
    "estimatedTimeRemaining": 7920
  },
  "liveUpdates": [
    {
      "timestamp": "2024-01-17T10:15:23Z",
      "message": "Detected altered signature on lease TX-2019-4521",
      "severity": "high"
    },
    {
      "timestamp": "2024-01-17T10:16:45Z",
      "message": "Expired notarization found on lease NM-2020-8934",
      "severity": "medium"
    }
  ]
}
```

#### GET /api/sessions/{sessionId}/results (Complete)
```json
{
  "sessionId": "sess_energy_20240117_001",
  "status": "completed",
  "completionTime": "2024-01-17T14:00:00Z",
  "processingTime": 14400,
  "vanguardResults": {
    "security": {
      "agentId": "security-sentinel",
      "processingTime": 4800,
      "overallScore": 92,
      "findings": [
        {
          "findingId": "sec_001",
          "documentId": "doc_lease_tx_4521",
          "type": "altered_document",
          "severity": "high",
          "description": "Digital signature timestamp inconsistent with document creation date",
          "recommendation": "Manual verification required"
        }
      ],
      "summary": {
        "documentsVerified": 3277,
        "documentsFlagger": 23,
        "criticalIssues": 2,
        "recommendations": [
          "Implement digital signature validation for all new leases",
          "Review all flagged documents with legal team"
        ]
      }
    },
    "integrity": {
      "agentId": "integrity-auditor",
      "processingTime": 4800,
      "overallScore": 78,
      "findings": [
        {
          "findingId": "int_001",
          "type": "boundary_overlap",
          "severity": "high",
          "affectedLeases": ["TX-2019-4521", "TX-2019-4522"],
          "description": "GPS coordinates indicate 47-acre overlap between adjacent leases",
          "financialImpact": 340000,
          "recommendation": "Immediate survey required"
        },
        {
          "findingId": "int_002",
          "type": "royalty_discrepancy",
          "severity": "high",
          "affectedLeases": ["TX-2020-series"],
          "description": "Royalty calculations inconsistent with production reports",
          "financialImpact": 12300000,
          "recommendation": "Recalculate all royalties for 2020-2023"
        }
      ],
      "summary": {
        "discrepanciesFound": 270,
        "dataConflicts": 147,
        "complianceIssues": 34,
        "financialImpact": 12300000
      }
    },
    "accuracy": {
      "agentId": "accuracy-engine",
      "processingTime": 4800,
      "overallScore": 85,
      "findings": [
        {
          "findingId": "acc_001",
          "type": "expiration_alert",
          "severity": "critical",
          "affectedLeases": 45,
          "description": "45 leases expire within 30 days",
          "deadlines": [
            "2024-01-25: 12 leases",
            "2024-02-01: 18 leases",
            "2024-02-15: 15 leases"
          ],
          "recommendation": "Initiate renewal process immediately"
        }
      ],
      "summary": {
        "errorsCorreected": 301,
        "deadlinesIdentified": 279,
        "criticalDates": [
          "2024-01-25T00:00:00Z",
          "2024-02-01T00:00:00Z"
        ],
        "accuracyRate": 99.3
      }
    }
  },
  "finalReport": {
    "executiveSummary": {
      "totalValue": 450000000,
      "valueAtRisk": 46300000,
      "immediateActions": 45,
      "potentialRecovery": 12300000,
      "complianceScore": 85,
      "recommendations": [
        "Address 45 expiring leases immediately",
        "Recover $12.3M in underpaid royalties",
        "Resolve 147 boundary conflicts",
        "Update 156 contact records"
      ]
    },
    "financialImpact": {
      "potentialLossPrevented": 34000000,
      "recoveryOpportunity": 12300000,
      "costSavings": 1800000,
      "totalROI": 847
    },
    "actionPlan": {
      "immediate": [
        {
          "action": "Renew expiring leases",
          "count": 45,
          "deadline": "2024-01-25",
          "assignedTo": "Land Management Team",
          "estimatedValue": 34000000
        }
      ],
      "shortTerm": [
        {
          "action": "Audit royalty payments",
          "count": 89,
          "deadline": "2024-03-01",
          "assignedTo": "Finance Team",
          "estimatedValue": 12300000
        }
      ],
      "longTerm": [
        {
          "action": "Resolve boundary disputes",
          "count": 147,
          "deadline": "2024-06-01",
          "assignedTo": "Legal Team",
          "estimatedValue": 8700000
        }
      ]
    }
  }
}
```

### 2. Government - LED Project Mock Response

#### GET /api/sessions/{sessionId}/results
```json
{
  "sessionId": "sess_gov_20240117_001",
  "status": "completed",
  "vanguardResults": {
    "security": {
      "summary": {
        "documentsVerified": 119,
        "documentsFlagger": 8,
        "criticalIssues": 3,
        "findings": [
          "3 contractors with potential conflicts of interest",
          "8 incomplete bond documents",
          "All federal compliance docs validated"
        ]
      }
    },
    "integrity": {
      "summary": {
        "discrepanciesFound": 3247,
        "dataConflicts": 15,
        "complianceIssues": 0,
        "findings": [
          "3,247 streetlights with incorrect GPS coordinates",
          "100% Buy American Act compliance verified",
          "$8.7M annual energy savings validated"
        ]
      }
    },
    "accuracy": {
      "summary": {
        "errorsCorreected": 156,
        "optimizationsFound": 23,
        "savingsIdentified": 2300000,
        "findings": [
          "Timeline optimized for weather constraints",
          "67% energy reduction confirmed",
          "$2.3M bulk purchasing opportunity"
        ]
      }
    }
  },
  "dashboardUrl": "/dashboard/gov/sess_gov_20240117_001"
}
```

### 3. Insurance - Hurricane Claims Mock Response

#### Real-time Processing Stream (WebSocket)
```json
{
  "type": "processing_update",
  "sessionId": "sess_ins_20240117_001",
  "timestamp": "2024-01-17T10:30:45Z",
  "metrics": {
    "totalClaims": 127000,
    "processed": 45678,
    "fraudDetected": 2890,
    "autoApproved": 8234,
    "processingRate": 3500,
    "estimatedCompletion": "2024-01-17T14:30:00Z"
  },
  "alerts": [
    {
      "type": "fraud_cluster",
      "severity": "high",
      "description": "Unusual claim pattern detected in ZIP 33139",
      "affectedClaims": 234,
      "potentialLoss": 4500000
    }
  ]
}
```

### 4. Mock Dashboard Data

#### Energy Dashboard
```json
{
  "dashboardId": "energy_lease_dashboard",
  "widgets": [
    {
      "type": "map",
      "title": "Lease Portfolio Overview",
      "data": {
        "totalLeases": 3300,
        "activeLeases": 3055,
        "expiringLeases": 245,
        "disputedAreas": 147,
        "heatmapData": "base64_encoded_geojson"
      }
    },
    {
      "type": "timeline",
      "title": "Critical Deadlines",
      "data": {
        "events": [
          {
            "date": "2024-01-25",
            "title": "12 Leases Expire",
            "value": 8900000,
            "severity": "critical"
          }
        ]
      }
    },
    {
      "type": "financial",
      "title": "Financial Impact Summary",
      "data": {
        "totalPortfolioValue": 450000000,
        "valueAtRisk": 46300000,
        "recoveryOpportunity": 12300000,
        "projectedSavings": 1800000
      }
    }
  ]
}
```

## Mock User Interactions

### 1. Document Upload Simulation
```javascript
// Frontend simulation
const mockUpload = {
  files: [
    { name: "Lease_TX_2019_4521.pdf", size: 2456789, status: "uploading" },
    { name: "Lease_TX_2019_4522.pdf", size: 1987654, status: "queued" },
    // ... 3298 more files
  ],
  progress: {
    uploaded: 1234,
    processing: 456,
    completed: 778,
    failed: 2,
    remaining: 1830
  }
};
```

### 2. Real-time Finding Alert
```javascript
// WebSocket message
{
  "type": "critical_finding",
  "agent": "integrity-auditor",
  "finding": {
    "title": "Major Royalty Discrepancy Detected",
    "description": "Production reports show 45% higher output than royalty calculations",
    "financialImpact": 3400000,
    "affectedDocuments": 23,
    "recommendation": "Immediate audit required",
    "confidence": 0.97
  }
}
```

### 3. Export Options
```javascript
const exportFormats = {
  "pdf": {
    "executive": "Executive Summary (2 pages)",
    "detailed": "Full Report (45 pages)",
    "technical": "Technical Appendix (120 pages)"
  },
  "excel": {
    "findings": "All Findings Spreadsheet",
    "financial": "Financial Impact Analysis",
    "action_items": "Prioritized Action List"
  },
  "api": {
    "webhook": "Configure real-time updates",
    "rest": "RESTful API access",
    "graphql": "GraphQL endpoint"
  }
};
```

## Performance Metrics

### Processing Benchmarks
```json
{
  "documentTypes": {
    "pdf": {
      "averageSize": 2.3,
      "processingRate": 125,
      "accuracyRate": 99.7
    },
    "scanned": {
      "averageSize": 5.6,
      "processingRate": 45,
      "accuracyRate": 97.2
    },
    "structured": {
      "averageSize": 0.8,
      "processingRate": 450,
      "accuracyRate": 99.9
    }
  },
  "systemCapacity": {
    "maxConcurrentSessions": 50,
    "maxDocumentsPerSession": 10000,
    "averageResponseTime": 1.2,
    "uptime": 99.99
  }
}