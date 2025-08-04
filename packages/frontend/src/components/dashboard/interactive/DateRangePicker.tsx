import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { DateRangePickerProps } from '../types';

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  presets = [],
  maxDate,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePresetClick = (preset: any) => {
    onChange(preset.getValue());
    setIsOpen(false);
  };

  const handleDateChange = (type: 'start' | 'end', dateString: string) => {
    const date = new Date(dateString);
    onChange({
      start: type === 'start' ? date : value.start,
      end: type === 'end' ? date : value.end,
    });
  };

  // Default presets if none provided
  const defaultPresets = [
    {
      label: 'Today',
      getValue: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(today);
        end.setHours(23, 59, 59, 999);
        return { start: today, end };
      },
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const end = new Date(yesterday);
        end.setHours(23, 59, 59, 999);
        return { start: yesterday, end };
      },
    },
    {
      label: 'Last 7 days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { start, end };
      },
    },
    {
      label: 'Last 30 days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        return { start, end };
      },
    },
    {
      label: 'This month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      },
    },
    {
      label: 'Last month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      },
    },
  ];

  const presetsToUse = presets.length > 0 ? presets : defaultPresets;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
        <span className="text-sm text-gray-700">
          {formatDate(value.start)} - {formatDate(value.end)}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={value.start.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    min={minDate?.toISOString().split('T')[0]}
                    max={maxDate?.toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={value.end.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    min={minDate?.toISOString().split('T')[0]}
                    max={maxDate?.toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
                <div className="grid grid-cols-2 gap-2">
                  {presetsToUse.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};