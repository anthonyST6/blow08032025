import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label,
} from 'recharts';
import { PieChartProps } from '../types';

export const PieChart: React.FC<PieChartProps> = ({
  data,
  innerRadius = 0,
  showLabels = true,
  showLegend = true,
  customColors,
  height = 400,
}) => {
  // Default color palette if not provided
  const defaultColors = [
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#ef4444', // red-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#06b6d4', // cyan-500
  ];

  const colors = customColors || defaultColors;

  const formatTooltipValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const formatPercentage = (value: number, total: number) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percentage = formatPercentage(value, totalValue);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-medium text-sm"
      >
        {percentage}
      </text>
    );
  };

  const renderCenterLabel = () => {
    if (innerRadius === 0) return null;

    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-900"
      >
        <tspan className="text-2xl font-bold" x="50%" dy="-0.1em">
          {totalValue.toLocaleString()}
        </tspan>
        <tspan className="text-sm text-gray-500" x="50%" dy="1.5em">
          Total
        </tspan>
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = formatPercentage(data.value, totalValue);

      return (
        <div className="bg-white px-4 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: {formatTooltipValue(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {percentage}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value: string, entry: any) => {
    const percentage = formatPercentage(entry.payload.value, totalValue);
    return (
      <span className="text-sm text-gray-700">
        {value} ({percentage})
      </span>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomizedLabel : false}
          outerRadius={height / 3}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {renderCenterLabel()}
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={renderLegendText}
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};