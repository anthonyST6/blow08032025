import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    users?: string[];
    actions?: string[];
    resources?: string[];
    severity?: string[];
  };
  includeFields: {
    timestamp: boolean;
    user: boolean;
    action: boolean;
    resource: boolean;
    details: boolean;
    ip: boolean;
    userAgent: boolean;
    severity: boolean;
  };
}

interface ExportPreview {
  totalRecords: number;
  estimatedSize: string;
  sampleData: any[];
}

const ExportAuditData: React.FC = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    filters: {
      users: [],
      actions: [],
      resources: [],
      severity: []
    },
    includeFields: {
      timestamp: true,
      user: true,
      action: true,
      resource: true,
      details: true,
      ip: true,
      userAgent: false,
      severity: true
    }
  });

  // Fetch available filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['audit-filter-options'],
    queryFn: async () => {
      const response = await api.get('/api/audit/filter-options');
      return response.data;
    }
  });

  // Preview export
  const { data: preview, isLoading: previewLoading, refetch: refreshPreview } = useQuery({
    queryKey: ['export-preview', exportOptions],
    queryFn: async () => {
      const response = await api.post('/api/audit/export/preview', exportOptions);
      return response.data as ExportPreview;
    },
    enabled: false
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/audit/export', exportOptions, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-export-${Date.now()}.${exportOptions.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Audit data exported successfully');
    },
    onError: () => {
      toast.error('Failed to export audit data');
    }
  });

  const handleFieldToggle = (field: keyof ExportOptions['includeFields']) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: !prev.includeFields[field]
      }
    }));
  };

  const handleFilterChange = (filterType: keyof ExportOptions['filters'], values: string[]) => {
    setExportOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: values
      }
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Export Audit Data</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Export audit logs for compliance reporting and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Export Format
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {(['csv', 'pdf', 'json'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportOptions(prev => ({ ...prev, format }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    exportOptions.format === format
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {format === 'csv' && '📊'}
                      {format === 'pdf' && '📄'}
                      {format === 'json' && '{ }'}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase">
                      {format}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {format === 'csv' && 'Spreadsheet compatible'}
                      {format === 'pdf' && 'Formatted report'}
                      {format === 'json' && 'Machine readable'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Date Range
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0]
                    }
                  }));
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 7 days
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0]
                    }
                  }));
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 30 days
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0]
                    }
                  }));
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 90 days
              </button>
            </div>
          </div>

          {/* Fields to Include */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Fields to Include
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(exportOptions.includeFields).map(([field, included]) => (
                <label key={field} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={() => handleFieldToggle(field as keyof ExportOptions['includeFields'])}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          {filterOptions && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Filters (Optional)
              </h2>
              <div className="space-y-4">
                {/* User Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Users
                  </label>
                  <select
                    multiple
                    value={exportOptions.filters.users}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('users', values);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    size={3}
                  >
                    {filterOptions.users?.map((user: string) => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>

                {/* Action Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actions
                  </label>
                  <select
                    multiple
                    value={exportOptions.filters.actions}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('actions', values);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    size={3}
                  >
                    {filterOptions.actions?.map((action: string) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </label>
                  <div className="flex gap-4">
                    {['info', 'warning', 'error', 'critical'].map((severity) => (
                      <label key={severity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.filters.severity?.includes(severity)}
                          onChange={(e) => {
                            const current = exportOptions.filters.severity || [];
                            if (e.target.checked) {
                              handleFilterChange('severity', [...current, severity]);
                            } else {
                              handleFilterChange('severity', current.filter(s => s !== severity));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {severity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview and Export */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Export Preview
            </h2>
            
            <button
              onClick={() => refreshPreview()}
              disabled={previewLoading}
              className="w-full mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {previewLoading ? 'Loading...' : 'Generate Preview'}
            </button>

            {preview && (
              <div className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Records:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {preview.totalRecords.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Estimated Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {preview.estimatedSize}
                    </span>
                  </div>
                </div>

                {preview.sampleData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sample Data (First 3 records)
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {preview.sampleData.slice(0, 3).map((record, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs font-mono overflow-x-auto"
                        >
                          <pre>{JSON.stringify(record, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Export Actions
            </h2>
            
            <button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Exporting...
                </span>
              ) : (
                `Export as ${exportOptions.format.toUpperCase()}`
              )}
            </button>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Export Information
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Exports are generated server-side</li>
                <li>• Large exports may take several minutes</li>
                <li>• Files are automatically downloaded when ready</li>
                <li>• All timestamps are in UTC</li>
              </ul>
            </div>

            {/* Recent Exports */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Exports
              </h3>
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between py-1">
                    <span>audit-export-1234567890.csv</span>
                    <span>2.3 MB</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>audit-export-1234567891.pdf</span>
                    <span>1.8 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportAuditData;