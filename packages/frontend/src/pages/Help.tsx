import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: {
    id: string;
    title: string;
    content: string;
    tags: string[];
  }[];
}

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<string>('');

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'Learn the basics of the Seraphim Vanguard Platform',
      articles: [
        {
          id: 'platform-overview',
          title: 'Platform Overview',
          content: `
# Platform Overview

The Seraphim Vanguard Platform is an AI-native enterprise solution designed for AI governance, validation, and compliance in regulated industries.

## Key Features

- **Zero-Trust Architecture**: Every AI decision is validated and audited
- **Multi-Agent Validation**: 8 specialized agents analyze AI outputs
- **Comprehensive Audit Trail**: Complete traceability for compliance
- **Role-Based Access Control**: Secure access management
- **Workflow Automation**: Streamline validation processes

## Core Components

1. **Prompt Management**: Submit and track AI prompts
2. **Agent Analysis**: Automated validation by specialized agents
3. **Workflow Builder**: Create custom validation workflows
4. **Analytics Dashboard**: Real-time insights and metrics
5. **Compliance Reporting**: Export audit-ready reports
          `,
          tags: ['overview', 'features', 'introduction']
        },
        {
          id: 'first-steps',
          title: 'Your First Steps',
          content: `
# Your First Steps

Welcome to the Seraphim Vanguard Platform! Here's how to get started:

## 1. Submit Your First Prompt

Navigate to the Prompt Submission page and enter your AI prompt. The system will automatically:
- Validate the input
- Send it to configured LLMs
- Trigger agent analysis

## 2. Review Agent Analysis

Once analysis is complete, view the results from our 8 specialized agents:
- Accuracy Validator
- Bias Detector
- Compliance Checker
- Security Scanner
- Explainability Analyzer
- Source Verifier
- Decision Tree Mapper
- Ethical Alignment Checker

## 3. Create a Workflow

Use the Workflow Builder to automate your validation process:
- Drag and drop workflow steps
- Configure triggers and conditions
- Set up notifications

## 4. Monitor Analytics

Track your AI governance metrics in real-time:
- Prompt volume and trends
- Agent performance
- Compliance scores
- Risk indicators
          `,
          tags: ['tutorial', 'quickstart', 'beginner']
        }
      ]
    },
    {
      id: 'agents',
      title: 'Vanguard Agents',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      description: 'Understanding the 8 specialized validation agents',
      articles: [
        {
          id: 'agent-overview',
          title: 'Agent System Overview',
          content: `
# Agent System Overview

The Vanguard Agent system consists of 8 specialized agents that work together to validate AI outputs comprehensively.

## How Agents Work

1. **Parallel Processing**: All agents analyze outputs simultaneously
2. **Scoring System**: Each agent provides a 0-100 confidence score
3. **Risk Assessment**: Agents identify specific risks and issues
4. **Recommendations**: Actionable suggestions for improvement

## Agent Coordination

Agents can be configured to work in different modes:
- **Independent**: Each agent works separately
- **Sequential**: Agents process in a specific order
- **Conditional**: Agent activation based on previous results

## Configuration

Agents can be customized through:
- Sensitivity thresholds
- Custom rules and patterns
- Industry-specific parameters
- Integration with external systems
          `,
          tags: ['agents', 'architecture', 'configuration']
        },
        {
          id: 'agent-types',
          title: 'Agent Types and Functions',
          content: `
# Agent Types and Functions

## 1. Accuracy Validator
Verifies factual correctness and consistency of AI outputs.
- Cross-references with knowledge bases
- Checks logical consistency
- Validates numerical calculations

## 2. Bias Detector
Identifies potential biases in AI responses.
- Demographic bias detection
- Cultural sensitivity analysis
- Fairness metrics calculation

## 3. Compliance Checker
Ensures outputs meet regulatory requirements.
- Industry-specific compliance rules
- Data privacy regulations
- Legal requirement validation

## 4. Security Scanner
Detects security vulnerabilities and risks.
- PII detection and masking
- Injection attack prevention
- Data leakage prevention

## 5. Explainability Analyzer
Assesses the interpretability of AI decisions.
- Decision path analysis
- Feature importance calculation
- Transparency scoring

## 6. Source Verifier
Validates information sources and citations.
- Source credibility assessment
- Citation accuracy checking
- Reference validation

## 7. Decision Tree Mapper
Maps the decision-making process.
- Logic flow visualization
- Decision point identification
- Alternative path analysis

## 8. Ethical Alignment Checker
Ensures outputs align with ethical guidelines.
- Ethical framework compliance
- Value alignment assessment
- Harm prevention analysis
          `,
          tags: ['agents', 'types', 'functions']
        }
      ]
    },
    {
      id: 'workflows',
      title: 'Workflows',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      description: 'Creating and managing validation workflows',
      articles: [
        {
          id: 'workflow-basics',
          title: 'Workflow Basics',
          content: `
# Workflow Basics

Workflows automate the validation process by defining a sequence of steps and conditions.

## Key Concepts

### Steps
The building blocks of workflows:
- **Prompt Step**: Submit a prompt to LLMs
- **Agent Analysis**: Run specific agents
- **Condition**: Branch based on results
- **Notification**: Send alerts

### Connections
Define the flow between steps:
- Sequential execution
- Conditional branching
- Parallel processing

### Triggers
Start workflows automatically:
- Manual trigger
- Schedule-based
- Event-driven
- API webhook

## Creating Your First Workflow

1. Open the Workflow Builder
2. Drag steps from the palette
3. Connect steps to define flow
4. Configure each step's settings
5. Set up triggers
6. Test and activate
          `,
          tags: ['workflows', 'basics', 'tutorial']
        },
        {
          id: 'advanced-workflows',
          title: 'Advanced Workflow Features',
          content: `
# Advanced Workflow Features

## Conditional Logic

Create sophisticated decision trees:
\`\`\`
IF accuracy_score < 80 THEN
  Run additional verification
ELSE IF compliance_issues > 0 THEN
  Route to compliance team
ELSE
  Auto-approve
\`\`\`

## Variables and Context

Pass data between steps:
- Extract values from responses
- Store intermediate results
- Use in conditions and templates

## Error Handling

Build resilient workflows:
- Retry policies
- Fallback paths
- Error notifications
- Timeout handling

## Integration

Connect with external systems:
- Webhook notifications
- API calls
- Database queries
- File exports

## Performance Optimization

- Parallel agent execution
- Caching strategies
- Resource allocation
- Load balancing
          `,
          tags: ['workflows', 'advanced', 'features']
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Security',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      description: 'Security features and compliance capabilities',
      articles: [
        {
          id: 'security-overview',
          title: 'Security Architecture',
          content: `
# Security Architecture

## Zero-Trust Principles

Every action is verified:
- Authentication at every layer
- Continuous authorization checks
- Audit trail for all operations
- Encrypted data at rest and in transit

## Access Control

Role-based permissions:
- **Admin**: Full system access
- **AI Risk Officer**: Risk management tools
- **Compliance Reviewer**: Audit and reporting
- **User**: Basic prompt submission

## Data Protection

- AES-256 encryption
- Key rotation policies
- Secure key management
- Data residency controls

## Network Security

- TLS 1.3 for all connections
- API rate limiting
- DDoS protection
- IP allowlisting

## Monitoring

- Real-time threat detection
- Anomaly detection
- Security event logging
- Incident response automation
          `,
          tags: ['security', 'architecture', 'protection']
        },
        {
          id: 'compliance-features',
          title: 'Compliance Features',
          content: `
# Compliance Features

## Regulatory Support

Built-in support for:
- GDPR (Data Protection)
- HIPAA (Healthcare)
- SOC 2 (Security)
- ISO 27001 (Information Security)
- Industry-specific regulations

## Audit Trail

Complete traceability:
- Every prompt and response
- All agent analyses
- User actions and decisions
- System configuration changes

## Reporting

Compliance-ready reports:
- Automated report generation
- Custom report templates
- Scheduled reporting
- Multiple export formats

## Data Retention

Configurable policies:
- Retention periods by data type
- Automatic data purging
- Legal hold capabilities
- Archive management

## Compliance Workflows

Pre-built templates for:
- Data subject requests
- Breach notifications
- Audit preparations
- Compliance reviews
          `,
          tags: ['compliance', 'regulations', 'audit']
        }
      ]
    },
    {
      id: 'api',
      title: 'API & Integration',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      description: 'API documentation and integration guides',
      articles: [
        {
          id: 'api-overview',
          title: 'API Overview',
          content: `
# API Overview

## RESTful API

Base URL: \`https://api.seraphim-vanguard.com/v1\`

### Authentication

Bearer token authentication:
\`\`\`
Authorization: Bearer YOUR_API_TOKEN
\`\`\`

### Rate Limits

- 1000 requests per hour
- 10,000 requests per day
- Burst limit: 100 requests per minute

## Core Endpoints

### Prompts
- \`POST /prompts\` - Submit a new prompt
- \`GET /prompts/{id}\` - Get prompt details
- \`GET /prompts\` - List prompts

### Agents
- \`GET /agents\` - List available agents
- \`POST /agents/{id}/analyze\` - Run agent analysis
- \`GET /agents/{id}/results\` - Get analysis results

### Workflows
- \`POST /workflows\` - Create workflow
- \`POST /workflows/{id}/execute\` - Execute workflow
- \`GET /workflows/{id}/status\` - Check execution status

## Response Format

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456"
  }
}
\`\`\`
          `,
          tags: ['api', 'rest', 'endpoints']
        },
        {
          id: 'webhooks',
          title: 'Webhooks & Events',
          content: `
# Webhooks & Events

## Webhook Configuration

Register webhooks for real-time notifications:

\`\`\`json
POST /webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["prompt.completed", "agent.analyzed"],
  "secret": "your-webhook-secret"
}
\`\`\`

## Available Events

### Prompt Events
- \`prompt.submitted\` - New prompt submitted
- \`prompt.completed\` - LLM response received
- \`prompt.failed\` - Prompt processing failed

### Agent Events
- \`agent.started\` - Agent analysis started
- \`agent.completed\` - Agent analysis completed
- \`agent.failed\` - Agent analysis failed

### Workflow Events
- \`workflow.started\` - Workflow execution started
- \`workflow.step.completed\` - Workflow step completed
- \`workflow.completed\` - Workflow execution completed
- \`workflow.failed\` - Workflow execution failed

## Webhook Security

Verify webhook signatures:
\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}
\`\`\`
          `,
          tags: ['webhooks', 'events', 'integration']
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Common issues and solutions',
      articles: [
        {
          id: 'common-issues',
          title: 'Common Issues',
          content: `
# Common Issues

## Authentication Problems

### "Invalid token" error
- Check token expiration
- Verify token format
- Ensure proper Authorization header

### "Insufficient permissions" error
- Verify user role assignments
- Check resource-specific permissions
- Contact admin for access

## Agent Analysis Issues

### Agents not running
- Check workflow configuration
- Verify agent availability
- Review agent settings

### Low confidence scores
- Review input quality
- Check agent thresholds
- Analyze agent feedback

## Performance Issues

### Slow response times
- Check network connectivity
- Review payload size
- Consider pagination

### Timeout errors
- Increase timeout settings
- Break large operations
- Use async processing

## Data Issues

### Missing data in exports
- Verify date ranges
- Check filter settings
- Ensure data retention
          `,
          tags: ['troubleshooting', 'issues', 'solutions']
        },
        {
          id: 'error-codes',
          title: 'Error Codes Reference',
          content: `
# Error Codes Reference

## 400 Series - Client Errors

### 400 Bad Request
- Invalid request format
- Missing required fields
- Invalid parameter values

### 401 Unauthorized
- Missing authentication
- Invalid credentials
- Expired token

### 403 Forbidden
- Insufficient permissions
- Resource access denied
- Rate limit exceeded

### 404 Not Found
- Resource doesn't exist
- Invalid endpoint
- Deleted resource

## 500 Series - Server Errors

### 500 Internal Server Error
- Unexpected server error
- Contact support
- Check status page

### 502 Bad Gateway
- Service temporarily unavailable
- Upstream service error
- Retry after delay

### 503 Service Unavailable
- Maintenance mode
- Service overload
- Check status page

## Custom Error Codes

### AGENT_001 - Agent Initialization Failed
- Agent configuration error
- Missing dependencies
- Contact support

### WORKFLOW_001 - Workflow Execution Failed
- Invalid workflow definition
- Step configuration error
- Check workflow logs

### COMPLIANCE_001 - Compliance Check Failed
- Regulatory violation detected
- Review compliance rules
- Update configuration
          `,
          tags: ['errors', 'codes', 'reference']
        }
      ]
    }
  ];

  const filteredSections = helpSections.filter(section => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const sectionMatch = section.title.toLowerCase().includes(query) ||
                        section.description.toLowerCase().includes(query);
    
    const articleMatch = section.articles.some(article =>
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    return sectionMatch || articleMatch;
  });

  const selectedSectionData = helpSections.find(s => s.id === selectedSection);
  const selectedArticleData = selectedSectionData?.articles.find(a => a.id === selectedArticle);

  const renderMarkdown = (content: string) => {
    // Simple markdown renderer for demo
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mb-3 mt-4">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mb-2 mt-3">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-1">{line.substring(2)}</li>;
        }
        if (line.startsWith('```')) {
          return <pre key={index} className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md my-3 overflow-x-auto"><code>{line.substring(3)}</code></pre>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Documentation</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Find answers and learn how to use the Seraphim Vanguard Platform
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      {!selectedSection ? (
        // Section Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                  {section.icon}
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{section.description}</p>
              <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                {section.articles.length} articles →
              </div>
            </button>
          ))}
        </div>
      ) : !selectedArticle ? (
        // Article List
        <div>
          <button
            onClick={() => setSelectedSection('')}
            className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to sections
          </button>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                {selectedSectionData?.icon}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedSectionData?.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedSectionData?.description}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedSectionData?.articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article.id)}
                  className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Article Content
        <div>
          <button
            onClick={() => setSelectedArticle('')}
            className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {selectedSectionData?.title}
          </button>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            <div className="prose dark:prose-invert max-w-none">
              {renderMarkdown(selectedArticleData?.content || '')}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedArticleData?.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Was this helpful?
                  <button className="ml-3 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                    Yes
                  </button>
                  <button className="ml-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      {!selectedSection && (
        <div className="mt-12 bg-blue-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/settings"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              System Settings →
            </Link>
            <a
              href="https://github.com/seraphim-vanguard/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              GitHub Documentation →
            </a>
            <a
              href="mailto:support@seraphim-vanguard.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact Support →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;