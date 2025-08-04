# Mission Control Layout Diagram

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                      │
│  [Logo] Mission Control    [Vertical Selector] [Time] [Operator]       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         SIA GOVERNANCE METRICS                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │  Security   │    │  Integrity  │    │  Accuracy   │                │
│  │    92%      │    │    94%      │    │    96%      │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬───────────────────────────────────────────┐
│      QUICK ACTIONS          │           SYSTEM STATUS                    │
│  ┌─────────┐ ┌─────────┐   │  Total Prompts:        12,847            │
│  │ Agent   │ │ Prompt  │   │  Total Analyses:        8,923            │
│  │ Orch.   │ │ Eng.    │   │  Active Workflows:         42            │
│  └─────────┘ └─────────┘   │  Flagged Responses:       156            │
│  ┌─────────┐ ┌─────────┐   │                                           │
│  │Complian.│ │ Audit   │   │                                           │
│  │ Review  │ │ Console │   │                                           │
│  └─────────┘ └─────────┘   │                                           │
└─────────────────────────────┴───────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════════╗
║                    🚀 MISSION CONTROL OPERATIONS (NEW)                   ║
╠═════════════════════════════════════════════════════════════════════════╣
║ ┌─────────────────┬─────────────────────┬─────────────────────┐        ║
║ │ ACTIVE MISSIONS │  AGENT PERFORMANCE  │      ALERTS         │        ║
║ │                 │ ┌─────────────────┐ │ ┌─────────────────┐ │        ║
║ │ Data Analysis   │ │  📈 Graph       │ │ │🔴 Critical (2)  │ │        ║
║ │ ▓▓▓▓▓▓▓░░ 75%  │ │ Productivity    │ │ │🟡 High (3)      │ │        ║
║ │                 │ │ Efficiency      │ │ │🟢 Medium (5)    │ │        ║
║ │ Threat Detect.  │ └─────────────────┘ │ └─────────────────┘ │        ║
║ │ ▓▓▓▓░░░░░ 40%  │                     │                     │        ║
║ │                 │ ┌─────────────────┐ │ • Security Anomaly │        ║
║ │ Compliance Ch.  │ │  TASK SUMMARY   │ │   12:34 PM        │        ║
║ │ ▓▓▓▓▓▓▓▓░ 85%  │ │ ✅ 342 Complete │ │                   │        ║
║ │                 │ │ 🔄 28 Ongoing   │ │ • Agent Node Down │        ║
║ │ System Optim.   │ │ ⏳ 56 Pending   │ │   12:28 PM        │        ║
║ │ ▓▓▓▓▓▓▓▓▓ 95%  │ └─────────────────┘ │                     │        ║
║ │                 │                     │ • Data Sync Fail  │        ║
║ │ [+ View All]    │                     │   12:15 PM        │        ║
║ └─────────────────┴─────────────────────┴─────────────────────┘        ║
╚═════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME ACTIVITY FEED                             │
│  • Land Lease Risk Assessment Completed                    5 min ago    │
│  • Compliance Issue Detected                              12 min ago    │
│  • Multi-Party Agreement Workflow Started                 18 min ago    │
│  • Prompt Engineering Update                              25 min ago    │
│  • Critical Security Alert                                32 min ago    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Active Missions Panel (Left Column)
- **Width**: 1/3 of container on large screens, full width on mobile
- **Height**: Fixed 400px with internal scroll
- **Features**:
  - Mission name with category icon
  - Animated progress bar with percentage
  - Color coding by category:
    - Data Analysis: Blue (#3B82F6)
    - Threat Detection: Red (#EF4444)
    - Compliance Check: Yellow (#F59E0B)
    - System Optimization: Green (#10B981)
  - "View All" button at bottom

### 2. Agent Performance & Task Summary (Middle Column)
- **Width**: 1/3 of container on large screens, full width on mobile
- **Layout**: Stacked vertically

#### Agent Performance Graph (Top)
- **Height**: 200px
- **Chart Type**: Recharts LineChart
- **Lines**: 
  - Productivity (Blue line)
  - Efficiency (Green line)
- **Features**:
  - 24-hour rolling window
  - Hover tooltips
  - Grid lines for readability

#### Task Summary Box (Bottom)
- **Height**: 180px
- **Layout**: 3 large number displays
- **Icons**:
  - ✅ Completed (Green)
  - 🔄 Ongoing (Blue)
  - ⏳ Pending (Yellow)
- **Additional Metrics**:
  - Failure rate badge
  - Average completion time

### 3. Alerts Panel (Right Column)
- **Width**: 1/3 of container on large screens, full width on mobile
- **Height**: Fixed 400px with internal scroll
- **Features**:
  - Severity badges with counts
  - Alert list with:
    - Icon by type
    - Title and timestamp
    - Hover effect
    - Click to open diagnostic modal
  - Auto-refresh every 10 seconds

## Responsive Behavior

### Desktop (lg: ≥1024px)
- 3-column layout as shown above
- All panels visible simultaneously

### Tablet (md: 768px-1023px)
- 2-column layout:
  - Active Missions (left)
  - Performance/Tasks + Alerts stacked (right)

### Mobile (< 768px)
- Single column layout
- Panels stack vertically
- Collapsible sections with expand/collapse

## Animation Specifications

### Entry Animations
```css
/* Stagger animation for mission control section */
.mission-control-section {
  animation: fadeInUp 0.5s ease-out;
  animation-delay: 0.2s;
}

/* Individual panel animations */
.mission-panel { animation-delay: 0.3s; }
.performance-panel { animation-delay: 0.4s; }
.alerts-panel { animation-delay: 0.5s; }
```

### Progress Bar Animation
```css
.progress-bar {
  transition: width 0.3s ease-out;
}

.progress-bar-fill {
  background: linear-gradient(90deg, 
    var(--color-start) 0%, 
    var(--color-end) 100%);
  animation: shimmer 2s infinite;
}
```

### Real-time Update Effects
- New alerts: Slide in from right with glow effect
- Progress updates: Smooth transition with pulse
- Task count changes: Number flip animation

## Color Scheme Integration

### Background Colors
- Panels: `bg-white/5` with `backdrop-blur-md`
- Hover states: `bg-white/10`
- Active states: `bg-white/15`

### Border Colors
- Default: `border-white/10`
- Hover: `border-white/20`
- Active: `border-seraphim-gold/50`

### Text Colors
- Headers: `text-seraphim-text` (white)
- Labels: `text-seraphim-text-dim` (gray-400)
- Values: `text-seraphim-gold` for emphasis

## Interaction States

### Hover Effects
- Panels: Slight scale (1.02) and glow
- List items: Background highlight
- Buttons: Color transition

### Click Feedback
- Ripple effect from click point
- Brief scale down (0.98) then back

### Loading States
- Skeleton screens for initial load
- Shimmer effect on updating data
- Spinner for async operations