import React, { useState } from 'react';
import {
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  LockClosedIcon,
  FingerPrintIcon,
  CogIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  department: string;
  lastLogin: Date;
  createdAt: Date;
  mfaEnabled: boolean;
  permissions: Permission[];
  accessLevel: 'basic' | 'elevated' | 'admin' | 'super-admin';
  siaCompliance: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  sessions: Session[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface Session {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'john.doe@company.com',
    name: 'John Doe',
    role: {
      id: 'role-admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: [],
      userCount: 3,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      isSystem: true,
    },
    status: 'active',
    department: 'IT Security',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2024-01-01'),
    mfaEnabled: true,
    permissions: [],
    accessLevel: 'admin',
    siaCompliance: {
      security: 98,
      integrity: 95,
      accuracy: 92,
    },
    sessions: [
      {
        id: 'session-001',
        device: 'Desktop - Chrome',
        location: 'New York, US',
        ipAddress: '192.168.1.100',
        startTime: new Date(Date.now() - 1000 * 60 * 30),
        lastActivity: new Date(),
        isActive: true,
      },
    ],
  },
  {
    id: 'user-002',
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    role: {
      id: 'role-analyst',
      name: 'Data Analyst',
      description: 'Read access to analytics and reports',
      permissions: [],
      userCount: 12,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
      isSystem: false,
    },
    status: 'active',
    department: 'Analytics',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date('2024-01-05'),
    mfaEnabled: true,
    permissions: [],
    accessLevel: 'elevated',
    siaCompliance: {
      security: 92,
      integrity: 88,
      accuracy: 95,
    },
    sessions: [],
  },
  {
    id: 'user-003',
    email: 'bob.wilson@company.com',
    name: 'Bob Wilson',
    role: {
      id: 'role-operator',
      name: 'System Operator',
      description: 'Manage AI agents and workflows',
      permissions: [],
      userCount: 8,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-12'),
      isSystem: false,
    },
    status: 'suspended',
    department: 'Operations',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date('2024-01-10'),
    mfaEnabled: false,
    permissions: [],
    accessLevel: 'basic',
    siaCompliance: {
      security: 75,
      integrity: 80,
      accuracy: 85,
    },
    sessions: [],
  },
];

const mockRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: [],
    userCount: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isSystem: true,
  },
  {
    id: 'role-analyst',
    name: 'Data Analyst',
    description: 'Read access to analytics, reports, and dashboards',
    permissions: [],
    userCount: 12,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
    isSystem: false,
  },
  {
    id: 'role-operator',
    name: 'System Operator',
    description: 'Manage AI agents, workflows, and executions',
    permissions: [],
    userCount: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12'),
    isSystem: false,
  },
  {
    id: 'role-auditor',
    name: 'Compliance Auditor',
    description: 'View audit logs and compliance reports',
    permissions: [],
    userCount: 5,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
    isSystem: false,
  },
];

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onToggleStatus }) => {
  const statusConfig = {
    active: {
      icon: CheckBadgeIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Active',
    },
    inactive: {
      icon: ClockIcon,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      label: 'Inactive',
    },
    suspended: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: 'Suspended',
    },
    pending: {
      icon: InformationCircleIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      label: 'Pending',
    },
  };

  const accessLevelColors = {
    'basic': 'bg-gray-500',
    'elevated': 'bg-blue-500',
    'admin': 'bg-purple-500',
    'super-admin': 'bg-seraphim-gold',
  };

  const status = statusConfig[user.status];
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-seraphim-gold/20 to-seraphim-gold/5 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-seraphim-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${status.bgColor} flex items-center space-x-1`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Role</p>
            <p className="text-sm text-white font-medium">{user.role.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Department</p>
            <p className="text-sm text-white">{user.department}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Access Level</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${accessLevelColors[user.accessLevel]}`} />
              <span className="text-sm text-white capitalize">{user.accessLevel}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Login</p>
            <p className="text-sm text-white">
              {user.lastLogin.toLocaleDateString()} {user.lastLogin.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`flex items-center space-x-1 ${user.mfaEnabled ? 'text-green-500' : 'text-gray-500'}`}>
            <FingerPrintIcon className="w-4 h-4" />
            <span className="text-xs">MFA {user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          {user.sessions.some(s => s.isActive) && (
            <div className="flex items-center space-x-1 text-blue-500">
              <DevicePhoneMobileIcon className="w-4 h-4" />
              <span className="text-xs">{user.sessions.filter(s => s.isActive).length} Active Sessions</span>
            </div>
          )}
        </div>

        {/* SIA Compliance */}
        <div className="flex items-center justify-between mb-4 p-3 bg-black/30 rounded-lg">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-vanguard-blue rounded-full" />
            <span className="text-xs text-gray-300">S: {user.siaCompliance.security}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-vanguard-red rounded-full" />
            <span className="text-xs text-gray-300">I: {user.siaCompliance.integrity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-vanguard-green rounded-full" />
            <span className="text-xs text-gray-300">A: {user.siaCompliance.accuracy}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleStatus(user)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {user.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(user)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => onDelete(user)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-seraphim-gold/10 border border-seraphim-gold/30">
              <ShieldCheckIcon className="w-5 h-5 text-seraphim-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{role.name}</h3>
              {role.isSystem && (
                <span className="text-xs text-seraphim-gold">System Role</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{role.userCount} users</span>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-4">{role.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Created {role.createdAt.toLocaleDateString()}</span>
          <span>Updated {role.updatedAt.toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(role)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={role.isSystem}
          >
            <PencilIcon className={`w-4 h-4 ${role.isSystem ? 'text-gray-600' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={() => onDelete(role)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={role.isSystem}
          >
            <TrashIcon className={`w-4 h-4 ${role.isSystem ? 'text-gray-600' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>
    </Card>
  );
};

const UserManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    role: 'all',
    department: 'all',
  });

  const handleEditUser = (user: User) => {
    console.log('Edit user:', user);
    // TODO: Implement edit functionality
  };

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user);
    // TODO: Implement delete functionality
  };

  const handleToggleUserStatus = (user: User) => {
    console.log('Toggle user status:', user);
    // TODO: Implement status toggle
  };

  const handleEditRole = (role: Role) => {
    console.log('Edit role:', role);
    // TODO: Implement edit functionality
  };

  const handleDeleteRole = (role: Role) => {
    console.log('Delete role:', role);
    // TODO: Implement delete functionality
  };

  const filteredUsers = mockUsers.filter((user) => {
    if (selectedFilters.status !== 'all' && user.status !== selectedFilters.status) return false;
    if (selectedFilters.role !== 'all' && user.role.id !== selectedFilters.role) return false;
    if (selectedFilters.department !== 'all' && user.department !== selectedFilters.department) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const departments = Array.from(new Set(mockUsers.map(u => u.department)));

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <UserGroupIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          User & Role Management
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage users, roles, and permissions for secure access control
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setSelectedTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'users'
              ? 'bg-seraphim-gold/20 text-seraphim-gold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <UserIcon className="w-4 h-4 inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setSelectedTab('roles')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'roles'
              ? 'bg-seraphim-gold/20 text-seraphim-gold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
          Roles
        </button>
        <button
          onClick={() => setSelectedTab('permissions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'permissions'
              ? 'bg-seraphim-gold/20 text-seraphim-gold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <KeyIcon className="w-4 h-4 inline mr-2" />
          Permissions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {selectedTab === 'users' && (
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                Filters
              </h3>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">
                    Status
                  </label>
                  <select
                    value={selectedFilters.status}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">
                    Role
                  </label>
                  <select
                    value={selectedFilters.role}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, role: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    {mockRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">
                    Department
                  </label>
                  <select
                    value={selectedFilters.department}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, department: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Users</span>
                  <span className="text-sm font-semibold text-white">{mockUsers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active Users</span>
                  <span className="text-sm font-semibold text-green-500">
                    {mockUsers.filter(u => u.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">MFA Enabled</span>
                  <span className="text-sm font-semibold text-blue-500">
                    {mockUsers.filter(u => u.mfaEnabled).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Suspended</span>
                  <span className="text-sm font-semibold text-red-500">
                    {mockUsers.filter(u => u.status === 'suspended').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className={selectedTab === 'users' ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {selectedTab === 'users' && `${filteredUsers.length} Users`}
              {selectedTab === 'roles' && `${mockRoles.length} Roles`}
              {selectedTab === 'permissions' && 'Permission Management'}
            </h2>
            <Button variant="primary">
              <PlusIcon className="w-4 h-4 mr-1" />
              {selectedTab === 'users' && 'Add User'}
              {selectedTab === 'roles' && 'Create Role'}
              {selectedTab === 'permissions' && 'Add Permission'}
            </Button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {selectedTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4"
              >
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onToggleStatus={handleToggleUserStatus}
                  />
                ))}
              </motion.div>
            )}

            {selectedTab === 'roles' && (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {mockRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                  />
                ))}
              </motion.div>
            )}

            {selectedTab === 'permissions' && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-6">
                  <div className="text-center py-12">
                    <KeyIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Permission management interface coming soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Configure granular permissions for roles and users
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;