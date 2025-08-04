import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { getExecutiveSummary } from '../services/executiveSummary.service';

interface ExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  useCase: {
    id: string;
    name: string;
    description: string;
    verticalId?: string;
  };
  vertical?: {
    name: string;
    description: string;
  };
}

const ExecutiveSummaryModal: React.FC<ExecutiveSummaryModalProps> = ({
  isOpen,
  onClose,
  useCase,
  vertical,
}) => {
  // Get comprehensive executive summary content
  const summary = getExecutiveSummary(useCase.id, useCase.name, vertical?.name || 'Industry');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-seraphim-black border border-seraphim-gold/30 shadow-2xl">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-seraphim-gold/20 to-transparent p-6 border-b border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-seraphim-gold/20 rounded-lg">
                    <DocumentTextIcon className="h-8 w-8 text-seraphim-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Executive Summary</h2>
                    <p className="text-lg text-seraphim-gold">{useCase.name}</p>
                    {vertical && (
                      <p className="text-sm text-gray-400 mt-1">{vertical.name} Vertical</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
                {/* Pain Points */}
                <div className="bg-gradient-to-br from-red-900/20 to-transparent rounded-lg p-6 border border-red-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    Industry Pain Points
                  </h3>
                  <ul className="space-y-3">
                    {summary.painPoints.map((pain: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-gray-300 text-sm leading-relaxed">{pain}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Business Case */}
                <div className="bg-gradient-to-br from-vanguard-blue/20 to-transparent rounded-lg p-6 border border-vanguard-blue/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-vanguard-blue mr-2" />
                    Business Case
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{summary.businessCase}</p>
                </div>

                {/* Technical Case */}
                <div className="bg-gradient-to-br from-vanguard-red/20 to-transparent rounded-lg p-6 border border-vanguard-red/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CpuChipIcon className="h-5 w-5 text-vanguard-red mr-2" />
                    Technical Approach
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{summary.technicalCase}</p>
                </div>

                {/* Key Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <LightBulbIcon className="h-5 w-5 text-vanguard-green mr-2" />
                    Key Benefits & Outcomes
                  </h3>
                  <div className="bg-black/30 rounded-lg p-6 border border-white/10">
                    <ul className="space-y-3">
                      {summary.keyBenefits.map((benefit: string, index: number) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-vanguard-green mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Company References */}
                {summary.companyReferences && summary.companyReferences.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-900/20 to-transparent rounded-lg p-6 border border-yellow-500/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      Industry Examples & Case Studies
                    </h3>
                    <div className="space-y-4">
                      {summary.companyReferences.map((ref: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="bg-black/30 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white mb-1">{ref.company}</h4>
                              <p className="text-sm text-gray-300">{ref.issue}</p>
                            </div>
                            {ref.link && (
                              <a
                                href={ref.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                title="View source"
                              >
                                <LinkIcon className="h-4 w-4 text-seraphim-gold" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROI Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-seraphim-gold mr-2" />
                    Return on Investment
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-vanguard-blue/20 to-transparent rounded-lg p-4 border border-vanguard-blue/30">
                      <p className="text-xs text-gray-400 mb-1">Implementation</p>
                      <p className="text-lg font-bold text-vanguard-blue">2-6 weeks</p>
                    </div>
                    <div className="bg-gradient-to-br from-vanguard-green/20 to-transparent rounded-lg p-4 border border-vanguard-green/30">
                      <p className="text-xs text-gray-400 mb-1">Payback Period</p>
                      <p className="text-lg font-bold text-vanguard-green">3-12 months</p>
                    </div>
                    <div className="bg-gradient-to-br from-seraphim-gold/20 to-transparent rounded-lg p-4 border border-seraphim-gold/30">
                      <p className="text-xs text-gray-400 mb-1">Annual Savings</p>
                      <p className="text-lg font-bold text-seraphim-gold">$1M - $10M+</p>
                    </div>
                    <div className="bg-gradient-to-br from-vanguard-red/20 to-transparent rounded-lg p-4 border border-vanguard-red/30">
                      <p className="text-xs text-gray-400 mb-1">Efficiency Gain</p>
                      <p className="text-lg font-bold text-vanguard-red">10-20x</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-black/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Ready to transform your {vertical?.name || 'operations'}?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      onClick={onClose}
                      className="flex items-center"
                    >
                      <RocketLaunchIcon className="h-4 w-4 mr-2" />
                      Launch Mission
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExecutiveSummaryModal;