# Global Context Flow Diagram

## System Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VANGUARDS PLATFORM FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. INITIAL STATE (No Active Use Case)
   ┌─────────────────┐
   │ Mission Control │ ──────► Shows BASELINE DUMMY DATA
   └─────────────────┘         (Generic KPIs, trends)
            │
   ┌─────────────────┐
   │   Other Tabs    │ ──────► Show "Select a use case to begin"
   └─────────────────┘         (Disabled/Empty state)

2. USE CASE SELECTION
   ┌─────────────────┐
   │  Use Case       │
   │  Launcher       │ ──────► User selects "Oilfield Land Lease"
   └────────┬────────┘         and clicks "Launch"
            │
            ▼
   ┌─────────────────┐
   │ Set Global      │ ──────► activeUseCaseId = "oilfield-land-lease"
   │ Context         │         localStorage.setItem()
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Auto-trigger    │ ──────► POST /api/usecases/:id/runWorkflows
   │ Workflows       │         POST /api/usecases/:id/deploy
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Load Unified    │ ──────► GET /api/usecases/:id/data
   │ Data            │         activeUseCaseData = response
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Redirect to     │ ──────► navigate('/workflows')
   │ Workflows       │
   └─────────────────┘

3. ACTIVE USE CASE STATE
   ┌─────────────────┐
   │ Mission Control │ ──────► Shows OILFIELD DATA + Reset Button
   └─────────────────┘         
            │
   ┌─────────────────┐
   │   Workflows     │ ──────► Shows workflows for Oilfield
   └─────────────────┘         
            │
   ┌─────────────────┐
   │   Operations    │ ──────► Shows operations for Oilfield
   └─────────────────┘         
            │
   ┌─────────────────┐
   │ Integration Log │ ──────► Shows logs for Oilfield
   └─────────────────┘         
            │
   ┌─────────────────┐
   │  All Other Tabs │ ──────► Automatically show Oilfield data
   └─────────────────┘         

4. RESET ACTION
   ┌─────────────────┐
   │ User clicks     │
   │ "Reset Use Case"│ ──────► Confirmation dialog
   └────────┬────────┘         
            │
            ▼
   ┌─────────────────┐
   │ Clear Context   │ ──────► activeUseCaseId = null
   │                 │         activeUseCaseData = null
   └────────┬────────┘         localStorage.removeItem()
            │
            ▼
   ┌─────────────────┐
   │ Return to       │ ──────► Mission Control: Baseline data
   │ Initial State   │         Other tabs: Empty state
   └─────────────────┘
```

## Data Structure Flow

```
BASELINE DATA (No Active Use Case)
┌─────────────────────────────────┐
│ summary: {                      │
│   activeItems: 42,              │
│   successRate: 94.5,            │
│   costSavings: 2340000,         │
│   efficiencyGain: 67            │
│ }                               │
└─────────────────────────────────┘

USE CASE SPECIFIC DATA (Active)
┌─────────────────────────────────┐
│ summary: { ... }                │
│ domainData: {                   │
│   leases: [...],                │
│   compliance: {...},            │
│   financial: {...}              │
│ }                               │
│ operations: {                   │
│   workflows: [...],             │
│   agents: [...],                │
│   deployments: [...]            │
│ }                               │
│ logs: {                         │
│   integration: [...],           │
│   audit: [...],                 │
│   outputs: [...]                │
│ }                               │
│ certifications: [...]           │
└─────────────────────────────────┘
```

## Component Behavior Matrix

| Component | No Active Use Case | Active Use Case | Reset Available |
|-----------|-------------------|-----------------|-----------------|
| Mission Control | Baseline data | Use case data | Yes (button shown) |
| Use Case Launcher | Full functionality | Full functionality | No |
| Workflows | Empty state | Use case workflows | No |
| Operations | Empty state | Use case operations | No |
| Integration Log | Empty state | Use case logs | No |
| Audit Console | Empty state | Use case audits | No |
| Output Viewer | Empty state | Use case outputs | No |
| Certifications | Empty state | Use case certs | No |

## Key Implementation Points

1. **Single Source of Truth**: activeUseCaseId drives entire platform
2. **Automatic Propagation**: No manual selection after launcher
3. **Consistent State**: All tabs synchronized automatically
4. **Clear Reset**: One button to return to baseline
5. **Persistent State**: Survives page refresh via localStorage