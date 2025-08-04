import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  BoltIcon,
  CloudIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CalendarIcon,
  CpuChipIcon,
  SignalIcon,
  BeakerIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { Progress } from '../components/Progress';
import { Line, Bar, Area } from 'recharts';
import {
  LineChart,
  BarChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Types
interface ForecastData {
  timestamp: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  temperature?: number;
  humidity?: number;
}

interface AnomalyData {
  id: string;
  timestamp: string;
  type: 'spike' | 'drop' | 'pattern' | 'equipment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number;
  location: string;
}

interface ModelMetrics {
  name: string;
  accuracy: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  confidence: number;
  lastUpdated: Date;
}

const LoadForecasting: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedModel, setSelectedModel] = useState<'ensemble' | 'arima' | 'prophet' | 'lstm'>('ensemble');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);

  // Generate mock forecast data
  const generateForecastData = (timeframe: string): ForecastData[] => {
    const dataPoints = timeframe === 'hourly' ? 24 : timeframe === 'daily' ? 7 : timeframe === 'weekly' ? 4 : 12;
    const baseLoad = 1000; // MW
    const data: ForecastData[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const hour = i;
      const dayOfWeek = i % 7;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Simulate daily load pattern
      let loadMultiplier = 1;
      if (timeframe === 'hourly') {
        // Peak hours: 8-10 AM and 6-9 PM
        if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
          loadMultiplier = 1.4 + Math.random() * 0.2;
        } else if (hour >= 0 && hour <= 6) {
          loadMultiplier = 0.6 + Math.random() * 0.1;
        } else {
          loadMultiplier = 1 + Math.random() * 0.2;
        }
      }

      // Weekend reduction
      if (isWeekend) {
        loadMultiplier *= 0.8;
      }

      const predicted = baseLoad * loadMultiplier + (Math.random() - 0.5) * 100;
      const actual = i < dataPoints / 2 ? predicted + (Math.random() - 0.5) * 50 : undefined;
      
      data.push({
        timestamp: timeframe === 'hourly' ? `${i}:00` : `Day ${i + 1}`,
        actual,
        predicted,
        lowerBound: predicted * 0.95,
        upperBound: predicted * 1.05,
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
      });
    }

    return data;
  };

  const [forecastData, setForecastData] = useState<ForecastData[]>(generateForecastData(selectedTimeframe));

  // Generate mock anomalies
  const anomalies: AnomalyData[] = [
    {
      id: '1',
      timestamp: '2024-03-25 14:30',
      type: 'spike',
      severity: 'high',
      description: 'Unexpected demand spike in Industrial Zone A',
      impact: 250,
      location: 'Industrial Zone A',
    },
    {
      id: '2',
      timestamp: '2024-03-25 09:15',
      type: 'equipment',
      severity: 'medium',
      description: 'Transformer efficiency degradation detected',
      impact: 75,
      location: 'Substation 7',
    },
    {
      id: '3',
      timestamp: '2024-03-24 22:00',
      type: 'pattern',
      severity: 'low',
      description: 'Unusual nighttime consumption pattern',
      impact: 30,
      location: 'Residential District B',
    },
  ];

  // Model metrics
  const modelMetrics: ModelMetrics[] = [
    { name: 'Ensemble', accuracy: 94.5, mape: 2.3, rmse: 45.2, confidence: 92, lastUpdated: new Date() },
    { name: 'ARIMA', accuracy: 91.2, mape: 3.1, rmse: 52.8, confidence: 88, lastUpdated: new Date() },
    { name: 'Prophet', accuracy: 92.8, mape: 2.7, rmse: 48.5, confidence: 90, lastUpdated: new Date() },
    { name: 'LSTM', accuracy: 93.6, mape: 2.5, rmse: 46.3, confidence: 91, lastUpdated: new Date() },
  ];

  // Real-time data simulation
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        setForecastData(prev => {
          const newData = [...prev];
          // Update the last data point with new values
          const lastIndex = newData.length - 1;
          if (lastIndex >= 0) {
            const variation = (Math.random() - 0.5) * 50;
            newData[lastIndex] = {
              ...newData[lastIndex],
              predicted: newData[lastIndex].predicted + variation,
              lowerBound: (newData[lastIndex].predicted + variation) * 0.95,
              upperBound: (newData[lastIndex].predicted + variation) * 1.05,
            };
          }
          return newData;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  useEffect(() => {
    setForecastData(generateForecastData(selectedTimeframe));
  }, [selectedTimeframe]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'spike': return ArrowTrendingUpIcon;
      case 'drop': return ArrowTrendingUpIcon;
      case 'equipment': return CpuChipIcon;
      case 'pattern': return ChartBarIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center mb-2">
          <BoltIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Load Forecasting System
        </h1>
        <p className="text-gray-400">
          Advanced multi-dimensional energy demand prediction with real-time analysis
        </p>
      </div>

      {/* Control Panel */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-vanguard-blue/10 to-transparent border-vanguard-blue/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Timeframe Selection */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Forecast Horizon</label>
              <div className="flex space-x-2">
                {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${
                      selectedTimeframe === tf
                        ? 'bg-seraphim-gold/20 text-seraphim-gold border border-seraphim-gold/30'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Prediction Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm text-white"
              >
                <option value="ensemble">Ensemble (All Models)</option>
                <option value="arima">ARIMA</option>
                <option value="prophet">Prophet</option>
                <option value="lstm">LSTM Neural Network</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Mode Toggle */}
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
                isLiveMode
                  ? 'bg-vanguard-green/20 text-vanguard-green border border-vanguard-green/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <SignalIcon className="w-4 h-4 mr-2" />
              {isLiveMode ? 'Live Mode ON' : 'Live Mode OFF'}
            </button>

            {/* Confidence Interval Toggle */}
            <button
              onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                showConfidenceInterval
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Confidence Bands
            </button>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="factors">Factors</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* Forecast Tab */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                  Load Forecast Visualization
                </h3>
                
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="timestamp" stroke="#999" />
                    <YAxis stroke="#999" label={{ value: 'Load (MW)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    
                    {showConfidenceInterval && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="upperBound"
                          stroke="none"
                          fill="#3B82F6"
                          fillOpacity={0.1}
                          name="Upper Bound"
                        />
                        <Area
                          type="monotone"
                          dataKey="lowerBound"
                          stroke="none"
                          fill="#3B82F6"
                          fillOpacity={0.1}
                          name="Lower Bound"
                        />
                      </>
                    )}
                    
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      dot={false}
                      name="Predicted Load"
                    />
                    
                    {forecastData.some(d => d.actual !== undefined) && (
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Actual Load"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Statistics Panel */}
            <div className="space-y-4">
              <Card className="p-6">
                <h4 className="text-sm font-semibold text-white mb-4">Current Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Current Load</span>
                      <span className="text-sm font-medium text-white">1,245 MW</span>
                    </div>
                    <Progress value={75} variant="default" size="sm" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Peak Forecast</span>
                      <span className="text-sm font-medium text-white">1,480 MW</span>
                    </div>
                    <Progress value={88} variant="warning" size="sm" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Grid Capacity</span>
                      <span className="text-sm font-medium text-white">1,650 MW</span>
                    </div>
                    <Progress value={90} variant="error" size="sm" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-sm font-semibold text-white mb-4">Weather Impact</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CloudIcon className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-xs text-gray-400">Temperature</span>
                    </div>
                    <span className="text-sm text-white">28°C</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CloudIcon className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-xs text-gray-400">Humidity</span>
                    </div>
                    <span className="text-sm text-white">65%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BoltIcon className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-xs text-gray-400">Weather Impact</span>
                    </div>
                    <Badge variant="warning" size="small">+12%</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-sm font-semibold text-white mb-4">Quick Actions</h4>
                <div className="space-y-2">
                  <Button size="sm" variant="secondary" className="w-full">
                    <DocumentChartBarIcon className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Alert
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full">
                    <BeakerIcon className="w-4 h-4 mr-2" />
                    Run Simulation
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Anomaly Detection
            </h3>
            
            <div className="space-y-4">
              {anomalies.map((anomaly) => {
                const Icon = getAnomalyIcon(anomaly.type);
                return (
                  <motion.div
                    key={anomaly.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className={`p-2 rounded-lg bg-white/10`}>
                      <Icon className={`w-5 h-5 ${getSeverityColor(anomaly.severity)}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-white">{anomaly.description}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {anomaly.location} • {anomaly.timestamp}
                          </p>
                        </div>
                        <Badge
                          variant={
                            anomaly.severity === 'critical' ? 'error' :
                            anomaly.severity === 'high' ? 'warning' :
                            'info'
                          }
                          size="small"
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-gray-400">
                          Impact: <span className="text-white font-medium">{anomaly.impact} MW</span>
                        </span>
                        <span className="text-gray-400">
                          Type: <span className="text-white font-medium capitalize">{anomaly.type}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Factors Tab */}
        <TabsContent value="factors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                Demographic Factors
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Population Density Impact</span>
                    <span className="text-sm font-medium text-white">+18%</span>
                  </div>
                  <Progress value={68} variant="default" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Residential Growth Rate</span>
                    <span className="text-sm font-medium text-white">+5.2%</span>
                  </div>
                  <Progress value={52} variant="success" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Urban Migration Effect</span>
                    <span className="text-sm font-medium text-white">+3.8%</span>
                  </div>
                  <Progress value={38} variant="default" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                Industrial Activity
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Manufacturing Index</span>
                    <span className="text-sm font-medium text-white">112.5</span>
                  </div>
                  <Progress value={85} variant="success" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Commercial Activity</span>
                    <span className="text-sm font-medium text-white">98.3</span>
                  </div>
                  <Progress value={73} variant="default" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Data Center Load</span>
                    <span className="text-sm font-medium text-white">245 MW</span>
                  </div>
                  <Progress value={92} variant="warning" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CpuChipIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Model Performance Comparison
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modelMetrics.map((model) => (
                <Card key={model.name} className="p-4 bg-white/5">
                  <h4 className="text-sm font-semibold text-white mb-3">{model.name}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">Accuracy</span>
                        <span className="text-xs font-medium text-white">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} variant="success" size="sm" />
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">MAPE</span>
                        <span className="text-white">{model.mape}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">RMSE</span>
                        <span className="text-white">{model.rmse}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white">{model.confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        Updated {model.lastUpdated.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BeakerIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
              Scenario Planning
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-vanguard-green/10 border-vanguard-green/30">
                <h4 className="text-sm font-semibold text-white mb-2">Best Case</h4>
                <p className="text-xs text-gray-400 mb-3">
                  Optimal weather conditions, normal industrial activity
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Peak Load</span>
                    <span className="text-vanguard-green">1,320 MW</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Reserve Margin</span>
                    <span className="text-vanguard-green">20%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
                <h4 className="text-sm font-semibold text-white mb-2">Expected Case</h4>
                <p className="text-xs text-gray-400 mb-3">
                  Average conditions based on historical patterns
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Peak Load</span>
                    <span className="text-yellow-500">1,480 MW</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Reserve Margin</span>
                    <span className="text-yellow-500">10%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-vanguard-red/10 border-vanguard-red/30">
                <h4 className="text-sm font-semibold text-white mb-2">Worst Case</h4>
                <p className="text-xs text-gray-400 mb-3">
                  Extreme weather, equipment failures, high demand
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Peak Load</span>
                    <span className="text-vanguard-red">1,620 MW</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Reserve Margin</span>
                    <span className="text-vanguard-red">2%</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Button variant="primary">
                <BeakerIcon className="w-4 h-4 mr-2" />
                Run Custom Scenario
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadForecasting;