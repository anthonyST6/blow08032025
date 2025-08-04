import React from 'react';
import { TabPanelProps } from '../types';

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  activeValue,
  children,
  keepMounted = false,
}) => {
  const isActive = value === activeValue;

  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={isActive ? 'block' : 'hidden'}
    >
      {children}
    </div>
  );
};