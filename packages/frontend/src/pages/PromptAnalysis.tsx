import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { generateLLMModels, generateLLMAnalysisResult } from '../services/mockData.service';
import {
  BeakerIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface AnalysisResult {
  id: string;
  promptId: string;
  llmResponse: {
    id: string;
    response: string;
    model: string;
    latency: number;
  };
  agentResults: Array<{
    agentId: string;
    agentName: string;
    score: number;
    passed: boolean;
    flags: Array<{
      type: string;
      severity: string;
      message: string;
      details?: string;
    }>;
  }>;
  summary: {
    totalFlags: number;
    criticalFlags: number;
    averageScore: number | null;
  };
}

const PromptAnalysis: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Fetch available models
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['llm-models'],
    queryFn: async () => {
      try {
        const response = await api.get('/llm/models');
        return response.data.models;
      } catch (error) {
        // Use mock data if API fails
        console.log('Using mock LLM models data');
        return generateLLMModels();
      }
    },
  });

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.post('/llm/analyze', {
        prompt,
        modelId: selectedModel,
        runAgents: true,
      });
      
      setAnalysisResult(response.data);
      toast.success('Analysis completed successfully');
    } catch (error: any) {
      // Use mock data if API fails
      console.log('Using mock analysis data');
      const mockResult = generateLLMAnalysisResult(prompt, selectedModel);
      setAnalysisResult(mockResult);
      toast.success('Analysis completed (using mock data)');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-vanguard-red';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-vanguard-blue';
      default:
        return 'text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-vanguard-green';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-vanguard-red';
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <BeakerIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Prompt Analysis
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Analyze prompts with LLM and Vanguard agents for security, integrity, and accuracy
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
              disabled={modelsLoading}
            >
              {models?.map((model: any) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Enter Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-seraphim-gold focus:outline-none focus:ring-2 focus:ring-seraphim-gold/50"
              placeholder="Enter your prompt here..."
            />
          </div>

          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !prompt.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4 mr-2" />
                Analyze Prompt
              </>
            )}
          </Button>
        </div>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Analysis Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-gray-400">Total Flags</p>
                <p className="text-2xl font-bold text-white">{analysisResult.summary.totalFlags}</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-gray-400">Critical Flags</p>
                <p className="text-2xl font-bold text-vanguard-red">
                  {analysisResult.summary.criticalFlags}
                </p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-gray-400">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysisResult.summary.averageScore || 0)}`}>
                  {analysisResult.summary.averageScore?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* LLM Response */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              LLM Response
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Model: <span className="text-white">{analysisResult.llmResponse.model}</span> |
                Latency: <span className="text-white">{analysisResult.llmResponse.latency}ms</span>
              </p>
              <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-300">
                  {analysisResult.llmResponse.response}
                </pre>
              </div>
            </div>
          </Card>

          {/* Agent Results */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Agent Analysis Results
            </h2>
            {analysisResult.agentResults.map((result) => (
              <Card key={result.agentId} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white">{result.agentName}</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`text-lg font-semibold ${getScoreColor(result.score)}`}>
                      Score: {result.score.toFixed(2)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.passed
                        ? 'bg-vanguard-green/20 text-vanguard-green'
                        : 'bg-vanguard-red/20 text-vanguard-red'
                    }`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {result.flags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">
                      Flags ({result.flags.length}):
                    </p>
                    <div className="space-y-2">
                      {result.flags.map((flag, index) => (
                        <div
                          key={index}
                          className="bg-black/30 p-3 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-white">{flag.message}</p>
                              {flag.details && (
                                <p className="text-sm text-gray-400 mt-1">
                                  {flag.details}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                {flag.type}
                              </span>
                              <span className={`text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                                {flag.severity.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptAnalysis;