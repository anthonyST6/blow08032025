import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface ComplianceReport {
  id: string;
  title: string;
  description: string;
  type: 'regulatory' | 'internal' | 'external' | 'incident';
  status: 'draft' | 'review' | 'approved' | 'published';
  framework: string;
  period: {
    start: Date;
    end: Date;
  };
  sections: {
    id: string;
    title: string;
    content: string;
    status: 'complete' | 'incomplete';
    lastUpdated: Date;
  }[];
  metrics: {
    complianceScore: number;
    totalFindings: number;
    criticalFindings: number;
    resolvedFindings: number;
  };
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
  reviewers: {
    uid: string;
    displayName: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    reviewedAt?: Date;
  }[];
  comments: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: Date;
  }[];
  createdBy: {
    uid: string;
    displayName: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ComplianceReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'content' | 'review' | 'attachments' | 'comments'>('content');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState<{ [key: string]: string }>({});
  const [newComment, setNewComment] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Fetch report details
  const { data: report, isLoading } = useQuery({
    queryKey: ['compliance-report', id],
    queryFn: async () => {
      const response = await api.get(`/api/compliance/reports/${id}`);
      return response.data as ComplianceReport;
    }
  });

  // Update section content
  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionId, content }: { sectionId: string; content: string }) => {
      const response = await api.patch(`/api/compliance/reports/${id}/sections/${sectionId}`, {
        content
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Section updated');
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['compliance-report', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update section');
    }
  });

  // Submit review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ status, comments }: { status: 'approved' | 'rejected'; comments: string }) => {
      const response = await api.post(`/api/compliance/reports/${id}/review`, {
        status,
        comments
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Review submitted');
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['compliance-report', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/api/compliance/reports/${id}/comments`, {
        content
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Comment added');
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['compliance-report', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  });

  // Upload attachment
  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/api/compliance/reports/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Attachment uploaded');
      queryClient.invalidateQueries({ queryKey: ['compliance-report', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload attachment');
    }
  });

  // Delete attachment
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(`/api/compliance/reports/${id}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      toast.success('Attachment deleted');
      queryClient.invalidateQueries({ queryKey: ['compliance-report', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete attachment');
    }
  });

  // Update report status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.patch(`/api/compliance/reports/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['compliance-report', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachmentMutation.mutate(file);
    }
  };

  const handleSectionEdit = (sectionId: string) => {
    const section = report?.sections.find(s => s.id === sectionId);
    if (section) {
      setSectionContent(prev => ({ ...prev, [sectionId]: section.content }));
      setEditingSection(sectionId);
    }
  };

  const handleSectionSave = (sectionId: string) => {
    const content = sectionContent[sectionId];
    if (content !== undefined) {
      updateSectionMutation.mutate({ sectionId, content });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 dark:text-green-400';
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || !report) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const completedSections = report.sections.filter(s => s.status === 'complete').length;
  const completionPercentage = Math.round((completedSections / report.sections.length) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/compliance/reports')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{report.title}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{report.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
            {report.status === 'draft' && (
              <button
                onClick={() => updateStatusMutation.mutate('review')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit for Review
              </button>
            )}
            {report.status === 'approved' && (
              <button
                onClick={() => updateStatusMutation.mutate('published')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Publish Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Framework</h3>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{report.framework}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Compliance Score</h3>
          <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
            {report.metrics.complianceScore}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Findings</h3>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {report.metrics.totalFindings}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Issues</h3>
          <p className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">
            {report.metrics.criticalFindings}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion</h3>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {completionPercentage}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'content'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'review'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Review ({report.reviewers.length})
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'attachments'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Attachments ({report.attachments.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Comments ({report.comments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {report.sections.map((section) => (
                <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {new Date(section.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        section.status === 'complete'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {section.status}
                      </span>
                      {editingSection === section.id ? (
                        <>
                          <button
                            onClick={() => handleSectionSave(section.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSectionEdit(section.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  {editingSection === section.id ? (
                    <textarea
                      value={sectionContent[section.id] || ''}
                      onChange={(e) => setSectionContent(prev => ({ 
                        ...prev, 
                        [section.id]: e.target.value 
                      }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {report.reviewers.map((reviewer) => (
                  <div key={reviewer.uid} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {reviewer.displayName}
                        </h4>
                        <span className={`text-sm font-medium ${getReviewStatusColor(reviewer.status)}`}>
                          {reviewer.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{reviewer.email}</p>
                      {reviewer.comments && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          "{reviewer.comments}"
                        </p>
                      )}
                      {reviewer.reviewedAt && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Reviewed on {new Date(reviewer.reviewedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Review (if current user is a reviewer) */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Submit Your Review</h4>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add your review comments..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => submitReviewMutation.mutate({ 
                      status: 'approved', 
                      comments: reviewComment 
                    })}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => submitReviewMutation.mutate({ 
                      status: 'rejected', 
                      comments: reviewComment 
                    })}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h3>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                  Upload File
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {report.attachments.length > 0 ? (
                <div className="space-y-3">
                  {report.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📎</span>
                        <div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            {attachment.name}
                          </a>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy} on{' '}
                            {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this attachment?')) {
                            deleteAttachmentMutation.mutate(attachment.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No attachments yet
                </p>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {report.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {comment.userName}
                        </h4>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      addCommentMutation.mutate(newComment);
                    }
                  }}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceReportDetails;