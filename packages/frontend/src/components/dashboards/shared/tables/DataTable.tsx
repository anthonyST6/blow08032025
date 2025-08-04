import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowsUpDownIcon 
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/Card';
import { Badge } from '../../../Badge';
import { DashboardComponentProps, TableColumn } from '../types';
import { EmptyStateWrapper } from '../EmptyStateWrapper';

interface DataTableProps extends DashboardComponentProps {
  title: string;
  columns: TableColumn[];
  pageSize?: number;
  sortable?: boolean;
  searchable?: boolean;
  showPagination?: boolean;
  onRowClick?: (row: any) => void;
  rowKey?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  columns,
  isLiveData,
  hasData,
  onDataRequest,
  className = '',
  pageSize = 10,
  sortable = true,
  searchable = false,
  showPagination = true,
  onRowClick,
  rowKey = 'id',
  loading = false,
  error = null
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!hasData || !data || !Array.isArray(data)) return [];
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns, hasData]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = aVal.toString();
      const bStr = bVal.toString();
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: string) => {
    if (!sortable) return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (!sortable) return null;
    
    if (sortColumn !== column) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-500" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-500" />;
  };

  const tableContent = (
    <Card variant="glass" effect="glow" className={`data-table ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {isLiveData && hasData && (
              <Badge variant="info" size="small">
                LIVE
              </Badge>
            )}
            {searchable && hasData && (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-2"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded mb-2"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : !hasData || paginatedData.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No data to display</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 py-3 text-left text-sm font-medium text-gray-400 ${
                          column.sortable !== false && sortable ? 'cursor-pointer hover:text-white' : ''
                        }`}
                        style={{ width: column.width }}
                        onClick={() => column.sortable !== false && handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.header}</span>
                          {column.sortable !== false && getSortIcon(column.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <motion.tr
                      key={row[rowKey] || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-sm text-gray-300 ${
                            column.align ? `text-${column.align}` : ''
                          }`}
                        >
                          {column.render 
                            ? column.render(row[column.key], row)
                            : row[column.key] ?? '—'
                          }
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                  Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                  {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
                  {sortedData.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <EmptyStateWrapper
      hasData={hasData}
      onDataRequest={onDataRequest}
      config={{
        title: 'No Table Data',
        description: `Ingest data to view ${title}`,
      }}
    >
      {tableContent}
    </EmptyStateWrapper>
  );
};

// Preset table configurations
export const createLeaseTableColumns = (): TableColumn[] => [
  {
    key: 'leaseId',
    header: 'Lease ID',
    sortable: true,
    width: '120px'
  },
  {
    key: 'leaseName',
    header: 'Lease Name',
    sortable: true
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => (
      <Badge 
        variant={value === 'Active' ? 'success' : value === 'Pending' ? 'warning' : 'error'}
        size="small"
      >
        {value}
      </Badge>
    )
  },
  {
    key: 'expiryDate',
    header: 'Expiry Date',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString()
  },
  {
    key: 'royaltyRate',
    header: 'Royalty Rate',
    sortable: true,
    align: 'right',
    render: (value) => `${value}%`
  },
  {
    key: 'monthlyRevenue',
    header: 'Monthly Revenue',
    sortable: true,
    align: 'right',
    render: (value) => `$${value.toLocaleString()}`
  }
];