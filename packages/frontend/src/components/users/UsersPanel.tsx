import React from 'react';
import { motion } from 'framer-motion';
import { UserManagement, UserStatus, UserActivity, UserRole } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  CircleStackIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  ClockIcon as PendingIcon,
} from '@heroicons/react/24/outline';

interface UsersPanelProps {
  users: UserManagement[];
  onUserClick?: (user: UserManagement) => void;
}

const statusConfig: Record<UserStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  active: {
    icon: CheckCircleIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
  },
  inactive: {
    icon: XCircleIcon,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
  },
  suspended: {
    icon: PauseCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-400',
  },
  pending: {
    icon: PendingIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
  },
};

const activityIndicators: Record<UserActivity, {
  color: string;
  pulseClass?: string;
}> = {
  online: {
    color: 'bg-green-400',
    pulseClass: 'animate-pulse',
  },
  away: {
    color: 'bg-yellow-400',
  },
  offline: {
    color: 'bg-gray-400',
  },
};

const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'text-purple-400 bg-purple-400/20',
  [UserRole.AI_RISK_OFFICER]: 'text-blue-400 bg-blue-400/20',
  [UserRole.COMPLIANCE_REVIEWER]: 'text-yellow-400 bg-yellow-400/20',
  [UserRole.USER]: 'text-gray-400 bg-gray-400/20',
};

interface UserItemProps {
  user: UserManagement;
  index: number;
  onClick?: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, index, onClick }) => {
  const statusConf = statusConfig[user.status];
  const StatusIcon = statusConf.icon;
  const activityConf = activityIndicators[user.activity];
  const roleColor = roleColors[user.role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-seraphim-gold/50 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* User Avatar with Activity Indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-seraphim-gold/20 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-seraphim-gold" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${activityConf.color} ${activityConf.pulseClass || ''} ring-2 ring-seraphim-black`} />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-seraphim-text">{user.displayName}</h4>
              <p className="text-xs text-seraphim-text-dim">{user.email}</p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-1 ${statusConf.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs capitalize">{user.status}</span>
          </div>
        </div>

        {/* Role and Department */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-0.5 text-xs rounded-full ${roleColor}`}>
            {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {user.department && (
            <span className="px-2 py-0.5 text-xs bg-white/10 text-seraphim-text rounded-full">
              {user.department}
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-xs text-seraphim-text-dim">Sessions</p>
            <p className="text-sm font-medium text-seraphim-text">{user.sessionsActive}</p>
          </div>
          <div>
            <p className="text-xs text-seraphim-text-dim">Storage</p>
            <p className="text-sm font-medium text-seraphim-text">{user.storageUsed} MB</p>
          </div>
          <div>
            <p className="text-xs text-seraphim-text-dim">API Calls</p>
            <p className="text-sm font-medium text-seraphim-text">{user.apiCallsToday}</p>
          </div>
        </div>

        {/* Permissions */}
        <div className="mb-3">
          <p className="text-xs text-seraphim-text-dim mb-1">Permissions</p>
          <div className="flex flex-wrap gap-1">
            {user.permissions.map((permission) => (
              <span
                key={permission}
                className="px-2 py-0.5 text-xs bg-seraphim-gold/10 text-seraphim-gold rounded"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-xs text-seraphim-text-dim">
            <span>Last login: </span>
            <span className="text-seraphim-text">{getTimeAgo(user.lastLogin)}</span>
          </div>
          <div className="text-xs text-seraphim-text-dim">
            <span>Created: </span>
            <span className="text-seraphim-text">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const UsersPanel: React.FC<UsersPanelProps> = ({
  users,
  onUserClick,
}) => {
  const activeCount = users.filter(u => u.status === 'active').length;
  const onlineCount = users.filter(u => u.activity === 'online').length;
  const totalStorage = users.reduce((sum, u) => sum + u.storageUsed, 0);
  const totalApiCalls = users.reduce((sum, u) => sum + u.apiCallsToday, 0);

  // Group users by role
  const usersByRole = users.reduce((acc, user) => {
    const roleKey = user.role;
    if (!acc[roleKey]) {
      acc[roleKey] = [];
    }
    acc[roleKey].push(user);
    return acc;
  }, {} as Record<UserRole, UserManagement[]>);

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center flex-1">
            <UserGroupIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            User Management
          </div>
          <div className="flex items-center space-x-3 text-sm font-normal">
            <span className="text-green-400">{onlineCount} online</span>
            <span className="text-seraphim-text-dim">{activeCount} active</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[600px] overflow-y-auto custom-scrollbar px-6 py-4">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <div key={role} className="mb-6">
              <h3 className="text-sm font-medium text-seraphim-text-dim mb-3">
                {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}s ({roleUsers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleUsers.map((user, index) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    index={index}
                    onClick={() => onUserClick?.(user)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-seraphim-gold">{users.length}</p>
              <p className="text-xs text-seraphim-text-dim">Total Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              <p className="text-xs text-seraphim-text-dim">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{onlineCount}</p>
              <p className="text-xs text-seraphim-text-dim">Online Now</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {(totalStorage / 1024).toFixed(1)}
              </p>
              <p className="text-xs text-seraphim-text-dim">GB Storage</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {totalApiCalls.toLocaleString()}
              </p>
              <p className="text-xs text-seraphim-text-dim">API Calls Today</p>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default UsersPanel;