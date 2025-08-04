import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportApi } from '../services/reportApi';
import './SimpleReportGenerator.css';

interface UseCase {
  useCaseId: string;
  useCaseName: string;
  reportCount: number;
  reports: Report[];
}

interface Report {
  id: string;
  name: string;
  description: string;
  configurable?: boolean;
  parameters?: ReportParameter[];
}

interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'dateRange' | 'select' | 'multiSelect';
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

interface ReportConfig {
  parameters: ReportParameter[];
  outputFormats: string[];
  scheduling?: {
    enabled: boolean;
    frequencies: string[];
  };
}

interface SimpleReportGeneratorProps {
  currentUseCase?: string;
}

export const SimpleReportGenerator: React.FC<SimpleReportGeneratorProps> = ({ currentUseCase }) => {
  const { user } = useAuth();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<string>(currentUseCase || '');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'daily',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1
  });

  useEffect(() => {
    loadUseCases();
  }, []);

  useEffect(() => {
    if (currentUseCase) {
      setSelectedUseCase(currentUseCase);
    }
  }, [currentUseCase]);

  useEffect(() => {
    if (selectedUseCase && selectedReport) {
      loadReportConfig();
    }
  }, [selectedUseCase, selectedReport]);

  const loadUseCases = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getAllUseCases();
      
      // If currentUseCase is provided, filter to show only that use case
      if (currentUseCase) {
        const filteredData = data.filter(uc => uc.useCaseId === currentUseCase);
        setUseCases(filteredData);
      } else {
        setUseCases(data);
      }
    } catch (err) {
      setError('Failed to load use cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReportConfig = async () => {
    try {
      setLoading(true);
      const config = await reportApi.getReportConfig(selectedUseCase, selectedReport);
      setReportConfig(config);
      
      if (config?.parameters) {
        const defaults: Record<string, any> = {};
        config.parameters.forEach(param => {
          if (param.defaultValue !== undefined) {
            defaults[param.name] = param.defaultValue;
          }
        });
        setParameters(defaults);
      }
    } catch (err) {
      setError('Failed to load report configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const result = await reportApi.generateReport({
        useCaseId: selectedUseCase,
        reportType: selectedReport,
        parameters
      });

      if (result.success) {
        setSuccess(`Report generated successfully! Report ID: ${result.reportId}`);
        if (result.reportUrl) {
          window.open(result.reportUrl, '_blank');
        }
      } else {
        setError(result.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleScheduleReport = async () => {
    try {
      const result = await reportApi.scheduleReport(
        selectedUseCase,
        selectedReport,
        scheduleConfig
      );

      if (result.success) {
        setSuccess(`Report scheduled successfully! Schedule ID: ${result.scheduleId}`);
        setShowSchedule(false);
      } else {
        setError(result.error || 'Failed to schedule report');
      }
    } catch (err) {
      setError('Failed to schedule report');
      console.error(err);
    }
  };

  const renderParameterInput = (param: ReportParameter) => {
    const value = parameters[param.name] || '';

    switch (param.type) {
      case 'string':
        return (
          <input
            type="text"
            className="form-input"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            required={param.required}
            minLength={param.validation?.minLength}
            maxLength={param.validation?.maxLength}
            pattern={param.validation?.pattern}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-input"
            value={value}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            required={param.required}
            min={param.validation?.min}
            max={param.validation?.max}
          />
        );

      case 'boolean':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(param.name, e.target.checked)}
            />
            <span>{param.label}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            className="form-input"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            required={param.required}
          />
        );

      case 'dateRange':
        const [startDate, endDate] = value || ['', ''];
        return (
          <div className="date-range">
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => handleParameterChange(param.name, [e.target.value, endDate])}
              required={param.required}
            />
            <span>to</span>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => handleParameterChange(param.name, [startDate, e.target.value])}
              required={param.required}
            />
          </div>
        );

      case 'select':
        return (
          <select
            className="form-select"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            required={param.required}
          >
            <option value="">Select {param.label}</option>
            {param.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiSelect':
        return (
          <select
            className="form-select"
            multiple
            value={value || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleParameterChange(param.name, selected);
            }}
            required={param.required}
          >
            {param.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const selectedUseCaseData = useCases.find(uc => uc.useCaseId === selectedUseCase);
  const selectedReportData = selectedUseCaseData?.reports.find(r => r.id === selectedReport);

  return (
    <div className="report-generator">
      <h1>Report Generator</h1>
      <p className="subtitle">Generate customizable reports for all use cases across the platform</p>

      {/* Use Case and Report Selection */}
      <div className="card">
        <div className="form-grid">
          {!currentUseCase && (
            <div className="form-group">
              <label>Select Use Case</label>
              <select
                className="form-select"
                value={selectedUseCase}
                onChange={(e) => {
                  setSelectedUseCase(e.target.value);
                  setSelectedReport('');
                  setReportConfig(null);
                  setParameters({});
                }}
              >
                <option value="">Choose a use case...</option>
                {useCases.map(useCase => (
                  <option key={useCase.useCaseId} value={useCase.useCaseId}>
                    {useCase.useCaseName} ({useCase.reportCount} reports)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Select Report</label>
            <select
              className="form-select"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              disabled={!selectedUseCase}
            >
              <option value="">Choose a report...</option>
              {selectedUseCaseData?.reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedReportData && (
          <div className="report-info">
            <h3>{selectedReportData.name}</h3>
            <p>{selectedReportData.description}</p>
            {reportConfig && (
              <div className="format-chips">
                {reportConfig.outputFormats.map(format => (
                  <span key={format} className="chip">
                    {format.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Parameters */}
      {reportConfig && reportConfig.parameters.length > 0 && (
        <div className="card">
          <h2>Report Parameters</h2>
          <div className="form-grid">
            {reportConfig.parameters.map(param => (
              <div key={param.name} className="form-group">
                <label>
                  {param.label}
                  {param.required && <span className="required">*</span>}
                </label>
                {param.type !== 'boolean' && renderParameterInput(param)}
                {param.type === 'boolean' && renderParameterInput(param)}
                {param.description && (
                  <small className="help-text">{param.description}</small>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedReport && (
        <div className="card">
          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={handleGenerateReport}
              disabled={generating || loading}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>

            {reportConfig?.scheduling?.enabled && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                Schedule Report
              </button>
            )}
          </div>
        </div>
      )}

      {/* Schedule Configuration */}
      {showSchedule && reportConfig?.scheduling?.enabled && (
        <div className="card">
          <h2>Schedule Report</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Frequency</label>
              <select
                className="form-select"
                value={scheduleConfig.frequency}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}
              >
                {reportConfig.scheduling.frequencies.map(freq => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                className="form-input"
                value={scheduleConfig.time}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>

            {scheduleConfig.frequency === 'weekly' && (
              <div className="form-group">
                <label>Day of Week</label>
                <select
                  className="form-select"
                  value={scheduleConfig.dayOfWeek}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            {scheduleConfig.frequency === 'monthly' && (
              <div className="form-group">
                <label>Day of Month</label>
                <input
                  type="number"
                  className="form-input"
                  value={scheduleConfig.dayOfMonth}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                  min={1}
                  max={31}
                />
              </div>
            )}
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={handleScheduleReport}>
              Schedule
            </button>
            <button className="btn btn-secondary" onClick={() => setShowSchedule(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="alert alert-error">
          <button onClick={() => setError(null)}>×</button>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <button onClick={() => setSuccess(null)}>×</button>
          {success}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleReportGenerator;