import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface NewUserForm {
  email: string;
  displayName: string;
  role: string;
  department: string;
  permissions: {
    canCreatePrompts: boolean;
    canViewAnalytics: boolean;
    canManageWorkflows: boolean;
    canExportData: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
    canManageAgents: boolean;
    canViewCompliance: boolean;
  };
  metadata: {
    jobTitle: string;
    phoneNumber: string;
    location: string;
    manager: string;
    startDate: string;
  };
  sendWelcomeEmail: boolean;
  temporaryPassword: string;
}

const NewUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewUserForm>({
    email: '',
    displayName: '',
    role: 'User',
    department: '',
    permissions: {
      canCreatePrompts: true,
      canViewAnalytics: false,
      canManageWorkflows: false,
      canExportData: false,
      canManageUsers: false,
      canViewAuditLogs: false,
      canManageAgents: false,
      canViewCompliance: false
    },
    metadata: {
      jobTitle: '',
      phoneNumber: '',
      location: '',
      manager: '',
      startDate: new Date().toISOString().split('T')[0]
    },
    sendWelcomeEmail: true,
    temporaryPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(true);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: NewUserForm) => {
      const response = await api.post('/api/users', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('User created successfully');
      navigate(`/users/${data.uid}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.displayName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!generatePassword && !formData.temporaryPassword) {
      toast.error('Please provide a temporary password');
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handlePermissionChange = (permission: keyof NewUserForm['permissions']) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: getRoleDefaultPermissions(role)
    }));
  };

  const getRoleDefaultPermissions = (role: string) => {
    switch (role) {
      case 'Admin':
        return {
          canCreatePrompts: true,
          canViewAnalytics: true,
          canManageWorkflows: true,
          canExportData: true,
          canManageUsers: true,
          canViewAuditLogs: true,
          canManageAgents: true,
          canViewCompliance: true
        };
      case 'AI Risk Officer':
        return {
          canCreatePrompts: true,
          canViewAnalytics: true,
          canManageWorkflows: true,
          canExportData: true,
          canManageUsers: false,
          canViewAuditLogs: true,
          canManageAgents: true,
          canViewCompliance: true
        };
      case 'Compliance Reviewer':
        return {
          canCreatePrompts: false,
          canViewAnalytics: true,
          canManageWorkflows: false,
          canExportData: true,
          canManageUsers: false,
          canViewAuditLogs: true,
          canManageAgents: false,
          canViewCompliance: true
        };
      default: // User
        return {
          canCreatePrompts: true,
          canViewAnalytics: false,
          canManageWorkflows: false,
          canExportData: false,
          canManageUsers: false,
          canViewAuditLogs: false,
          canManageAgents: false,
          canViewCompliance: false
        };
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New User</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Add a new user to the Seraphim Vanguard platform
            </p>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="User">User</option>
                <option value="AI Risk Officer">AI Risk Officer</option>
                <option value="Compliance Reviewer">Compliance Reviewer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Engineering, Compliance, Risk Management"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.metadata.jobTitle}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, jobTitle: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.metadata.phoneNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, phoneNumber: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.metadata.location}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, location: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manager
              </label>
              <input
                type="text"
                value={formData.metadata.manager}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, manager: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.metadata.startDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, startDate: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Permissions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Permissions are automatically set based on the selected role, but can be customized as needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.permissions).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handlePermissionChange(key as keyof NewUserForm['permissions'])}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^can/, 'Can').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Password & Welcome Email */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Password & Welcome Email
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generatePassword}
                  onChange={(e) => {
                    setGeneratePassword(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, temporaryPassword: '' }));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Generate temporary password automatically
                </span>
              </label>
            </div>

            {!generatePassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, temporaryPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter temporary password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, temporaryPassword: generateRandomPassword() }))}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Generate random password
                </button>
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sendWelcomeEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Send welcome email with login instructions
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createUserMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {createUserMutation.isPending ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewUser;