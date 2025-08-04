import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { BarChartProps } from '../types';

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  orientation = 'vertical',
  stacked = false,
  grouped = false,
  showValues = false,
  xAxis = {},
  yAxis = {},
  height = 400,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const formatAxisTick = (value: any, isNumber: boolean = false) => {
    if (isNumber && typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toFixed(0);
    }
    return value;
  };

  const formatTooltipValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const formattedValue = formatTooltipValue(value);
    
    if (isHorizontal) {
      return (
        <text
          x={x + width + 5}
          y={y + height / 2}
          fill="#666"
          textAnchor="start"
          dominantBaseline="middle"
          fontSize="12"
        >
          {formattedValue}
        </text>
      );
    } else {
      return (
        <text
          x={x + width / 2}
          y={y - 5}
          fill="#666"
          textAnchor="middle"
          dominantBaseline="bottom"
          fontSize="12"
        >
          {formattedValue}
        </text>
      );
    }
  };

  const getBarRadius = (): [number, number, number, number] => {
    if (isHorizontal) {
      return [0, 4, 4, 0];
    }
    return [4, 4, 0, 0];
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tickFormatter={(value) => formatAxisTick(value, true)}
              domain={xAxis.domain}
              hide={xAxis.hide}
              label={xAxis.label ? { value: xAxis.label, position: 'insideBottom', offset: -5 } : undefined}
              stroke="#666"
            />
            <YAxis
              type="category"
              dataKey="name"
              hide={yAxis.hide}
              label={yAxis.label ? { value: yAxis.label, angle: -90, position: 'insideLeft' } : undefined}
              stroke="#666"
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tickFormatter={(value) => formatAxisTick(value)}
              hide={xAxis.hide}
              label={xAxis.label ? { value: xAxis.label, position: 'insideBottom', offset: -5 } : undefined}
              stroke="#666"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={(value) => formatAxisTick(value, true)}
              domain={yAxis.domain}
              hide={yAxis.hide}
              label={yAxis.label ? { value: yAxis.label, angle: -90, position: 'insideLeft' } : undefined}
              stroke="#666"
            />
          </>
        )}
        
        <Tooltip
          formatter={formatTooltipValue}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        
        <Legend
          verticalAlign="top"
          height={36}
        />
        
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            stackId={stacked ? 'stack' : undefined}
            radius={getBarRadius()}
          >
            {showValues && (
              <LabelList
                dataKey={bar.dataKey}
                content={renderCustomLabel}
              />
            )}
            {/* Add gradient effect for single bars */}
            {!stacked && !grouped && data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={bar.color} fillOpacity={0.8 + (idx / data.length) * 0.2} />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};