import React from 'react';
import { ArrowLeftIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { useSelectedUseCase } from '@/hooks/useSelectedUseCase';

export const UseCaseHeader: React.FC = () => {
  const { useCaseDetails, returnToMissionControl, clearAndReturn } = useSelectedUseCase();
  
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={returnToMissionControl}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Mission Control
          </Button>
          
          <div className="h-6 w-px bg-gray-600" />
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {useCaseDetails?.name || 'Use Case Dashboard'}
              </h1>
              <p className="text-sm text-gray-400">
                {useCaseDetails?.vertical || 'Energy'} • Active Session
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Data
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAndReturn}
            className="text-gray-400 hover:text-red-400"
            title="Clear selection and return to Mission Control"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
};