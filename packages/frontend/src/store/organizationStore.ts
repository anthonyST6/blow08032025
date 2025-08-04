import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  vertical: 'energy' | 'government' | 'insurance';
  settings: {
    allowedDomains: string[];
    maxUsers: number;
    features: {
      advancedAnalytics: boolean;
      customWorkflows: boolean;
      apiAccess: boolean;
      whiteLabeling: boolean;
    };
    notifications: {
      email: boolean;
      slack: boolean;
      webhook?: string;
    };
  };
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    currentPeriodEnd: string;
    seats: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'ai_risk_officer' | 'compliance_reviewer' | 'user';
  status: 'active' | 'invited' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalPrompts: number;
  totalAnalyses: number;
  totalReports: number;
  averageRiskScore: number;
  monthlyUsage: {
    prompts: number;
    analyses: number;
    reports: number;
  };
}

interface OrganizationState {
  organization: Organization | null;
  users: OrganizationUser[];
  stats: OrganizationStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrganization: () => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  fetchOrganizationUsers: () => Promise<void>;
  inviteUser: (email: string, role: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  fetchOrganizationStats: () => Promise<void>;
  clearError: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  devtools(
    (set, get) => ({
      organization: null,
      users: [],
      stats: null,
      isLoading: false,
      error: null,

      fetchOrganization: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get('/organization');
          set({ organization: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch organization';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      updateOrganization: async (updates: Partial<Organization>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put('/organization', updates);
          set({ organization: response.data, isLoading: false });
          toast.success('Organization updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update organization';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchOrganizationUsers: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get('/organization/users');
          set({ users: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch users';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      inviteUser: async (email: string, role: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/organization/users/invite', { email, role });
          const newUser = response.data;
          
          set((state) => ({
            users: [...state.users, newUser],
            isLoading: false
          }));
          
          toast.success(`Invitation sent to ${email}`);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to invite user';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateUserRole: async (userId: string, role: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put(`/organization/users/${userId}/role`, { role });
          const updatedUser = response.data;
          
          set((state) => ({
            users: state.users.map(u => 
              u.id === userId ? updatedUser : u
            ),
            isLoading: false
          }));
          
          toast.success('User role updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update user role';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await api.delete(`/organization/users/${userId}`);
          
          set((state) => ({
            users: state.users.filter(u => u.id !== userId),
            isLoading: false
          }));
          
          toast.success('User removed successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to remove user';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      fetchOrganizationStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get('/organization/stats');
          set({ stats: response.data, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch organization stats';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'organization-store',
    }
  )
);

// Helper hooks
export const useOrganization = () => useOrganizationStore((state) => state.organization);
export const useOrganizationUsers = () => useOrganizationStore((state) => state.users);
export const useOrganizationStats = () => useOrganizationStore((state) => state.stats);
export const useOrganizationLoading = () => useOrganizationStore((state) => state.isLoading);
export const useOrganizationError = () => useOrganizationStore((state) => state.error);

// Selector for active users
export const useActiveUsers = () => 
  useOrganizationStore((state) => state.users.filter(u => u.status === 'active'));

// Selector for users by role
export const useUsersByRole = (role: string) => 
  useOrganizationStore((state) => state.users.filter(u => u.role === role));