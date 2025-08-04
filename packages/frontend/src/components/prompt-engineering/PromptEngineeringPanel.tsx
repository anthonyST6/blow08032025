import React from 'react';
import { motion } from 'framer-motion';
import { PromptTemplate, PromptStatus, PromptCategory } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  BeakerIcon,
  DocumentTextIcon,
  SparklesIcon,
  TagIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  BeakerIcon as FlaskIcon,
} from '@heroicons/react/24/outline';

interface PromptEngineeringPanelProps {
  templates: PromptTemplate[];
  onTemplateClick?: (template: PromptTemplate) => void;
}

const statusConfig: Record<PromptStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  draft: {
    icon: PencilSquareIcon,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
  },
  testing: {
    icon: FlaskIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
  },
  active: {
    icon: CheckCircleIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
  },
  archived: {
    icon: ArchiveBoxIcon,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500',
  },
};

const categoryIcons: Record<PromptCategory, React.ComponentType<{ className?: string }>> = {
  analysis: ChartBarIcon,
  generation: SparklesIcon,
  classification: TagIcon,
  extraction: DocumentTextIcon,
};

interface TemplateItemProps {
  template: PromptTemplate;
  index: number;
  onClick?: () => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, index, onClick }) => {
  const statusConf = statusConfig[template.status];
  const StatusIcon = statusConf.icon;
  const CategoryIcon = categoryIcons[template.category];
  const isHighPerforming = template.successRate > 95;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-seraphim-gold/50 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${statusConf.bgColor}/20 ${statusConf.color}`}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-seraphim-text truncate">{template.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-seraphim-text-dim">v{template.version}</span>
                <span className="text-xs text-seraphim-text-dim">•</span>
                <span className="text-xs text-seraphim-text-dim capitalize">{template.category}</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${statusConf.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs capitalize">{template.status}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-seraphim-gold/10 text-seraphim-gold rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-xs text-seraphim-text-dim">Usage</p>
            <p className="text-sm font-medium text-seraphim-text">{template.usageCount}</p>
          </div>
          <div>
            <p className="text-xs text-seraphim-text-dim">Success</p>
            <p className={`text-sm font-medium ${isHighPerforming ? 'text-green-400' : 'text-seraphim-text'}`}>
              {template.successRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-seraphim-text-dim">Tokens</p>
            <p className="text-sm font-medium text-seraphim-text">{template.averageTokens}</p>
          </div>
        </div>

        {/* Success Rate Bar */}
        <div className="mb-3">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 ${
                isHighPerforming 
                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                  : 'bg-gradient-to-r from-seraphim-gold to-yellow-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${template.successRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-1 text-xs text-seraphim-text-dim">
            <ClockIcon className="h-3 w-3" />
            <span>Modified {getTimeAgo(template.lastModified)}</span>
          </div>
          <span className="text-xs text-seraphim-text-dim">by {template.createdBy}</span>
        </div>
      </div>
    </motion.div>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export const PromptEngineeringPanel: React.FC<PromptEngineeringPanelProps> = ({
  templates,
  onTemplateClick,
}) => {
  const activeCount = templates.filter(t => t.status === 'active').length;
  const testingCount = templates.filter(t => t.status === 'testing').length;
  const avgSuccessRate = templates
    .filter(t => t.status === 'active')
    .reduce((sum, t, _, arr) => sum + t.successRate / arr.length, 0);

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center flex-1">
            <BeakerIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-float" />
            Prompt Engineering
          </div>
          <div className="flex items-center space-x-3 text-sm font-normal">
            <span className="text-green-400">{activeCount} active</span>
            <span className="text-yellow-400">{testingCount} testing</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[600px] overflow-y-auto custom-scrollbar px-6 py-4">
          <div className="space-y-3">
            {templates.map((template, index) => (
              <TemplateItem
                key={template.id}
                template={template}
                index={index}
                onClick={() => onTemplateClick?.(template)}
              />
            ))}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-seraphim-gold">{templates.length}</p>
              <p className="text-xs text-seraphim-text-dim">Total Templates</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              <p className="text-xs text-seraphim-text-dim">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {avgSuccessRate.toFixed(1)}%
              </p>
              <p className="text-xs text-seraphim-text-dim">Avg Success</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-seraphim-text-dim">Total Usage</p>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default PromptEngineeringPanel;