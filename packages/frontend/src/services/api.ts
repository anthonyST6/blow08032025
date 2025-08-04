import axios, { AxiosInstance, AxiosError } from 'axios';
import { devAuth } from './auth.dev';

// Check if we're in development mode
const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV;

// Conditionally import Firebase auth only in production
let auth: any;
if (!isDevelopment) {
  import('./firebase').then(module => {
    auth = module.auth;
  });
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      if (isDevelopment) {
        // Dev mode: get token from dev auth
        const token = devAuth.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else if (auth) {
        // Production mode: use Firebase
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      try {
        if (isDevelopment) {
          // In dev mode, just redirect to login
          window.location.href = '/login';
        } else if (auth) {
          // Production mode: try Firebase token refresh
          const user = auth.currentUser;
          if (user) {
            await user.getIdToken(true); // Force refresh
            // Retry the original request
            const originalRequest = error.config;
            if (originalRequest) {
              const token = await user.getIdToken();
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: isDevelopment ? '/auth/dev-login' : '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
    register: isDevelopment ? '/auth/dev-register' : '/auth/register',
  },
  
  // LLM
  llm: {
    models: '/llm/models',
    analyze: '/llm/analyze',
    generate: '/llm/generate',
  },
  
  // Agents
  agents: {
    list: '/agents',
    analyze: '/agents/analyze',
    vanguard: '/agents/vanguard',
    domain: '/agents/domain',
  },
  
  // Prompts
  prompts: {
    list: '/prompts',
    create: '/prompts',
    get: (id: string) => `/prompts/${id}`,
    update: (id: string) => `/prompts/${id}`,
    delete: (id: string) => `/prompts/${id}`,
    analyze: (id: string) => `/prompts/${id}/analyze`,
  },
  
  // Reports
  reports: {
    list: '/reports',
    get: (id: string) => `/reports/${id}`,
    generate: '/reports/generate',
    export: (id: string) => `/reports/${id}/export`,
  },
  
  // Workflows
  workflows: {
    list: '/workflows',
    create: '/workflows',
    get: (id: string) => `/workflows/${id}`,
    update: (id: string) => `/workflows/${id}`,
    delete: (id: string) => `/workflows/${id}`,
    run: (id: string) => `/workflows/${id}/run`,
    status: (id: string) => `/workflows/${id}/status`,
  },
  
  // Admin
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    organizations: '/admin/organizations',
    settings: '/admin/settings',
    userRole: (userId: string) => `/admin/users/${userId}/role`,
    userStatus: (userId: string) => `/admin/users/${userId}/status`,
  },
  
  // Metrics
  metrics: {
    dashboard: '/metrics/dashboard',
    agents: '/metrics/agents',
    prompts: '/metrics/prompts',
    performance: '/metrics/performance',
  },
};

export { api };