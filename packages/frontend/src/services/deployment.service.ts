import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  rollbackEnabled: boolean;
  healthCheckInterval: number;
  maxRetries: number;
}

export interface DeploymentStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'warning';
  progress: number;
  duration?: number;
  message?: string;
  substeps?: {
    name: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  uptime: string;
  lastCheck: Date;
}

export interface DependencyInfo {
  name: string;
  version: string;
  status: 'resolved' | 'missing' | 'conflict';
  required: boolean;
}

export interface SecurityProtocol {
  name: string;
  status: 'active' | 'inactive' | 'configuring';
  level: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  network: number;
  requestsPerSecond: number;
  avgResponseTime: number;
  errorRate: number;
  costPerRequest: number;
  efficiencyScore: number;
  carbonFootprint: number;
}

class DeploymentService {
  private eventSource: EventSource | null = null;
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
    };
  }

  async startDeployment(config: DeploymentConfig): Promise<string> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/deployment/start`,
        config,
        { headers: this.getHeaders() }
      );
      return response.data.deploymentId;
    } catch (error) {
      toast.error('Failed to start deployment');
      throw error;
    }
  }

  async getDeploymentStatus(): Promise<{
    inProgress: boolean;
    deploymentId: string | null;
    stages: DeploymentStage[];
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deployment/status`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      toast.error('Failed to get deployment status');
      throw error;
    }
  }

  async rollbackDeployment(deploymentId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/deployment/rollback/${deploymentId}`,
        {},
        { headers: this.getHeaders() }
      );
      toast.success('Deployment rolled back successfully');
    } catch (error) {
      toast.error('Failed to rollback deployment');
      throw error;
    }
  }

  async getHealthChecks(): Promise<HealthCheckResult[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deployment/health`,
        { headers: this.getHeaders() }
      );
      return response.data.healthChecks;
    } catch (error) {
      toast.error('Failed to get health checks');
      throw error;
    }
  }

  async performHealthCheck(service: string): Promise<HealthCheckResult> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/deployment/health/${service}`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data.result;
    } catch (error) {
      toast.error('Failed to perform health check');
      throw error;
    }
  }

  async getDependencies(): Promise<DependencyInfo[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deployment/dependencies`,
        { headers: this.getHeaders() }
      );
      return response.data.dependencies;
    } catch (error) {
      toast.error('Failed to get dependencies');
      throw error;
    }
  }

  async validateDependency(name: string, version: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/deployment/dependencies/validate`,
        { name, version },
        { headers: this.getHeaders() }
      );
      return response.data.isValid;
    } catch (error) {
      toast.error('Failed to validate dependency');
      throw error;
    }
  }

  async getSecurityProtocols(): Promise<SecurityProtocol[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deployment/security`,
        { headers: this.getHeaders() }
      );
      return response.data.protocols;
    } catch (error) {
      toast.error('Failed to get security protocols');
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deployment/metrics`,
        { headers: this.getHeaders() }
      );
      return response.data.metrics;
    } catch (error) {
      toast.error('Failed to get performance metrics');
      throw error;
    }
  }

  subscribeToDeploymentUpdates(
    onStageUpdate: (stage: DeploymentStage) => void,
    onHealthUpdate: (health: HealthCheckResult[]) => void,
    onDeploymentCompleted: (data: any) => void,
    onDeploymentFailed: (data: any) => void
  ): () => void {
    // Close existing connection if any
    if (this.eventSource) {
      this.eventSource.close();
    }

    // Create new EventSource connection
    const url = new URL(`${API_BASE_URL}/deployment/stream`);
    if (this.authToken) {
      url.searchParams.append('token', this.authToken);
    }

    this.eventSource = new EventSource(url.toString());

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'stageUpdate':
            onStageUpdate(data.stage);
            break;
          case 'healthUpdate':
            onHealthUpdate(data.health);
            break;
          case 'deploymentCompleted':
            onDeploymentCompleted(data);
            toast.success('Deployment completed successfully!');
            break;
          case 'deploymentFailed':
            onDeploymentFailed(data);
            toast.error(`Deployment failed: ${data.error}`);
            break;
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      toast.error('Lost connection to deployment server');
    };

    // Return cleanup function
    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  // Mock implementations for demo mode
  getMockDeploymentStatus() {
    return {
      inProgress: false,
      deploymentId: null,
      stages: [
        {
          id: 'pre-flight',
          name: 'Pre-flight Checks',
          status: 'pending' as const,
          progress: 0,
          substeps: [
            { name: 'Environment validation', status: 'pending' as const },
            { name: 'Resource availability', status: 'pending' as const },
            { name: 'Security compliance', status: 'pending' as const },
          ],
        },
        {
          id: 'dependency',
          name: 'Dependency Resolution',
          status: 'pending' as const,
          progress: 0,
          substeps: [
            { name: 'Package scanning', status: 'pending' as const },
            { name: 'Version compatibility', status: 'pending' as const },
            { name: 'License verification', status: 'pending' as const },
          ],
        },
      ],
    };
  }

  getMockHealthChecks(): HealthCheckResult[] {
    return [
      {
        service: 'API Gateway',
        status: 'healthy',
        latency: 45,
        uptime: '99.99%',
        lastCheck: new Date(),
      },
      {
        service: 'AI Engine',
        status: 'healthy',
        latency: 120,
        uptime: '99.95%',
        lastCheck: new Date(),
      },
      {
        service: 'Database Cluster',
        status: 'healthy',
        latency: 15,
        uptime: '99.99%',
        lastCheck: new Date(),
      },
    ];
  }

  getMockDependencies(): DependencyInfo[] {
    return [
      { name: '@seraphim/core', version: '2.4.1', status: 'resolved', required: true },
      { name: '@seraphim/ai-engine', version: '1.8.0', status: 'resolved', required: true },
      { name: '@vanguard/security', version: '3.2.0', status: 'resolved', required: true },
      { name: '@vanguard/monitoring', version: '2.1.5', status: 'resolved', required: false },
    ];
  }

  getMockSecurityProtocols(): SecurityProtocol[] {
    return [
      {
        name: 'Zero Trust Network',
        status: 'active',
        level: 'critical',
        description: 'All network traffic is untrusted by default',
      },
      {
        name: 'End-to-End Encryption',
        status: 'active',
        level: 'critical',
        description: 'AES-256 encryption for all data in transit',
      },
      {
        name: 'Multi-Factor Authentication',
        status: 'active',
        level: 'high',
        description: 'Required for all administrative access',
      },
    ];
  }

  getMockPerformanceMetrics(): PerformanceMetrics {
    return {
      cpu: 42,
      memory: 68,
      network: 156,
      requestsPerSecond: 12450,
      avgResponseTime: 45,
      errorRate: 0.02,
      costPerRequest: 0.0012,
      efficiencyScore: 94.5,
      carbonFootprint: 0.2,
    };
  }
}

export const deploymentService = new DeploymentService();