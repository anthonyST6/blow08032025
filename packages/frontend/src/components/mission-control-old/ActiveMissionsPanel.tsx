import React from 'react';
import { motion } from 'framer-motion';
import { Mission, MissionCategory } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  CogIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface ActiveMissionsPanelProps {
  missions: Mission[];
  onMissionClick?: (mission: Mission) => void;
  onViewAllClick?: () => void;
}

const categoryConfig: Record<MissionCategory, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  progressColor: string;
}> = {
  'data-analysis': {
    icon: ChartBarIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    progressColor: 'bg-gradient-to-r from-blue-500 to-blue-400',
  },
  'threat-detection': {
    icon: ShieldCheckIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-400',
    progressColor: 'bg-gradient-to-r from-red-500 to-red-400',
  },
  'compliance-check': {
    icon: DocumentCheckIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
    progressColor: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
  },
  'system-optimization': {
    icon: CogIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
    progressColor: 'bg-gradient-to-r from-green-500 to-green-400',
  },
};

const MissionItem: React.FC<{
  mission: Mission;
  index: number;
  onClick?: () => void;
}> = ({ mission, index, onClick }) => {
  const config = categoryConfig[mission.category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200">
        <div className={`p-2 rounded-lg ${config.bgColor}/20 ${config.color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-seraphim-text truncate pr-2">
              {mission.name}
            </h4>
            <span className="text-xs text-seraphim-text-dim">
              {mission.progress}%
            </span>
          </div>
          
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 ${config.progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${mission.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${
              mission.status === 'completed' ? 'text-green-400' :
              mission.status === 'active' ? 'text-blue-400' :
              'text-gray-400'
            }`}>
              {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
            </span>
            <span className="text-xs text-seraphim-text-dim">
              {mission.assignedAgents.length} agents
            </span>
          </div>
        </div>
        
        <ChevronRightIcon className="h-4 w-4 text-seraphim-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
};

export const ActiveMissionsPanel: React.FC<ActiveMissionsPanelProps> = ({
  missions,
  onMissionClick,
  onViewAllClick,
}) => {
  // Sort missions by status (active first, then pending, then completed)
  const sortedMissions = [...missions].sort((a, b) => {
    const statusOrder = { active: 0, pending: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center flex-1">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2" />
            Active Missions
          </div>
          <span className="text-sm font-normal text-seraphim-text-dim">
            {missions.filter(m => m.status === 'active').length} running
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[500px] overflow-y-auto custom-scrollbar px-6 py-4">
          <div className="space-y-1">
            {sortedMissions.map((mission, index) => (
              <MissionItem
                key={mission.id}
                mission={mission}
                index={index}
                onClick={() => onMissionClick?.(mission)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default ActiveMissionsPanel;