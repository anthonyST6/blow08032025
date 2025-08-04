import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { ComplianceTrackerProps } from '../types';

export const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({
  requirements,
  status,
  groupBy = 'category',
  showProgress = true,
  onRequirementClick,
}) => {
  // Create a map of requirement status
  const statusMap = useMemo(() => {
    const map = new Map<string, any>();
    status.forEach(s => {
      map.set(s.requirementId, s);
    });
    return map;
  }, [status]);

  // Group requirements based on groupBy prop
  const groupedRequirements = useMemo(() => {
    const groups = new Map<string, typeof requirements>();
    
    requirements.forEach(req => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'category':
          groupKey = req.category;
          break;
        case 'status':
          groupKey = statusMap.get(req.id)?.status || 'pending';
          break;
        case 'deadline':
          if (!req.dueDate) {
            groupKey = 'No deadline';
          } else {
            const daysUntilDue = Math.ceil((new Date(req.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue < 0) groupKey = 'Overdue';
            else if (daysUntilDue <= 7) groupKey = 'Due this week';
            else if (daysUntilDue <= 30) groupKey = 'Due this month';
            else groupKey = 'Due later';
          }
          break;
        default:
          groupKey = 'Other';
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(req);
    });
    
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [requirements, groupBy, statusMap]);

  // Calculate overall compliance statistics
  const stats = useMemo(() => {
    const total = requirements.length;
    let compliant = 0;
    let nonCompliant = 0;
    let partial = 0;
    let pending = 0;
    
    requirements.forEach(req => {
      const reqStatus = statusMap.get(req.id)?.status || 'pending';
      switch (reqStatus) {
        case 'compliant':
          compliant++;
          break;
        case 'non-compliant':
          nonCompliant++;
          break;
        case 'partial':
          partial++;
          break;
        default:
          pending++;
      }
    });
    
    return {
      total,
      compliant,
      nonCompliant,
      partial,
      pending,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
    };
  }, [requirements, statusMap]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'non-compliant':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'non-compliant':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilDue = (dueDate: Date | string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      {showProgress && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Compliance</h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Compliance Rate</span>
              <span>{stats.complianceRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-green-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.complianceRate}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
              <div className="text-xs text-gray-500">Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
              <div className="text-xs text-gray-500">Partial</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.nonCompliant}</div>
              <div className="text-xs text-gray-500">Non-Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Requirements */}
      <div className="space-y-4">
        {groupedRequirements.map(([groupName, groupReqs], groupIndex) => (
          <motion.div
            key={groupName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="bg-white rounded-lg shadow"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-md font-medium text-gray-900">{groupName}</h4>
              <p className="text-sm text-gray-500 mt-1">{groupReqs.length} requirements</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {groupReqs.map((req) => {
                const reqStatus = statusMap.get(req.id);
                const currentStatus = reqStatus?.status || 'pending';
                
                return (
                  <div
                    key={req.id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      onRequirementClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => onRequirementClick && onRequirementClick(req)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(currentStatus)}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{req.name}</h5>
                          {req.description && (
                            <p className="text-sm text-gray-500 mt-1">{req.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace('-', ' ')}
                            </span>
                            {req.dueDate && (
                              <span className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(req.dueDate)} ({getDaysUntilDue(req.dueDate)})
                              </span>
                            )}
                            {reqStatus?.lastUpdated && (
                              <span className="text-xs text-gray-400">
                                Updated {formatDate(reqStatus.lastUpdated)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};