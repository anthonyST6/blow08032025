import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Seraphim Vanguard API',
      version,
      description: 'AI Governance and Validation Platform API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@seraphim-vanguard.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.seraphim-vanguard.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              example: 'user123',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            displayName: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'ai_risk_officer', 'compliance_reviewer', 'user'],
              example: 'user',
            },
            department: {
              type: 'string',
              example: 'Engineering',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Prompt: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'prompt123',
            },
            content: {
              type: 'string',
              example: 'Analyze this financial report...',
            },
            model: {
              type: 'string',
              example: 'gpt-4',
            },
            provider: {
              type: 'string',
              enum: ['openai', 'anthropic', 'azure'],
              example: 'openai',
            },
            parameters: {
              type: 'object',
              properties: {
                temperature: {
                  type: 'number',
                  example: 0.7,
                },
                maxTokens: {
                  type: 'integer',
                  example: 1000,
                },
              },
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['finance', 'analysis'],
            },
            createdBy: {
              type: 'string',
              example: 'user123',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        LLMResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'response123',
            },
            promptId: {
              type: 'string',
              example: 'prompt123',
            },
            content: {
              type: 'string',
              example: 'Based on the financial report analysis...',
            },
            model: {
              type: 'string',
              example: 'gpt-4',
            },
            provider: {
              type: 'string',
              example: 'openai',
            },
            tokensUsed: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'integer',
                  example: 150,
                },
                completion: {
                  type: 'integer',
                  example: 350,
                },
                total: {
                  type: 'integer',
                  example: 500,
                },
              },
            },
            latency: {
              type: 'number',
              example: 2.5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AgentAnalysis: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'analysis123',
            },
            responseId: {
              type: 'string',
              example: 'response123',
            },
            agentType: {
              type: 'string',
              enum: ['accuracy', 'bias', 'compliance', 'security', 'explainability', 'source_verifier', 'decision_tree', 'ethical_alignment'],
              example: 'accuracy',
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              example: 0.85,
            },
            passed: {
              type: 'boolean',
              example: true,
            },
            findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'warning',
                  },
                  message: {
                    type: 'string',
                    example: 'Potential bias detected',
                  },
                  severity: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'critical'],
                    example: 'medium',
                  },
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Consider rephrasing to be more neutral'],
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Workflow: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'workflow123',
            },
            name: {
              type: 'string',
              example: 'Financial Analysis Workflow',
            },
            description: {
              type: 'string',
              example: 'Automated workflow for financial report analysis',
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'step1',
                  },
                  type: {
                    type: 'string',
                    enum: ['prompt', 'agent_analysis', 'condition', 'notification'],
                    example: 'prompt',
                  },
                  config: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              },
            },
            triggers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['manual', 'schedule', 'event'],
                    example: 'schedule',
                  },
                  config: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              },
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'draft'],
              example: 'active',
            },
            createdBy: {
              type: 'string',
              example: 'user123',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'audit123',
            },
            action: {
              type: 'string',
              example: 'prompt.created',
            },
            userId: {
              type: 'string',
              example: 'user123',
            },
            resourceType: {
              type: 'string',
              example: 'prompt',
            },
            resourceId: {
              type: 'string',
              example: 'prompt123',
            },
            details: {
              type: 'object',
              additionalProperties: true,
            },
            ipAddress: {
              type: 'string',
              example: '192.168.1.1',
            },
            userAgent: {
              type: 'string',
              example: 'Mozilla/5.0...',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

// API Documentation for routes
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Users
 *     description: User management endpoints
 *   - name: Prompts
 *     description: Prompt management endpoints
 *   - name: LLM
 *     description: LLM interaction endpoints
 *   - name: Agents
 *     description: Agent analysis endpoints
 *   - name: Workflows
 *     description: Workflow management endpoints
 *   - name: Audit
 *     description: Audit log endpoints
 *   - name: Analytics
 *     description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - displayName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               displayName:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/prompts:
 *   get:
 *     summary: Get all prompts
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: List of prompts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     prompts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prompt'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *   post:
 *     summary: Create a new prompt
 *     tags: [Prompts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - model
 *               - provider
 *             properties:
 *               content:
 *                 type: string
 *               model:
 *                 type: string
 *               provider:
 *                 type: string
 *                 enum: [openai, anthropic, azure]
 *               parameters:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Prompt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Prompt'
 */

/**
 * @swagger
 * /api/agents/analyze:
 *   post:
 *     summary: Run agent analysis on a response
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - responseId
 *               - agents
 *             properties:
 *               responseId:
 *                 type: string
 *               agents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [accuracy, bias, compliance, security, explainability, source_verifier, decision_tree, ethical_alignment]
 *     responses:
 *       200:
 *         description: Analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     analyses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AgentAnalysis'
 */