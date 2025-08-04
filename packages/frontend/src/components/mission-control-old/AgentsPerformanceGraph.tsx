import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AgentPerformancePoint } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from 'recharts';

interface AgentsPerformanceGraphProps {
  data: AgentPerformancePoint[];
  onDataPointClick?: (point: AgentPerformancePoint) => void;
}

interface ChartDataPoint {
  time: string;
  hour: number;
  productivity: number;
  efficiency: number;
  timestamp: Date;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-seraphim-black/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-seraphim-text mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs text-seraphim-text-dim capitalize">
              {entry.name}:
            </span>
            <span className={`text-sm font-medium ${
              entry.name === 'productivity' ? 'text-blue-400' : 'text-green-400'
            }`}>
              {entry.value?.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AgentsPerformanceGraph: React.FC<AgentsPerformanceGraphProps> = ({
  data,
  onDataPointClick,
}) => {
  // Process data to get average performance per hour
  const chartData = useMemo(() => {
    const hourlyData = new Map<number, { productivity: number[]; efficiency: number[]; timestamp: Date }>();
    
    data.forEach(point => {
      const hour = point.timestamp.getHours();
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { productivity: [], efficiency: [], timestamp: point.timestamp });
      }
      const hourData = hourlyData.get(hour)!;
      hourData.productivity.push(point.productivity);
      hourData.efficiency.push(point.efficiency);
    });
    
    return Array.from(hourlyData.entries())
      .map(([hour, values]) => ({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour,
        productivity: values.productivity.reduce((a, b) => a + b, 0) / values.productivity.length,
        efficiency: values.efficiency.reduce((a, b) => a + b, 0) / values.efficiency.length,
        timestamp: values.timestamp,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [data]);

  const currentAvgProductivity = chartData.length > 0 
    ? chartData[chartData.length - 1].productivity.toFixed(1)
    : '0';
  
  const currentAvgEfficiency = chartData.length > 0
    ? chartData[chartData.length - 1].efficiency.toFixed(1)
    : '0';

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-seraphim-gold mr-2" />
            Agent Performance
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-400 mr-1" />
              <span className="text-seraphim-text-dim">Prod: {currentAvgProductivity}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-400 mr-1" />
              <span className="text-seraphim-text-dim">Eff: {currentAvgEfficiency}%</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-[180px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length > 0 && onDataPointClick) {
                  const point = data.find(p =>
                    p.timestamp.getHours() === e.activePayload![0].payload.hour
                  );
                  if (point) onDataPointClick(point);
                }
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                domain={[60, 100]}
                ticks={[60, 70, 80, 90, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
                formatter={(value) => (
                  <span className="text-seraphim-text-dim capitalize">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        <div className="mt-3 flex items-center justify-center">
          <p className="text-xs text-seraphim-text-dim">
            24-hour performance trend across all agents
          </p>
        </div>
      </CardContent>
    </>
  );
};

export default AgentsPerformanceGraph;