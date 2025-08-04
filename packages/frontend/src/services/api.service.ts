/**
 * Base API Service
 * Handles authentication, error handling, and common API functionality
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Get authentication token
   * Works with both production Firebase auth and dev mode
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // Check if we're in dev mode
      const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV;
      
      if (isDevelopment) {
        // In dev mode, get token from localStorage
        const devAuth = localStorage.getItem('dev-auth');
        if (devAuth) {
          const { token } = JSON.parse(devAuth);
          return token || null;
        }
        return null;
      } else {
        // In production, we need to get the token from Firebase
        // We'll use a dynamic import to avoid circular dependencies
        const { auth } = await import('./firebase');
        const user = auth.currentUser;
        if (!user) return null;
        return await user.getIdToken();
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();