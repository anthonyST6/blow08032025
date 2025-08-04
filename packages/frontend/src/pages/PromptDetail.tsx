import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Prompt, AgentAnalysis, UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const PromptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'details' | 'response' | 'analysis' | 'audit'>('details');

  // Fetch prompt details
  const { data: prompt, isLoading, error } = useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      const response = await api.get(`/api/prompts/${id}`);
      return response.data as Prompt;
    }
  });

  // Fetch agent analyses
  const { data: analyses } = useQuery({
    queryKey: ['analyses', id],
    queryFn: async () => {
      const response = await api.get(`/api/prompts/${id}/analyses`);
      return response.data as AgentAnalysis[];
    },
    enabled: !!prompt
  });

  // Rerun analysis mutation
  const rerunAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/prompts/${id}/rerun-analysis`);
      return response.data;
    },
    onSuccess: () => {
      // Refetch analyses
      window.location.reload();
    }
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      analyzing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status}
      </span>
    );
  };

  const getRiskLevelBadge = (level: string) => {
    const levelClasses = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      critical: 'bg-red-600 text-white'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${levelClasses[level as keyof typeof levelClasses] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load prompt details</p>
        <button
          onClick={() => navigate('/prompts')}
          className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Prompts
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/prompts')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ← Back to Prompts
            </button>
            {getStatusBadge(prompt.status)}
          </div>
          {user?.role === UserRole.ADMIN && prompt.status === 'completed' && (
            <button
              onClick={() => rerunAnalysisMutation.mutate()}
              disabled={rerunAnalysisMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rerunAnalysisMutation.isPending ? 'Rerunning...' : 'Rerun Analysis'}
            </button>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Prompt Details</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Submitted {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['details', 'response', 'analysis', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Prompt Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Prompt Information
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{prompt.provider}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{prompt.model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Temperature</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{prompt.temperature}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Tokens</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{prompt.maxTokens}</dd>
              </div>
            </dl>
          </div>

          {/* Prompt Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Prompt Content
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm">
                {prompt.content}
              </pre>
            </div>
            {prompt.context && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Context
                </h3>
                <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm">
                  {prompt.context}
                </pre>
              </div>
            )}
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'response' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            LLM Response
          </h2>
          {prompt.response ? (
            <div>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm">
                  {prompt.response.content}
                </pre>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tokens Used:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {prompt.response.tokensUsed || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {prompt.response.responseTime ? `${prompt.response.responseTime}ms` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No response available yet</p>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {analyses && analyses.length > 0 ? (
            analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {analysis.agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Agent
                  </h3>
                  <div className="flex items-center gap-2">
                    {getRiskLevelBadge(analysis.riskLevel)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Score: {analysis.score.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Findings */}
                {analysis.findings && analysis.findings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Findings
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.findings.map((finding, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recommendations
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                {analysis.metadata && Object.keys(analysis.metadata).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Details
                    </h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(analysis.metadata).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-gray-500 dark:text-gray-400">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </dt>
                          <dd className="text-gray-900 dark:text-white">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No analysis results available yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Audit Trail
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Prompt Submitted
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(prompt.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By: {prompt.userId}
              </p>
            </div>
            {prompt.response && (
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Response Received
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(prompt.updatedAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Response Time: {prompt.response.responseTime}ms
                </p>
              </div>
            )}
            {analyses && analyses.length > 0 && (
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Analysis Completed
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(analyses[0].createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analyses.length} agents analyzed
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDetail;