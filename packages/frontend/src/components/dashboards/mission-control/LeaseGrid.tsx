import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  EllipsisVerticalIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface LeaseGridProps {
  leases: any[];
  onLeaseSelect: (lease: any) => void;
  selectedLeaseId?: string;
}

const LeaseGrid: React.FC<LeaseGridProps> = ({ leases, onLeaseSelect, selectedLeaseId }) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data if no leases provided
  const mockLeases = [
    {
      id: '1',
      name: 'Eagle Ford Shale - Block A',
      location: 'Webb County, TX',
      status: 'active',
      expiryDate: '2025-12-31',
      value: 2500000,
      compliance: 98,
      issues: 0,
      operator: 'Seraphim Energy',
      acreage: 5000,
    },
    {
      id: '2',
      name: 'Permian Basin - Section 12',
      location: 'Midland County, TX',
      status: 'active',
      expiryDate: '2024-06-30',
      value: 3200000,
      compliance: 95,
      issues: 2,
      operator: 'Seraphim Energy',
      acreage: 7500,
    },
    {
      id: '3',
      name: 'Bakken Formation - Unit 7',
      location: 'McKenzie County, ND',
      status: 'expiring',
      expiryDate: '2024-03-15',
      value: 1800000,
      compliance: 88,
      issues: 5,
      operator: 'Seraphim Energy',
      acreage: 3200,
    },
  ];

  const displayLeases = leases.length > 0 ? leases : mockLeases;

  const sortedLeases = [...displayLeases].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-green-600';
    if (compliance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Land Leases</h3>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="name">Name</option>
              <option value="value">Value</option>
              <option value="compliance">Compliance</option>
              <option value="expiryDate">Expiry Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {sortedLeases.map((lease) => (
          <div
            key={lease.id}
            onClick={() => onLeaseSelect(lease)}
            className={`
              relative rounded-lg border p-4 cursor-pointer transition-all
              ${selectedLeaseId === lease.id 
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
              }
            `}
          >
            {/* Actions Menu */}
            <div className="absolute top-2 right-2">
              <Menu as="div" className="relative">
                <Menu.Button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            <DocumentTextIcon className="mr-2 h-4 w-4" />
                            View Details
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600`}
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {/* Content */}
            <div className="pr-8">
              <h4 className="text-lg font-medium text-gray-900 mb-1">{lease.name}</h4>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {lease.location}
              </div>

              {/* Status */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                  {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                </span>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Value</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    ${(lease.value / 1000000).toFixed(1)}M
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Compliance</span>
                  <span className={`text-sm font-medium ${getComplianceColor(lease.compliance)}`}>
                    {lease.compliance}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Issues</span>
                  <span className="text-sm font-medium flex items-center">
                    {lease.issues > 0 ? (
                      <>
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-red-500" />
                        <span className="text-red-600">{lease.issues}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-600">0</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Expires</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(lease.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayLeases.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leases found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaseGrid;