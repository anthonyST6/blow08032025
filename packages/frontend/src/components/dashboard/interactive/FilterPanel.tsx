import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { FilterPanelProps } from '../types';

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
  collapsible = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleFilterChange = (filterId: string, value: any) => {
    onChange({
      ...values,
      [filterId]: value,
    });
  };

  const handleReset = () => {
    const resetValues: any = {};
    filters.forEach(filter => {
      resetValues[filter.id] = filter.type === 'multiselect' ? [] : '';
    });
    onChange(resetValues);
    onReset?.();
  };

  const hasActiveFilters = Object.values(values).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== '' && value != null
  );

  const renderFilter = (filter: any) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{filter.placeholder || 'Select...'}</option>
            {filter.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map((option: any) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: any) => v !== option.value);
                    handleFilterChange(filter.id, newValues);
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={filter.min || 0}
              max={filter.max || 100}
              value={value || filter.min || 0}
              onChange={(e) => handleFilterChange(filter.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{filter.min || 0}</span>
              <span className="font-medium text-gray-700">{value || filter.min || 0}</span>
              <span>{filter.max || 100}</span>
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        );

      case 'search':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder || 'Search...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </button>
            )}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-500"
              >
                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-6 py-4 space-y-4">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filter.label}
              </label>
              {renderFilter(filter)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};