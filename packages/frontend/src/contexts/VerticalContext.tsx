import React, { createContext, useContext, useState, useCallback } from 'react';
import { verticals as verticalConfigs, VerticalModule } from '../config/verticals';

export type VerticalType =
  | 'energy'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'retail'
  | 'logistics'
  | 'education'
  | 'pharma'
  | 'government'
  | 'telecom';

interface VerticalContextType {
  selectedVertical: VerticalType | null;
  setSelectedVertical: (vertical: VerticalType | null) => void;
  verticalConfig: VerticalModule | null;
}

const VerticalContext = createContext<VerticalContextType>({
  selectedVertical: null,
  setSelectedVertical: () => {},
  verticalConfig: null,
});

export const useVertical = () => {
  const context = useContext(VerticalContext);
  if (!context) {
    throw new Error('useVertical must be used within a VerticalProvider');
  }
  return context;
};

export const VerticalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVertical, setSelectedVerticalState] = useState<VerticalType | null>(null);

  const setSelectedVertical = useCallback((vertical: VerticalType | null) => {
    setSelectedVerticalState(vertical);
    // Store in localStorage for persistence
    if (vertical) {
      localStorage.setItem('selectedVertical', vertical);
    } else {
      localStorage.removeItem('selectedVertical');
    }
  }, []);

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('selectedVertical') as VerticalType | null;
    if (stored && verticalConfigs[stored]) {
      setSelectedVerticalState(stored);
    }
  }, []);

  const verticalConfig = selectedVertical ? verticalConfigs[selectedVertical] : null;

  return (
    <VerticalContext.Provider value={{ selectedVertical, setSelectedVertical, verticalConfig }}>
      {children}
    </VerticalContext.Provider>
  );
};