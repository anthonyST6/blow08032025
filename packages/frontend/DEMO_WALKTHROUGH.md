# Seraphim Vanguards - Oilfield Land Lease Demo Walkthrough

This guide demonstrates the complete end-to-end flow of the Seraphim platform using the Oilfield Land Lease use case as a reference implementation.

## Prerequisites

1. Ensure the frontend development server is running:
   ```bash
   cd packages/frontend
   npm run dev
   ```

2. Open your browser to http://localhost:5173

3. Log in with admin credentials to access all features

## Demo Flow

### 1. Use Case Management

1. Navigate to the **Use Cases** tab
2. You'll see the pre-configured "Oilfield Land Lease" use case
3. Click on it to view details including:
   - Description and domain
   - Associated agent graph
   - Workflow templates
   - Deployment configurations

### 2. Agent Orchestration

1. Navigate to the **Agent Orchestration** tab
2. Select "Oilfield Land Lease" from the use case dropdown
3. Observe the hub-and-spoke agent graph with:
   - **Coordinator Agent** at the center
   - 8 specialized agents connected:
     - Title Search Agent
     - Regulatory Compliance Agent
     - Risk Assessment Agent
     - Contract Generation Agent
     - Data Validation Agent
     - Quality Assurance Agent
     - Integration Agent
     - Notification Agent
4. Click on any agent node to view its configuration
5. Try dragging agents to rearrange the graph
6. Click "Save Configuration" to persist changes

### 3. Workflow Creation

1. Navigate to the **Workflows** tab
2. Select "Oilfield Land Lease" from the use case dropdown
3. Click "Create New Workflow"
4. In the Workflow Builder:
   - Name: "Land Acquisition Workflow"
   - Description: "Complete workflow for oilfield land acquisition"
   - Add steps by selecting agents from the dropdown:
     1. Title Search Agent - "Verify land ownership"
     2. Regulatory Compliance Agent - "Check regulatory requirements"
     3. Risk Assessment Agent - "Evaluate acquisition risks"
     4. Contract Generation Agent - "Generate lease agreement"
     5. Quality Assurance Agent - "Review all outputs"
   - Save the workflow

### 4. Deployment Orchestration

1. Navigate to the **Deployment Orchestration** tab
2. Select "Oilfield Land Lease" from the use case dropdown
3. Observe the automatically generated deployment stages:
   - Each agent from the orchestration graph has a deployment stage
   - Stages show as "Not Started" initially
4. Click "Deploy All" to simulate deployment
5. Watch as stages progress through:
   - Not Started → In Progress → Deployed
6. Monitor the deployment progress and logs

### 5. Operations Monitoring

1. Navigate to the **Operations** tab
2. Select "Oilfield Land Lease" from the use case dropdown
3. View real-time agent status and metrics:
   - Agent health (online/offline/busy)
   - Performance metrics (CPU, memory, response time)
   - Task completion counts
   - Error rates
4. **Execute Demo Workflow**:
   - Click the "Execute Demo" button
   - This will trigger the agent execution service
   - Watch the toast notifications for progress
   - Agents will process tasks and generate outputs

### 6. Integration Logging

1. Navigate to the **Integration Log** tab
2. Observe automatic logging of:
   - API calls from agent executions
   - System events from workflow processing
   - Use case operations
   - Agent communications
3. Use filters to view specific log types:
   - Filter by source: Agent, Workflow, System
   - Filter by status: Success, Failure, Pending
   - Search for specific events

### 7. Audit Console

1. Navigate to the **Audit Console** tab
2. View comprehensive audit trail including:
   - User actions (workflow creation, agent configuration)
   - System changes (deployments, executions)
   - Agent executions with metadata
   - Configuration updates
3. Filter by:
   - Action type
   - Resource (UseCase, Agent, Workflow)
   - User
   - Date range

### 8. Output Viewer

1. Navigate to the **Output Viewer** tab
2. View all AI-generated outputs from agent executions:
   - Each output shows compliance certification status
   - SIA scores (Security, Integrity, Accuracy)
   - Digital signatures for certified outputs
   - Detailed compliance check results
3. Click on any output to view:
   - Full content
   - Metadata (model, tokens, execution time)
   - Audit trail
   - Certification details

## Key Features Demonstrated

### 1. **Use-Case-Driven Architecture**
- All components are filtered and organized by use case
- Pre-configured agent graphs for specific domains
- Workflow templates tailored to use case requirements

### 2. **Automatic Logging**
- Every action is automatically logged to Integration Log
- User actions tracked in Audit Console
- No manual logging required

### 3. **Output Storage & Certification**
- AI outputs automatically stored with compliance checks
- Real-time SIA scoring
- Digital signature generation for certified outputs

### 4. **Real-Time Updates**
- Live status updates in Operations tab
- Event-driven architecture for instant feedback
- Progress tracking across all modules

### 5. **End-to-End Integration**
- Seamless flow from use case selection to output certification
- All modules interconnected and data synchronized
- Consistent user experience across the platform

## Testing Scenarios

### Scenario 1: Complete Land Acquisition
1. Select Oilfield Land Lease use case
2. Execute the demo workflow from Operations
3. Monitor execution in Integration Log
4. Review outputs in Output Viewer
5. Check audit trail in Audit Console

### Scenario 2: Custom Workflow Creation
1. Create a new workflow with different agent combinations
2. Save and deploy the workflow
3. Execute and monitor results
4. Verify all outputs are certified

### Scenario 3: Agent Reconfiguration
1. Modify agent positions in orchestration graph
2. Update agent thresholds or parameters
3. Save configuration
4. Re-execute workflows to see impact

## Troubleshooting

- If agents show as offline, refresh the Operations page
- If outputs aren't appearing, check the Integration Log for errors
- For deployment issues, review the deployment logs in the console

## Summary

This demo showcases how Seraphim Vanguards provides a complete, integrated platform for use-case-driven AI automation with built-in compliance, monitoring, and certification capabilities. The Oilfield Land Lease use case demonstrates real-world applicability for complex business processes requiring multiple specialized agents working in coordination.