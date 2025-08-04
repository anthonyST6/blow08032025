# Seraphim V2 User Journey Specification
## Oilfield Land Lease Use Case - Complete Technical Specification

---

## 1. MISSION CONTROL DASHBOARD V2

### User Journey Flow

#### 1.1 Initial Landing
**When user navigates to `/dashboard/mission-control-v2`:**

1. **Vertical Selector** (Top Left)
   - Default: "Energy & Utilities" pre-selected
   - Dropdown shows all verticals with icons
   - On hover: Show use case count per vertical
   - On select: Animate transition, load use cases

2. **Use Case Selection**
   - "Oilfield Land Lease" appears as primary card
   - Card shows:
     * Live status indicator (green pulse = active)
     * Last run timestamp
     * Active lease count
     * Critical alerts badge
   - On click: Triggers executive summary modal

3. **Executive Summary Modal**
   ```
   Three panels with smooth transitions:
   
   Panel 1 - Business Case:
   - Revenue at risk: $XX.XM
   - Leases expiring in 90 days: XX
   - Compliance score: XX%
   - ROI of automation: XX%
   
   Panel 2 - Technical Approach:
   - 5 Vanguard agents deployed
   - XX integrations active
   - XX workflows automated
   - Real-time processing enabled
   
   Panel 3 - Key Benefits:
   - Prevent lease expirations
   - Automate compliance checks
   - Optimize portfolio value
   - Reduce manual effort by XX%
   ```

#### 1.2 Agent Canvas Interaction
**Main workspace area:**

1. **Agent Loading**
   - Agents appear with staggered animation
   - Each agent has:
     * Unique icon and color
     * Status ring (green/yellow/red)
     * Connection lines to other agents
     * Task count badge

2. **Agent Positions** (Optimized Layout)
   ```
   Orchestrator (Top Center)
        |
   ┌────┼────┐
   │    │    │
   Security  Integrity  Accuracy
   │         │         │
   └────┬────┴────┬────┘
        │         │
   Optimization  Negotiation
   ```

3. **Agent Interaction**
   - Hover: Highlight connections, show tooltip
   - Click: Opens side panel with:
     * Agent description
     * Current tasks (scrollable list)
     * Performance metrics
     * Recent actions log
     * Configuration options

4. **Drag & Drop**
   - Agents are draggable with physics
   - Snap-to-grid for alignment
   - Connections auto-update
   - Layout saves to user preferences

#### 1.3 Workflow Section
**Below agent canvas:**

1. **Workflow Cards**
   - "Lease Expiration Monitoring" 
   - "Compliance Validation"
   - "Financial Optimization"
   - "Contract Negotiation"

2. **Card Interaction**
   - Click to expand
   - Shows assigned agents with avatars
   - Step-by-step breakdown
   - Execution schedule
   - Last/next run times

#### 1.4 Control Panel
**Right sidebar:**

1. **Sample Data Section**
   - Toggle: Demo Mode / Live Mode
   - Upload button for custom data
   - Data preview window
   - Validation status

2. **Deployment Console**
   - Big "Activate All" button (gray → gold)
   - Individual agent toggles
   - Execution mode selector:
     * Manual
     * Scheduled
     * Event-driven
   - Resource allocation sliders

3. **Integration Status**
   - ERP: Connected (green dot)
   - GIS: Connected (green dot)
   - CLM: Syncing (yellow spinner)
   - Email: Active (green dot)

#### 1.5 Bottom Panels

1. **Integration Logs** (Tab 1)
   ```
   [11:23:45] SAP: Lease data sync completed (2,341 records)
   [11:23:52] ArcGIS: Boundary data updated for 156 leases
   [11:24:03] Quorum: New lease detected - ID: LS-2024-0892
   [11:24:15] SharePoint: Compliance docs uploaded (23 files)
   ```

2. **Downloads** (Tab 2)
   - Report tiles with:
     * Type icon (PDF/Excel/JSON)
     * Title and timestamp
     * File size
     * Download button
     * Preview option

---

## 2. USE CASE DASHBOARD V2

### User Journey Flow

#### 2.1 Dashboard Landing
**When user navigates to `/dashboard/use-case-v2`:**

1. **Status Overview Bar**
   ```
   ┌─────────┬──────────────┬─────────┬───────────────┬─────────┬────────────┐
   │ Active  │ Under Review │ Pending │ Expiring Soon │ Expired │ Terminated │
   │   1,245 │          89  │     156 │           234 │      12 │        567 │
   └─────────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
   ```
   - Each section is clickable to filter
   - Numbers update in real-time
   - Color-coded backgrounds

2. **Main Grid View**
   - Card layout (responsive grid)
   - Each lease card shows:
     * Lease ID and name
     * Status indicator
     * Days to expiration
     * Financial exposure
     * Last agent action
     * Mini SIA indicators

#### 2.2 Lease Interaction
**When user clicks a lease card:**

1. **Lease Detail Modal** (Full screen overlay)
   
   **Header Section:**
   - Lease name and ID
   - Current status with color
   - Quick actions toolbar:
     * Renew
     * Terminate
     * Flag for review
     * Export details

   **Tab Navigation:**
   
   **Overview Tab:**
   ```
   Lessee: Acme Oil Corp
   Lessor: Smith Family Trust
   Effective Date: 01/15/2020
   Expiration: 01/15/2025 (45 days)
   
   Terms:
   - Acreage: 640 acres
   - Royalty: 1/8
   - Bonus: $500/acre
   - Primary Term: 5 years
   
   Financial Summary:
   - Annual Revenue: $2.3M
   - Total Investment: $8.5M
   - ROI: 27%
   ```

   **Legal Clauses Tab:**
   - Searchable clause list
   - Risk indicators per clause:
     * Green check: Standard
     * Yellow warning: Review needed
     * Red alert: High risk
   - AI-highlighted concerns
   - Suggested modifications

   **GIS Map Tab:**
   - Interactive Mapbox view
   - Lease boundaries in blue
   - Surrounding leases colored by owner
   - Infrastructure overlay:
     * Wells (active/inactive)
     * Pipelines
     * Roads
   - Environmental zones
   - Click for parcel details

   **Agent History Tab:**
   ```
   Timeline view:
   
   [Today 10:45 AM] Optimization Vanguard
   ✓ Calculated renewal ROI: 34%
   → Recommendation: Renew with modified terms
   
   [Yesterday 3:22 PM] Accuracy Vanguard
   ✓ Updated expiration date from county records
   ⚠ Discrepancy resolved
   
   [3 days ago] Negotiation Vanguard
   ✓ Generated renewal package
   📎 Download: Renewal_Package_LS1234.pdf
   ```

   **SIA Status Tab:**
   - Mini certification view
   - Three circles (S/I/A)
   - Click to see detailed report
   - Fix history if applicable

   **Documents Tab:**
   - Original lease PDF
   - Amendments
   - Correspondence
   - Maps and exhibits
   - Compliance certificates

#### 2.3 Interactive Visualizations

1. **Lease Distribution Chart**
   - Pie chart by status
   - Click slice to filter grid
   - Hover for details
   - Export as PNG/CSV

2. **Expiration Timeline**
   - Gantt-style view
   - Next 12 months
   - Lease bars colored by risk
   - Drag to reschedule actions

3. **Financial Impact Heatmap**
   - Geographic heatmap
   - Color intensity = revenue
   - Overlay options:
     * By expiration risk
     * By compliance status
     * By ROI potential

#### 2.4 Agent Activity Panel
**Right sidebar - collapsible:**

```
Recent Agent Actions:

[Optimization] 2 min ago
Identified 23 leases for portfolio optimization
→ View recommendations

[Accuracy] 15 min ago  
Updated 45 lease records from county data
✓ All records current

[Negotiation] 1 hour ago
Generated 5 renewal packages
📎 Download all

[Security] 2 hours ago
Compliance check completed
⚠ 3 leases need attention
```

