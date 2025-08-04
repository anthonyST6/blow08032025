import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { SearchBarProps } from '../types';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  suggestions = [],
  onSearch,
  debounceMs = 300,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, onChange, value, debounceMs]);

  // Filter suggestions based on input
  useEffect(() => {
    if (internalValue && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(internalValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [internalValue, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInternalValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    onSearch?.(suggestion);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(internalValue);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => filteredSuggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {internalValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestions(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left cursor-pointer select-none relative py-2 pl-10 pr-4 hover:bg-gray-100 text-gray-900"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </span>
                <span className="block truncate">
                  {suggestion.split(new RegExp(`(${internalValue})`, 'gi')).map((part, i) => (
                    <span
                      key={i}
                      className={
                        part.toLowerCase() === internalValue.toLowerCase()
                          ? 'font-semibold text-indigo-600'
                          : ''
                      }
                    >
                      {part}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};