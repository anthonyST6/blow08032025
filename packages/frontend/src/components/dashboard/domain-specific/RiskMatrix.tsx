import React from 'react';
import { motion } from 'framer-motion';
import { RiskMatrixProps } from '../types';

export const RiskMatrix: React.FC<RiskMatrixProps> = ({
  risks,
  dimensions,
  colorScale,
  onRiskClick,
  showLabels = true,
  gridSize = 5,
}) => {
  const cellSize = 80;
  
  // Define risk matrix colors (from low to high risk)
  const defaultColors = [
    '#10b981', // green - low risk
    '#84cc16', // lime
    '#eab308', // yellow
    '#f97316', // orange
    '#ef4444', // red - high risk
  ];

  const getAxisLabel = (axis: 'likelihood' | 'impact' | 'custom') => {
    switch (axis) {
      case 'likelihood':
        return 'Likelihood';
      case 'impact':
        return 'Impact';
      default:
        return 'Value';
    }
  };

  const getAxisValue = (risk: any, axis: 'likelihood' | 'impact' | 'custom') => {
    switch (axis) {
      case 'likelihood':
        return risk.likelihood;
      case 'impact':
        return risk.impact;
      default:
        return 0;
    }
  };

  const getRiskColor = (x: number, y: number) => {
    // Calculate risk level based on position in matrix
    const riskLevel = (x + y) / (2 * (gridSize - 1));
    const colorIndex = Math.floor(riskLevel * (defaultColors.length - 1));
    return defaultColors[colorIndex];
  };

  const getGridLabels = () => {
    const labels = [];
    for (let i = 1; i <= gridSize; i++) {
      labels.push(i.toString());
    }
    return labels;
  };

  const gridLabels = getGridLabels();

  // Group risks by their grid position
  const risksByPosition = risks.reduce((acc, risk) => {
    const x = Math.floor(getAxisValue(risk, dimensions.x) * (gridSize - 1));
    const y = Math.floor(getAxisValue(risk, dimensions.y) * (gridSize - 1));
    const key = `${x}-${y}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(risk);
    return acc;
  }, {} as Record<string, typeof risks>);

  return (
    <div className="p-4">
      <div className="relative">
        {/* Y-axis label */}
        <div 
          className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-700"
          style={{ width: `${gridSize * cellSize}px` }}
        >
          {getAxisLabel(dimensions.y)} →
        </div>

        {/* Y-axis values */}
        <div className="absolute -left-8 top-0 flex flex-col-reverse" style={{ height: `${gridSize * cellSize}px` }}>
          {gridLabels.map((label, index) => (
            <div
              key={`y-${index}`}
              className="flex items-center justify-end pr-2 text-sm text-gray-600"
              style={{ height: `${cellSize}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="inline-block border-2 border-gray-300">
          {Array.from({ length: gridSize }).map((_, yIndex) => (
            <div key={`row-${yIndex}`} className="flex">
              {Array.from({ length: gridSize }).map((_, xIndex) => {
                const actualY = gridSize - 1 - yIndex; // Invert Y axis
                const positionKey = `${xIndex}-${actualY}`;
                const cellRisks = risksByPosition[positionKey] || [];
                const cellColor = getRiskColor(xIndex, actualY);

                return (
                  <motion.div
                    key={`cell-${xIndex}-${yIndex}`}
                    className="border border-gray-200 relative group cursor-pointer"
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: cellColor,
                      opacity: 0.3,
                    }}
                    whileHover={{ opacity: 0.5 }}
                    onClick={() => cellRisks.length > 0 && onRiskClick && onRiskClick(cellRisks[0])}
                  >
                    {/* Risk dots */}
                    {cellRisks.map((risk, index) => (
                      <motion.div
                        key={risk.id}
                        className="absolute bg-gray-800 rounded-full shadow-lg"
                        style={{
                          width: '24px',
                          height: '24px',
                          left: `${20 + (index % 2) * 30}px`,
                          top: `${20 + Math.floor(index / 2) * 30}px`,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRiskClick && onRiskClick(risk);
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {risk.name.substring(0, 2).toUpperCase()}
                        </div>
                      </motion.div>
                    ))}

                    {/* Tooltip */}
                    {cellRisks.length > 0 && (
                      <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="font-medium mb-1">
                          {cellRisks.length} risk{cellRisks.length > 1 ? 's' : ''} in this cell
                        </div>
                        {cellRisks.slice(0, 3).map(risk => (
                          <div key={risk.id} className="text-xs">
                            • {risk.name}
                          </div>
                        ))}
                        {cellRisks.length > 3 && (
                          <div className="text-xs">
                            • ... and {cellRisks.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* X-axis values */}
        <div className="flex mt-2 ml-0" style={{ width: `${gridSize * cellSize}px` }}>
          {gridLabels.map((label, index) => (
            <div
              key={`x-${index}`}
              className="text-center text-sm text-gray-600"
              style={{ width: `${cellSize}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* X-axis label */}
        <div className="text-center mt-4 text-sm font-medium text-gray-700">
          {getAxisLabel(dimensions.x)} →
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-4">
        <span className="text-sm text-gray-600">Risk Level:</span>
        <div className="flex items-center space-x-2">
          {defaultColors.map((color, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: color }}
              />
              {index === 0 && <span className="ml-1 text-xs text-gray-600">Low</span>}
              {index === defaultColors.length - 1 && <span className="ml-1 text-xs text-gray-600">High</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};