#### 2.5 Next Best Action Feed
**Bottom panel - always visible:**

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Next Best Actions (Ranked by Impact)                 │
├─────────────────────────────────────────────────────────┤
│ 1. Renew Lease LS-1234 → Save $2.3M/year              │
│    Confidence: 94% | Due: 45 days | [Execute] [Defer] │
│                                                         │
│ 2. Renegotiate Terms on LS-5678 → Increase ROI 15%    │
│    Confidence: 87% | Impact: $450K | [Execute] [Defer] │
│                                                         │
│ 3. Terminate Lease LS-9012 → Reduce losses $125K/year │
│    Confidence: 91% | Reason: Below threshold | [Execute]│
└─────────────────────────────────────────────────────────┘
```

---

## 3. CERTIFICATIONS DASHBOARD V2

### User Journey Flow

#### 3.1 Dashboard Landing
**When user navigates to `/dashboard/certifications-v2`:**

1. **SIA Status Display**
   ```
   Three large circles in center:
   
   [Security]     [Integrity]     [Accuracy]
      🛡️             ⚖️              ✓
    (Blue)         (Red)          (Green)
     PASS          FIXING          PASS
     98/100        72/100         95/100
   ```

2. **Status Behaviors:**
   - **Passed (Green)**: Solid color, score displayed
   - **Failed (Red)**: Red outline, pulsing
   - **Fixing (Yellow)**: Spinning border, progress %
   - **Checking**: Subtle pulse animation

#### 3.2 Detailed Reports
**When user clicks any SIA circle:**

1. **Full Report View** (Scrollable overlay)

   **Security Report Example:**
   ```
   SECURITY CERTIFICATION REPORT
   Generated: 2024-03-26 11:45:23
   Score: 98/100 (PASS)
   
   ✓ Access Control: All lease data properly secured
   ✓ Audit Trail: Complete record of all changes
   ✓ Encryption: Data encrypted at rest and in transit
   ⚠ Minor: 2 users with elevated permissions (under review)
   
   Checks Performed:
   1. User authentication verification ✓
   2. Role-based access control audit ✓
   3. Data encryption validation ✓
   4. API security assessment ✓
   5. Compliance with SOC2 requirements ✓
   
   Historical Trend:
   [Line graph showing score over past 30 days]
   ```

   **Integrity Report (Failed Example):**
   ```
   INTEGRITY CERTIFICATION REPORT
   Generated: 2024-03-26 11:45:23
   Score: 72/100 (FAILED)
   
   ❌ Data Consistency: Mismatches found across systems
   ❌ Source Validation: 23 leases with conflicting data
   ✓ Referential Integrity: Foreign keys valid
   ⚠ Cross-System Sync: 3 systems out of sync
   
   CRITICAL ISSUES:
   
   1. ERP vs GIS Mismatch
      - 15 leases show different acreage
      - Root cause: Manual entry errors
      - Fix: Auto-sync from authoritative source
   
   2. Contract vs Database Discrepancy  
      - 8 leases have wrong expiration dates
      - Root cause: Amendment not processed
      - Fix: Re-parse contract documents
   
   [AUTO-FIX IN PROGRESS]
   Assigned to: Integrity Vanguard
   Progress: 45% (23/51 issues resolved)
   Est. completion: 15 minutes
   ```

#### 3.3 Auto-Fix Workflow
**When certification fails:**

1. **Immediate UI Response**
   - Circle turns red with alert icon
   - Toast notification appears
   - Auto-fix begins automatically

2. **Fix Progress Display**
   ```
   ┌─────────────────────────────────────┐
   │ 🔧 Auto-Fix in Progress             │
   ├─────────────────────────────────────┤
   │ Issue: Data consistency failure     │
   │ Agent: Integrity Vanguard           │
   │                                     │
   │ Steps:                              │
   │ ✓ 1. Identifying mismatches        │
   │ ⟳ 2. Syncing from source (45%)    │
   │ ○ 3. Validating corrections        │
   │ ○ 4. Updating certifications       │
   │                                     │
   │ [=====>          ] 45%             │
   └─────────────────────────────────────┘
   ```

3. **Fix Completion**
   - Circle animates from red → yellow → green
   - Success notification
   - Audit entry created
   - Report updated

#### 3.4 Data Lineage View
**Accessible from report or main dashboard:**

```
Visual flow diagram:

[Source Systems]          [Seraphim Platform]         [Destinations]
                              
SAP ─────┐                                          ┌──→ Reports
         │                 ┌─────────────┐         │
Quorum ──┼───[Ingestion]──→│ Vanguard    │──→[API]─┼──→ Dashboards
         │                 │ Processing  │         │
ArcGIS ──┘                 └─────────────┘         └──→ Alerts
                                  ↓
                           [Certification]
                                  ↓
                           [Quality Score]
```

- Click any node for details
- Red highlights show failure points
- Green shows validated paths

#### 3.5 Audit Log Viewer
**Bottom panel with advanced filtering:**

```
┌─ Filters ──────────────────────────────────────────────┐
│ Agent: [All Vanguards ▼] Action: [All ▼] Date: [Today ▼]│
└────────────────────────────────────────────────────────┘

Time        Agent           Action                  Status   Details
─────────────────────────────────────────────────────────────────
11:45:23    Integrity      Data sync started       🟡       51 mismatches found
11:45:45    Integrity      ERP update             ✓        15 records corrected  
11:46:12    Integrity      GIS sync               ✓        8 boundaries updated
11:46:34    Accuracy       Validation check       ✓        All dates verified
11:47:01    System         Certification rerun    ✓        Score: 95/100
11:47:15    Security       Access log review      ✓        No anomalies
```

#### 3.6 Manual Controls
**For exceptional cases:**

1. **Recheck Button**
   - Forces immediate recertification
   - Shows spinner during check
   - Updates scores in real-time

2. **Override Panel** (Admin only)
   - Temporarily accept failed cert
   - Requires justification
   - Sets expiration time
   - Creates audit record

3. **Fix Configuration**
   - Set auto-fix thresholds
   - Configure retry attempts
   - Define escalation rules
   - Customize fix strategies

---

## 4. CROSS-DASHBOARD FEATURES

### 4.1 Action Packages (Human-in-the-Loop)

**When high-risk action needs approval:**

1. **Notification Appears**
   - Toast in top-right
   - Sound alert (optional)
   - Badge on bell icon

2. **Action Package Format**
   ```
   ┌─────────────────────────────────────────┐
   │ ⚠️ Approval Required                    │
   ├─────────────────────────────────────────┤
   │ Lease LS-1234 Renewal                  │
   │                                         │
   │ Risk: $2.3M annual revenue             │
   │ Recommendation: Auto-renew (3 years)    │
   │ Confidence: 96%                         │
   │ Impact: Protects $6.9M over term       │
   │                                         │
   │ [Approve] [Reject] [Request Info]      │
   │                                         │
   │ Timeout: 4:32 remaining                │
   └─────────────────────────────────────────┘
   ```

3. **Multi-Channel Delivery**
   - In-app notification
   - Teams adaptive card
   - Slack interactive message
   - Email with deep link

### 4.2 Real-Time Updates

**WebSocket-powered features:**

1. **Live Status Changes**
   - Numbers update without refresh
   - Smooth transitions
   - Optimistic UI updates

2. **Agent Activity Stream**
   - New actions appear instantly
   - Progress bars update live
   - Error states immediate

3. **Collaborative Features**
   - See other users' cursors
   - Lock indicators on records
   - Real-time comments

### 4.3 Mobile Responsiveness

**Tablet optimization:**
- Collapsible sidebars
- Touch-friendly controls
- Swipe gestures
- Responsive grid layouts

---

## 5. ERROR HANDLING & EDGE CASES

### 5.1 Graceful Degradation
- If agent fails: Show last known good state
- If integration down: Use cached data
- If WebSocket disconnects: Poll fallback

### 5.2 Error Recovery
- Automatic retry with backoff
- Manual retry options
- Clear error messages
- Suggested fixes

### 5.3 Performance
- Virtual scrolling for large lists
- Lazy loading for charts
- Progressive image loading
- Debounced searches

---

## 6. SUCCESS METRICS

### 6.1 User Engagement
- Time to first action < 30 seconds
- Click-through rate on recommendations > 80%
- Approval response time < 5 minutes

### 6.2 System Performance  
- Dashboard load time < 2 seconds
- Real-time update latency < 100ms
- Auto-fix success rate > 85%

### 6.3 Business Impact
- Prevented lease expirations: 100%
- Compliance score improvement: +25%
- Manual effort reduction: 75%
- ROI on automation: 450%