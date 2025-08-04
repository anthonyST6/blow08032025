import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DocumentTextIcon,
  DocumentIcon,
  TableCellsIcon,
  CodeBracketIcon,
  CloudArrowDownIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  ChevronDownIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { reportService, ReportMetadata } from '../services/report.service';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ReportRepositoryProps {
  useCaseId?: string;
  onGenerateReport?: () => void;
}

export const ReportRepository: React.FC<ReportRepositoryProps> = ({
  useCaseId,
  onGenerateReport,
}) => {
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ReportMetadata | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, [useCaseId]);

  // Filter reports
  useEffect(() => {
    let filtered = reports;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.agent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }

    // Agent filter
    if (filterAgent !== 'all') {
      filtered = filtered.filter(report => report.agent === filterAgent);
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, filterType, filterAgent]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const filters = useCaseId ? { useCaseId } : undefined;
      const loadedReports = await reportService.listReports(filters);
      setReports(loadedReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: ReportMetadata) => {
    try {
      await reportService.downloadReport(report.id, report.name, report.type);
      toast.success(`Downloaded ${report.name}.${report.type}`);
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      setDeleteConfirm(null);
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleGenerateSamples = async () => {
    setLoading(true);
    try {
      const sampleReports = await reportService.generateSampleReports(useCaseId);
      setReports([...sampleReports, ...reports]);
      toast.success('Sample reports generated successfully');
    } catch (error) {
      console.error('Failed to generate sample reports:', error);
      toast.error('Failed to generate sample reports');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'json':
        return <CodeBracketIcon className="w-5 h-5" />;
      case 'xlsx':
        return <TableCellsIcon className="w-5 h-5" />;
      case 'txt':
        return <DocumentIcon className="w-5 h-5" />;
      default:
        return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'text-red-500';
      case 'json':
        return 'text-green-500';
      case 'xlsx':
        return 'text-blue-500';
      case 'txt':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get unique agents and types
  const agents = Array.from(new Set(reports.map(r => r.agent)));
  const types = ['pdf', 'json', 'xlsx', 'txt'];

  // Calculate stats
  const stats = {
    total: reports.length,
    pdf: reports.filter(r => r.type === 'pdf').length,
    json: reports.filter(r => r.type === 'json').length,
    xlsx: reports.filter(r => r.type === 'xlsx').length,
    txt: reports.filter(r => r.type === 'txt').length,
    totalSize: reports.reduce((sum, r) => sum + r.size, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FolderOpenIcon className="w-8 h-8 mr-3 text-purple-500" />
            Report Repository
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage and download generated reports
          </p>
        </div>
        <div className="flex space-x-2">
          {onGenerateReport && (
            <Button onClick={onGenerateReport} variant="primary">
              <PlusIcon className="w-4 h-4 mr-1" />
              Generate Report
            </Button>
          )}
          <Button onClick={handleGenerateSamples} variant="secondary" disabled={loading}>
            <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
            Generate Samples
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Total Reports</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">PDF</p>
          <p className="text-2xl font-bold text-red-500">{stats.pdf}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">JSON</p>
          <p className="text-2xl font-bold text-green-500">{stats.json}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Excel</p>
          <p className="text-2xl font-bold text-blue-500">{stats.xlsx}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Text</p>
          <p className="text-2xl font-bold text-gray-500">{stats.txt}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-1">Total Size</p>
          <p className="text-2xl font-bold text-purple-500">{formatFileSize(stats.totalSize)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <Button variant="secondary" size="sm" onClick={loadReports} disabled={loading}>
            <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none appearance-none pr-10"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Agent</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none appearance-none pr-10"
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
              >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">
          {reports.length === 0 ? (
            <div>
              <FolderOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No reports found.</p>
              <p className="text-sm mt-2">Generate reports to see them here.</p>
            </div>
          ) : (
            <div>
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No reports match your filters.</p>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:border-purple-500/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <Badge variant="secondary" size="small">
                      {report.type.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1 truncate">{report.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{report.agent}</span>
                    <span>{formatFileSize(report.size)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(report)}
                      className="flex-1"
                    >
                      <CloudArrowDownIcon className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    {deleteConfirm === report.id ? (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteConfirm(report.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};