import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeatMapProps } from '../types';

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  xLabels,
  yLabels,
  colorScale = {
    min: '#e3f2fd',
    max: '#1565c0',
  },
  showValues = true,
  onClick,
  height = 400,
}) => {
  // Calculate min and max values for color scaling
  const { minValue, maxValue } = useMemo(() => {
    const values = data.map(d => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [data]);

  // Create a color interpolation function
  const getColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    
    if (colorScale.steps && colorScale.steps.length > 0) {
      // Use custom color steps
      const stepIndex = Math.floor(ratio * (colorScale.steps.length - 1));
      return colorScale.steps[stepIndex];
    }
    
    // Linear interpolation between min and max colors
    const minColor = colorScale.min;
    const maxColor = colorScale.max;
    
    // Simple color interpolation (works best with similar hues)
    const r1 = parseInt(minColor.slice(1, 3), 16);
    const g1 = parseInt(minColor.slice(3, 5), 16);
    const b1 = parseInt(minColor.slice(5, 7), 16);
    
    const r2 = parseInt(maxColor.slice(1, 3), 16);
    const g2 = parseInt(maxColor.slice(3, 5), 16);
    const b2 = parseInt(maxColor.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Create a 2D array for easier access
  const dataMatrix = useMemo(() => {
    const matrix: (number | null)[][] = Array(yLabels.length)
      .fill(null)
      .map(() => Array(xLabels.length).fill(null));
    
    data.forEach(item => {
      const xIndex = typeof item.x === 'string' 
        ? xLabels.indexOf(item.x)
        : item.x;
      const yIndex = typeof item.y === 'string'
        ? yLabels.indexOf(item.y)
        : item.y;
      
      if (xIndex >= 0 && yIndex >= 0) {
        matrix[yIndex][xIndex] = item.value;
      }
    });
    
    return matrix;
  }, [data, xLabels, yLabels]);

  const cellSize = Math.min(
    (height - 100) / yLabels.length,
    600 / xLabels.length
  );

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Y-axis labels */}
        <div className="flex">
          <div className="flex flex-col justify-between pr-2" style={{ marginTop: '30px' }}>
            {yLabels.map((label, index) => (
              <div
                key={`y-${index}`}
                className="text-sm text-gray-600 text-right"
                style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div>
            {/* X-axis labels */}
            <div className="flex mb-2">
              {xLabels.map((label, index) => (
                <div
                  key={`x-${index}`}
                  className="text-sm text-gray-600 text-center transform rotate-45 origin-left"
                  style={{ 
                    width: `${cellSize}px`,
                    marginLeft: index === 0 ? `${cellSize / 2}px` : 0,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div>
              {dataMatrix.map((row, yIndex) => (
                <div key={`row-${yIndex}`} className="flex">
                  {row.map((value, xIndex) => {
                    const cellValue = value !== null ? value : 0;
                    const color = value !== null ? getColor(cellValue) : '#f5f5f5';
                    
                    return (
                      <motion.div
                        key={`cell-${xIndex}-${yIndex}`}
                        className="border border-gray-200 flex items-center justify-center cursor-pointer relative group"
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          backgroundColor: color,
                        }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => onClick && value !== null && onClick(xIndex, yIndex, cellValue)}
                      >
                        {showValues && value !== null && (
                          <span className="text-xs font-medium text-gray-900">
                            {formatValue(cellValue)}
                          </span>
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {xLabels[xIndex]} / {yLabels[yIndex]}: {value !== null ? formatValue(cellValue) : 'No data'}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Color scale legend */}
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{formatValue(minValue)}</span>
            <div className="w-48 h-4 rounded" style={{
              background: `linear-gradient(to right, ${colorScale.min}, ${colorScale.max})`,
            }} />
            <span className="text-sm text-gray-600">{formatValue(maxValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};