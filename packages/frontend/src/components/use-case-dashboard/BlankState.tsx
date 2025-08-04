import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';

export const BlankState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center max-w-2xl p-8">
        <div className="mb-8">
          <MapIcon className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <div className="w-16 h-1 bg-amber-500 mx-auto"></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          No Use Case Selected
        </h2>
        
        <p className="text-gray-400 mb-8 text-lg">
          The Use Case Dashboard displays detailed analytics and controls for your selected use case. 
          Please select a use case from Mission Control to begin.
        </p>
        
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/mission-control')}
          className="inline-flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Go to Mission Control
        </Button>
      </div>
    </div>
  );
};