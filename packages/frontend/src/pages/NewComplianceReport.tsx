import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  sections: ReportSection[];
}

const NewComplianceReport: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    type: 'regulatory',
    framework: '',
    templateId: '',
    period: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    sections: [] as { title: string; content: string; }[],
    reviewers: [] as string[],
    tags: [] as string[],
    notifyReviewers: true
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      const response = await api.get('/api/compliance/templates');
      return response.data as ReportTemplate[];
    }
  });

  // Fetch team members for reviewers
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await api.get('/api/users', {
        params: { role: 'Compliance Reviewer' }
      });
      return response.data;
    }
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: typeof reportData) => {
      const response = await api.post('/api/compliance/reports', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Report created successfully');
      navigate(`/compliance/reports/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create report');
    }
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setReportData(prev => ({
        ...prev,
        templateId,
        framework: template.framework,
        sections: template.sections.map(s => ({
          title: s.title,
          content: ''
        }))
      }));
    }
  };

  const handleSectionContentChange = (index: number, content: string) => {
    setReportData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => 
        i === index ? { ...s, content } : s
      )
    }));
  };

  const handleReviewerToggle = (userId: string) => {
    setReportData(prev => ({
      ...prev,
      reviewers: prev.reviewers.includes(userId)
        ? prev.reviewers.filter(id => id !== userId)
        : [...prev.reviewers, userId]
    }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const tag = e.currentTarget.value.trim();
      if (!reportData.tags.includes(tag)) {
        setReportData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string) => {
    setReportData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return reportData.title && reportData.description && reportData.type;
      case 2:
        return reportData.framework && reportData.templateId;
      case 3:
        return reportData.sections.every(s => s.content.trim());
      case 4:
        return reportData.reviewers.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    createReportMutation.mutate(reportData);
  };

  if (templatesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Compliance Report</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Follow the steps to create a new compliance report
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-24 h-1 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Basic Info</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Template</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Content</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Review</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Title *
              </label>
              <input
                type="text"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter report title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and scope of this report"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Type *
              </label>
              <select
                value={reportData.type}
                onChange={(e) => setReportData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="regulatory">Regulatory</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="incident">Incident</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period Start *
                </label>
                <input
                  type="date"
                  value={reportData.period.start}
                  onChange={(e) => setReportData(prev => ({ 
                    ...prev, 
                    period: { ...prev.period, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period End *
                </label>
                <input
                  type="date"
                  value={reportData.period.end}
                  onChange={(e) => setReportData(prev => ({ 
                    ...prev, 
                    period: { ...prev.period, end: e.target.value }
                  }))}
                  min={reportData.period.start}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <input
                type="text"
                onKeyDown={handleTagInput}
                placeholder="Type and press Enter to add tags"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {reportData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {reportData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Select Template
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Compliance Framework *
              </label>
              <select
                value={reportData.framework}
                onChange={(e) => setReportData(prev => ({ ...prev, framework: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a framework</option>
                <option value="GDPR">GDPR</option>
                <option value="HIPAA">HIPAA</option>
                <option value="SOC2">SOC 2</option>
                <option value="ISO27001">ISO 27001</option>
                <option value="NIST">NIST</option>
              </select>
            </div>

            {reportData.framework && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Report Template *
                </label>
                <div className="space-y-3">
                  {templates
                    ?.filter(t => t.framework === reportData.framework)
                    .map((template) => (
                      <label
                        key={template.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          reportData.templateId === template.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={reportData.templateId === template.id}
                          onChange={() => handleTemplateSelect(template.id)}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {template.sections.length} sections
                            </div>
                          </div>
                          {reportData.templateId === template.id && (
                            <span className="ml-3 text-blue-600 dark:text-blue-400">✓</span>
                          )}
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Report Content
            </h2>

            <div className="space-y-6">
              {reportData.sections.map((section, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {section.title} *
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionContentChange(index, e.target.value)}
                    placeholder={`Enter content for ${section.title}`}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {section.content.length} characters
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Review & Submit
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Reviewers *
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {teamMembers?.map((member: any) => (
                  <label
                    key={member.uid}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={reportData.reviewers.includes(member.uid)}
                      onChange={() => handleReviewerToggle(member.uid)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.displayName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportData.notifyReviewers}
                  onChange={(e) => setReportData(prev => ({ 
                    ...prev, 
                    notifyReviewers: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Send email notifications to reviewers
                </span>
              </label>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Report Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Title:</dt>
                  <dd className="text-gray-900 dark:text-white">{reportData.title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Type:</dt>
                  <dd className="text-gray-900 dark:text-white capitalize">{reportData.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Framework:</dt>
                  <dd className="text-gray-900 dark:text-white">{reportData.framework}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Period:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(reportData.period.start).toLocaleDateString()} - {new Date(reportData.period.end).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Sections:</dt>
                  <dd className="text-gray-900 dark:text-white">{reportData.sections.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Reviewers:</dt>
                  <dd className="text-gray-900 dark:text-white">{reportData.reviewers.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/compliance/reports')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || createReportMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createReportMutation.isPending && <LoadingSpinner size="small" />}
              Create Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewComplianceReport;