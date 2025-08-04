import React from 'react';
import { useMissionControlPersistence } from '@/hooks/useMissionControlPersistence';

interface UseCaseSelectorProps {
  useCase: {
    id: string;
    name: string;
    vertical?: string;
    active: boolean;
    [key: string]: any;
  };
  onSelect?: (useCase: any) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wrapper component for use case selection that handles persistence
 * This component wraps any clickable element and saves the selection to persistence
 */
export const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  useCase,
  onSelect,
  disabled = false,
  className = '',
  children
}) => {
  const { setSelectedVertical, setSelectedUseCase } = useMissionControlPersistence();

  const handleClick = () => {
    if (disabled || !useCase.active) return;

    // Extract vertical from use case ID (e.g., 'energy-oilfield-land-lease' -> 'energy')
    const vertical = useCase.vertical || useCase.id.split('-')[0];
    
    // Save to persistence
    setSelectedVertical(vertical);
    setSelectedUseCase(useCase.id, useCase);
    
    console.log('Persisting use case selection:', {
      vertical,
      useCaseId: useCase.id,
      useCase
    });

    // Call the original onSelect if provided
    if (onSelect) {
      onSelect(useCase);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`${disabled || !useCase.active ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </div>
  );
};