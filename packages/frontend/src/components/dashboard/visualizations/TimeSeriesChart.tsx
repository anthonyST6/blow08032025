import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { format } from 'date-fns';
import { TimeSeriesChartProps } from '../types';

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  lines,
  xAxis = {},
  yAxis = {},
  tooltip = {},
  brush = false,
  zoom = false,
  annotations = [],
  height = 400,
}) => {
  const formatXAxisTick = (value: any) => {
    if (xAxis.tickFormat) {
      return xAxis.tickFormat(value);
    }
    
    // Default date formatting
    if (value instanceof Date || typeof value === 'string') {
      const date = new Date(value);
      return format(date, 'MMM dd');
    }
    
    return value;
  };

  const formatYAxisTick = (value: any) => {
    if (yAxis.tickFormat) {
      return yAxis.tickFormat(value);
    }
    
    // Default number formatting
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toFixed(0);
    }
    
    return value;
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (tooltip.formatter) {
      return tooltip.formatter(value, name);
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value;
  };

  const formatTooltipLabel = (label: any) => {
    if (tooltip.labelFormatter) {
      return tooltip.labelFormatter(label);
    }
    
    if (label instanceof Date || typeof label === 'string') {
      const date = new Date(label);
      return format(date, 'PPp');
    }
    
    return label;
  };

  const renderAnnotations = () => {
    return annotations.map((annotation, index) => {
      if (annotation.type === 'line' && annotation.value !== undefined) {
        return (
          <ReferenceLine
            key={`annotation-${index}`}
            y={annotation.value}
            stroke={annotation.color || '#666'}
            strokeDasharray="3 3"
            label={annotation.label}
          />
        );
      }
      
      if (annotation.type === 'area' && annotation.start !== undefined && annotation.end !== undefined) {
        return (
          <ReferenceArea
            key={`annotation-${index}`}
            y1={annotation.start}
            y2={annotation.end}
            fill={annotation.color || '#666'}
            fillOpacity={0.1}
            label={annotation.label}
          />
        );
      }
      
      return null;
    });
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxisTick}
          domain={xAxis.domain}
          hide={xAxis.hide}
          label={xAxis.label ? { value: xAxis.label, position: 'insideBottom', offset: -5 } : undefined}
          stroke="#666"
        />
        
        <YAxis
          tickFormatter={formatYAxisTick}
          domain={yAxis.domain}
          hide={yAxis.hide}
          label={yAxis.label ? { value: yAxis.label, angle: -90, position: 'insideLeft' } : undefined}
          stroke="#666"
        />
        
        <Tooltip
          formatter={formatTooltipValue}
          labelFormatter={formatTooltipLabel}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        
        <Legend
          verticalAlign="top"
          height={36}
          iconType="line"
        />
        
        {renderAnnotations()}
        
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            name={line.name}
            strokeWidth={line.strokeWidth || 2}
            strokeDasharray={line.dashed ? '5 5' : undefined}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
        
        {brush && (
          <Brush
            dataKey="timestamp"
            height={30}
            stroke="#8884d8"
            tickFormatter={formatXAxisTick}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};