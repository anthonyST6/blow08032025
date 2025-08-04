import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import {
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

interface LeaseDetailsProps {
  lease: any;
  onClose: () => void;
}

const LeaseDetails: React.FC<LeaseDetailsProps> = ({ lease, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock detailed data
  const leaseDetails = {
    ...lease,
    operator: 'Seraphim Energy Corp',
    workingInterest: 75,
    royaltyRate: 12.5,
    bonusPayment: 500000,
    primaryTerm: '3 years',
    secondaryTerm: 'HBP',
    depthRights: 'Surface to 10,000 ft',
    minerals: ['Oil', 'Natural Gas', 'NGLs'],
    lastProduction: '2,450 BOE/day',
    lastInspection: '2024-01-15',
    nextInspection: '2024-04-15',
    documents: [
      { name: 'Original Lease Agreement', date: '2021-01-15', size: '2.4 MB' },
      { name: 'Amendment 1', date: '2022-06-20', size: '1.1 MB' },
      { name: 'Title Opinion', date: '2021-01-10', size: '3.7 MB' },
      { name: 'Survey Report', date: '2021-01-05', size: '5.2 MB' },
    ],
    timeline: [
      { date: '2024-01-15', event: 'Annual Inspection Completed', status: 'completed' },
      { date: '2023-12-01', event: 'Royalty Payment Processed', status: 'completed' },
      { date: '2023-11-15', event: 'Production Report Filed', status: 'completed' },
      { date: '2023-10-20', event: 'Environmental Compliance Check', status: 'completed' },
    ],
    compliance: {
      environmental: { score: 98, status: 'compliant' },
      regulatory: { score: 95, status: 'compliant' },
      financial: { score: 100, status: 'compliant' },
      operational: { score: 92, status: 'minor_issues' },
    },
  };

  const tabs = [
    { name: 'Overview', icon: DocumentTextIcon },
    { name: 'Compliance', icon: CheckCircleIcon },
    { name: 'Documents', icon: DocumentDuplicateIcon },
    { name: 'Timeline', icon: ClockIcon },
  ];

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-50';
      case 'minor_issues':
        return 'text-yellow-600 bg-yellow-50';
      case 'major_issues':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{leaseDetails.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {leaseDetails.location}
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 border-b border-gray-200 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `${
                    selected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Tab>
            );
          })}
        </Tab.List>

        <Tab.Panels className="p-6">
          {/* Overview Tab */}
          <Tab.Panel className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <p className="mt-1 text-sm font-medium text-gray-900 capitalize">{leaseDetails.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Operator</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{leaseDetails.operator}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Working Interest</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{leaseDetails.workingInterest}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Royalty Rate</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{leaseDetails.royaltyRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Acreage</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{leaseDetails.acreage?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Lease Value</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  ${(leaseDetails.value / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Primary Term</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{leaseDetails.primaryTerm}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Expires</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {new Date(leaseDetails.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Production</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Production</span>
                  <span className="text-sm font-medium text-gray-900">{leaseDetails.lastProduction}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mineral Rights</p>
              <div className="flex flex-wrap gap-2">
                {leaseDetails.minerals.map((mineral: string) => (
                  <span
                    key={mineral}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {mineral}
                  </span>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* Compliance Tab */}
          <Tab.Panel className="space-y-4">
            {Object.entries(leaseDetails.compliance).map(([category, data]: [string, any]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {category.replace('_', ' ')} Compliance
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceColor(data.status)}`}>
                    {data.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        data.score >= 95 ? 'bg-green-500' :
                        data.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{data.score}%</span>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Inspection</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(leaseDetails.nextInspection).toLocaleDateString()}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </Tab.Panel>

          {/* Documents Tab */}
          <Tab.Panel className="space-y-2">
            {leaseDetails.documents.map((doc: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <PaperClipIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.date} • {doc.size}
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Download
                </button>
              </div>
            ))}
          </Tab.Panel>

          {/* Timeline Tab */}
          <Tab.Panel>
            <div className="flow-root">
              <ul className="-mb-8">
                {leaseDetails.timeline.map((event: any, index: number) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== leaseDetails.timeline.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            event.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                            {event.status === 'completed' ? (
                              <CheckCircleIcon className="h-5 w-5 text-white" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{event.event}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default LeaseDetails;