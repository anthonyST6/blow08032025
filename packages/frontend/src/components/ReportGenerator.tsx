import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormLabel,
  RadioGroup,
  Radio,
  Autocomplete,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { reportApi } from '../services/reportApi';

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

export const ReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    parameters: true,
    scheduling: false,
    history: false
  });
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'daily',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1
  });
  const [reportHistory, setReportHistory] = useState<any[]>([]);

  // Load use cases on mount
  useEffect(() => {
    loadUseCases();
  }, []);

  // Load report configuration when report is selected
  useEffect(() => {
    if (selectedUseCase && selectedReport) {
      loadReportConfig();
    }
  }, [selectedUseCase, selectedReport]);

  const loadUseCases = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getAllUseCases();
      setUseCases(data);
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
      
      // Initialize parameters with default values
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
        // Optionally download the report
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
        setScheduleDialog(false);
      } else {
        setError(result.error || 'Failed to schedule report');
      }
    } catch (err) {
      setError('Failed to schedule report');
      console.error(err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderParameterInput = (param: ReportParameter) => {
    const value = parameters[param.name] || '';

    switch (param.type) {
      case 'string':
        return (
          <TextField
            fullWidth
            label={param.label}
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            helperText={param.description}
            required={param.required}
            inputProps={{
              minLength: param.validation?.minLength,
              maxLength: param.validation?.maxLength,
              pattern: param.validation?.pattern
            }}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={param.label}
            value={value}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            helperText={param.description}
            required={param.required}
            inputProps={{
              min: param.validation?.min,
              max: param.validation?.max
            }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => handleParameterChange(param.name, e.target.checked)}
              />
            }
            label={param.label}
          />
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={param.label}
              value={value || null}
              onChange={(newValue) => handleParameterChange(param.name, newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  helperText={param.description}
                  required={param.required}
                />
              )}
            />
          </LocalizationProvider>
        );

      case 'dateRange':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              startText="Start Date"
              endText="End Date"
              value={value || [null, null]}
              onChange={(newValue) => handleParameterChange(param.name, newValue)}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField {...startProps} fullWidth />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} fullWidth />
                </>
              )}
            />
          </LocalizationProvider>
        );

      case 'select':
        return (
          <FormControl fullWidth required={param.required}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              label={param.label}
            >
              {param.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {param.description && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                {param.description}
              </Typography>
            )}
          </FormControl>
        );

      case 'multiSelect':
        return (
          <Autocomplete
            multiple
            options={param.options || []}
            getOptionLabel={(option) => option.label}
            value={param.options?.filter(opt => value?.includes(opt.value)) || []}
            onChange={(_, newValue) => {
              handleParameterChange(param.name, newValue.map(v => v.value));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={param.label}
                helperText={param.description}
                required={param.required}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.label}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        );

      default:
        return null;
    }
  };

  const selectedUseCaseData = useCases.find(uc => uc.useCaseId === selectedUseCase);
  const selectedReportData = selectedUseCaseData?.reports.find(r => r.id === selectedReport);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Generator
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Generate customizable reports for all use cases across the platform
      </Typography>

      {/* Use Case and Report Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Use Case</InputLabel>
                <Select
                  value={selectedUseCase}
                  onChange={(e) => {
                    setSelectedUseCase(e.target.value);
                    setSelectedReport('');
                    setReportConfig(null);
                    setParameters({});
                  }}
                  label="Select Use Case"
                >
                  {useCases.map(useCase => (
                    <MenuItem key={useCase.useCaseId} value={useCase.useCaseId}>
                      <Box>
                        <Typography>{useCase.useCaseName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {useCase.reportCount} reports available
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedUseCase}>
                <InputLabel>Select Report</InputLabel>
                <Select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  label="Select Report"
                >
                  {selectedUseCaseData?.reports.map(report => (
                    <MenuItem key={report.id} value={report.id}>
                      <Box>
                        <Typography>{report.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {report.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedReportData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AssessmentIcon color="primary" />
                <Typography variant="h6">{selectedReportData.name}</Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {selectedReportData.description}
              </Typography>
              {reportConfig && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {reportConfig.outputFormats.map(format => (
                    <Chip
                      key={format}
                      label={format.toUpperCase()}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Report Parameters */}
      {reportConfig && reportConfig.parameters.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <SettingsIcon color="primary" />
                <Typography variant="h6">Report Parameters</Typography>
              </Stack>
              <IconButton onClick={() => toggleSection('parameters')}>
                {expandedSections.parameters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.parameters}>
              <Grid container spacing={3}>
                {reportConfig.parameters.map(param => (
                  <Grid item xs={12} md={6} key={param.name}>
                    {renderParameterInput(param)}
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {selectedReport && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={generating ? <CircularProgress size={20} /> : <AssessmentIcon />}
                onClick={handleGenerateReport}
                disabled={generating || loading}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportConfig?.scheduling?.enabled && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setScheduleDialog(true)}
                >
                  Schedule Report
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl>
              <FormLabel>Frequency</FormLabel>
              <RadioGroup
                value={scheduleConfig.frequency}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}
              >
                {reportConfig?.scheduling?.frequencies.map(freq => (
                  <FormControlLabel
                    key={freq}
                    value={freq}
                    control={<Radio />}
                    label={freq.charAt(0).toUpperCase() + freq.slice(1)}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <TextField
              type="time"
              label="Time"
              value={scheduleConfig.time}
              onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            {scheduleConfig.frequency === 'weekly' && (
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={scheduleConfig.dayOfWeek}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  label="Day of Week"
                >
                  <MenuItem value={0}>Sunday</MenuItem>
                  <MenuItem value={1}>Monday</MenuItem>
                  <MenuItem value={2}>Tuesday</MenuItem>
                  <MenuItem value={3}>Wednesday</MenuItem>
                  <MenuItem value={4}>Thursday</MenuItem>
                  <MenuItem value={5}>Friday</MenuItem>
                  <MenuItem value={6}>Saturday</MenuItem>
                </Select>
              </FormControl>
            )}

            {scheduleConfig.frequency === 'monthly' && (
              <TextField
                type="number"
                label="Day of Month"
                value={scheduleConfig.dayOfMonth}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                inputProps={{ min: 1, max: 31 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleScheduleReport} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportGenerator;