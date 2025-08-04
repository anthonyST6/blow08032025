import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/Card';
import { Badge } from '../../../Badge';
import { DashboardComponentProps } from '../types';
import { EmptyStateWrapper } from '../EmptyStateWrapper';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'scatter';

interface UniversalChartProps extends DashboardComponentProps {
  title: string;
  type: ChartType;
  height?: number;
  showLegend?: boolean;
  colors?: string[];
  dataKeys?: string[];
  xAxisKey?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  stacked?: boolean;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export const UniversalChart: React.FC<UniversalChartProps> = ({
  title,
  type,
  data,
  isLiveData,
  hasData,
  onDataRequest,
  className = '',
  height = 300,
  showLegend = true,
  colors = DEFAULT_COLORS,
  dataKeys = [],
  xAxisKey = 'name',
  yAxisLabel,
  showGrid = true,
  stacked = false,
  loading = false,
  error = null
}) => {
  const renderChart = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-full bg-gray-700 rounded"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (!hasData || !data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data to display</p>
        </div>
      );
    }

    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const axisStyle = {
      stroke: '#9CA3AF',
      fontSize: 12
    };

    const gridStyle = {
      stroke: '#374151',
      strokeDasharray: '3 3'
    };

    const tooltipStyle = {
      backgroundColor: '#1F2937',
      border: 'none',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[8, 8, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey={dataKeys[0] || 'value'}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart {...chartProps}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={xAxisKey} {...axisStyle} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        );

      case 'radar':
        return (
          <RadarChart {...chartProps}>
            <PolarGrid {...gridStyle} />
            <PolarAngleAxis dataKey={xAxisKey} {...axisStyle} />
            <PolarRadiusAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...chartProps}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={dataKeys[0]} {...axisStyle} />
            <YAxis dataKey={dataKeys[1]} {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            <Scatter
              name="Data Points"
              data={data}
              fill={colors[0]}
            />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  const chartContent = (
    <Card variant="glass" effect="glow" className={`universal-chart ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {isLiveData && hasData && (
              <Badge variant="info" size="small">
                LIVE
              </Badge>
            )}
            {onDataRequest && (
              <button
                onClick={onDataRequest}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart() || <div />}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <EmptyStateWrapper
      hasData={hasData}
      onDataRequest={onDataRequest}
      config={{
        title: 'No Chart Data',
        description: `Ingest data to view ${title}`,
      }}
    >
      {chartContent}
    </EmptyStateWrapper>
  );
};

// Preset chart components for common use cases
export const TimeSeriesChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart {...props} type="line" />
);

export const DistributionChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart {...props} type="bar" />
);

export const ComparisonChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart {...props} type="pie" />
);

export const TrendChart: React.FC<Omit<UniversalChartProps, 'type'>> = (props) => (
  <UniversalChart {...props} type="area" />
);